import { Annotation } from '@/models/user/annotation'
import Paper, { Point } from 'paper'
import { DetectedObject } from '@tensorflow-models/coco-ssd'

export function createBBox(annotation: DetectedObject): Annotation {
  const [x, y, w, h] = annotation.bbox
  const boxStart = new Point(x, y)
  const boxEnd = new Point(x + w, y + h)
  const boxRect = new Paper.Rectangle(boxStart, boxEnd)
  const bbox = new Paper.Path.Rectangle(boxRect)
  bbox.strokeColor = Paper.Color.random()
  bbox.strokeWidth = 3

  return { item: bbox, label: annotation.class }
}

export function createBBoxes(data: DetectedObject[]) {
  const annotations = data.map(annotation => createBBox(annotation))

  return annotations
}
