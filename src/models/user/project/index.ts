import { Dataset } from '@/models/user/annotation'
export interface ProjectInfo {
  id: string
  name: string
  type: string
  path: string
  createdAt: string
  lastSelectedIndex: number
}

export interface Project {
  info: ProjectInfo
  datasets: Dataset[]
}
