import { describe, expect, it } from 'vitest'
import { analysePixels } from '../src/analysis/imageAnalysis'

describe('analysePixels', () => {
  it('creates the fixed grid and quarter narration from image pixels', () => {
    const data = new Uint8ClampedArray(96 * 32 * 4)
    for (let index = 0; index < data.length; index += 4) {
      data[index] = 220
      data[index + 1] = 80
      data[index + 2] = 50
      data[index + 3] = 255
    }
    const result = analysePixels(data, 96, 32)
    expect(result.cells).toHaveLength(96 * 32)
    expect(result.columns).toHaveLength(96)
    expect(result.columns.every(column => column.length === 32)).toBe(true)
    expect(result.quarterSummary).toHaveLength(4)
    expect(result.meanLightness).toBeGreaterThan(0)
  })
})
