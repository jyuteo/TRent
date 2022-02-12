import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { logout } from "./apiCalls/user";
import useMetaMask from "./hooks/metamask";
import Home from "./pages/Home";
import Item from "./pages/Item";
import ListItem from "./pages/ListItem";
import Login from "./pages/Login";
import MyRentals from "./pages/MyRentals";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Rental from "./pages/Rental";

const App = () => {
  const user = useSelector((state) => state.user.currentUser);
  const isLogin = useSelector((state) => state.user.loginSuccess);

  const { account, isLoading: isLoadingMetamask } = useMetaMask();

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [isConnectedAndLoggedIn, setIsConnectedAndLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (isLogin) {
        if (account) {
          if (user.ethAccountAddress !== account) {
            logout(dispatch);
            setIsConnectedAndLoggedIn(false);
          } else {
            setIsConnectedAndLoggedIn(true);
          }
        } else {
          if (!isLoadingMetamask) {
            logout(dispatch);
            setIsConnectedAndLoggedIn(false);
          }
        }
      } else {
        setIsConnectedAndLoggedIn(false);
      }
    };

    setIsLoading(true);
    check().then(() => {
      setIsLoading(false);
    });
  }, [isLogin, user, account, dispatch, isLoadingMetamask]);

  return (
    <BrowserRouter>
      <Routes>
        {!isLogin && <Route path="*" element={<Navigate to="/login" />} />}
        <Route
          path="/login"
          exact
          element={isLogin ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          exact
          element={isLogin ? <Navigate to="/" /> : <Register />}
        />
        {!isLoading && isConnectedAndLoggedIn && (
          <Route path="/" exact element={<Home />} />
        )}
        {!isLoading && isConnectedAndLoggedIn && (
          <Route path="/list" exact element={<ListItem />} />
        )}
        {!isLoading && isConnectedAndLoggedIn && (
          <Route path="/item/:itemContractAddress" exact element={<Item />} />
        )}
        {!isLoading && isConnectedAndLoggedIn && (
          <Route
            path="/rental/:rentalContractAddress"
            exact
            element={<Rental />}
          />
        )}
        {!isLoading && isConnectedAndLoggedIn && (
          <Route path="/my-rentals" exact element={<MyRentals />} />
        )}
        {!isLoading && isConnectedAndLoggedIn && (
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
