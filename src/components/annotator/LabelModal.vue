<template lang="pug">
draggable-container.label-modal(:style='posStyle' ref='modalContainer')
  v-card
    v-card-title Label
    v-card-text.pb-0
      v-text-field(
        outlined
        single-line
        hide-details
        v-model="annotation.label"
        @keyup.enter="onOk"
        @keydown.esc="onOk"
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
import DraggableContainer from '@/components/utils/DraggableContainer.vue'
import { Annotation } from '@/models/user/annotation'

@Component({ name: 'LabelModal', components: { DraggableContainer } })
export default class LabelModal extends Vue {
  @Prop() private annotation!: Annotation

  get posStyle() {
    if (!this.annotation) return

    const annotationBounds = this.annotation.item.bounds
    const viewPos = Paper.view.bounds.point
    console.log(viewPos.toString())

    const container = this.$refs.modalContainer as Vue
    const xOffset = 66 / Paper.view.zoom // (padding-left + extra) / zoom
    const yOffset = container?.$el.clientHeight / 2 || 86

    const { x, y } = annotationBounds.point
      .subtract(viewPos)
      .add(
        new Paper.Point(
          annotationBounds.width + xOffset,
          annotationBounds.height / 2
        )
      )
      .multiply(Paper.view.zoom)

    return {
      left: `${x}px`,
      top: `${y - yOffset}px`
    }
  }

  mounted() {
    if (!this.annotation) return

    const labelText = this.$refs.labelText as Vue
    const labelInput = labelText.$el.querySelector('input')
    if (labelInput) labelInput.select()
  }

  onClear() {
    this.$emit('clear')
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
