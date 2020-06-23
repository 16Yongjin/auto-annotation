export interface BBox {
  label: string
  bbox: number[]
}

export interface BBoxDataset {
  path: string
  annotations: BBox[]
}

export interface ProjectInfo {
  id: string
  name: string
  type: string
  path: string
  createdAt: string
  lastSelectedIndex: number
}

export interface DBProject {
  info: ProjectInfo
  datasets: BBoxDataset[]
}
