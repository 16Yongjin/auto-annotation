import { Module } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/electron/db'
import { ProjectInfo, Project } from '@/models/user/project/index'
import { ProjectState } from './types'
import { RootState } from '@/store/types'
import { createDBDatasetsFromPath } from '@/utils/file'
import { DBProject } from '@/models/db'
import { importAnnotation } from '@/utils/import'

const projectModule: Module<ProjectState, RootState> = {
  state: {
    activeProjects: []
  },
  mutations: {
    openProject(state, project: Project) {
      state.activeProjects.push(project)
    }
  },
  actions: {
    async createProject({ dispatch }, projectInfo: ProjectInfo) {
      projectInfo.createdAt = new Date().toString()
      projectInfo.id = uuidv4()
      projectInfo.lastSelectedIndex = 0

      const datasets = await createDBDatasetsFromPath(projectInfo.path)
      const dbProject: DBProject = { info: projectInfo, datasets }

      await db
        .get('projects')
        .push(dbProject)
        .write()

      dispatch('openProject', projectInfo.id)

      return dbProject
    },
    openProject({ commit }, id: string) {
      const dbProject = db
        .get('projects')
        .find({ info: { id } })
        .value()

      const project: Project = {
        info: dbProject.info,
        datasets: importAnnotation(dbProject.datasets)
      }

      commit('openProject', project)

      return project
    },
    async getProjectById({ getters, dispatch }, id: string) {
      const project = getters.getProjectById(id)

      if (!project) {
        console.log('loading project!')
        const newProject = await dispatch('openProject', id)
        console.log(newProject)

        return newProject
      }

      return project
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
