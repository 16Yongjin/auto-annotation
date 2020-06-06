import Paper from 'paper'
import { Image } from '@/models/datasets'

const delay = (n: number) => new Promise(resolve => setTimeout(resolve, n))

export async function createImage(image: Image) {
  const img = document.createElement('img')
  img.src = image.coco_url
  img.id = image.id.toString()

  await delay(0)

  const raster = new Paper.Raster(img)
  const center = new Paper.Point(raster.width / 2, raster.height / 2)

  raster.position = center
  Paper.view.center = center

  return raster
}
