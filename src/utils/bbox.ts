import Paper, { Point } from 'paper'
import ColorHash from 'color-hash'
import { categories } from '@/utils'
import { Annotation } from '@/models/datasets'
import { CreateBBoxOptions } from '@/models/options/createBBox'

export function createBBox(
  data: Annotation[],
  { category }: CreateBBoxOptions
) {
  const colorHash = new ColorHash()
  const annotations = data.map(annotation => {
    // 바운드 박스
    const [x, y, w, h] = annotation.bbox
    const boxStart = new Point(x, y)
    const boxEnd = new Point(x + w, y + h)
    const boxRect = new Paper.Rectangle(boxStart, boxEnd)
    const box = new Paper.Path.Rectangle(boxRect)
    box.strokeColor = new Paper.Color(colorHash.hex(annotation.id.toString()))
    box.strokeWidth = 3

    const bbox = new Paper.Group([box])

    if (category) {
      // 카테고리 텍스트
      const boxText = new Paper.PointText(boxStart.subtract(new Point(0, 4)))
      boxText.content = categories[annotation.category_id - 1].name

      // 카테고리 텍스트 박스
      const boxTextBox = new Paper.Path.Rectangle(boxText.bounds.expand(3))
      boxTextBox.fillColor = box.strokeColor

      if (category) bbox.addChildren([boxTextBox, boxText])
    }

    return bbox
  })

  return annotations
}
