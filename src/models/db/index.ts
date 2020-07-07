export interface BBox {
  label: string
  bbox: number[]
}

export interface Segmentation {
  label: string
  segmentation: number[]
}

export type AnnotationType = BBox | Segmentation

export interface Dataset<T extends AnnotationType> {
  path: string
  annotations: T[]
}

export type BBoxDataset = Dataset<BBox>

export type SegmentationDataset = Dataset<Segmentation>

type ProjectType = 'BBox' | 'Segmentation'

export interface ProjectInfo {
  id: string
  name: string
  type: ProjectType
  path: string
  createdAt: string
  lastSelectedIndex: number
}

export interface DBProject<T extends AnnotationType> {
  info: ProjectInfo
  datasets: Dataset<T>[]
}
