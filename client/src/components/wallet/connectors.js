import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 42, 1337], //1 = Ethereum Mainnet, 42 = Kovan Testnet, 1337 = localhost chain (ganache)
});
