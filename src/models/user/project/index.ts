import { Dataset } from '@/models/user/annotation'

export interface Project {
  name: string
  datasets: Dataset[]
}

export interface ProjectInfo {
  name: string
  type: string
  path: string
  createdAt: string
}
