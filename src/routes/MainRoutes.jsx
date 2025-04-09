import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ProjectPage from "../pages/ProjectPage";
import UserAuth from "../auth/UserAuth";

const MainRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <UserAuth>
              <HomePage />
            </UserAuth>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/project"
          element={
            <UserAuth>
              <ProjectPage />
            </UserAuth>
          }
        />
        <Route />
      </Routes>
    </>
  );
};

export default MainRoutes;
