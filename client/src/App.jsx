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
  // const { isActive } = useMetaMask();
  // const activeUserAndValidEthAccount = user && isActive;
  return (
    <BrowserRouter>
      <Routes>
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
          path="/"
          exact
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        {user && <Route path="/list" exact element={<ListItem />} />}
        {user && (
          <Route path="/item/:itemContractAddress" exact element={<Item />} />
        )}
        <Route
          path="*"
          element={user ? <NotFound /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
