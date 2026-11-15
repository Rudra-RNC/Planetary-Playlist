import * as Tone from 'tone'
import { SONIFICATION } from '../config/sonification'
import type { NoteEvent, } from '../mapping/noteMapping'

export class AudioEngine {
  private voices = [
    new Tone.Synth({ oscillator: { type: 'triangle' } }),
    new Tone.Synth({ oscillator: { type: 'sine' } }),
    new Tone.Synth({ oscillator: { type: 'fatsawtooth' } }),
  ]
  private filter = new Tone.Filter(4200, 'lowpass')
  private reverb = new Tone.Reverb({ decay: 3.2, wet: SONIFICATION.reverbWet })
  private compressor = new Tone.Compressor(-18, 3)
  private limiter = new Tone.Limiter(-1).toDestination()
  private drone = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 1.2, release: 1.5 } })
  private events: NoteEvent[] = []
  private loopId?: number
  private column = 0
  private bpm = SONIFICATION.tempo
  private volume = SONIFICATION.defaultVolume
  private speed = 1
  private rootNote = 'C3'
  private dronePlaying = false
  private playing = false
  private onColumn?: (column: number) => void

  constructor(onColumn?: (column: number) => void) {
    this.onColumn = onColumn
    this.voices.forEach(voice => { voice.chain(this.filter, this.reverb, this.compressor, this.limiter); voice.volume.value = this.volume })
    this.drone.chain(this.filter, this.reverb, this.compressor, this.limiter); this.drone.volume.value = -24
  }
  async start() { await Tone.start(); Tone.getTransport().start() }
  setEvents(events: NoteEvent[], bpm: number, rootNote = 'C3') { this.events = events; this.bpm = bpm; this.rootNote = rootNote; this.column = 0 }
  setSpeed(speed: number) { this.speed = speed; if (this.playing && this.loopId !== undefined) this.play() }
  setDroneLevel(lightness: number) { this.drone.volume.value = -30 + Math.max(0, Math.min(1, lightness)) * 9 }
  setVolume(value: number) { this.volume = value; this.voices.forEach(voice => { voice.volume.value = value }) }
  getVolume() { return this.volume }
  play() {
    Tone.getTransport().stop(); Tone.getTransport().cancel()
    this.loopId = Tone.getTransport().scheduleRepeat(time => {
      this.events.filter(event => event.column === this.column).forEach(event => {
        const voice = event.hue < 70 ? this.voices[0] : event.hue < 170 ? this.voices[1] : this.voices[2]
        voice.triggerAttackRelease(event.pitch, SONIFICATION.noteDuration, time, event.velocity)
      })
      this.onColumn?.(this.column)
      this.column = (this.column + 1) % SONIFICATION.columns
    }, `${60 / (this.bpm * this.speed) / 4}s`)
    if (!this.dronePlaying) { this.drone.triggerAttack(this.rootNote); this.dronePlaying = true }
    this.playing = true
    Tone.getTransport().start()
  }
  pause() { Tone.getTransport().pause(); this.drone.triggerRelease(); this.dronePlaying = false; this.playing = false }
  restart() { this.column = 0; Tone.getTransport().stop(); this.play() }
  dispose() { if (this.loopId !== undefined) Tone.getTransport().clear(this.loopId); this.voices.forEach(voice => voice.dispose()); this.drone.dispose(); this.filter.dispose(); this.reverb.dispose(); this.compressor.dispose(); this.limiter.dispose() }
}
