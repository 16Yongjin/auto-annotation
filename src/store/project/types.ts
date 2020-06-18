import { Project } from '@/models/user/project'

export interface ProjectState {
  activeProjects: Project[]
  currentProjectIndex: number
}
