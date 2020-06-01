import Paper from 'paper'
import {
  OnAction,
  ResizeBBoxAction,
  MoveBBoxAction
} from '@/models/user/actions'

const hitOptions = {
  segments: true,
  stroke: true,
  tolerance: 3
}

export function createBBoxEditTool(onEdit: OnAction) {
  Paper.settings.handleSize = 8

  const tool = new Paper.Tool()

  let bbox: paper.Path.Rectangle | null = null

  // 수정할 BBox 선택
  tool.onMouseDown = function(event: paper.MouseEvent) {
    const hitResult = Paper.project.hitTest(event.point, hitOptions)

    if (!hitResult) return

    if (hitResult.type === 'stroke') {
      // 박스 테두리 클릭, 이대로 마우스 드래그 시 박스 이동
      bbox = hitResult.item as paper.Path.Rectangle
      bbox.data.state = 'moving'
      bbox.data.prevPosition = bbox.position.clone()
    } else if (hitResult.type === 'segment') {
      // 박스 모서리 클릭, 마우스 드래그 시 박스 크기 조절
      const segment = hitResult.segment
      bbox = segment.path
      const index = segment.index
      const opposite = (index + 2) % 4

      bbox.data.state = 'resizing'
      bbox.data.prevBounds = bbox.bounds.clone()
      bbox.data.from = bbox.segments[opposite].point.clone()
    }
  }

  // 선택된 BBox 수정
  tool.onMouseDrag = function({ point, lastPoint }: paper.ToolEvent) {
    if (!bbox) return

    if (bbox.data.state === 'moving') {
      // 박스 위치 이동
      bbox.position = bbox.position.add(point).subtract(lastPoint)
    } else if (bbox.data.state === 'resizing') {
      // 박스 크기 조절
      const bounds = new Paper.Rectangle(bbox.data.from, point)

      if (bounds.area <= 0) return

      bbox.bounds = bounds
    }
  }

  // BBox 수정 완료
  tool.onMouseUp = function() {
    if (!bbox) return

    if (bbox.data.state === 'moving') {
      const editAction = new MoveBBoxAction(bbox)

      onEdit(editAction)
    } else if (bbox.data.state === 'resizing') {
      const editAction = new ResizeBBoxAction(bbox)

      onEdit(editAction)
    }

    bbox = null
  }

  // 선택할 아이템 강조 표시
  tool.onMouseMove = function({ item }: paper.ToolEvent) {
    Paper.project.activeLayer.selected = false

    if (!item || item.className === 'Raster') return

    item.selected = true
  }

  return tool
}
