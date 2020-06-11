export interface Image {
  path: string
  height?: number
  width?: number
}

export interface Annotation {
  label: string
  bbox: number[]
}

export interface BBoxExport {
  image: Image
  annotations: Annotation[]
  labeled: boolean
}
