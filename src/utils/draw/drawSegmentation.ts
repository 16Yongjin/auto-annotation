import { UserAction } from './../../models/user'
import Paper from 'paper'

function drawSegmentation(path: paper.Path) {
  const compoundPath = new Paper.CompoundPath('')
  compoundPath.addChild(path.clone())
  compoundPath.strokeColor = new Paper.Color('black')
  compoundPath.fillColor = Paper.Color.random()
  compoundPath.opacity = 0.5

  return compoundPath
}

export function createSegmentationDrawTool(onDrawEnd: Function) {
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
    path.simplify()
    path.flatten(4)

    if (path.length > 30) {
      console.log('hi')
      const compoundPath = drawSegmentation(path)

      const userAction: UserAction = {
        name: 'addSegmentation',
        item: compoundPath,
        undo: function() {
          this.item.remove()
        },
        redo: function() {
          Paper.project.activeLayer.addChild(this.item)
        }
      }
      onDrawEnd(userAction)
    }
    path.remove()
    path = null
  }

  return tool
}
