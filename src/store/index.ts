import Vue from 'vue'
import Vuex from 'vuex'
import { RootState } from './types'
import userActionModule from './userAction/index'
import projectModule from './project/index'

Vue.use(Vuex)

export default new Vuex.Store<RootState>({
  modules: {
    userActionModule,
    projectModule
  },
  state: {},
  mutations: {},
  actions: {}
})
