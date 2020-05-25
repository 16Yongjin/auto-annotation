<template>
  <div>
    <canvas width="300" height="300" id="canvas"></canvas>

    <div>
      <button @click="showBBox">BBox</button>
      <button @click="showSegmentation">Segmentation</button>
      <button @click="hideAnnotation">Hide All</button>
      <button @click="userBBoxTool">Draw BBox</button>
    </div>
  </div>
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import { UserAction } from '@/models/user'
import { createBBox, createSegmentation } from '@/utils'
import { createBBoxMouseTool } from '@/utils/draw'
import coco from '@/assets/coco1.json'

@Component({ name: 'Home' })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  segmentation: paper.Group | null = null
  tool: paper.Tool | null = null
  bbox: paper.Group | null = null
  userAnnotation: paper.Path[] = []
  userActions: UserAction[] = []

  @Prop() private msg!: string

  showBBox() {
    if (this.bbox) return
    this.bbox = createBBox(this.coco)
  }

  showSegmentation() {
    if (this.segmentation) return
    this.segmentation = createSegmentation(this.coco)
  }

  hideAnnotation() {
    if (this.bbox) {
      this.bbox.remove()
      this.bbox = null
    }
    if (this.segmentation) {
      this.segmentation.remove()
      this.segmentation = null
    }
  }

  userBBoxTool() {
    if (this.tool) {
      this.tool.remove()
      this.tool = null
    }
    this.tool = createBBoxMouseTool((bbox: paper.Path.Rectangle) => {
      this.userAnnotation.push(bbox)
      this.userActions.push({ name: 'addBBox', item: bbox })
    })
  }

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

    window.addEventListener('keydown', e => this.keyHandler(e))
  }

  keyHandler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'z') this.undo()
  }

  undo() {
    const userAction = this.userActions.pop()
    if (userAction) userAction.item.remove()
  }
}
</script>

<style></style>
