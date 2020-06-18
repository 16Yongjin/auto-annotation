import { Dataset } from '@/models/user/annotation'

export interface Project {
  name: string
  datasets: Dataset[]
}
