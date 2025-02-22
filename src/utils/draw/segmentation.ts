import Paper from 'paper'
import { OnAction, DrawActoin } from '@/models/user/actions'

function drawSegmentation(path: paper.Path) {
  const compoundPath = new Paper.CompoundPath('')
  compoundPath.addChild(path.clone())
  compoundPath.strokeColor = new Paper.Color('black')
  compoundPath.fillColor = Paper.Color.random()
  compoundPath.opacity = 0.5

  return compoundPath
}

export function createSegmentationDrawTool(onDrawEnd: OnAction) {
  const tool = new Paper.Tool()

  let path: paper.Path | null = null

  tool.onMouseDown = function() {
    path = new Paper.Path()
    path.strokeColor = new Paper.Color('black')
  }
  tool.onMouseDrag = function({ point }: paper.ToolEvent) {
    if (!path) return
    path.add(point)
  }

  tool.onMouseUp = function({ point }: paper.ToolEvent) {
    if (!path) return

    path.add(point)
    path.closePath()

    if (path.length > 30) {
      path.simplify()
      path.flatten(4)

      const compoundPath = drawSegmentation(path)

      const userAction = new DrawActoin(compoundPath)

      onDrawEnd(userAction)
    }
    path.remove()
    path = null
  }

  return tool
}
