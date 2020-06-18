import { UserAction } from '@/models/user/actions'

export interface UserActionState {
  userActions: UserAction[]
  redoActions: UserAction[]
}
