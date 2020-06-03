<template lang="pug">
draggable-container.label-modal(
  :style='posStyle')
  v-card
    v-card-title Label
    v-card-text.pb-0
      v-text-field(
        outlined
        single-line
        hide-details
        v-model="bbox.label"
        @keyup.enter="onOk"
        label="레이블 입력"
        ref="labelText")
    v-card-actions
      v-btn(text @click="onClear") Clear
      v-spacer
      v-btn(text color="primary" @click="onOk") Ok
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Paper from 'paper'
import DraggableContainer from '@/components/DraggableContainer.vue'
import { BBox } from '@/models/user/annotation'

@Component({ name: 'LabelModal', components: { DraggableContainer } })
export default class LabelModal extends Vue {
  @Prop() private bbox!: BBox

  get posStyle() {
    if (!this.bbox) return

    const bboxBounds = this.bbox.bbox.bounds
    const viewPos = Paper.view.bounds.point

    const { x, y } = bboxBounds.point
      .subtract(viewPos)
      .add(new Paper.Point(bboxBounds.width, bboxBounds.height / 2))
      .multiply(Paper.view.zoom)

    return {
      left: `${x + 10}px`,
      top: `${y - 86}px`
    }
  }

  mounted() {
    const labelText = this.$refs.labelText as Vue
    const labelInput = labelText.$el.querySelector('input')
    if (labelInput) labelInput.select()
  }

  onClear() {
    this.bbox.bbox.remove()

    this.$emit('ok')
  }

  onOk() {
    this.$emit('ok')
  }
}
</script>

<style scoped>
.label-modal {
  position: absolute;
  z-index: 9999;
}

.hide {
  visibility: hidden;
}
</style>
