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

const testFileID = 'QmRTxuZ8Uwp84g6TTNXupCPW6G3MHQQyHwqGqetU9Bhdhy'

node.on('ready', () => {
    console.log('IPFS node is ready')
    console.log('IPFS cat before')
    node.files.cat(testFileID, (err, stream) => {
        if (err) { return cb(err) }
        let data = ''
        stream.on('data', (chunk) => {
            data += chunk
        })
        stream.on('end', () => {
            console.log('IPFS cat success')
            console.log(data)
            console.log(testFileID)
        })
    })
})
