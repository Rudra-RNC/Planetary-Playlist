import { describe, expect, it } from 'vitest'
import { mapNotes } from '../src/mapping/noteMapping'
import type { Analysis, Track } from '../src/types'

const track: Track = { id:'test', title:'Test', theme:'test', imageFile:'', sourceUrl:'', credit:'', rootNote:'C4', scale:'majorPentatonic', bpm:84, accent:'#fff', description:'' }
const analysis: Analysis = { cells: [], meanLightness: .5, salienceThreshold: .8, columns: Array.from({ length: 96 }, (_, col) => [{ col, row: 4, hue: 20, saturation: .9, lightness: .5, salience: .8 }]) }

describe('mapNotes', () => {
  it('maps deterministic columns to scale-locked notes', () => {
    const first = mapNotes(analysis, track)
    expect(first).toEqual(mapNotes(analysis, track))
    expect(first).toHaveLength(96)
    expect(first.every(note => ['C','D','E','G','A'].some(name => note.pitch.startsWith(name)))).toBe(true)
  })
})
