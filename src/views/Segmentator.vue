<template lang="pug">
div.h100.rel.view
  toolbar(
    :onDetectObject='onDetectObject'
    :useDrawTool='useSegmentationDrawTool'
    :useEditTool='useSegmentationEditTool'
    :useMoveTool='useMoveTool'
    :clearAnnotation='clearAnnotation'
    :resetZoom='resetZoom'
    :exportAnnotation='exportAnnotation'
    :selectedTool='selectedTool'
    :detectorLoading='detectorLoading'
  )

  annotation-viewer(:dataset='selectedDataset' :tool='selectedTool' @select='onAnnotationSelect')

  label-modal(
    v-if='showLabelModal'
    :annotation='selectedAnnotation'
    :focus-on-show='focusLabelModal'
    @clear='removeSelectedAnnotation'
    @ok='resetSelectedAnnotation'
  )

  image-preview-bottom-bar(:datasets='datasets' @dataset-select='selectDataset' :dataset-index='datasetIndex')
</template>

<script lang="ts">
import Paper from 'paper'
import { Component, Watch } from 'vue-property-decorator'
import { Annotation } from '@/models/user/annotation'
import { UserAction } from '@/models/user/actions'
import {
  createSegmentationDrawTool,
  createSegmentationEditTool,
  processExportAnnotation
} from '@/utils'
import LabelModal from '@/components/annotator/LabelModal.vue'
import Toolbar from '@/components/annotator/segmentation/Toolbar.vue'
import ImagePreviewBottomBar from '@/components/annotator/ImagePreviewBottomBar.vue'
import AnnotationViewer from '@/components/annotator/AnnotationViewer.vue'
import Annotator from '@/views/Annotator'

enum Tool {
  Draw,
  Edit,
  Move
}

@Component({
  name: 'Segementation',
  components: {
    LabelModal,
    ImagePreviewBottomBar,
    Toolbar,
    AnnotationViewer
  },
  extends: Annotator
})
export default class Segmentation extends Annotator {
  serverUrl = 'http://localhost:8000/file?filename='

  @Watch('$route.params.id')
  onProjectChanged() {
    if (this.$route.name === 'segmentation') super.loadDatasets()
  }

  mounted() {
    this.setupSegmentator()
  }

  setupSegmentator() {
    window.addEventListener('keydown', e => this.segmentatorKeyHandler(e))
    this.useSegmentationDrawTool()
  }

  segmentatorKeyHandler(e: KeyboardEvent) {
    if (this.$route.name !== 'segmentation') return
    if (this.selectedAnnotation) return

    if (e.key === 'd') this.useSegmentationDrawTool()
    else if (e.key === 'e') this.useSegmentationEditTool()
  }

  onDetectObject() {
    console.log('detect!')
  }

  useSegmentationDrawTool() {
    this.removeTool()
    this.tool = createSegmentationDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const item = userAction.item as paper.CompoundPath
      const bbox = { item, label: 'untitled' }
      this.attachAnnotationInteraction(bbox)
      this.addAnnotations([bbox])
      this.onAnnotationSelect(bbox)
    })
    this.selectedTool = Tool.Draw
  }

  useSegmentationEditTool() {
    this.removeTool()
    this.tool = createSegmentationEditTool(this.addUserAction.bind(this))
    this.selectedTool = Tool.Edit
  }

  exportAnnotation() {
    const exportData = processExportAnnotation(this.datasets)
    console.log(exportData)
  }

  attachAnnotationInteraction(bbox: Annotation) {
    bbox.item.onMouseDown = this.onSegementationMouseDown(bbox)
    bbox.item.onMouseEnter = this.onSegementationMouseEnter(bbox)
    bbox.item.onMouseLeave = this.onSegementationMouseLeave(bbox)
  }

  onSegementationMouseEnter(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== Tool.Edit) return
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.2
    }
  }

  onSegementationMouseLeave(bbox: Annotation) {
    return () => {
      if (bbox.item.selected) return
      bbox.item.fillColor = new Paper.Color('rgba(255,255,255,0.01)')
    }
  }

  onSegementationMouseDown(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== Tool.Edit) return
      this.onAnnotationSelect(bbox)
    }
  }
}
</script>

<style scoped>
.view {
  padding: 0 0 0 56px;
}
</style>
