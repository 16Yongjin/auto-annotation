<template>
  <div>
    <canvas width="300" height="300" id="canvas"></canvas>
  </div>
</template>

<script lang="ts">
import Paper, { Point } from 'paper'
import { pipe, chunk, map } from 'lodash/fp'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import categories from '@/utils/categories'
import coco from '@/assets/coco1.json'

@Component({ name: 'Home' })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null

  @Prop() private msg!: string

  async mounted() {
    this.canvas = document.querySelector('canvas#canvas')

    if (!this.canvas) return

    this.canvas.width = this.coco.image.width
    this.canvas.height = this.coco.image.height

    Paper.setup(this.canvas)

    const img = document.createElement('img')
    img.src = this.coco.image.coco_url
    img.id = this.coco.image.id.toString()

    const raster = new Paper.Raster(img)
    raster.position = Paper.view.center

    const toPoint = ([x, y]: number[]) => new Point(x, y)
    this.coco.annotations.forEach(annotation => {
      const segmentation = annotation.segmentation
      const compoundPath = new Paper.CompoundPath('')
      const pathes = segmentation.map(polygons => {
        const path = new Paper.Path()
        const points = pipe(chunk(2), map(toPoint))(polygons)
        path.add(...points)
        path.closePath()
        return path
      })
      compoundPath.onMouseMove = function(event: paper.MouseEvent) {
        const prevTooltip = this.parent.children.find(i => i.name === 'tooltip')
        if (prevTooltip) prevTooltip.remove()

        const category = categories[annotation.category_id - 1].name
        const tooltipRect = new Paper.Rectangle(
          event.point.add(new Point(-20, -40)),
          new Paper.Size(category.length * 6, 28)
        )
        const tooltipBox = new Paper.Path.Rectangle(tooltipRect)
        tooltipBox.fillColor = new Paper.Color('white')
        tooltipBox.strokeColor = new Paper.Color('black')

        const tooltipText = new Paper.PointText(
          event.point.add(new Point(-20, -20))
        )
        tooltipText.content = category
        tooltipText.fitBounds(tooltipRect)

        const tooltip = new Paper.Group([tooltipBox, tooltipText])
        tooltip.name = 'tooltip'
        this.parent.addChild(tooltip)
      }

      compoundPath.onMouseLeave = function() {
        const tooltip = this.parent.children.find(i => i.name === 'tooltip')
        if (tooltip) tooltip.remove()
      }
      compoundPath.addChildren(pathes)
      compoundPath.opacity = 0.5
      compoundPath.strokeColor = new Paper.Color('black')
      compoundPath.fillColor = Paper.Color.random()
    })
  }
}
</script>

<style></style>
