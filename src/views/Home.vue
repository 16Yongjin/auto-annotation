<template>
  <div>
    <canvas width="300" height="300" id="canvas"></canvas>

    <div>
      <button @click="showBBox">BBox</button>
      <button @click="showSegmentation">Segmentation</button>
      <button @click="hideAnnotation">Hide All</button>
      <button @click="useBBoxTool">Draw BBox</button>
      <button @click="useSegmentationTool">Draw Segmentation</button>
      <button @click="removeTool">Remove Tool</button>
    </div>
  </div>
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import { UserAction } from '@/models/user'
import { createBBox, createSegmentation, createImage } from '@/utils'
import { createBBoxMouseTool, createSegmentationTool } from '@/utils/draw'
import coco from '@/assets/coco1.json'

@Component({ name: 'Home' })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  segmentation: paper.Group | null = null
  tool: paper.Tool | null = null
  bbox: paper.Group | null = null
  userBBox: paper.Path[] = []
  userSegmentation: paper.CompoundPath[] = []
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

  useSegmentationTool() {
    this.removeTool()
    this.tool = createSegmentationTool((segmentation: paper.CompoundPath) => {
      this.userSegmentation.push(segmentation)
      this.userActions.push({ name: 'addSegmentation', item: segmentation })
    })
  }

  useBBoxTool() {
    this.removeTool()
    this.tool = createBBoxMouseTool((bbox: paper.Path.Rectangle) => {
      this.userBBox.push(bbox)
      this.userActions.push({ name: 'addBBox', item: bbox })
    })
  }

  removeTool() {
    if (this.tool) {
      this.tool.remove()
      this.tool = null
    }
  }

  async mounted() {
    this.canvas = document.querySelector('canvas#canvas')

    if (!this.canvas) return

    Paper.setup(this.canvas)

    createImage(this.coco.image)

    window.addEventListener('keydown', e => this.keyHandler(e))

    this.useSegmentationTool()
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
