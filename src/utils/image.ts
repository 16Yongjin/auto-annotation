import Paper from 'paper'
import { Image } from '@/models/datasets'

export function createImage(image: Image) {
  Paper.view.viewSize = new Paper.Size(image.width, image.height)

  const img = document.createElement('img')
  img.src = image.coco_url
  img.id = image.id.toString()

  const raster = new Paper.Raster(img)
  raster.position = Paper.view.center
}
