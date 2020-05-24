export interface Image {
  license: number
  file_name: string
  coco_url: string
  height: number
  width: number
  date_captured: string
  flickr_url: string
  id: number
}

export interface Annotation {
  segmentation: number[][]
  area: number
  iscrowd: number
  image_id: number
  bbox: number[]
  category_id: number
  id: number
}

export interface Coco {
  image: Image
  annotations: Annotation[]
}

export interface Category {
  supercategory: string
  id: number
  name: string
}
