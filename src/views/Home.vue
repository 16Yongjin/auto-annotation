<template lang="pug">
div
  v-btn-toggle
    v-btn(@click='showBBox') BBox 보기
    v-btn(@click='useBBoxDrawTool') BBox 그리기
    v-btn(@click='useBBoxEditTool') BBox 수정
    v-btn(@click='hideAnnotation') BBox 숨기기
  v-btn-toggle
    v-btn(@click='showSegmentation') Segmentation 보기
    v-btn(@click='useSegmentationDrawTool') Segmentation 그리기
    v-btn(@click='useSegmentationEditTool') Segmentation 수정
    v-btn(@click='hideAnnotation') Segmentation 숨기기
  v-btn-toggle
    v-btn(@click='removeTool') Remove Tool
    v-btn(@click='resetZoom') Reset Zoom
  br
  canvas#canvas(width='300', height='300' @wheel="onWheel")
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import { UserAction } from '@/models/user'
import { zoomOnWheel, resetZoom } from '@/utils'
import { createBBox, createSegmentation, createImage } from '@/utils/show'
import { createBBoxDrawTool, createSegmentationDrawTool } from '@/utils/draw'
import { createSegmentationEditTool, createBBoxEditTool } from '@/utils/edit'
import coco from '@/assets/coco1.json'

@Component({ name: 'Home' })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  segmentation: paper.Group[] = []
  tool: paper.Tool | null = null
  bbox: paper.Group[] = []
  userBBox: paper.Path[] = []
  userSegmentation: paper.CompoundPath[] = []
  userActions: UserAction[] = []
  onWheel = zoomOnWheel

  showBBox() {
    if (this.bbox.length) return
    this.bbox = createBBox(this.coco.annotations)
  }

  showSegmentation() {
    if (this.segmentation.length) return
    this.segmentation = createSegmentation(this.coco.annotations)
  }

  hideAnnotation() {
    const remove = (items: paper.Item[]) => {
      if (!items.length) return
      items.forEach(b => b.remove())
      items = []
    }

    remove(this.bbox)
    remove(this.segmentation)
    remove(this.userBBox)
    remove(this.userSegmentation)
    this.removeTool()
  }

  useSegmentationDrawTool() {
    this.removeTool()
    this.tool = createSegmentationDrawTool(
      (segmentation: paper.CompoundPath) => {
        this.userSegmentation.push(segmentation)
        this.userActions.push({
          name: 'addSegmentation',
          item: segmentation,
          undo: () => {
            segmentation.remove()
          }
        })
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
      this.userActions.push({
        name: 'addBBox',
        item: bbox,
        undo: () => {
          bbox.remove()
        }
      })
    })
  }

  useBBoxEditTool() {
    this.removeTool()
    this.tool = createBBoxEditTool((userAction: UserAction) => {
      console.log(userAction)

      this.userActions.push(userAction)
    })
  }

  removeTool() {
    if (this.tool) {
      this.tool.remove()
      this.tool = null
    }
  }

  resetZoom() {
    const { width, height } = this.coco.image
    resetZoom(new Paper.Point(width / 2, height / 2))
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

    if (userAction) userAction.undo()
  }
}
</script>

<style></style>
