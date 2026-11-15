export const SCALE_INTERVALS = {
  majorPentatonic: [0, 2, 4, 7, 9],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
} as const satisfies Record<string, readonly number[]>

export type ScaleName = keyof typeof SCALE_INTERVALS
export type NoteDuration = '16n'
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export function assertScaleName(value: string): ScaleName {
  if (value in SCALE_INTERVALS) return value as ScaleName
  throw new Error(`Unknown sonification scale: ${value}`)
}

export const SONIFICATION = {
  grid: {
    // More columns make the sweep more detailed; more rows make pitch changes finer.
    columns: 96,
    rows: 32,
  },
  timing: {
    // Raising BPM shortens the sweep; this is the default when a track does not override it.
    defaultBpm: 84,
    // This is the scheduling step, not the audible decay or release of a voice.
    stepDuration: '16n' as NoteDuration,
  },
  selection: {
    // The threshold is an image-relative percentile, so every frame contributes a controlled number of events.
    saliencePercentile: 0.72,
    // Raising this permits denser harmony; three keeps the result intelligible.
    maxVoices: 3,
    // Voices must be at least this many scale degrees apart within a column.
    minScaleDegreeGap: 1,
  },
  pitch: {
    // Thirty-two image rows span three octaves; the top row is the highest scale degree.
    octaves: 3,
    // The track root is the bottom register; pitch mapping is quantized to its selected scale.
    lowestMidi: 48,
  },
  timbre: {
    // Hue boundaries choose bright pluck, mallet, or airy pad families.
    warmHueMax: 70,
    greenHueMax: 170,
    // Lightness maps into this conservative velocity range.
    velocityMin: 0.25,
    velocityMax: 0.9,
    // Voice release can outlast one grid step without changing when the next column is scheduled.
    warmDuration: '16n' as const,
    greenDuration: '8n' as const,
    coolDuration: '2n' as const,
    // Pan stays inside the headphone-friendly stereo field.
    panRange: 0.8,
  },
  master: {
    // All values here are decibels or seconds; lower volume is safer for first playback.
    defaultVolumeDb: -13,
    droneVolumeDb: -24,
    droneMinVolumeDb: -30,
    droneMaxVolumeDb: -21,
    filterMinHz: 1200,
    filterMaxHz: 4200,
    reverbWet: 0.3,
    reverbDecaySeconds: 3.2,
    compressorThresholdDb: -18,
    compressorRatio: 3,
    limiterCeilingDb: -1,
  },
} as const satisfies {
  grid: { columns: number; rows: number }
  timing: { defaultBpm: number; stepDuration: NoteDuration }
  selection: { saliencePercentile: number; maxVoices: number; minScaleDegreeGap: number }
  pitch: { octaves: number; lowestMidi: number }
  timbre: { warmHueMax: number; greenHueMax: number; velocityMin: number; velocityMax: number; warmDuration: string; greenDuration: string; coolDuration: string; panRange: number }
  master: Record<string, number>
}

export type TrackConfig = { bpm: number; rootNote: string; scale: ScaleName }

export function resolveConfig(track: TrackConfig) {
  return {
    ...SONIFICATION,
    timing: { ...SONIFICATION.timing, bpm: track.bpm || SONIFICATION.timing.defaultBpm },
    track: { rootNote: track.rootNote, scale: track.scale },
  }
}
