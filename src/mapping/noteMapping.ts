import { SCALE_INTERVALS, SONIFICATION } from '../config/sonification'
import type { Analysis, Track } from '../types'

export type NoteEvent = { column: number; row: number; pitch: string; velocity: number; pan: number; hue: number }

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function midiToNote(midi: number) { return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}` }

export function mapNotes(analysis: Analysis, track: Track): NoteEvent[] {
  const intervals = SCALE_INTERVALS[track.scale] ?? SCALE_INTERVALS.majorPentatonic
  const rootIndex = NOTE_NAMES.indexOf(track.rootNote.replace(/[0-9]/g, ''))
  const rootMidi = 48 + Math.max(0, rootIndex)
  return analysis.columns.flatMap((column, col) => column
    .filter(cell => cell.salience > SONIFICATION.salienceThreshold)
    .sort((a, b) => b.salience - a.salience)
    .slice(0, SONIFICATION.maxVoices)
    .map(cell => {
      const degree = Math.round((SONIFICATION.rows - 1 - cell.row) / (SONIFICATION.rows - 1) * 21)
      const octave = Math.floor(degree / intervals.length)
      const midi = rootMidi + octave * 12 + intervals[degree % intervals.length]
      return { column: col, row: cell.row, pitch: midiToNote(midi), velocity: Math.min(0.9, 0.25 + cell.salience), pan: col / 47.5 - 1, hue: cell.hue }
    }))
}
