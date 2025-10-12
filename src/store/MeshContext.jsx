import React, { createContext, useState, useEffect } from "react";
import AuthService from "../service/auth.service";

const MeshContext = createContext();

const MeshProvider = ({ children }) => {
  const [navItems, setNavItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // important

  console.log(user)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.getMe();
        setUser(res.data.user); // make sure backend returns { user: {...} }
      } catch (err) {
        setUser(null);
        console.log(err)
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <MeshContext.Provider value={{ navItems, setNavItems, user, setUser, loading }}>
      {children}
    </MeshContext.Provider>
  );
};

export { MeshContext, MeshProvider };
