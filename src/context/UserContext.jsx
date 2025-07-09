import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Error parsing user info from localStorage:", err);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (userInfo) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        localStorage.removeItem("userInfo");
      }
    } catch (err) {
      console.error("Error updating localStorage for userInfo:", err);
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
