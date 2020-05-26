import Paper from 'paper'

function drawSegmentation(path: paper.Path) {
  console.log(path)
  const compoundPath = new Paper.CompoundPath('')
  compoundPath.addChild(path)
  compoundPath.strokeColor = new Paper.Color('black')
  compoundPath.fillColor = Paper.Color.random()
  compoundPath.opacity = 0.5
  compoundPath.rasterize()

  return compoundPath
}

export function createSegmentationTool(onDrawEnd: Function) {
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
      console.log('hi')
      const compoundPath = drawSegmentation(path)
      onDrawEnd(compoundPath)
    }
    path = null
  }

  return tool
}
