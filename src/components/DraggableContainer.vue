<template lang="pug">
#draggable-container(ref='draggableContainer', @mousedown='dragMouseDown')
  slot
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'DraggableContainer' })
export default class DraggableContainer extends Vue {
  positions = {
    clientX: NaN,
    clientY: NaN,
    movementX: 0,
    movementY: 0
  }

  dragMouseDown(event: MouseEvent) {
    event.preventDefault()
    // get the mouse cursor position at startup:
    this.positions.clientX = event.clientX
    this.positions.clientY = event.clientY
    document.onmousemove = this.elementDrag
    document.onmouseup = this.closeDragElement
  }

  elementDrag(event: MouseEvent) {
    event.preventDefault()
    this.positions.movementX = this.positions.clientX - event.clientX
    this.positions.movementY = this.positions.clientY - event.clientY
    this.positions.clientX = event.clientX
    this.positions.clientY = event.clientY
    // set the element's new position:
    const container = this.$refs.draggableContainer as HTMLElement
    container.style.top = container.offsetTop - this.positions.movementY + 'px'
    container.style.left =
      container.offsetLeft - this.positions.movementX + 'px'
  }

  closeDragElement() {
    document.onmouseup = null
    document.onmousemove = null
  }
}
</script>

<style>
#draggable-container {
  position: absolute;
  z-index: 9;
}
#draggable-header {
  z-index: 10;
}
</style>
