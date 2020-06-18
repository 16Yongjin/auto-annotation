import { Module } from 'vuex'
import { UserAction } from '@/models/user/actions'
import { UserActionState } from './types'
import { RootState } from './../types'

const userActionModule: Module<UserActionState, RootState> = {
  state: {
    userActions: [],
    redoActions: []
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
    },
    resetUserActions(state) {
      state.userActions = []
      state.redoActions = []
    }
  }
}

export default userActionModule
