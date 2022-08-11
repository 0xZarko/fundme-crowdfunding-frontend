//In the front-end, require doesnt work (we use the import keyword)
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

//Since we can't assign functions to onclick in the HTML because it's a "module" type, we do
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    //We can check for a Metamask wallet with the window.ethereum object
    if (typeof window.ethereum !== "undefined") {
        //If we detected a Metamask wallet
        try {
            //We try to connect to it
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected!" //We change the button to show connected
        const accounts = await ethereum.request({ method: "eth_accounts" }) //We get all the connected accounts
        console.log(accounts) //And print them
    } else {
        connectButton.innerHTML = "No wallet detected"
    }
}

//Fund
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount} ETH...`)

    //We first check if there's a wallet to use to fund
    if (typeof window.ethereum !== "undefined") {
        //To send a transaction we need a provider(connection to blockchain) and a signer(wallet)
        //Then we also need the contract to interact with (ABI and address)

        //First, we get the provider from ethers and Metamask:
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //Then, we get the tx signer directly from the connected Metamask account:
        const signer = provider.getSigner()
        //We now get the contract to interact with from the constants.js file and connect it to the signer:
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //We want to listen for the transaction to be mined so we can show the user
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`) //All transaction responses have a hash

    //The resolve is the function that should be called when the Promise resolves correctly
    //The reject is tue function that should be called if the Promise times out or errors out
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Transaction completed with ${transactionReceipt.confirmations} confirmations.`
            )
            resolve() //We call resolve here because we can confirm the TX has been mined
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress) //You can get the balance of any address using the provider
        console.log(`The contract has ${ethers.utils.formatEther(balance)} ETH`) //This formats the eth in a readeable way
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
