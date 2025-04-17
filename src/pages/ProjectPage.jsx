import axios from "../config/axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../context/userContext";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webContainer";

const ProjectPage = () => {
  const location = useLocation();
  const messageBoxRef = useRef(null);

  const [isSidePannelOpen, setisSidePannelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state);
  const [messageInput, setMessageInput] = useState("");
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);

  const { user } = useContext(UserContext);

  const handleSelectedUser = (userId) => {
    if (selectedUsers.indexOf(userId) !== -1) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddCollaborator = async () => {
    console.log(selectedUsers);
    try {
      await axios.put("/projects/add-user", {
        projectId: location.state._id,
        users: selectedUsers,
      });
      setIsModalOpen(false);
    } catch (error) {
      log(error);
    }
  };

  const fetchProjectData = async () => {
    try {
      const { data } = await axios.get(
        `/projects/get-project/${location.state._id}`
      );
      setProject(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.get("/users/all");
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const scrollToBottom = () => {
    const messageBox = document.querySelector(".messageBox");
    messageBox.scrollTo({
      top: messageBox.scrollHeight,
      behavior: "smooth",
    });
    const { scrollTop, scrollHeight, clientHeight } = messageBoxRef?.current;
    setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 50);
  };

  const send = () => {
    const messageObject = {
      message: messageInput,
      sender: user,
    };
    sendMessage("project-message", messageObject);
    setMessages((prevMessages) => [...prevMessages, messageObject]);
    scrollToBottom();
    setMessageInput("");
  };

  const writeAiMessage = (message) => {
    const messageObject = JSON.parse(message);

    return (
      <div className="bg-slate-950 text-white p-2 overflow-auto">
        <Markdown>{messageObject.text}</Markdown>
      </div>
    );
  };

  useEffect(() => {
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("web container started");
      });
    }

    receiveMessage("project-message", (data) => {
      const message = JSON.parse(data.message);
      console.log(message);

      webContainer?.mount(message.fileTree)

      if (message.fileTree) {
        setFileTree(message.fileTree);
      }

      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });

    fetchAllUsers();
    fetchProjectData();
  }, []);

  return (
    <main className="w-full h-screen flex">
      <section className="left relative min-w-80 h-full border-r border-gray-400 flex flex-col">
        <header className="w-full px-2 py-2 border-b border-gray-400 flex justify-between items-center">
          <button
            onClick={() => setIsModalOpen(!isModalOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-200 rounded-md cursor-pointer"
          >
            <i className="ri-add-fill"></i>
            <p className="text-xs font-medium">Add Collaborator</p>
          </button>
          <button
            onClick={() => setisSidePannelOpen(!isSidePannelOpen)}
            className="px-3 py-2 bg-slate-200 rounded-md cursor-pointer"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversationArea h-[60vh] relative w-full flex flex-col flex-grow px-2 py-2">
          <div
            ref={messageBoxRef}
            className="messageBox relative h-[82vh] overflow-y-auto overflow-x-hidden w-full flex flex-col gap-2"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender._id === user._id
                    ? "ml-auto max-w-64 bg-slate-200"
                    : "bg-slate-300 max-w-80"
                } w-fit flex flex-col gap-1 px-4 py-2 rounded-md`}
              >
                <small className="leading-none text-xs font-medium text-gray-600">
                  {msg.sender.email}
                </small>
                <p className="leading-none text-sm font-normal rounded-md">
                  {msg.sender._id === "ai"
                    ? writeAiMessage(msg.message)
                    : msg.message}
                </p>
              </div>
            ))}
          </div>

          {showScrollToBottom && (
            <div
              onClick={scrollToBottom}
              className="absolute bottom-20 left-1/2 rounded-full shadow-lg"
            >
              <i className="ri-arrow-down-s-line"></i>
            </div>
          )}

          <div className="messageInput mt-2 w-full flex shrink-0 items-center gap-1 text-base font-medium px-2 py-2 bg-white border border-gray-400 rounded-full">
            <input
              onChange={(e) => setMessageInput(e.target.value)}
              value={messageInput}
              type="text"
              placeholder="Enter message . . ."
              className="w-full px-2 py-1 bg-transparent border-none outline-none"
            />
            <button
              onClick={send}
              className="px-6 py-1 rounded-full cursor-pointer text-white bg-sky-400"
            >
              <i className="ri-send-plane-fill text-xl"></i>
            </button>
          </div>
        </div>

        <div
          className={`absolute top-0 ${
            isSidePannelOpen ? "translate-x-0" : "-translate-x-full"
          } transition-all duration-300 z-10 w-full h-full bg-gray-100`}
        >
          <header className="w-full px-2 py-2 flex justify-between items-center border-b border-gray-400">
            <h1 className="text-xl font-semibold">Collaborators</h1>
            <button
              onClick={() => setisSidePannelOpen(!isSidePannelOpen)}
              className="px-3 py-2 bg-slate-200 rounded-md cursor-pointer"
            >
              <i className="ri-close-line"></i>
            </button>
          </header>

          <div className="users flex flex-col px-2 py-2 gap-2">
            {project.users.length > 0 &&
              project.users.map((user) => (
                <div
                  key={user._id}
                  className="user w-full bg-slate-200 hover:bg-slate-300 transition-all duration-300 py-2 px-2 rounded-md flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-red-300 rounded-full"></div>
                  <h2 className="text-base font-semibold">{user.email}</h2>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="right flex flex-grow">
        <div className="explorer w-60 h-full bg-slate-400">
          <div className="file-tree flex flex-col gap-1">
            {Object.keys(fileTree).map((file) => (
              <div
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="file-tree-element w-full bg-slate-200 cursor-pointer px-4 py-2"
              >
                <p className="text-lg font-semibold">{file}</p>
              </div>
            ))}
          </div>
        </div>

        {currentFile && (
          <div className="code-editor flex flex-col flex-grow bg-slate-900">
            <div className="code-editor-top w-full bg-slate-700 text-white flex justify-start gap-1 items-center px-4 py-2">
              {openFiles.map((file) => (
                <button
                  onClick={() => setCurrentFile(file)}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    currentFile === file ? "bg-slate-900" : "bg-slate-800"
                  }`}
                >
                  <p className="font-medium text-lg">{file}</p>
                  <i className="ri-close-line cursor-pointer"></i>
                </button>
              ))}
            </div>

            <div className="code-editor-bottom w-full flex-grow">
              {fileTree[currentFile] && (
                <div className="code-editor-area w-full h-full overflow-auto flex-grow bg-slate-50 px-4 py-2">
                  <pre className="hljs h-full">
                    <code
                      className="hljs h-full outline-none"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        setFileTree((prevFileTree) => ({
                          ...prevFileTree,
                          [currentFile]: {
                            ...prevFileTree[currentFile],
                            content: updatedContent,
                          },
                        }));
                      }}
                      dangerouslySetInnerHTML={{
                        __html: hljs.highlight(
                          fileTree[currentFile].file.contents,
                          {
                            language: "javascript",
                            ignoreIllegals: true,
                          }
                        ).value,
                      }}
                      style={{
                        whiteSpace: "pre-wrap",
                        paddingBottom: "25rem",
                        counterSet: "line-numbering",
                      }}
                    ></code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-96 p-4 rounded-lg shadow-lg flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">Select a User</h2>
              <i
                onClick={() => setIsModalOpen(false)}
                className="ri-close-line cursor-pointer"
              ></i>
            </div>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {users.length > 0 &&
                users?.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectedUser(user._id)}
                    className={`user w-full bg-slate-200 hover:bg-slate-300 ${
                      selectedUsers.indexOf(user._id) !== -1
                        ? "bg-slate-300"
                        : ""
                    } transition-all duration-300 py-2 px-2 rounded-md flex items-center gap-2 cursor-pointer`}
                  >
                    <div className="w-12 h-12 bg-red-300 rounded-full"></div>
                    <h2 className="text-base font-semibold">Username</h2>
                  </div>
                ))}
            </div>

            <button
              onClick={handleAddCollaborator}
              className="w-fit px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Add Collaborator
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectPage;
