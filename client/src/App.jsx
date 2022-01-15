import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useMetaMask from "./hooks/metamask";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

const App = () => {
  const user = useSelector((state) => state.user.currentUser);
  const { isActive } = useMetaMask();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Home />} />
        {!isActive && <Route path="*" element={<Login />} />}
        <Route
          path="/login"
          element={user && isActive ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={user && isActive ? <Navigate to="/" /> : <Register />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
