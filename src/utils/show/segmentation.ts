import Paper, { Point } from 'paper'
import { pipe, chunk, map } from 'lodash/fp'
import { Annotation } from '@/models/user/annotation'
import { Segmentation } from '@/models/db'
import { DeepLabOutput } from '@tensorflow-models/deeplab/dist/types'

const toPoint = ([x, y]: number[]) => new Point(x, y)

export function createSegmentation(segmentationData: number[][]) {
  const segmentation = new Paper.CompoundPath('')
  const pathes = segmentationData.map(polygons => {
    const path = new Paper.Path()
    const points = pipe(chunk(2), map(toPoint))(polygons)
    path.add(...points)
    path.closePath()
    return path
  })
  segmentation.addChildren(pathes)
  segmentation.opacity = 0.5
  segmentation.strokeColor = new Paper.Color('black')
  segmentation.fillColor = Paper.Color.random()

  return segmentation
}

export function createSegmentations(data: Segmentation[]): Annotation[] {
  const annotations = data.map(({ segmentation, label }) => ({
    item: createSegmentation(segmentation),
    label
  }))

  return annotations
}

export function createSegmentationFromDB(
  annotations: Segmentation[]
): Annotation[] {
  const segmentations = createSegmentations(annotations)

  segmentations.forEach(b => b.item.remove())

  return segmentations
}

export function createSegmentationFromDetector(data: DeepLabOutput[]) {
  data.map(d => {
    console.log(d.legend)
  })
}
