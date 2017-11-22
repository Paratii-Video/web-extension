'use strict'

console.log('[PARATII] popup.js ---')

// var jquery = require('jquery')
// var popper = require('popper.js')
const Uploader = require('./uploader.js')
let uploader = new Uploader({el: document.querySelector('body')})

console.log('uploader ready ', uploader)
