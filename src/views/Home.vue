<template>
  <div>
    <div style="padding-top: 55px" />

    <img alt="Vue logo" src="../assets/logo.png" />
    <h1>Web-based Image Annotaiton Tool</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  @Prop() private msg!: string
}
</script>
