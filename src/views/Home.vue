<template lang="pug">
div.h100.rel
  v-container.pt-0(fluid)
    v-row
      v-col.canvas-view(cols='9')
        canvas#canvas(@wheel='onWheel' resize='true')
      v-col(cols='3')
        annotation-list(:annotations='annotations' @select="onAnnotationSelect")
  label-modal(v-if="selectedBBox" :bbox='selectedBBox' @ok="onLabelEdit")

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
import LabelModal from '@/components/LabelModal.vue'
import coco from '@/assets/coco1.json'
import { BBox } from '@/models/user/annotation'

@Component({ name: 'Home', components: { AnnotationList, LabelModal } })
export default class Home extends Vue {
  coco: Coco = coco[0]
  canvas: HTMLCanvasElement | null = null
  segmentation: paper.Group[] = []
  tool: paper.Tool | null = null
  bbox: paper.Group[] = []
  userBBox: BBox[] = []
  userSegmentation: paper.CompoundPath[] = []
  userActions: UserAction[] = []
  redoActions: UserAction[] = []
  onWheel = zoomOnWheel
  selectedBBox: BBox | null = null

  get annotations() {
    return this.userBBox.filter(b => b.bbox.isInserted())
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

    this.userBBox.forEach(i => i.bbox.remove())
    this.userBBox = []

    this.userSegmentation.forEach(i => i.remove())
    this.userSegmentation = []

    this.selectedBBox = null

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
      this.addUserAction(userAction)

      const bbox = userAction.item as paper.Path.Rectangle
      const userBBox = { bbox, label: 'untitled' }
      this.userBBox.push(userBBox)
      this.selectedBBox = userBBox
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

    Paper.settings.handleSize = 8

    // createImage(this.coco.image)

    createImage({
      license: 1,
      // eslint-disable-next-line @typescript-eslint/camelcase
      file_name: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      coco_url: require('@/assets/image.jpg'),
      height: 1,
      width: 1,
      // eslint-disable-next-line @typescript-eslint/camelcase
      date_captured: '',
      // eslint-disable-next-line @typescript-eslint/camelcase
      flickr_url: '',
      id: 1
    })

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

  onLabelEdit() {
    this.selectedBBox = null
  }

  onAnnotationSelect(annotation: BBox) {
    this.selectedBBox = null
    this.$nextTick(() => {
      this.selectedBBox = annotation
    })
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

.rel {
  position: relative;
}

.canvas-view {
  background: grey;
  height: calc(100vh - 48px);
  padding: 0;
}
</style>
