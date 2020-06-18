import Paper from 'paper'

export function createMoveTool() {
  const tool = new Paper.Tool()

  let startPoint = new Paper.Point(0, 0)

  tool.onMouseDown = function({ point }: paper.ToolEvent) {
    startPoint = point
  }

  tool.onMouseDrag = function({ point }: paper.ToolEvent) {
    const delta = startPoint.subtract(point)
    Paper.view.center = Paper.view.center.add(delta)
  }

  return tool
}
