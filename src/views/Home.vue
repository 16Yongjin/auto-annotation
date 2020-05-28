<template>
  <div>
    <canvas width="300" height="300" id="canvas"></canvas>

    <div>
      <button @click="showBBox">Show BBox</button>
      <button @click="showSegmentation">Show Segmentation</button>
      <button @click="hideAnnotation">Hide All</button>
      <button @click="useBBoxDrawTool">Draw BBox</button>
      <button @click="useBBoxEditTool">Edit BBox</button>
      <button @click="useSegmentationDrawTool">Draw Segmentation</button>
      <button @click="useSegmentationEditTool">Edit Segmentation</button>
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
import { createBBoxDrawTool, createSegmentationDrawTool } from '@/utils/draw'
import { createSegmentationEditTool, createBBoxEditTool } from '@/utils/edit'
import coco from '@/assets/coco1.json'

@Component({ name: 'Home' })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  segmentation: paper.CompoundPath[] = []
  tool: paper.Tool | null = null
  bbox: paper.Group[] = []
  userBBox: paper.Path[] = []
  userSegmentation: paper.CompoundPath[] = []
  userActions: UserAction[] = []

  @Prop() private msg!: string

  showBBox() {
    if (this.bbox.length) return
    this.bbox = createBBox(this.coco.annotations, { category: false })
  }

  showSegmentation() {
    if (this.segmentation.length) return
    this.segmentation = createSegmentation(this.coco.annotations)
  }

  hideAnnotation() {
    if (this.bbox.length) {
      this.bbox.forEach(b => b.remove())
      this.bbox = []
    }
    if (this.segmentation.length) {
      this.segmentation.forEach(s => s.remove())
      this.segmentation = []
    }
  }

  useSegmentationDrawTool() {
    this.removeTool()
    this.tool = createSegmentationDrawTool(
      (segmentation: paper.CompoundPath) => {
        this.userSegmentation.push(segmentation)
        this.userActions.push({ name: 'addSegmentation', item: segmentation })
      }
    )
  }

  useSegmentationEditTool() {
    this.removeTool()
    this.tool = createSegmentationEditTool()
  }

  useBBoxDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((bbox: paper.Path.Rectangle) => {
      this.userBBox.push(bbox)
      this.userActions.push({ name: 'addBBox', item: bbox })
    })
  }

  useBBoxEditTool() {
    this.removeTool()
    this.tool = createBBoxEditTool()
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

    this.useBBoxDrawTool()
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
