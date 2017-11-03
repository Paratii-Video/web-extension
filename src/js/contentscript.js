'use strict'

console.log('[PARATII] content script Loaded')

const $ = require('jquery')

// Gecko fix
if(typeof chrome === 'undefined') {
    const chrome = browser
} 

let playerBase = 'http://localhost/paratii/player.html'

$(() => {
    if($('.paratii-player').length) { 
        $('.paratii-player').each((i, el) => {
            let uri = $(el).attr('data-uri');
            $(el).html('<iframe src="' + playerBase + '#' + encodeURIComponent(uri) + '" width="854" height="480" allowscriptaccess allowtransparency allowfullscreen scrolling="no" frameborder="0"></iframe>')
        })
    }
})

window.addEventListener('message', (event) => {
    /*if (event.source != window)
        return*/
	
	if (event.data.type && event.data.type == 'PARATII_DATA') {
		console.log('Received chunk data from extension...')
		let chunk = event.data.data
	}
    if (event.data.type && event.data.type == 'PARATII_COMM') {
		console.log('Received message from page...')
		console.log(event.data)
		
		let payload = event.data.payload
		if (payload.action == 'start') {
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