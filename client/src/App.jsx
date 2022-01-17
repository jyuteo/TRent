import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useMetaMask from "./hooks/metamask";
import Home from "./pages/Home";
import Item from "./pages/Item";
import ListItem from "./pages/ListItem";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

const App = () => {
  const user = useSelector((state) => state.user.currentUser);
  // const user = true;
  const { isActive } = useMetaMask();
  // const activeUserAndValidEthAccount = user && isActive;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Home />} />
        {!isActive && <Route path="*" element={<Login />} />}
        <Route
          path="/login"
          exact
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          exact
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/list"
          exact
          element={user ? <ListItem /> : <Navigate to="/login" />}
        />
        <Route path="/item/:itemContractAddress" exact element={<Item />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
