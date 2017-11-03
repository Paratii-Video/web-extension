'use strict'

console.log('[PARATII] background.js')

const IPFS = require('ipfs')
const node = new IPFS({
    bitswap: {
        maxMessageSize: 32 * 1024
    },
    repo: 'paratii-' + String(Math.random() + Date.now()).replace(/\./g, ''),
    config: {
        Swarm: [
            '/dns4/star.paratii.video/wss/p2p-webrtc-star'
        ],
        Bootstrap: [
            '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW',
        ]
    }
})

let nodeReady = false

node.on('ready', () => {
    console.log('IPFS node is ready')
    nodeReady = true
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.payload) {
		if(request.payload.action == 'paratii.start') {
			if(!nodeReady) {
				sendResponse({
					response: 'paratii.error.ipfsnotready'
				})
			} else {
				let uri = request.payload.uri
				console.log(uri)
				node.files.cat(uri, (stream) => {
					stream.on('data', (data) => {
						console.log('Received data packet')
						console.log(data)
						chrome.tabs.query({
							active: true
						}, (tabs) => {
							tabs.forEach((tab) => {
								chrome.tabs.sendMessage(tab, {
									type: 'PARATII_DATA',
									requestID: uri,
									data: data
								}, (response) => {
									console.log('Received response to data packet...')
									console.log(response)
									onDataResponseHandler(response)
								})
							})
						})
					})
					sendResponse({
						response: 'paratii.success.ok'
					})
				})
				sendResponse({
					response: 'paratii.papoy.papoy'
				})
			}
		}
	}
})