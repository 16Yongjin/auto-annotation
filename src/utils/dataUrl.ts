export function toDataUrl(image: HTMLImageElement | HTMLCanvasElement) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0)
  const dataURL = canvas.toDataURL()

  return dataURL
}
