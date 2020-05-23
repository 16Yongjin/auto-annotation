interface UndoActionArgs {
  name: string
  action: string
  func: Function
  args: string[]
}

export default class UndoAction {
  name: string
  action: string
  func: Function
  args: string[]

  constructor({ name, action, func, args }: UndoActionArgs) {
    this.name = name
    this.action = action
    this.func = func
    this.args = args
  }

  undo() {
    return this.func(this.args)
  }
}
