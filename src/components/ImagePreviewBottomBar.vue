<template lang="pug">
v-container.container
  v-row
    img(v-for='image, i in images' :key='i' src='C:/Users/yongj/Desktop/imgs/000000023899.jpg')
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'LabelModal' })
export default class LabelModal extends Vue {
  @Prop() private images!: string[]

  mounted() {
    console.log('mount')
  }
}
</script>

<style scoped>
.container {
  height: 300px;
}
</style>
