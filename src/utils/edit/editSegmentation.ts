import { OnEdit } from '@/models/user'
import Paper from 'paper'

const hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 3
}

export function createSegmentationEditTool(onEdit: OnEdit) {
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

        // 세그먼트 제거 이벤트 발생
        // undo - Path에 세그먼트 다시 추가
        // redo - Path에서 세그먼트 제거
        const editAction = {
          name: 'removeSegment',
          item: path,
          from: segment,
          to: segment,
          undo: function() {
            const path = this.item as paper.Path
            path.insertSegments(index, [this.from])
          },
          redo: function() {
            this.to.remove()
          }
        }

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

      // 세그먼트 생성 이벤트 발생
      // undo - 세그먼트 제거
      // redo - 세그먼트 다시 추가
      const editAction = {
        name: 'addSegment',
        item: path,
        from: segment,
        to: segment,
        undo: function() {
          this.from.remove()
        },
        redo: function() {
          const path = this.item as paper.Path
          path.insertSegments(index, [this.to])
        }
      }

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
        const segmentPrevPos = segmentPosition.clone()
        const segmentNextPos = segment.point.clone()

        // 세그먼트 이동 이벤트 발생
        // undo - 세그먼트를 원래 위치로 옮김
        // redo - 세그먼트를 옮겼던 위치로 다시 옮김
        const editAction = {
          name: 'moveSegment',
          item: path,
          from: segment,
          to: segment,
          undo: function() {
            this.from.point = segmentPrevPos
          },
          redo: function() {
            this.to.point = segmentNextPos
          }
        }

        onEdit(editAction)
      } else if (path && pathPosition) {
        // Path 이동 이벤트 발생
        // undo - Path를 원래 위치로 옮김
        // redo - Path를 옮겼던 위치로 다시 옮김
        const editAction = {
          name: 'movePath',
          item: path,
          from: pathPosition,
          to: path.position.clone(),
          undo: function() {
            this.item.position = this.from
          },
          redo: function() {
            this.item.position = this.to
          }
        }

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
