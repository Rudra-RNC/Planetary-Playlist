export const SONIFICATION = {
  columns: 96,
  rows: 32,
  tempo: 84,
  salienceThreshold: 0.08,
  maxVoices: 3,
  reverbWet: 0.3,
  defaultVolume: -13,
  noteDuration: '16n' as const,
}

export const SCALE_INTERVALS: Record<string, number[]> = {
  majorPentatonic: [0, 2, 4, 7, 9],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
}
