import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { toast } from "react-toastify";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!projectName) {
      return toast.warning("Project name is required!");
    }

    const { data } = await axios.post("/projects/create", {
      projectName,
    });

    console.log(data);

    setProjectName("");
    setShowModal(false);
  };

  const fetchAllProjects = async () => {
    try {
      const { data } = await axios.post("/projects/all");
      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  return (
    <div className="px-4 py-4">
      <button
        className="flex items-center justify-center gap-2 bg-slate-300 cursor-pointer px-4 py-2 rounded text0base font-medium"
        onClick={() => setShowModal(true)}
      >
        <span>Create Project</span>
        <i className="ri-link"></i>
      </button>
      <div className="projects flex flex-wrap gap-5 mt-5">
        {projects.length > 0
          ? projects.map((project) => (
              <div
              key={project._id}
                onClick={() => navigate(`/project`, { state: project })}
                className="project px-4 py-2 bg-slate-300 rounded-md cursor-pointer flex flex-col gap-2 min-w-52 hover:bg-slate-400 transition-all"
              >
                <h3 className="text-xl font-semibold">{project.projectName}</h3>
                <div className="flex items-center gap-2 text-gray-800">
                  <small className="text-sm font-medium">
                    <i className="ri-user-line"></i> Collaborator :
                  </small>
                  <p className="text-base font-medium">
                    {project.users.length}
                  </p>
                </div>
              </div>
            ))
          : ""}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={submitHandler} className="text-base font-medium">
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Name
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  type="text"
                  placeholder="Enter project name"
                  id="projectName"
                  name="projectName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
