import { BBox } from '@/models/db'
import { Annotation } from '@/models/user/annotation'
import Paper, { Point } from 'paper'
import { DetectedObject } from '@tensorflow-models/coco-ssd'

export function createBBox(annotation: BBox): Annotation {
  const [x, y, w, h] = annotation.bbox
  const boxStart = new Point(x, y)
  const boxEnd = new Point(x + w, y + h)
  const boxRect = new Paper.Rectangle(boxStart, boxEnd)
  const bbox = new Paper.Path.Rectangle(boxRect)
  bbox.strokeColor = Paper.Color.random()
  bbox.strokeWidth = 3

  bbox.fillColor = new Paper.Color('white')
  bbox.fillColor.alpha = 0.01

  return { item: bbox, label: annotation.label }
}

// 작은 박스가 큰 박스 앞에 위치하게 해서
// 박스를 선택하기 쉽게 하기 위해 레이어 내부의 항목 순서 조정
function orderAnnotations(annotations: Annotation[]) {
  annotations
    .sort((a, b) => b.item.bounds.area - a.item.bounds.area)
    .forEach(annotation => {
      Paper.project.activeLayer.addChild(annotation.item)
    })
}

export function createBBoxes(data: BBox[]) {
  const annotations = data.map(annotation => createBBox(annotation))

  orderAnnotations(annotations)

  return annotations
}

export function createBBoxFromDetector(data: DetectedObject[]) {
  const bboxData = data.map(d => ({ bbox: d.bbox, label: d.class }))
  return createBBoxes(bboxData)
}

export function createBBoxesFromDB(annotations: BBox[]): Annotation[] {
  const bboxes = createBBoxes(annotations)

  bboxes.forEach(b => b.item.remove())

  return bboxes
}
