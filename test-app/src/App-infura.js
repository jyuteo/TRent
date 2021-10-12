import './App.css'
import React, { Component } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import Web3 from 'web3'
var web3 = new Web3(window.ethereum)
const ethereum = window.ethereum

const userContractCreatorJSON = require('./abis/UserContractCreator.json')
const userContractCreatorABI = userContractCreatorJSON.abi
const userContractCreatorAddress = '0xA1069cDA422ac5692ed2026c8bb91A49759e095c'
var userContractCreator

const itemContractCreatorJSON = require('./abis/ItemContractCreator.json')
const itemContractCreatorABI = itemContractCreatorJSON.abi
const itemContractCreatorAddress = '0xD3B79F1E40D61da0b29e090B7964a59e7C33D7D6'
var itemContractCreator

const rentalContractCreatorJSON = require('./abis/RentalContractCreator.json')
const rentalContractCreatorABI = rentalContractCreatorJSON.abi
const rentalContractCreatorAddress =
  '0x4E9B58a76981FcaCE0ce7ff420b697555E08b891'
var rentalContractCreator

const userJSON = require('./abis/User.json')
const userABI = userJSON.abi
var userContract

const itemJSON = require('./abis/Item.json')
const itemABI = itemJSON.abi
var itemContract

const rentalJSON = require('./abis/Rental.json')
const rentalABI = rentalJSON.abi
var rentalContract

class App extends Component {
  async componentDidMount() {
    await this.loadweb3()
    await this.loadAccount()
  }

  constructor(props) {
    super(props)
    this.state = {
      userContractCreator: null,
      itemContractCreator: null,
      rentalContractCreator: null,
      userContract: null,
      itemContract: null,
      rentalContract: null,
      userContractAddress: null,
      itemContractAddress: null,
      rentalContractAddress: null,
      account: '',
      username: 'testuser',
      dAddress: 'deliveryAddress',
      itemDetails: null,
    }
    this.onNewUser = this.onNewUser.bind(this)
    this.onNewItem = this.onNewItem.bind(this)
    this.onNewRental = this.onNewRental.bind(this)
  }

  async loadweb3() {
    const provider = await detectEthereumProvider()
    if (!provider) {
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

  loadUserContractCreator = async () => {
    userContractCreator = new web3.eth.Contract(
      userContractCreatorABI,
      userContractCreatorAddress,
    )
    this.setState({ userContractCreator: userContractCreator })
    console.log('userContractCreator:', userContractCreator)
  }

  loadItemContractCreator = async () => {
    itemContractCreator = new web3.eth.Contract(
      itemContractCreatorABI,
      itemContractCreatorAddress,
    )
    this.setState({ itemContractCreator: itemContractCreator })
    console.log('itemContractCreator:', itemContractCreator)
  }

  loadRentalContractCreator = async () => {
    rentalContractCreator = new web3.eth.Contract(
      rentalContractCreatorABI,
      rentalContractCreatorAddress,
    )
    this.setState({ rentalContractCreator: rentalContractCreator })
    console.log('rentalContractCreator:', rentalContractCreator)
  }

  loadUserContract = async () => {
    userContract = new web3.eth.Contract(
      userABI,
      this.state.userContractAddress,
    )
    this.setState({ userContract: userContract })
    console.log('userContract:', userContract)
  }

  loadItemContract = async () => {
    itemContract = new web3.eth.Contract(
      itemABI,
      this.state.itemContractAddress,
    )
    this.setState({ itemContract: itemContract })
    console.log('itemContract:', itemContract)
  }

  loadRentalContract = async () => {
    rentalContract = new web3.eth.Contract(
      rentalABI,
      this.state.rentalContractAddress,
    )
    this.setState({ rentalContract: rentalContract })
    console.log('rentalContract:', rentalContract)
  }

  createUserContract = async (e) => {
    await this.loadUserContractCreator()
    if (this.state.userContractCreator !== 'undefined') {
      try {
        this.state.userContractCreator.events
          .userContractCreated()
          .on('data', this.onNewUser)

        await this.state.userContractCreator.methods
          .createUserContract(
            this.state.account,
            this.state.username,
            this.state.dAddress,
          )
          .send({
            from: this.state.account,
            gas: 6721974,
            gasPrice: 10000000000,
          })
      } catch (err) {
        console.log('Error in creating User contract: ', err)
      }
    }
  }

  onNewUser = function (e) {
    this.setState({
      userContractAddress: e.returnValues.userContract,
    })
    console.log('userContractAddress:', e.returnValues.userContract)
  }

  getUser = async (e) => {
    await this.loadUserContract()
    // let username = await this.state.userContract.methods.getUsername().call()
    // console.log('username', username)
    let username = await this.state.userContract.methods.username().call()
    console.log('username', username)
  }

  createItemContract = async (e) => {
    await this.loadItemContractCreator()
    this.setState({
      itemDetails: {
        ownerUserContract: this.state.userContractAddress,
        ownerAddress: this.state.account,
        name: 'testItemName',
        collectionOrReturnAddress: 'testCollectionAddress',
        description: 'itemDescription',
        rentPerDay: 10000000, // in gwei
        maxAllowableLateDays: 5,
        multipleForLateFees: 2,
        isAvailableForRent: true,
        mediaIPFSHashes: ['a', 'b'],
      },
    })
    if (this.state.itemContractCreator !== 'undefined') {
      try {
        this.state.itemContractCreator.events
          .itemContractCreated()
          .on('data', this.onNewItem)

        await this.state.itemContractCreator.methods
          .createItemContract(this.state.itemDetails)
          .send({
            from: this.state.account,
            gas: 6721974,
            gasPrice: 20000000000,
          })
      } catch (err) {
        console.log('Error in creating Item contract: ', err)
      }
    }
  }

  onNewItem = function (e) {
    this.setState({
      itemContractAddress: e.returnValues.itemContract,
    })
    console.log('itemContractAddress:', e.returnValues.itemContract)
  }

  getItem = async (e) => {
    await this.loadItemContract()
    let itemDetails = await this.state.itemContract.methods
      .getItemDetails()
      .call()
    console.log('itemDetails', itemDetails)
  }

  createRentalContract = async (e) => {
    await this.loadRentalContractCreator()
    if (this.state.rentalContractCreator !== 'undefined') {
      try {
        this.state.rentalContractCreator.events
          .rentalContractCreated()
          .on('data', this.onNewRental)

        await this.state.rentalContractCreator.methods
          .createRentalContract(
            '0xd222462d409308811cD0a4841644478DF326C4E2',
            {
              ownerUserContract: '0x668e75639B0d7a6e3e664cCC4FBCc99754e885aa',
              ownerAddress: '0x8e8eee6e9e37ccdda5735e26260dbbd720440784',
              name: 'testItemName',
              collectionOrReturnAddress: 'testCollectionAddress',
              description: 'itemDescription',
              rentPerDay: 10000000, // in gwei
              maxAllowableLateDays: 5,
              multipleForLateFees: 2,
              isAvailableForRent: true,
              mediaIPFSHashes: ['a', 'b'],
            },
            '0xe3d0B1c451606c2E5a6bca4fdfa781E07b595230',
            this.state.account,
            10000,
            200,
            1633442907,
            1633529307,
          )
          .send({
            from: this.state.account,
            gas: 2000000,
            gasPrice: 200000,
            value: 200000000000,
          })
      } catch (err) {
        console.log('Error in creating Rental contract: ', err)
      }
    } else {
      console.log('rentalContractCreator undefined')
    }
  }

  onNewRental = function (e) {
    this.setState({
      rentalContractAddress: e.returnValues.rentalContract,
    })
    console.log('rentalContractAddress:', e.returnValues.rentalContract)
  }

  getRental = async (e) => {
    await this.loadRentalContract()
    let renterAddress = await this.state.rentalContract.methods
      .getRenterAddress()
      .call()
    let contractBalance = await this.state.rentalContract.methods
      .getContractBalance()
      .call()
    console.log('renterAddress', renterAddress)
    console.log('rentalContractBalance', contractBalance)
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
        <button type="submit" onClick={(e) => this.createItemContract(e)}>
          Create Item
        </button>
        <button type="submit" onClick={(e) => this.getItem(e)}>
          Get Item
        </button>
        <button type="submit" onClick={(e) => this.createRentalContract(e)}>
          Create Rental
        </button>
        <button type="submit" onClick={(e) => this.getRental(e)}>
          Get Rental
        </button>
      </div>
    )
  }
}
export default App
