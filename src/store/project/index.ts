import { Module } from 'vuex'
import { ProjectState } from './types'
import { RootState } from './../types'

const projectModule: Module<ProjectState, RootState> = {
  state: {
    activeProjects: [],
    currentProjectIndex: -1
  },
  mutations: {
    openProject(state, project) {
      state.activeProjects.push(project)

      state.currentProjectIndex = state.activeProjects.length - 1
    }
  },
  getters: {
    activeProjects(state) {
      return state.activeProjects
    }
  }
}

export default projectModule
