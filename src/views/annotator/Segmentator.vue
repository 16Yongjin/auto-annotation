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
import { Annotation } from '@/models/user/annotation'
import { UserAction } from '@/models/user/actions'
import {
  createSegmentationDrawTool,
  createSegmentationEditTool,
  Tool
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
