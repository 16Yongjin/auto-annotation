import { Module } from 'vuex'
import axios from 'axios'
import { ProjectInfo, Project } from '@/models/user/project/index'
import { ProjectState } from './types'
import { RootState } from '@/store/types'

const projectModule: Module<ProjectState, RootState> = {
  state: {
    activeProjects: [],
    currentProjectIndex: -1
  },
  mutations: {
    openProject(state, project: Project) {
      state.activeProjects.push(project)

      state.currentProjectIndex = state.activeProjects.length - 1
    }
  },
  actions: {
    async createProject({ commit }, projectInfo: ProjectInfo) {
      const { data } = await axios.post<Project>(
        'http://localhost:8000/projects',
        projectInfo
      )
      commit('openProject', data)
      return data
    }
  },
  getters: {
    activeProjects(state) {
      return state.activeProjects
    },
    getProjectById(state) {
      return (id: string) => state.activeProjects.find(p => p.info.id === id)
    }
  }
}

export default projectModule
