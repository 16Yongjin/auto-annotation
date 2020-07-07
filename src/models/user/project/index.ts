import { Dataset } from '@/models/user/annotation'

type ProjectType = 'BBox' | 'Segmentation'

export interface ProjectInfo {
  id: string
  name: string
  type: ProjectType
  path: string
  createdAt: string
  lastSelectedIndex: number
}

export interface Project {
  info: ProjectInfo
  datasets: Dataset[]
}
