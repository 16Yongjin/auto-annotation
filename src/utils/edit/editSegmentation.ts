import Paper from 'paper'

const hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 3
}

export function createSegmentationEditTool() {
  const tool = new Paper.Tool()

  let segment: paper.Segment | null = null
  let path: paper.Path | null = null

  tool.onMouseDown = function(event: paper.MouseEvent) {
    segment = path = null
    const hitResult = Paper.project.hitTest(event.point, hitOptions)

    if (!hitResult || hitResult.type === 'pixel') return

    if (event.modifiers.shift) {
      if (hitResult.type === 'segment') {
        hitResult.segment.remove()
      }
      return
    }

    path = hitResult.item as paper.Path

    if (hitResult.type === 'segment') {
      segment = hitResult.segment
    } else if (hitResult.type === 'stroke') {
      const location = hitResult.location
      segment = path.insert(location.index + 1, event.point)
    }
  }

  tool.onMouseMove = function(event: paper.ToolEvent) {
    Paper.project.activeLayer.selected = false

    if (event.item && event.item.className !== 'Raster') {
      event.item.selected = true
    }
  }

  tool.onMouseDrag = function(event: paper.MouseEvent) {
    if (segment) {
      segment.point = segment.point.add(event.delta)
    } else if (path) {
      path.position = path.position.add(event.delta)
    }
  }

  return tool
}
