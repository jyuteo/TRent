import './App.css'
import React, { Component } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3'
var web3 = new Web3(window.ethereum)

const contractFactoryJSON = require('./abis/ContractFactory.json')
const contractFactoryABI = contractFactoryJSON.abi
const contractFactoryAddress = '0x137Ff4AfBD7c53b340755d1A15b6339C00e809DF'
var contractFactory

const ethereum = window.ethereum

class App extends Component {
  async componentDidMount() {
    await this.loadweb3()
    await this.loadAccount()
  }

  constructor(props) {
    super(props)
    this.state = {
      contractFactory: null,
      account: '',
      username: 'testuser1',
      dAddress: 'deliveryAddress',
      userContractAddress: null,
      userContract: null,
    }
  }

  async loadweb3() {
    const provider = await detectEthereumProvider()
    if (provider) {
      // From now on, this should always be true:
      // provider === window.ethereum
      this.startApp(provider) // initialize your app
    } else {
      console.log('Please install MetaMask!')
    }
  }

  async loadAccount() {
    try {
      let accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log('accounts: ', accounts)
      this.setState({ account: accounts[0] })
      if (accounts.length === 0) {
        window.alert('Please login Metamask Account')
        window.location.reload()
      }
    } catch (e) {
      console.log('account: ', e)
    }
  }

  startApp = async (provider) => {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?')
    }
    // Access the decentralized web!
    else {
      // var web3 = new Web3(window.ethereum)
      var address = contractFactoryAddress
      var abi = contractFactoryABI
      contractFactory = new web3.eth.Contract(abi, address)
      this.setState({ contractFactory: contractFactory })
      console.log('contractFactory:', contractFactory)
    }
  }

  createUserContract = async (e) => {
    if (this.state.contractFactory !== 'undefined') {
      try {
        console.log('admin', await contractFactory.methods.getAdmin().call())
        console.log(this.state.account, typeof this.state.account)
        await contractFactory.methods
          .createUser(
            this.state.account,
            this.state.username,
            this.state.dAddress,
          )
          .send({
            from: this.state.account,
            gas: 6721974,
            gasPrice: 20000000000,
          })

        let userContract = await contractFactory.methods.getUser().call()
        console.log(typeof userContract)
        console.log('User contract: ', userContract)

        let username = await contractFactory.methods.getUsername().call()
        console.log(typeof username)
        console.log('username', username)

        let mappingResult = await contractFactory.methods
          .userContractForUser(this.state.account)
          .call()
        console.log('mapping', mappingResult)
      } catch (err) {
        console.log('Error in creating User contract: ', err)
      }
    }
  }

  loadUserContract = async () => {
    const UserJSON = require('./abis/User.json')
    const UserABI = UserJSON.abi
    const UserAddress = '0xe26Bd87D5E758F7c43C63f1895f6b0C2712fAfc6'
    console.log('usercontract', UserAddress)
    var user = new web3.eth.Contract(UserABI, UserAddress)
    console.log('user', user)
    this.setState({ userContract: user })
  }

  getUser = async (e) => {
    await this.loadUserContract()
    console.log(this.state.userContract)
    let username = await this.state.userContract.methods.getUsername().call()
    console.log(('username', username))
  }

  render() {
    return (
      <div>
        <button type="submit" onClick={(e) => this.createUserContract(e)}>
          Create
        </button>
        <button type="submit" onClick={(e) => this.getUser(e)}>
          Get User
        </button>
      </div>
    )
  }
}
export default App
