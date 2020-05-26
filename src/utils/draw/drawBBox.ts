import Paper from 'paper'

function drawBox(start: paper.Point, end: paper.Point, color: paper.Color) {
  const boxRect = new Paper.Rectangle(start, end)
  const box = new Paper.Path.Rectangle(boxRect)
  box.strokeColor = color
  box.strokeWidth = 3
  return box
}

const minimumBBoxSize = (box: paper.Path.Rectangle) =>
  box.bounds.width >= 5 && box.bounds.height >= 5

export function createBBoxMouseTool(onDrawEnd: Function) {
  const tool = new Paper.Tool()

  let boxColor = Paper.Color.random()
  const origin = new Paper.Point(0, 0)
  let box: paper.Path.Rectangle | null = drawBox(origin, origin, boxColor)

  tool.onMouseDown = function({ downPoint, point }: paper.ToolEvent) {
    if (box) box.remove()
    boxColor = Paper.Color.random()
    box = drawBox(downPoint, point, boxColor)
  }
  tool.onMouseDrag = function({ downPoint, point }: paper.ToolEvent) {
    if (box) box.remove()
    box = drawBox(downPoint, point, boxColor)
  }

  tool.onMouseUp = function({ downPoint, point }: paper.ToolEvent) {
    if (box) box.remove()
    box = drawBox(downPoint, point, boxColor)
    console.log(box.bounds.area)

    if (minimumBBoxSize(box)) {
      onDrawEnd(box)
      box = null
    } else {
      box.remove()
    }
  }

  return tool
}
