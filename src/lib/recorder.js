/* eslint-disable */
// taken from https://github.com/grishkovelli/vue-audio-recorder/tree/master/src/lib
import Encoder from './encoder'

export default class {
  constructor (options = {}) {
    this.afterRecording  = options.recordingFinished
    this.micFailed       = options.micFailed
    this.bitRate         = 128; //options.bitRate
    this.sampleRate      = 44100; //options.sampleRate

    this.bufferSize = 4096

    this.isPause     = false
    this.isRecording = false
  }

  start () {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        echoCancellation: false
      }
    }

    navigator.mediaDevices
             .getUserMedia(constraints)
             .then(stream => this._micCaptured(stream))
             .catch(error => this.micFailed && this.micFailed(error))

    this.isPause = false
    this.isRecording = true
    if (!this.lameEncoder) this.lameEncoder = new Encoder({
      bitRate    : this.bitRate,
      sampleRate : this.sampleRate
    })
  }

  stop () {
    this.stream.getTracks().forEach((track) => track.stop())
    this.input.disconnect()
    this.processor.disconnect()
    this.context.close()

    const record = this.lameEncoder.finish()

    this.isPause     = false
    this.isRecording = false

    this.afterRecording && this.afterRecording(record)
  }

  pause () {
    this.stream.getTracks().forEach((track) => track.stop())
    this.input.disconnect()
    this.processor.disconnect()
    this.context.close()

    this.isPause = true

    this.pauseRecording && this.pauseRecording('pause recording')
  }

  _micCaptured (stream) {
    this.context    = new(window.AudioContext || window.webkitAudioContext)()
    this.input      = this.context.createMediaStreamSource(stream)
    this.processor  = this.context.createScriptProcessor(this.bufferSize, 1, 1)
    this.stream     = stream

    this.processor.onaudioprocess = (ev) => {
      const sample = ev.inputBuffer.getChannelData(0)
      this.lameEncoder.encode(sample)
    }

    this.input.connect(this.processor)
    this.processor.connect(this.context.destination)
  }

}
