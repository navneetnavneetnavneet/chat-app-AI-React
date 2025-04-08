import axios from "../config/axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";

const ProjectPage = () => {
  const location = useLocation();

  const [isSidePannelOpen, setisSidePannelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state);

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

  useEffect(() => {
    initializeSocket();

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

        <div className="conversationArea w-full flex flex-col flex-grow px-2 py-2">
          <div className="messageBox w-full flex flex-col gap-2 flex-grow">
            <div className="message max-w-72 w-fit flex flex-col gap-1 bg-slate-300 px-4 py-2 rounded-md">
              <small className="leading-none text-xs font-medium text-gray-600 ">
                example@gail.com
              </small>
              <p className="leading-none text-sm font-normal">
                Lorem ipsum dolor sit amet. Lorem iopsum dolor sit amet.Lorem
                ipsum dolor sit amet.
              </p>
            </div>
            <div className="message ml-auto max-w-72 w-fit flex flex-col gap-1 bg-slate-200 px-4 py-2 rounded-md">
              <small className="leading-none text-xs font-medium text-gray-600 ">
                example@gail.com
              </small>
              <p className="leading-none text-sm font-normal">
                Lorem ipsum dolor sit amet.
              </p>
            </div>
          </div>

          <div className="messageInput w-full flex shrink-0 items-center gap-1 text-base font-medium px-2 py-2 bg-white border border-gray-400 rounded-full">
            <input
              type="text"
              placeholder="Enter message . . ."
              className="w-full px-2 py-1 bg-transparent border-none outline-none"
            />
            <button className="px-6 py-1 rounded-full cursor-pointer text-white bg-sky-400">
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
