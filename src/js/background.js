/* globals chrome */
'use strict'

console.log('[PARATII] background.js')

const IPFS = require('ipfs')
const pull = require('pull-stream')
// const pullFileReader = require('pull-filereader')
// const toStream = require('buffer-to-stream')
// const toPullStream = require('stream-to-pull-stream')
const MultistreamUploader = require('./multistreamUpload.js')

const node = new IPFS({
  bitswap: {
    maxMessageSize: 32 * 1024
    // meterController: paratiiIPFS.meterController
  },
  repo: 'paratii-' + String(Math.random() + Date.now()).replace(/\./g, ''),
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

const uploader = new MultistreamUploader({
  node: node
})

node.on('ready', () => {
  console.log('[PARATII] IPFS node Ready')
})

// -----------------------------------------------------------------------------
// [Long Lived connection]
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connected to ', port)
  port.onMessage.addListener((msg) => {
    // try {
    //   msg.payload = JSON.parse(msg.payload)
    // } catch (e) {
    //   console.error('couldn\'t parse msg.payload')
    // }

    console.log('message recieved', msg.payload)
    port.postMessage('Hi Popup.js')

    if (msg.command === 'upload-chunk') {
      // upload that shit.
      console.log('upload-chunk: ', msg)
      uploader.createOrWrite(msg.name, msg.data)
    } else if (msg.command === 'upload-end') {
      console.log('upload-end: ', msg)
      uploader.end(msg.name)
    }

  //   pull(
  //     pull.values(msg.payload),
  //     pull.through((file) => {
  //       console.log('Adding ', file)
  //     }),
  //     pull.asyncMap((file, cb) => pull(
  //       pull.values([{
  //         path: 'test_file',
  //         content: toPullStream(toStream(Buffer.from(file)))
  //         /* content: pull(
  //           pullFileReader(file),
  //           pull.through((chunk) => updateProgress(chunk.length))
  //         ) */
  //       }]),
  //       node.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
  //       pull.collect((err, res) => {
  //         if (err) {
  //           return cb(err)
  //         }
  //         const file = res[0]
  //         console.log('🍾 yay something happened')
  //         console.log(file)
  //       })
  //     )),
  //    pull.collect((err, files) => {
  //      if (err) {
  //        throw err
  //      }
  //      if (files && files.length) {
  //        console.log('apparently all done')
  //        console.log(files)
  //      }
  //    })
  //  )
  //  ==========================================================
    // Working but crashy
  //   pull(
  //     pull.values(msg.payload),
  //     pull.through((file) => {
  //       console.log('Adding ', file)
  //     }),
  //     pull.asyncMap((file, cb) => pull(
  //       pull.values([{
  //         path: 'test_file',
  //         content: toPullStream(toStream(Buffer.from(file)))
  //         /* content: pull(
  //           pullFileReader(file),
  //           pull.through((chunk) => updateProgress(chunk.length))
  //         ) */
  //       }]),
  //       node.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
  //       pull.collect((err, res) => {
  //         if (err) {
  //           return cb(err)
  //         }
  //         const file = res[0]
  //         console.log('🍾 yay something happened')
  //         console.log(file)
  //       }))),
  //    pull.collect((err, files) => {
  //      if (err) {
  //        throw err
  //      }
  //      if (files && files.length) {
  //        console.log('apparently all done')
  //        console.log(files)
  //      }
  //    })
  //  )
  })
})
// -----------------------------------------------------------------------------

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
      let file = request.payload.file
      console.log('file should be', file)
      /* let ipfsfile = {
        path: 'video.mp4',
        content: file
      } */
      /* let updateProgress = (size) => {

      } */
      let files = [file]
      pull(
        pull.values(files),
        pull.through((file) => {
          console.log('Adding ', file)
        }),
        // node.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
        pull.asyncMap((file, cb) => pull(
          pull.collect((err, res) => {
            if (err) {
              return cb(err)
            }
            const file = res[0]
            console.log('🍾 yay something happened')
            console.log(file)
            cb(null, file)
          }))),
       pull.collect((err, files) => {
         if (err) {
           console.error('gotcha ', err)
           throw err
         }
         if (files && files.length) {
           console.log('apparently all done')
           console.log(files)
         }
       })
     )
      // console.log('ipfs file should be ', ipfsfile)
      /* node.files.add(ipfsfile, (err, result) => { // Upload buffer to IPFS
        if (err) {
          console.error(err)
          return
        }
        console.log('Yay something succeeded')
        console.log('yay result is ', result)
        if (!result) {
          console.log('ipfs failed omg')
          return
        }
        if (result.length < 1) {
          console.log('ipfs didn\'t upload')
          return
        }
        let hash = result[0].hash
        console.log('YAAY OMG YES SUCCESS UPLOADING FILE OMG')
        console.log('IPFS hash is ', hash)
        let url = 'https://ipfs.io/ipfs/' + hash
        console.log('ipfs.io URL is ', url)
        console.log('🍾🍾🍾')
      }) */
    }
  }
})

//
// pull(
//   pull.values(msg.payload),
//   pull.through((file) => {
//     console.log('Adding ', file)
//   }),
//   pull.asyncMap((file, cb) => pull(
//     pull.values([{
//       path: file.name,
//       content: pullFileReader(file)
//       /* content: pull(
//         pullFileReader(file),
//         pull.through((chunk) => updateProgress(chunk.length))
//       ) */
//     }]),
//     node.files.createAddPullStream({chunkerOptions: {maxChunkSize: 64048}}), // default size 262144
//     pull.collect((err, res) => {
//       if (err) {
//         return cb(err)
//       }
//       const file = res[0]
//       console.log('🍾 yay something happened')
//       console.log(file)
//     }))),
//  pull.collect((err, files) => {
//    if (err) {
//      throw err
//    }
//    if (files && files.length) {
//      console.log('apparently all done')
//      console.log(files)
//    }
//  })
// )
