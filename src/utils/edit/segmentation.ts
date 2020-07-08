import Paper from 'paper'
import {
  OnAction,
  AddSegmentAction,
  RemoveSegmentAction,
  MoveSegmentAction,
  MovePathAction
} from '@/models/user/actions'

const hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 3
}

export function createSegmentationEditTool(onEdit: OnAction) {
  Paper.settings.handleSize = 6

  const tool = new Paper.Tool()

  let segment: paper.Segment | null = null
  let path: paper.Path | null = null
  let segmentPosition: paper.Point | null = null
  let pathPosition: paper.Point | null = null

  tool.onMouseDown = function(event: paper.MouseEvent) {
    // 상태 초기화
    pathPosition = segmentPosition = segment = path = null

    const hitResult = Paper.project.hitTest(event.point, hitOptions)

    if (!hitResult || hitResult.type === 'pixel') return

    // Path에서 세그먼트 제거하기
    if (event.modifiers.shift) {
      if (hitResult.type === 'segment') {
        const segment = hitResult.segment
        const index = segment.index
        const path = segment.path

        const editAction = new RemoveSegmentAction(path, segment, index)

        onEdit(editAction)

        segment.remove()
      }
      return
    }

    // 클릭된 Path 선택 & 최근 위치 저장
    path = hitResult.item as paper.Path
    pathPosition = path.position.clone()

    if (hitResult.type === 'segment') {
      // 클릭된 세그먼트 선택 & 최근 위치 저장
      segment = hitResult.segment
      segmentPosition = segment.point.clone()
    } else if (hitResult.type === 'stroke') {
      // 세그먼트 새로 생성 & 위치 저장
      const index = hitResult.location.index + 1
      segment = path.insert(index, event.point)
      segmentPosition = segment.point.clone()

      const editAction = new AddSegmentAction(path, segment, index)

      onEdit(editAction)
    }
  }

  tool.onMouseDrag = function(event: paper.MouseEvent) {
    if (segment) {
      // 세그먼트 이동
      segment.point = segment.point.add(event.delta)
    } else if (path) {
      // Path 이동
      path.position = path.position.add(event.delta)
    }

    tool.onMouseUp = function() {
      if (segment && path && segmentPosition) {
        // 세그먼트 이동 끝났음

        const editAction = new MoveSegmentAction(
          segment,
          segmentPosition.clone(),
          segment.point.clone()
        )

        onEdit(editAction)
      } else if (path && pathPosition) {
        const editAction = new MovePathAction(
          path,
          pathPosition,
          path.position.clone()
        )

        onEdit(editAction)
      }
      // 상태 초기화
      pathPosition = segmentPosition = segment = path = null
    }
  }

  // 선택할 아이템 강조 표시
  tool.onMouseMove = function({ item }: paper.ToolEvent) {
    Paper.project.activeLayer.selected = false

    if (!item || item.className === 'Raster') return
    item.selected = true
  }

  return tool
}
