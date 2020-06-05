import { Annotation } from '@/models/user/annotation'
import Paper, { Point } from 'paper'
import ColorHash from 'color-hash'
import { getCategory } from '@/utils'
import { Annotation as AnnotationData } from '@/models/datasets'
import { CreateBBoxOptions } from '@/models/options/createBBox'
import { DetectedObject } from '@tensorflow-models/coco-ssd'

const colorHash = new ColorHash()

const defaultOption: CreateBBoxOptions = {
  category: false
}

export function createBBox(
  annotation: DetectedObject,
  { category } = defaultOption
): Annotation {
  const [x, y, w, h] = annotation.bbox
  const boxStart = new Point(x, y)
  const boxEnd = new Point(x + w, y + h)
  const boxRect = new Paper.Rectangle(boxStart, boxEnd)
  const box = new Paper.Path.Rectangle(boxRect)
  // box.strokeColor = new Paper.Color(colorHash.hex(annotation.toString()))
  box.strokeColor = Paper.Color.random()
  box.strokeWidth = 3

  const bbox = new Paper.Group([box])

  if (category) {
    // 카테고리 텍스트
    const boxText = new Paper.PointText(boxStart.subtract(new Point(0, 4)))
    boxText.content = annotation.class

    // 카테고리 텍스트 박스
    const boxTextBox = new Paper.Path.Rectangle(boxText.bounds.expand(3))
    boxTextBox.fillColor = box.strokeColor

    if (category) bbox.addChildren([boxTextBox, boxText])
  }

  return { item: bbox, label: annotation.class }
}

export function createBBoxes(data: DetectedObject[], options = defaultOption) {
  const annotations = data.map(annotation => createBBox(annotation, options))

  return annotations
}
