export { BBox } from './bbox'
export { Segmentation } from './segmentation'

export interface Annotation {
  item: paper.Item
  label: string
}

export interface Dataset {
  path: string
  raster?: paper.Raster
  annotations: Annotation[]
  labeled: boolean
}
