import { NOTE_NAMES, resolveConfig, SCALE_INTERVALS } from '../config/sonification'
import type { Analysis, Track } from '../types'

export type NoteEvent = { column: number; row: number; pitch: string; velocity: number; pan: number; hue: number }

function midiToNote(midi: number) { return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}` }

function noteToMidi(note: string, fallback: number) {
  const match = note.match(/^([A-G]#?)(-?\d+)$/)
  if (!match) return fallback
  const noteIndex = NOTE_NAMES.indexOf(match[1] as (typeof NOTE_NAMES)[number])
  return noteIndex < 0 ? fallback : (Number(match[2]) + 1) * 12 + noteIndex
}

export function mapNotes(analysis: Analysis, track: Track): NoteEvent[] {
  const config = resolveConfig(track)
  const intervals = SCALE_INTERVALS[config.track.scale]
  const rootMidi = noteToMidi(config.track.rootNote, config.pitch.lowestMidi)
  const maxDegree = config.pitch.octaves * intervals.length - 1
  return analysis.columns.flatMap((column, col) => {
    const selectedDegrees: number[] = []
    return column
      .filter(cell => cell.salience >= analysis.salienceThreshold)
      .sort((a, b) => b.salience - a.salience)
      .flatMap(cell => {
        const degree = Math.round((config.grid.rows - 1 - cell.row) / (config.grid.rows - 1) * maxDegree)
        if (selectedDegrees.some(selected => Math.abs(selected - degree) < config.selection.minScaleDegreeGap)) return []
        selectedDegrees.push(degree)
        const octave = Math.floor(degree / intervals.length)
        const midi = rootMidi + octave * 12 + intervals[degree % intervals.length]
        const velocity = Math.min(config.timbre.velocityMax, config.timbre.velocityMin + cell.salience)
        const pan = (col / (config.grid.columns - 1) * 2 - 1) * config.timbre.panRange
        return [{ column: col, row: cell.row, pitch: midiToNote(midi), velocity, pan, hue: cell.hue }]
      })
      .slice(0, config.selection.maxVoices)
  })
}
