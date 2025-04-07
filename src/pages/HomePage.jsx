import React, { useContext } from "react";
import { UserContext } from "../context/userContext";

const HomePage = () => {
  const { user } = useContext(UserContext);
  
  

  return <div>{user?.fullName}</div>;
};

export default HomePage;
