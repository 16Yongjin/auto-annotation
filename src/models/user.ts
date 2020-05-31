export interface UserAction {
  name: string
  item: paper.Item
  undo: Function
  redo: Function
}

export interface EditAction extends UserAction {
  from: any
  to: any
}

export type OnEdit = (e: EditAction) => void
