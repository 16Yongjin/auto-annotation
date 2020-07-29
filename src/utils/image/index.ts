export function createImageFromData(data: ImageData): HTMLImageElement {
  const canvas = document.createElement('canvas')
  canvas.width = data.width
  canvas.height = data.height
  const ctx = canvas.getContext('2d')

  if (!ctx) return new Image()

  ctx.putImageData(data, 0, 0)

  const img = document.createElement('img')
  img.src = canvas.toDataURL('image/png')

  return img
}
