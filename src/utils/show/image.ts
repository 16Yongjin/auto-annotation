import Paper from 'paper'
import { Image } from '@/models/datasets'

const delay = (n: number) => new Promise(resolve => setTimeout(resolve, n))

function onloadImage(obj: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    obj.onload = () => resolve(obj)
    obj.onerror = reject
  })
}

export async function createImage(image: Image) {
  const img = document.createElement('img')
  const imgLoading = onloadImage(img)
  img.src = image.coco_url
  img.id = image.id.toString()

  await imgLoading

  const raster = new Paper.Raster(img)
  console.log('raster loaded?', raster.loaded)
  const center = new Paper.Point(raster.width / 2, raster.height / 2)
  console.log(center)

  raster.position = center
  Paper.view.center = center

  return raster
}
