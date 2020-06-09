<template lang="pug">
.img-container
  v-img.mr-1.ml-1(
    v-for='image, i in images' :key='i'
    :src='`http://localhost:8000/file/${image}`'
    height='100'
    width='100'
    )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'LabelModal' })
export default class LabelModal extends Vue {
  @Prop() private images!: string[]
}
</script>

<style scoped>
.img-container {
  display: flex;
  align-items: center;
  height: 128px;
  overflow-x: auto;
  -ms-overflow-style: none;
}

.img-container::-webkit-scrollbar {
  display: none;
}
</style>
