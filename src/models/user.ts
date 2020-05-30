export interface UserAction {
  name: string
  item: paper.Item
  undo: Function
}
