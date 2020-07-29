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

  annotation-viewer(:dataset='selectedDataset' :tool='selectedTool' @select='onAnnotationSelect' type='segmentator')

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
import { Component } from 'vue-property-decorator'
import { ipcRenderer as ipc } from 'electron-better-ipc'
import { DeepLabOutput } from '@tensorflow-models/deeplab/dist/types'
import { Annotation } from '@/models/user/annotation'
import { UserAction } from '@/models/user/actions'
import {
  createSegmentationDrawTool,
  createSegmentationEditTool,
  Tool,
  toDataUrl,
  createSegmentationFromDetector,
  createImageFromData
} from '@/utils'
import LabelModal from '@/components/annotator/LabelModal.vue'
import Toolbar from '@/components/annotator/segmentation/Toolbar.vue'
import ImagePreviewBottomBar from '@/components/annotator/ImagePreviewBottomBar.vue'
import AnnotationViewer from '@/components/annotator/AnnotationViewer.vue'
import Annotator from '@/views/annotator/Annotator'

@Component({
  name: 'Segmentator',
  components: {
    LabelModal,
    ImagePreviewBottomBar,
    Toolbar,
    AnnotationViewer
  },
  extends: Annotator
})
export default class Segmentator extends Annotator {
  async onDetectObject() {
    if (this.detectorLoading || !this.selectedDataset?.raster) return

    this.detectorLoading = true

    const image = this.selectedDataset.raster.image
    const dataUrl = toDataUrl(image)
    const prediction = await ipc.callMain<string, DeepLabOutput>(
      'detect/segmentation',
      dataUrl
    )
    console.log('predictions', Object.keys(prediction.legend))
    const { segmentationMap, width, height } = prediction

    const segmentationMapData = new ImageData(segmentationMap, width, height)

    this.selectedDataset.raster.image = createImageFromData(segmentationMapData)

    // const segmentations = createSegmentationFromDetector(predictions)
    // segmentations.forEach(segment => this.attachAnnotationInteraction(segment))
    // this.addAnnotations(segmentations)

    // const items = bboxes.map(b => b.item)
    // this.addUserAction(new MultipleDrawAction(items))

    this.detectorLoading = false
  }

  useDrawTool() {
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

  useEditTool() {
    this.removeTool()
    this.tool = createSegmentationEditTool(this.addUserAction.bind(this))
    this.selectedTool = Tool.Edit
  }

  exportAnnotation() {
    console.log('export!')
  }

  attachAnnotationInteraction(annotation: Annotation) {
    annotation.item.onMouseDown = this.onSegementationMouseDown(annotation)
  }

  onSegementationMouseDown(annotation: Annotation) {
    return () => {
      if (this.selectedTool !== Tool.Edit) return
      this.onAnnotationSelect(annotation)
    }
  }
}
</script>

<style scoped>
.view {
  padding: 0 0 0 56px;
}
</style>
