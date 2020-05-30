import Paper from 'paper'

const hitOptions = {
  segments: true,
  stroke: true,
  tolerance: 3
}

export function createBBoxEditTool(onEdit: Function) {
  Paper.settings.handleSize = 8

  const tool = new Paper.Tool()

  let bbox: paper.Path.Rectangle | null = null

  tool.onMouseDown = function(event: paper.MouseEvent) {
    const hitResult = Paper.project.hitTest(event.point, hitOptions)

    if (hitResult.type === 'stroke') {
      bbox = hitResult.item as paper.Path.Rectangle
      bbox.data.state = 'moving'
      bbox.data.prevPosition = bbox.position.clone()
    } else if (hitResult.type === 'segment') {
      const segment = hitResult.segment
      bbox = segment.path
      const segments = bbox.segments
      const index = segments.indexOf(segment)
      const opposite = (index + 2) % 4

      bbox.data.state = 'resizing'
      bbox.data.from = bbox.segments[opposite].point.clone()
    }
  }
  tool.onMouseDrag = function({ point, lastPoint }: paper.ToolEvent) {
    if (!bbox) return

    if (bbox.data.state === 'moving') {
      bbox.position = bbox.position.add(point).subtract(lastPoint)
    } else if (bbox.data.state === 'resizing') {
      const bounds = new Paper.Rectangle(bbox.data.from, point)

      if (bounds.area <= 0) return

      const oldBound = bbox.bounds.clone()

      onEdit({
        item: bbox,
        name: 'resizeBBox',
        undo: () => {
          if (bbox) bbox.bounds = oldBound
        }
      })

      bbox.bounds = bounds
    }
  }

  tool.onMouseMove = function({ item }: paper.ToolEvent) {
    Paper.project.activeLayer.selected = false

    if (!item || item.className === 'Raster') return

    item.selected = true
  }

  tool.onMouseUp = function() {
    if (!bbox) return

    onEdit({
      item: bbox,
      name: 'moveBBox',
      undo: function() {
        if (this.item) {
          this.item.position = this.item.data.prevPosition
        }
      }
    })

    bbox = null
  }

  return tool
}
