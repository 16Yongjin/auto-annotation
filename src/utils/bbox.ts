import Paper, { Point } from 'paper'
import ColorHash from 'color-hash'
import { categories } from '@/utils'
import { Coco } from '@/models/datasets'

export function createBBox(data: Coco) {
  const colorHash = new ColorHash()
  const annotations = new Paper.Group()

  data.annotations.forEach(annotation => {
    // 바운드 박스
    const [x, y, w, h] = annotation.bbox
    const boxStart = new Point(x, y)
    const boxEnd = new Point(x + w, y + h)
    const boxRect = new Paper.Rectangle(boxStart, boxEnd)
    const box = new Paper.Path.Rectangle(boxRect)
    box.strokeColor = new Paper.Color(colorHash.hex(annotation.id.toString()))
    box.strokeWidth = 3

    // 카테고리 텍스트
    const boxText = new Paper.PointText(boxStart.subtract(new Point(0, 4)))
    boxText.content = categories[annotation.category_id - 1].name

    // 카테고리 텍스트 박스
    const boxTextBox = new Paper.Path.Rectangle(boxText.bounds.expand(3))
    boxTextBox.fillColor = box.strokeColor

    const bbox = new Paper.Group([box, boxTextBox, boxText])

    annotations.addChild(bbox)
  })

  return annotations
}
