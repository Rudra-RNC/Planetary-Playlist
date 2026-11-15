import { SONIFICATION } from '../config/sonification'
import type { Analysis, Cell } from '../types'

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { hue: (h * 60 + 360) % 360, saturation: s, lightness: l }
}

export function analysePixels(data: Uint8ClampedArray, width: number, height: number): Analysis {
  const cells: Cell[] = []
  let meanLightness = 0
  for (let row = 0; row < SONIFICATION.rows; row += 1) {
    for (let col = 0; col < SONIFICATION.columns; col += 1) {
      const x = Math.min(width - 1, Math.floor((col + 0.5) * width / SONIFICATION.columns))
      const y = Math.min(height - 1, Math.floor((row + 0.5) * height / SONIFICATION.rows))
      const i = (y * width + x) * 4
      const hsl = rgbToHsl(data[i], data[i + 1], data[i + 2])
      meanLightness += hsl.lightness
      cells.push({ ...hsl, salience: hsl.saturation * (0.4 + Math.abs(hsl.lightness - 0.5)), row, col })
    }
  }
  meanLightness /= cells.length
  const columns = Array.from({ length: SONIFICATION.columns }, (_, col) => cells.filter(cell => cell.col === col))
  const quarterSummary = [0, 1, 2, 3].map(quarter => {
    const part = cells.filter(cell => Math.floor(cell.col / 24) === quarter)
    const avgHue = part.reduce((sum, cell) => sum + cell.hue, 0) / part.length
    const tone = avgHue < 70 ? 'warm amber' : avgHue < 170 ? 'green and gold' : avgHue < 260 ? 'cool blue' : 'violet'
    const energy = part.reduce((sum, cell) => sum + cell.salience, 0) / part.length > 0.2 ? 'active' : 'quiet'
    return `${['Left', 'Lower-left', 'Lower-right', 'Right'][quarter]} quarter: ${tone}, ${energy}`
  })
  return { cells, columns, quarterSummary, meanLightness }
}

export function analyseImage(image: HTMLImageElement): Analysis {
  const canvas = document.createElement('canvas')
  canvas.width = SONIFICATION.columns; canvas.height = SONIFICATION.rows
  const context = canvas.getContext('2d')!
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return analysePixels(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)
}
