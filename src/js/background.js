/* globals chrome */
'use strict'

console.log('[PARATII] background.js')

const IPFS = require('ipfs')
const node = new IPFS({
  bitswap: {
    maxMessageSize: 32 * 1024
    // meterController: paratiiIPFS.meterController
  },
  repo: String(Math.random()),
  config: {
    Addresses: {
      Swarm: [
        '/dns4/star.paratii.video/wss/p2p-webrtc-star'
      ]
    },
    Bootstrap: [
      // '/ip4/127.0.0.1/tcp/4003/ws/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
      // '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/9091/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
      // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss/ipfs/Qmbd5jx8YF1QLhvwfLbCTWXGyZLyEJHrPbtbpRESvYs4FS',
      // '/ip4/34.213.133.148/tcp/4003/ws/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW',
      '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
    ]
  }
})

node.on('ready', () => {
  console.log('[PARATII] IPFS node Ready')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.debug('Got Msg from contentscript: \n request:', request, '\nsender:', sender)
  if (request.payload) {
    if (request.payload.action === 'paratii.start') {
      if (node.isOnline()) {
        console.log('IPFS is already running.')
        sendResponse({
          response: 'paratii.success.ok'
        })
      } else {
        node.start(() => {
          node.on('ready', () => {
            console.log('IPFS node is ready')
            sendResponse({
              response: 'paratii.success.ok'
            })

            // let uri = request.payload.uri
            // console.log(uri)
            // node.files.cat(uri, (err, stream) => {
            //   if (err) {
            //     console.log('IPFS cat error')
            //   }
            //   stream.on('data', (data) => {
            //     console.log('Received data packet')
            //     console.log(data)
            //     chrome.tabs.query({
            //       active: true
            //     }, (tabs) => {
            //       tabs.forEach((tab) => {
            //         chrome.tabs.sendMessage(tab, {
            //           type: 'PARATII_DATA',
            //           requestID: uri,
            //           data: data
            //         }, (response) => {
            //           console.log('Received response to data packet...')
            //           console.log(response)
            //           // onDataResponseHandler(response)
            //         })
            //       })
            //     })
            //   })
            // })
          })
        })
      }
    } else if (request.payload.action === 'paratii.stop') {
      console.log('Stopping IPFS')
      node.stop()
    }
  }
})
