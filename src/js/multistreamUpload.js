'use strict'
const { EventEmitter } = require('events')
const streamBuffers = require('stream-buffers')

class MultistreamUploader extends EventEmitter {
  constructor (opts) {
    super()
    this.node = opts.node
    this.readableStreamBuffers = {}
  }

  createOrWrite (name, data) {
    if (this.readableStreamBuffers[name]) {
      console.log('putting the 0101 in the stream')
      this.readableStreamBuffers[name].put(Buffer.from(data))
    } else {
      // create a streambuffer, hook it up
      this.init({
        chunkSize: 32048,
        name: name,
        data: data
      }, () => {
        console.log('MultistreamUploader initiated')
      })
    }
  }

  end (name) {
    this.readableStreamBuffers[name].stop()
  }

  init (opts, cb) {
    // create a readable stream, this is where we're gonna push the chunks.
    this.readableStreamBuffers[opts.name] = new streamBuffers.ReadableStreamBuffer({
      chunkSize: opts.chunkSize || 32048 // in bytes
    })

    this.node.files.createAddStream((err, stream) => {
      if (err) throw err

      stream.on('data', (file) => {
        console.log(`Added ${file.path} as ${file.hash}`)

        // if (progressbar) {
        //   clearInterval(progressbar)
        //   progress = 0
        // }
      })

      this.readableStreamBuffers[opts.name].on('data', (chunk) => {
        // progress += chunk.byteLength
      })

      if (!this.readableStreamBuffers[opts.name].destroy) {
        this.readableStreamBuffers[opts.name].destroy = () => {}
      }

      stream.write({
        path: opts.name,
        content: this.readableStreamBuffers[opts.name]
      })

      this.readableStreamBuffers[opts.name].put(Buffer.from(opts.data))
      // this.readableStreamBuffers[opts.name].stop()

      this.readableStreamBuffers[opts.name].on('end', () => {
        stream.end()
      })

      this.readableStreamBuffers[opts.name].resume()

      return cb()

      // progress.
      // let progressbar = setInterval(() => {
      //   console.log('progress: ', progress, '/', fileSize, ' = ', Math.floor((progress / fileSize) * 100), '%')
      // }, 5000)
    })
  }
}

module.exports = MultistreamUploader
