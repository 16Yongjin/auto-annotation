<template lang="pug">
div(ref='scrollContainer' @mousewheel='onScrollWheel')
  slot
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'HorizontalScroller' })
export default class HorizontalScroller extends Vue {
  onScrollWheel(event: WheelEvent) {
    event.preventDefault()
    const container = this.$refs.scrollContainer as HTMLElement
    const delta = Math.max(-1, Math.min(1, event.deltaY))
    container.scrollLeft += delta * 50
  }
}
</script>
