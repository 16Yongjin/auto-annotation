<template lang="pug">
div.h100
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

  v-container(fluid)
    v-row
      v-col.canvas-view(cols="9")
        canvas#canvas(@wheel="onWheel" resize="true")
          v-card-text hi
      v-col(cols="3")
        v-card
          v-card-title Label
          v-card-text.pb-0
            v-text-field(outlined single-line hide-details label="레이블 입력")
          v-card-actions
            v-btn(text) Clear
            v-spacer
            v-btn(text color="primary") Ok

        annotation-list(:annotations='annotations')

</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Vue } from 'vue-property-decorator'
import { Coco } from '@/models/datasets'
import { UserAction } from '@/models/user/actions'
import { zoomOnWheel, resetZoom } from '@/utils'
import { createBBox, createSegmentation, createImage } from '@/utils/show'
import { createBBoxDrawTool, createSegmentationDrawTool } from '@/utils/draw'
import { createSegmentationEditTool, createBBoxEditTool } from '@/utils/edit'
import AnnotationList from '@/components/AnnotationList.vue'
import coco from '@/assets/coco1.json'

@Component({ name: 'Home', components: { AnnotationList } })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  segmentation: paper.Group[] = []
  tool: paper.Tool | null = null
  bbox: paper.Group[] = []
  userBBox: paper.Path[] = []
  userSegmentation: paper.CompoundPath[] = []
  userActions: UserAction[] = []
  redoActions: UserAction[] = []
  onWheel = zoomOnWheel

  get annotations() {
    return this.userBBox
      .filter(s => s.isInserted())
      .map(s => ({ name: 'tt', annotation: s }))
  }

  showBBox() {
    if (this.bbox.length) return
    this.bbox = createBBox(this.coco.annotations)
  }

  showSegmentation() {
    if (this.segmentation.length) return
    this.segmentation = createSegmentation(this.coco.annotations)
  }

  hideAnnotation() {
    this.bbox.forEach(i => i.remove())
    this.bbox = []

    this.segmentation.forEach(i => i.remove())
    this.segmentation = []

    this.userBBox.forEach(i => i.remove())
    this.userBBox = []

    this.userSegmentation.forEach(i => i.remove())
    this.userSegmentation = []

    this.removeTool()
  }

  useSegmentationDrawTool() {
    this.removeTool()
    this.tool = createSegmentationDrawTool((userAction: UserAction) => {
      this.userSegmentation.push(userAction.item as paper.CompoundPath)
      this.addUserAction(userAction)
    })
  }

  useSegmentationEditTool() {
    this.removeTool()
    this.tool = createSegmentationEditTool((userAction: UserAction) => {
      this.addUserAction(userAction)
    })
  }

  useBBoxDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((userAction: UserAction) => {
      this.userBBox.push(userAction.item as paper.Path.Rectangle)
      this.addUserAction(userAction)
    })
  }

  useBBoxEditTool() {
    this.removeTool()
    this.tool = createBBoxEditTool((userAction: UserAction) => {
      this.addUserAction(userAction)
    })
  }

  removeTool() {
    if (this.tool) {
      this.tool.remove()
    }
    this.tool = null
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
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.shiftKey ? this.redo() : this.undo()
    }
  }

  undo() {
    const userAction = this.userActions.pop()

    if (!userAction) return

    userAction.undo()
    this.redoActions.push(userAction)
  }

  redo() {
    const userAction = this.redoActions.pop()

    if (!userAction) return

    userAction.redo()
    this.userActions.push(userAction)
  }

  addUserAction(userAction: UserAction) {
    this.userActions.push(userAction)
    this.redoActions = []
  }
}
</script>

<style>
#canvas {
  width: 100%;
  height: 100%;
}

.h100 {
  height: 100%;
}

.canvas-view {
  background: grey;
  height: calc(100vh - 48px);
  padding: 0;
}
</style>
