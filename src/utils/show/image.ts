import Paper from 'paper'

function onloadImage(obj: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj)
    obj.onerror = reject
  })
}

export async function createRaster(imageUrl: string) {
  const img = document.createElement('img')
  const imgLoading = onloadImage(img)
  img.src = imageUrl
  img.crossOrigin = 'anonymous'

  await imgLoading

  const raster = new Paper.Raster(img)
  const center = new Paper.Point(raster.width / 2, raster.height / 2)

  raster.position = center
  Paper.view.center = center

  return raster
}
