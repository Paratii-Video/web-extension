/* globals chrome */
'use strict'

console.log('[PARATII] content script Loaded')

// const $ = require('jquery')

// Gecko fix
// if (typeof chrome === 'undefined') {
//   chrome = browser
// }

// let playerBase = 'http://localhost/paratii/player.html'
//
// $(() => {
//   if ($('.paratii-player').length) {
//     $('.paratii-player').each((i, el) => {
//       let uri = $(el).attr('data-uri')
//       $(el).html('<iframe src="' + playerBase + '#' + encodeURIComponent(uri) + '" width="854" height="480" allowscriptaccess allowtransparency allowfullscreen scrolling="no" frameborder="0"></iframe>')
//     })
//   }
// })

function detectPlayers (selector) {
  let players = document.querySelectorAll(selector)
  for (let i = 0; i < players.length; i++) {
    let player = players[i]
    console.log('player: ', player)
    let uri = player.dataset['uri']
    if (uri) {
      player.innerHTML = '<iframe src="' + uri + '" width="854" height="480" allowscriptaccess allowtransparency allowfullscreen scrolling="no" frameborder="0"></iframe>'
    }
  }
}

// disabled bc i'm working on upload for now
detectPlayers('.paratii-player')

// Testing msg passing between contentscript => background.js
/* chrome.runtime.sendMessage({
  payload: {
    action: 'paratii.start',
    uri: 'test URL'
  }
}, (response) => {
  console.log('Received message from extension...')
  console.log(response)
  // window.postMessage({
  //   type: 'PARATII_RESP',
  //   payload: {
  //     action: 'paratii.replyfromextension',
  //     response: response,
  //     verbatim: true
  //   }
  // }, '*')
}) */

window.addEventListener('message', (event) => {
    /* if (event.source != window)
        return */

  if (event.data.type && event.data.type === 'PARATII_DATA') {
    let chunk = event.data.data
    console.log('Received chunk data from extension...', chunk)
  }
  if (event.data.type && event.data.type === 'PARATII_COMM') {
    console.log('Received message from page...')
    console.log(event.data)

    let payload = event.data.payload
    if (payload.action === 'upload') {
      console.log('Supposed to send data to extension for uploading')
      let arrayBufferForUploading = payload.buffer
      console.log(arrayBufferForUploading)
      chrome.runtime.sendMessage({
        payload: {
          action: 'paratii.upload',
          buffer: arrayBufferForUploading
        }
      }, (response) => {
        console.log('Received message from extension...')
        console.log(response)
        window.postMessage({
          type: 'PARATII_RESP',
          payload: {
            action: 'paratii.replyfromextension',
            response: response,
            verbatim: true
          }
        }, '*')
      })
    }
    if (payload.action === 'start') {
      let videoURI = payload.uri
      chrome.runtime.sendMessage({
        payload: {
          action: 'paratii.start',
          uri: videoURI
        }
      }, (response) => {
        console.log('Received message from extension...')
        console.log(response)
        window.postMessage({
          type: 'PARATII_RESP',
          payload: {
            action: 'paratii.replyfromextension',
            response: response,
            verbatim: true
          }
        }, '*')
      })
    }
  }
})
