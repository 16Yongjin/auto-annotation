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

  return box
}

const minimumBBoxSize = (box: paper.Path.Rectangle) =>
  box.bounds.width >= 5 && box.bounds.height >= 5

export class BBoxDrawTool extends Paper.Tool {
  boxColor: paper.Color = Paper.Color.random()
  box: paper.Path.Rectangle | null = null
  onDraw: OnAction = () => null

  constructor(onDraw: OnAction) {
    super()
    this.onDraw = onDraw
  }

  onMouseDown = ({ downPoint, point }: paper.ToolEvent) => {
    if (this.box) this.box.remove()
    this.boxColor = Paper.Color.random()
    this.box = drawBox(downPoint, point, this.boxColor)
  }

  onMouseDrag = ({ downPoint, point }: paper.ToolEvent) => {
    if (this.box) this.box.remove()
    this.box = drawBox(downPoint, point, this.boxColor)
  }

  onMouseUp = ({ downPoint, point }: paper.ToolEvent) => {
    if (this.box) this.box.remove()
    this.box = drawBBox(downPoint, point, this.boxColor)

    if (minimumBBoxSize(this.box)) {
      const userAction = new DrawActoin(this.box)

      this.onDraw(userAction)

      this.box = null
    } else {
      this.box.remove()
    }
  }
}
