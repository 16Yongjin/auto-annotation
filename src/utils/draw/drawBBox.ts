import Paper from 'paper'
import { OnAction, DrawActoin } from '@/models/user/actions'

function drawBox(start: paper.Point, end: paper.Point, color: paper.Color) {
  const boxRect = new Paper.Rectangle(start, end)
  const box = new Paper.Path.Rectangle(boxRect)
  box.strokeColor = color
  box.strokeWidth = 3
  return box
}

function drawBBox(start: paper.Point, end: paper.Point, color: paper.Color) {
  const box = drawBox(start, end, color)

  box.fillColor = new Paper.Color('white')
  box.fillColor.alpha = 0.01

  box.onMouseEnter = () => {
    if (box.fillColor) box.fillColor.alpha = 0.2
  }

  box.onMouseLeave = () => {
    if (box.fillColor) box.fillColor.alpha = 0.01
  }

  return box
}

const minimumBBoxSize = (box: paper.Path.Rectangle) =>
  box.bounds.width >= 5 && box.bounds.height >= 5

export function createBBoxDrawTool(onDrawEnd: OnAction) {
  const tool = new Paper.Tool()

  let boxColor = Paper.Color.random()
  let box: paper.Path.Rectangle | null = null

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
    box = drawBBox(downPoint, point, boxColor)

    if (minimumBBoxSize(box)) {
      const userAction = new DrawActoin(box)

      onDrawEnd(userAction)

      box = null
    } else {
      box.remove()
    }
  }

  return tool
}
