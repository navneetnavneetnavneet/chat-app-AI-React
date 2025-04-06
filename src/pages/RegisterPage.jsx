import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      return toast.warning("All filed are required !");
    }

    if (password.length <= 5) {
      return toast.warning("Password must be atleast 6 characters !");
    }

    if (password.length >= 16) {
      return toast.warning(
        "Password must not be exceed more than 15 characters !"
      );
    }

    try {
      const { data } = await axios.post("/users/register", {
        fullName,
        email,
        password,
      });
      console.log(data);

      await toast.success("User Register Successfully");
      navigate("/");

      setFullName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-ful h-screen bg-zinc-800 flex items-center justify-center">
      <div className="w-1/4 px-5 py-5 shadow-xl bg-zinc-700 rounded-md flex flex-col gap-5">
        <h1 className="text-2xl font-semibold text-white">
          Create Your Account
        </h1>
        <form
          onSubmit={submitHandler}
          className="w-full text-white text-base font-normal flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="block text-base text-gray-300">
              Full Name
            </label>
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              type="text"
              placeholder="Enter full name"
              className="w-full px-4 py-2 rounded-md outline-none border-2 border-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="block text-base text-gray-300">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Enter email"
              className="w-full px-4 py-2 rounded-md outline-none border-2 border-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="block text-base text-gray-300">
              Password
            </label>
            <div className="w-full flex items-center px-4 py-2 rounded-md outline-none border-2 border-zinc-400">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={show ? "text" : "password"}
                placeholder="Enter password"
                className="w-full outline-none border-none"
              />
              <i
                onClick={() => setShow(!show)}
                className={`${
                  show ? "ri-eye-line" : "ri-eye-off-line"
                } mr-2 cursor-pointer`}
              ></i>
            </div>
          </div>
          <button className="px-4 py-2 bg-sky-500 border-none rounded-md active:scale-95 transition-all">
            Create Account
          </button>
        </form>
        <p className="text-center text-xs text-gray-300">
          Already have an account ?{" "}
          <Link to="/login" className="text-sky-500 font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
