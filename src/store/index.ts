import Vue from 'vue'
import Vuex from 'vuex'
import { UserAction } from '@/models/user/actions'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {},
  state: {
    userActions: [] as UserAction[],
    redoActions: [] as UserAction[]
  },
  mutations: {
    undo(state) {
      const userAction = state.userActions.pop()

      if (!userAction) return

      userAction.undo()
      state.redoActions.push(userAction)
    },
    redo(state) {
      const userAction = state.redoActions.pop()

      if (!userAction) return

      userAction.redo()
      state.userActions.push(userAction)
    },
    addUserAction(state, userAction: UserAction) {
      state.userActions.push(userAction)
      state.redoActions = []
    }
  },
  actions: {}
})
