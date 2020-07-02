import Paper, { Point } from 'paper'
import {
  OnAction,
  ResizeBBoxAction,
  MoveBBoxAction
} from '@/models/user/actions'

const hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 3
}

export class BBoxEditTool extends Paper.Tool {
  bbox: paper.Path.Rectangle | null = null
  onEdit: OnAction = () => null

  constructor(onEdit: OnAction) {
    super()
    this.onEdit = onEdit
  }

  // 수정할 BBox 선택
  onMouseDown = (event: paper.MouseEvent) => {
    const hitResult = Paper.project.hitTest(event.point, hitOptions)

    if (!hitResult) return

    if (hitResult.type === 'stroke' || hitResult.type === 'fill') {
      // 박스 테두리 클릭, 이대로 마우스 드래그 시 박스 이동
      this.bbox = hitResult.item as paper.Path.Rectangle
      if (this.bbox.fillColor) this.bbox.fillColor.alpha = 0.2
      this.bbox.data.state = 'moving'
      this.bbox.data.prevPosition = this.bbox.position.clone()
    } else if (hitResult.type === 'segment') {
      // 박스 모서리 클릭, 마우스 드래그 시 박스 크기 조절
      const segment = hitResult.segment
      this.bbox = segment.path
      const index = segment.index
      const opposite = (index + 2) % 4

      this.bbox.data.state = 'resizing'
      this.bbox.data.prevBounds = this.bbox.bounds.clone()
      this.bbox.data.from = this.bbox.segments[opposite].point.clone()
    }
  }

  // 선택된 this.bbox 수정
  onMouseDrag = ({ point, lastPoint }: paper.ToolEvent) => {
    if (!this.bbox) return

    if (this.bbox.data.state === 'moving') {
      // 박스 위치 이동
      this.bbox.position = this.bbox.position.add(point).subtract(lastPoint)
    } else if (this.bbox.data.state === 'resizing') {
      // 박스 크기 조절
      const bounds = new Paper.Rectangle(this.bbox.data.from, point)

      if (bounds.area <= 0) return

      this.bbox.bounds = bounds
    }
  }

  // this.bbox 수정 완료
  onMouseUp = () => {
    if (!this.bbox) return

    if (this.bbox.data.state === 'moving') {
      if (this.bbox.position.equals(this.bbox.data.prevPosition)) return

      const editAction = new MoveBBoxAction(this.bbox)

      this.onEdit(editAction)
    } else if (this.bbox.data.state === 'resizing') {
      const editAction = new ResizeBBoxAction(this.bbox)

      this.onEdit(editAction)
    }

    this.bbox = null
  }

  resizeBBox(item: paper.Path.Rectangle, delta: paper.Point) {
    item.data.prevBounds = item.bounds.clone()
    item.bounds.width += delta.x
    item.bounds.height += delta.y
    this.onEdit(new ResizeBBoxAction(item))
  }

  moveBBox(item: paper.Path.Rectangle, delta: paper.Point) {
    item.data.prevPosition = item.position.clone()
    item.position = item.position.add(delta)
    this.onEdit(new MoveBBoxAction(item))
  }

  onKeyDown = ({ key, modifiers: { control, shift } }: paper.KeyEvent) => {
    const item = Paper.project.activeLayer.getItem({
      selected: true
    }) as paper.Path.Rectangle
    if (!item) return

    const delta = shift ? 10 : 1

    if (key === 'left') {
      if (control) this.resizeBBox(item, new Point(-delta, 0))
      else this.moveBBox(item, new Point(-delta, 0))
    } else if (key === 'right') {
      if (control) this.resizeBBox(item, new Point(delta, 0))
      else this.moveBBox(item, new Point(delta, 0))
    } else if (key === 'up') {
      if (control) this.resizeBBox(item, new Point(0, -delta))
      else this.moveBBox(item, new Point(0, -delta))
    } else if (key === 'down') {
      if (control) this.resizeBBox(item, new Point(0, delta))
      else this.moveBBox(item, new Point(0, delta))
    }
  }
}
