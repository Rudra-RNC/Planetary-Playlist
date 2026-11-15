import type { ScaleName } from './config/sonification'

export type Track = {
  id: string; title: string; theme: string; imageFile: string; sourceUrl: string; credit: string
  rootNote: string; scale: ScaleName; bpm: number; accent: string; description: string
}

export type Cell = { hue: number; saturation: number; lightness: number; salience: number; row: number; col: number }
export type Analysis = { cells: Cell[]; columns: Cell[][]; meanLightness: number; salienceThreshold: number }
