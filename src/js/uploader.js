/* globals chrome */
'use strict'
const { EventEmitter } = require('events')
const pull = require('pull-stream')
const pullFileReader = require('pull-filereader')
// const toStream = require('pull-stream-to-stream')

class Uploader extends EventEmitter {
  constructor (opts) {
    super()
    this.el = opts.el || document.querySelector('body')

    this.el.addEventListener('dragover', this.dragenter.bind(this))
    this.el.addEventListener('dragenter', this.dragenter.bind(this))
    this.el.addEventListener('drop', this.onDrop.bind(this))

    this.port = chrome.extension.connect({
      name: 'Paratii Communication'
    })

    this.port.onMessage.addListener(this.handleBackgroundResponse.bind(this))
  }

  dragenter (ev) {
    this.statusEl = document.querySelector('.statusContainer')

    ev.stopPropagation()
    ev.preventDefault()
    console.log('dragenter', ev)
  }

  onDrop (ev) {
    console.log('drop', ev)
    if (ev) {
      this.dragenter(ev)
    }

    this.files = []
    // let fReader = new FileReader()

    // fReader.addEventListener('load', () => {
    //   this.files.push(fReader.result)
    // })

    // fReader.onload = (theFile) => {
    //   return (e) => {
    //     console.log('theFile ', theFile)
    //     console.log('e ', e)
    //     this.processInBackground(this.files)
    //   }
    // }

    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      this.files.push(ev.dataTransfer.files[i])
      console.log(ev.dataTransfer.files[i])
      // fReader.readAsDataURL(ev.dataTransfer.files[i])
    }

    if (this.files && this.files.length) {
      // console.log(this.files.map((e) => `Adding ${e.name}`))
      // console.log(fReader.result)
      // this.processInBackground(this.files)
    }
    // WORKING BUT CRASHY
  //   pull(
  //     pull.values(this.files),
  //     pull.through((file) => {
  //       console.log('Adding ', file)
  //     }),
  //     pull.asyncMap((file, cb) => pull(
  //       pullFileReader(file),
  //       // pull.values([{
  //       //   path: file.name,
  //       //   content: pullFileReader(file)
  //       //   /* content: pull(
  //       //     pullFileReader(file),
  //       //     pull.through((chunk) => updateProgress(chunk.length))
  //       //   ) */
  //       // }]),
  //       pull.collect((err, res) => {
  //         if (err) {
  //           return cb(err)
  //         }
  //         const file = res[0]
  //         console.log('Adding %s finished', file)
  //         const contents = Buffer.concat(res)
  //         cb(null, contents)
  //       })
  //     )),
  //    pull.collect((err, files) => {
  //      if (err) {
  //        throw err
  //      }
  //      if (files && files.length) {
  //        console.log('apparently all done')
  //        console.log(files)
  //        this.processInBackground(files)
  //      }
  //    })
  //  )
    let name = null
    pull(
      pull.values(this.files),
      pull.through((file) => {
        console.log('Adding ', file)
      }),
      // pullFileReader(this.files),
      pull.asyncMap((file, cb) => pull(
        pullFileReader(file),
        // pull.values([{
        //   path: file.name,
        //   content: pullFileReader(file)
        //   /* content: pull(
        //     pullFileReader(file),
        //     pull.through((chunk) => updateProgress(chunk.length))
        //   ) */
        // }]),
        pull.through((chunk) => {
          console.log('loading ', file, chunk)
          this.sendChunkToBackground(file.name, chunk)
          name = file.name
        }),
        pull.collect((err, res) => {
          if (err) {
            return cb(err)
          }
          // const file = res[0]
          console.log('Adding finished', res)

          const contents = Buffer.concat(res)
          cb(null, contents)
        })
      )),
      pull.collect((err, chunks) => {
        if (err) throw err
        console.log('Adding finished', chunks)
        // this.processInBackground(chunks)
        this.sendEnd(name)
      })
    )
  }

  processInBackground (files) {
    console.log('sending ', files)
    this.port.postMessage({
      command: 'upload',
      payload: files
    })
  }

  sendChunkToBackground (name, chunk) {
    console.log('sending chunk: ', name)
    this.port.postMessage({
      command: 'upload-chunk',
      name: name,
      data: chunk
    })
  }

  sendEnd (name) {
    console.log('sending END', name)
    this.port.postMessage({
      command: 'upload-end',
      name: name
    })
  }

  handleBackgroundResponse (msg) {
    console.log('Msg recieved ', msg)
  }
}

module.exports = Uploader
