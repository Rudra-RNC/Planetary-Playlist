import * as Tone from 'tone'
import { resolveConfig, SONIFICATION, type TrackConfig } from '../config/sonification'
import type { NoteEvent } from '../mapping/noteMapping'

export class AudioEngine {
  private voices = [
    new Tone.Synth({ oscillator: { type: 'triangle' } }),
    new Tone.Synth({ oscillator: { type: 'sine' } }),
    new Tone.Synth({ oscillator: { type: 'fatsawtooth' } }),
  ]
  private voicePanners = [new Tone.Panner(0), new Tone.Panner(0), new Tone.Panner(0)]
  private filter = new Tone.Filter(SONIFICATION.master.filterMaxHz, 'lowpass')
  private reverb = new Tone.Reverb({ decay: SONIFICATION.master.reverbDecaySeconds, wet: SONIFICATION.master.reverbWet })
  private compressor = new Tone.Compressor(SONIFICATION.master.compressorThresholdDb, SONIFICATION.master.compressorRatio)
  private limiter = new Tone.Limiter(SONIFICATION.master.limiterCeilingDb).toDestination()
  private drone = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 1.2, release: 1.5 } })
  private events: NoteEvent[] = []
  private loopId?: number
  private column = 0
  private bpm: number = SONIFICATION.timing.defaultBpm
  private volume: number = SONIFICATION.master.defaultVolumeDb
  private speed = 1
  private rootNote = 'C3'
  private dronePlaying = false
  private playing = false
  private onColumn?: (column: number) => void

  constructor(onColumn?: (column: number) => void) {
    this.onColumn = onColumn
    this.voices.forEach((voice, index) => { voice.chain(this.voicePanners[index], this.filter, this.reverb, this.compressor, this.limiter); voice.volume.value = this.volume })
    this.drone.chain(this.filter, this.reverb, this.compressor, this.limiter); this.drone.volume.value = SONIFICATION.master.droneVolumeDb
  }
  async start() { await Tone.start(); Tone.getTransport().start() }
  setEvents(events: NoteEvent[], track: TrackConfig) {
    const config = resolveConfig(track)
    this.events = events
    this.bpm = config.timing.bpm
    this.rootNote = config.track.rootNote
    this.column = Math.min(this.column, SONIFICATION.grid.columns - 1)
  }
  setSpeed(speed: number) { this.speed = speed; if (this.playing && this.loopId !== undefined) this.play() }
  setDroneLevel(lightness: number) {
    const normalized = Math.max(0, Math.min(1, lightness))
    this.drone.volume.value = SONIFICATION.master.droneMinVolumeDb + normalized * (SONIFICATION.master.droneMaxVolumeDb - SONIFICATION.master.droneMinVolumeDb)
    this.filter.frequency.value = SONIFICATION.master.filterMinHz + normalized * (SONIFICATION.master.filterMaxHz - SONIFICATION.master.filterMinHz)
  }
  setVolume(value: number) { this.volume = value; this.voices.forEach(voice => { voice.volume.value = value }) }
  getVolume() { return this.volume }
  play() {
    Tone.getTransport().stop(); Tone.getTransport().cancel()
    this.loopId = Tone.getTransport().scheduleRepeat(time => {
      this.events.filter(event => event.column === this.column).forEach(event => {
        const voiceIndex = event.hue < SONIFICATION.timbre.warmHueMax ? 0 : event.hue < SONIFICATION.timbre.greenHueMax ? 1 : 2
        const voice = this.voices[voiceIndex]
        this.voicePanners[voiceIndex].pan.value = event.pan
        const duration = voiceIndex === 0 ? SONIFICATION.timbre.warmDuration : voiceIndex === 1 ? SONIFICATION.timbre.greenDuration : SONIFICATION.timbre.coolDuration
        voice.triggerAttackRelease(event.pitch, duration, time, event.velocity)
      })
      this.onColumn?.(this.column)
      this.column = (this.column + 1) % SONIFICATION.grid.columns
    }, `${60 / (this.bpm * this.speed) / 4}s`)
    if (!this.dronePlaying) { this.drone.triggerAttack(this.rootNote); this.dronePlaying = true }
    this.playing = true
    Tone.getTransport().start()
  }
  pause() { Tone.getTransport().pause(); this.drone.triggerRelease(); this.dronePlaying = false; this.playing = false }
  seek(column: number) {
    this.pause()
    this.column = Math.max(0, Math.min(SONIFICATION.grid.columns - 1, Math.round(column)))
    this.onColumn?.(this.column)
  }
  restart() { this.column = 0; this.onColumn?.(this.column); Tone.getTransport().stop(); this.play() }
  dispose() { if (this.loopId !== undefined) Tone.getTransport().clear(this.loopId); this.voices.forEach(voice => voice.dispose()); this.voicePanners.forEach(panner => panner.dispose()); this.drone.dispose(); this.filter.dispose(); this.reverb.dispose(); this.compressor.dispose(); this.limiter.dispose() }
}
