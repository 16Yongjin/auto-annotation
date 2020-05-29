export { createTooltip } from './tooltip'
export { categories } from './categories'
export { createSegmentation, createBBox, createImage } from './show'
export { zoomOnWheel, resetZoom } from './zoom'

function hashCode(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function intToRGB(i: number) {
  const c = (i & 0x00ffffff).toString(16).toUpperCase()

  return '00000'.substring(0, 6 - c.length) + c
}

export const rgbFromString = (str: string) => `#${intToRGB(hashCode(str))}`

export const rgbFromInt = (n: number) => `#${intToRGB(n)}`
