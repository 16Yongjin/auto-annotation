/* eslint-disable @typescript-eslint/no-explicit-any */

import Paper from 'paper'

export type OnAction = (e: UserAction) => void

export abstract class UserAction {
  item: any

  constructor(item: paper.Item) {
    this.item = item
  }

  abstract undo(): void
  abstract redo(): void
}

// 어노테이션 그리기 액션
// undo - 그린 어노테이션 삭제
// redo - 그렸던 어노테이션 다시 추가
export class DrawActoin extends UserAction {
  undo() {
    this.item.remove()
    this.item.data.destroy = true
  }

  redo() {
    Paper.project.activeLayer.addChild(this.item)
    this.item.data.destroy = false
  }
}

export class RemoveAction extends UserAction {
  undo() {
    Paper.project.activeLayer.addChild(this.item)
    this.item.data.destroy = false
  }

  redo() {
    this.item.remove()
    this.item.data.destroy = true
  }
}

export abstract class EditAction extends UserAction {
  from: any
  to: any
  constructor(item: any, from: any, to: any) {
    super(item)
    this.from = from
    this.to = to
  }
}

// BBox 크기 조절 이벤트 발생
// undo - 원래 크기로 조절
// redo - 조절했던 크기로 다시 조절
export class ResizeBBoxAction extends EditAction {
  constructor(bbox: paper.Path.Rectangle) {
    const from = bbox.data.prevBounds.clone()
    const to = bbox.bounds.clone()
    super(bbox, from, to)
  }

  undo() {
    if (this.item) this.item.bounds = this.from
  }

  redo() {
    if (this.item) this.item.bounds = this.to
  }
}

// BBox 이동 이벤트 발생
// undo - bbox를 원래 위치로 이동
// redo - bbox를 옮겼던 위치로 재이동
export class MoveBBoxAction extends EditAction {
  constructor(bbox: paper.Path.Rectangle) {
    const from = bbox.data.prevPosition.clone()
    const to = bbox.position.clone()
    super(bbox, from, to)
  }

  undo() {
    this.item.position = this.from
  }

  redo() {
    this.item.position = this.to
  }
}

// 세그먼트 제거 이벤트 발생
// undo - Path에 세그먼트 다시 추가
// redo - Path에서 세그먼트 제거
export class RemoveSegmentAction extends EditAction {
  index: number

  constructor(item: paper.Item, from: paper.Segment, index: number) {
    super(item, from, from)
    this.index = index
  }

  undo() {
    const path = this.item as paper.Path
    path.insertSegments(this.index, [this.from])
  }

  redo() {
    this.to.remove()
  }
}

// 세그먼트 생성 이벤트 발생
// undo - 세그먼트 제거
// redo - 세그먼트 다시 추가
export class AddSegmentAction extends EditAction {
  index: number

  constructor(item: paper.Item, from: paper.Segment, index: number) {
    super(item, from, from)
    this.index = index
  }

  undo() {
    this.from.remove()
  }

  redo() {
    const path = this.item as paper.Path
    path.insertSegments(this.index, [this.to])
  }
}

// 세그먼트 이동 이벤트 발생
// undo - 세그먼트를 원래 위치로 옮김
// redo - 세그먼트를 옮겼던 위치로 다시 옮김
export class MoveSegmentAction extends EditAction {
  undo() {
    this.item.point = this.from
  }

  redo() {
    this.item.point = this.to
  }
}

// Path 이동 이벤트 발생
// undo - Path를 원래 위치로 옮김
// redo - Path를 옮겼던 위치로 다시 옮김
export class MovePathAction extends EditAction {
  undo() {
    this.item.position = this.from
  }

  redo() {
    this.item.position = this.to
  }
}
