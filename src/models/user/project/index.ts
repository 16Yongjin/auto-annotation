import { Dataset } from '@/models/user/annotation'

export interface Project {
  info: ProjectInfo
  datasets: Dataset[]
}

export interface ProjectInfo {
  id: string
  name: string
  type: string
  path: string
  createdAt: string
}
