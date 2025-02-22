import { Module } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import router from '@/router'
import { db } from '@/electron/db'
import { ProjectInfo, Project } from '@/models/user/project'
import { ProjectState } from './types'
import { RootState } from '@/store/types'
import { BBoxDataset, DBProjectType, SegmentationDataset } from '@/models/db'
import {
  importBBox,
  importSegmentation,
  validateDatasets,
  createDatasetsFromDir
} from '@/utils/import'

const projectModule: Module<ProjectState, RootState> = {
  state: {
    activeProjects: []
  },
  mutations: {
    openProject(state, project: Project) {
      state.activeProjects.push(project)
    },
    closeProject(state, id: string) {
      state.activeProjects = state.activeProjects.filter(p => p.info.id !== id)
    }
  },
  actions: {
    async createProject({ dispatch }, projectInfo: ProjectInfo) {
      projectInfo.createdAt = new Date().toString()
      projectInfo.id = uuidv4()
      projectInfo.lastSelectedIndex = 0

      const datasets = await createDatasetsFromDir(projectInfo.path)
      const dbProject: DBProjectType = {
        info: projectInfo,
        datasets
      }

      await db
        .get('projects')
        .push(dbProject)
        .write()

      await dispatch('openProject', projectInfo.id)

      return dbProject
    },
    async openProject({ commit }, id: string) {
      const dbProject = db
        .get('projects')
        .find({ info: { id } })
        .value()

      dbProject.datasets = await validateDatasets(dbProject)

      await db.write()

      const project: Project = {
        info: dbProject.info,
        datasets:
          dbProject.info.type === 'BBox'
            ? importBBox(dbProject.datasets as BBoxDataset[])
            : importSegmentation(dbProject.datasets as SegmentationDataset[])
      }

      commit('openProject', project)

      return project
    },
    async getProjectById({ getters, dispatch }, id: string) {
      const project = getters.getProjectById(id)

      if (!project) {
        const newProject = await dispatch('openProject', id)
        return newProject
      }

      return project
    },
    closeProject({ state, commit }, id: string) {
      const index = state.activeProjects.findIndex(p => p.info.id === id)
      const activeProjectId = router.currentRoute.params.id

      if (id === activeProjectId) {
        const nextProject = state.activeProjects[index + 1]
        const prevProject = state.activeProjects[index - 1]
        const toUrl = (p: Project) =>
          `/${p.info.type.toLowerCase()}/${p.info.id}`

        if (nextProject) router.push(toUrl(nextProject))
        else if (prevProject) router.push(toUrl(prevProject))
        else router.push('/')
      }

      commit('closeProject', id)
    },
    async deleteProject({ state }, id: string) {
      await db
        .get('projects')
        .remove({ info: { id } })
        .write()

      state.activeProjects = state.activeProjects.filter(p => p.info.id !== id)
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
