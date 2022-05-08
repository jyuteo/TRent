import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { persistor, store } from "./stores/store";
import { PersistGate } from "redux-persist/integration/react";
import Web3 from "web3";
import { Web3ReactProvider } from "@web3-react/core";
import { MetaMaskProvider } from "./hooks/metamask";

const getLibrary = (provider, connector) => {
  return new Web3(provider);
};

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <MetaMaskProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <div className="main-wrapper">
            <App />
          </div>
        </PersistGate>
      </Provider>
    </MetaMaskProvider>
  </Web3ReactProvider>,
  document.getElementById("root")
);
