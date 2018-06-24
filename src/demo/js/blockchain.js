import Web3 from 'web3';

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
var connected = false

console.log(web3)
console.log(web3.isConnected())

if (web3 && web3.isConnected()) {

	connected = true
	console.log(connected)
}

console.log(web3.eth.accounts)
console.log(web3.eth.coinbase)
console.log(web3.eth.blockNumber)
console.log(web3.eth.getBlock(1))