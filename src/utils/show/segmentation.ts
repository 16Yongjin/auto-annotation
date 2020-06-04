import Paper, { Point } from 'paper'
import { pipe, chunk, map } from 'lodash/fp'
import ColorHash from 'color-hash'
import { Annotation } from '@/models/user/annotation'
import { Annotation as AnnotationData } from '@/models/datasets'
import { createTooltip, getCategory } from '@/utils'
import { removeTooltip } from '@/utils/tooltip'
import { CreateSegmentationOptions } from '@/models/options/createSegmentation'

const colorHash = new ColorHash()

const toPoint = ([x, y]: number[]) => new Point(x, y)

const defaultOption: CreateSegmentationOptions = {
  tooltip: false
}

export function createSegmentation(
  annotation: AnnotationData,
  { tooltip } = defaultOption
) {
  const compoundPath = new Paper.CompoundPath('')
  const pathes = annotation.segmentation.map(polygons => {
    const path = new Paper.Path()
    const points = pipe(chunk(2), map(toPoint))(polygons)
    path.add(...points)
    path.closePath()
    return path
  })
  compoundPath.addChildren(pathes)
  compoundPath.opacity = 0.5
  compoundPath.strokeColor = new Paper.Color('black')
  compoundPath.fillColor = new Paper.Color(
    colorHash.hex(annotation.id.toString())
  )

  const segmentation = new Paper.Group([compoundPath])

  if (tooltip) {
    // 세그먼테이션에 마우스 올리면 카테고리 표시
    compoundPath.onMouseMove = function({ point }: paper.MouseEvent) {
      removeTooltip(this)

      const categoryName = getCategory(annotation.category_id)
      const tooltip = createTooltip(categoryName, point)
      this.parent.addChild(tooltip)
    }
    // 마우스 떼면 카테고리 표시 제거
    compoundPath.onMouseLeave = function() {
      removeTooltip(this)
    }

    segmentation.addChild(compoundPath)
  }
  return { item: segmentation, label: getCategory(annotation.category_id) }
}

export function createSegmentations(
  data: AnnotationData[],
  options = defaultOption
): Annotation[] {
  const annotations: Annotation[] = data.map(annotation =>
    createSegmentation(annotation, options)
  )

  return annotations
}
