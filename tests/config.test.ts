import { describe, expect, it } from 'vitest'
import tracksJson from '../src/data/tracks.json'
import { assertScaleName, resolveConfig, SCALE_INTERVALS, SONIFICATION } from '../src/config/sonification'
import type { Track } from '../src/types'

const tracks = tracksJson.map((track) => ({ ...track, scale: assertScaleName(track.scale) })) satisfies readonly Track[]

describe('sonification configuration', () => {
  it('keeps tuning values within safe musical bounds', () => {
    expect(SONIFICATION.grid.columns).toBeGreaterThan(0)
    expect(SONIFICATION.grid.rows).toBeGreaterThan(0)
    expect(SONIFICATION.selection.maxVoices).toBeGreaterThanOrEqual(1)
    expect(SONIFICATION.selection.maxVoices).toBeLessThanOrEqual(4)
    expect(SONIFICATION.timbre.panRange).toBeLessThanOrEqual(1)
    expect(SONIFICATION.master.limiterCeilingDb).toBeLessThan(0)
  })

  it('keeps every scale ordered and rooted at zero', () => {
    for (const intervals of Object.values(SCALE_INTERVALS)) {
      expect(intervals[0]).toBe(0)
      expect(intervals.every((interval, index) => index === 0 || interval > intervals[index - 1])).toBe(true)
    }
  })

  it('validates track scale names and resolves per-track overrides', () => {
    expect(tracks).toHaveLength(10)
    expect(tracks.every(track => track.scale in SCALE_INTERVALS)).toBe(true)
    expect(resolveConfig(tracks[0]).timing.bpm).toBe(tracks[0].bpm)
    expect(resolveConfig(tracks[0]).track.rootNote).toBe(tracks[0].rootNote)
  })
})
