/* globals chrome */
'use strict'

console.log('[PARATII] background.js')

const IPFS = require('ipfs')
const node = new IPFS({
  /*bitswap: {
    maxMessageSize: 32 * 1024
    // meterController: paratiiIPFS.meterController
  },*/
  repo: 'paratii-' + String(Math.random() + Date.now()).replace(/\./g, ''),
  /*config: {
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
  }*/
})

node.on('ready', () => {
  console.log('[PARATII] IPFS node Ready')
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Got Msg from contentscript: \n request:', request, '\nsender:', sender)
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
          })
        })
      }
    } else if (request.payload.action === 'paratii.stop') {
      console.log('Stopping IPFS')
      node.stop()
    } else if (request.payload.action === 'paratii.upload') {
      console.log('Got msg with action upload')
      console.log(request.payload)
      let buffer = request.payload.buffer
      console.log('buffer should be', buffer)
      let file = {
        path: 'video.mp4',
        content: buffer
      }
      console.log('file should be ', file)
      node.files.add(file, (err, result) => { // Upload buffer to IPFS
        if(err) {
          console.error(err)
          return
        }
        console.log('Yay something succeeded')
        console.log('yay result is ', result)
        if(!result) {
          console.log('ipfs failed omg')
          return
        }
        if(result.length < 1) {
          console.log('ipfs didn\'t upload')
          return
        }
        let hash = result[0].hash
        console.log('YAAY OMG YES SUCCESS UPLOADING FILE OMG')
        console.log('IPFS hash is ', hash)
        let url = 'https://ipfs.io/ipfs/' + hash
        console.log('ipfs.io URL is ', url)
        console.log('🍾🍾🍾')
      })
    }
  }
})
