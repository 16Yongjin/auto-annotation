<template lang="pug">
div.h100.rel.view
  toolbar(
    :onDetectObject='onDetectObject'
    :useDrawTool='useDrawTool'
    :useEditTool='useEditTool'
    :useMoveTool='useMoveTool'
    :clearAnnotation='clearAnnotation'
    :resetZoom='resetZoom'
    :exportAnnotation='exportAnnotation'
    :selectedTool='selectedTool'
    :detectorLoading='detectorLoading'
  )

  annotation-viewer(:dataset='selectedDataset' :tool='selectedTool' @select='onAnnotationSelect' type='bbox')

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
import { Component } from 'vue-property-decorator'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { DetectedObject } from '@tensorflow-models/coco-ssd'
import { Annotation } from '@/models/user/annotation'
import { UserAction, MultipleDrawAction } from '@/models/user/actions'
import {
  Tool,
  toDataUrl,
  saveFile,
  BBoxEditTool,
  createBBoxDrawTool,
  createBBoxFromDetector,
  processExportBBox
} from '@/utils'
import LabelModal from '@/components/annotator/LabelModal.vue'
import Toolbar from '@/components/annotator/bbox/Toolbar.vue'
import ImagePreviewBottomBar from '@/components/annotator/ImagePreviewBottomBar.vue'
import AnnotationViewer from '@/components/annotator/AnnotationViewer.vue'
import Annotator from '@/views/annotator/Annotator'

@Component({
  name: 'BBox',
  components: {
    LabelModal,
    ImagePreviewBottomBar,
    Toolbar,
    AnnotationViewer
  }
})
export default class BBox extends Annotator {
  async onDetectObject() {
    if (this.detectorLoading || !this.selectedDataset?.raster) return

    this.detectorLoading = true

    const image = this.selectedDataset.raster.image
    const dataUrl = toDataUrl(image)
    const predictions = await ipc.callMain<string, DetectedObject[]>(
      'detect/bbox',
      dataUrl
    )
    const bboxes = createBBoxFromDetector(predictions)
    bboxes.forEach(bbox => this.attachAnnotationInteraction(bbox))
    this.addAnnotations(bboxes)

    const items = bboxes.map(b => b.item)
    this.addUserAction(new MultipleDrawAction(items))

    this.detectorLoading = false
  }

  useDrawTool() {
    this.removeTool()
    this.tool = createBBoxDrawTool((userAction: UserAction) => {
      this.addUserAction(userAction)

      const item = userAction.item as paper.Path.Rectangle
      const bbox = { item, label: 'untitled' }
      this.attachAnnotationInteraction(bbox)
      this.addAnnotations([bbox])
      this.onAnnotationSelect(bbox)
    })
    this.selectedTool = Tool.Draw
  }

  useEditTool() {
    this.removeTool()
    this.tool = new BBoxEditTool(this.addUserAction.bind(this))
    this.selectedTool = Tool.Edit
  }

  exportAnnotation() {
    if (!this.project) return

    const exportData = processExportBBox(this.datasets)

    saveFile({ defaultPath: this.project.info.path, file: exportData })
  }

  attachAnnotationInteraction(bbox: Annotation) {
    bbox.item.onMouseDown = this.onBBoxMouseDown(bbox)
    bbox.item.onMouseEnter = this.onBBoxMouseEnter(bbox)
    bbox.item.onMouseLeave = this.onBBoxMouseLeave(bbox)
  }

  selectItem(item: paper.Item) {
    item.fillColor = new Paper.Color('rgba(0,255,0,0.2)')
  }

  deselectItem(item: paper.Item) {
    item.fillColor = new Paper.Color('rgba(255,255,255,0.01)')
  }

  onBBoxMouseEnter(bbox: Annotation) {
    return () => {
      if (this.selectedTool !== Tool.Edit) return
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.2
    }
  }

  onBBoxMouseLeave(bbox: Annotation) {
    return () => {
      if (bbox.item.selected) return
      if (bbox.item.fillColor) bbox.item.fillColor.alpha = 0.01
    }
  }

  onBBoxMouseDown(bbox: Annotation) {
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
