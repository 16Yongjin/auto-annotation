import Paper, { Point } from 'paper'
import { pipe, chunk, map } from 'lodash/fp'
import ColorHash from 'color-hash'
import { Annotation } from '@/models/datasets'
import { categories, createTooltip } from '@/utils'
import { removeTooltip } from '@/utils/tooltip'

const toPoint = ([x, y]: number[]) => new Point(x, y)

export function createSegmentation(data: Annotation[]) {
  const colorHash = new ColorHash()
  // const annotations = new Paper.Group()
  const annotations: paper.CompoundPath[] = []

  // 어노테이션 생성
  data.forEach(annotation => {
    const compoundPath = new Paper.CompoundPath('')
    const segmentation = annotation.segmentation
    const pathes = segmentation.map(polygons => {
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

    // // 세그먼테이션에 마우스 올리면 카테고리 표시
    // compoundPath.onMouseMove = function({ point }: paper.MouseEvent) {
    //   removeTooltip(this)

    //   const categoryName = categories[annotation.category_id - 1].name
    //   const tooltip = createTooltip(categoryName, point)
    //   this.parent.addChild(tooltip)
    // }
    // // 마우스 떼면 카테고리 표시 제거
    // compoundPath.onMouseLeave = function() {
    //   removeTooltip(this)
    // }

    // annotations.addChild(compoundPath)
    annotations.push(compoundPath)
  })

  return annotations
}
