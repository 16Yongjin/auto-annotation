<template lang="pug">
v-dialog(:value='active' max-width='600px')
  template(v-slot:activator='{ on, attrs }')
    v-btn(text v-bind='attrs' v-on='on' @click="$emit('on')")
      v-icon fas fa-plus
  v-card
    v-card-title
      span.headline User Profile
    v-card-text
      v-container
        v-row
          v-col(cols='12', sm='6', md='4')
            v-text-field(label='Legal first name*', required)
          v-col(cols='12', sm='6', md='4')
            v-text-field(label='Legal middle name', hint='example of helper text only on focus')
          v-col(cols='12', sm='6', md='4')
            v-text-field(label='Legal last name*', hint='example of persistent helper text', persistent-hint, required)
          v-col(cols='12')
            v-text-field(label='Email*', required)
          v-col(cols='12')
            v-text-field(label='Password*', type='password', required)
          v-col(cols='12', sm='6')
            v-select(:items="['0-17', '18-29', '30-54', '54+']", label='Age*', required)
          v-col(cols='12', sm='6')
            v-autocomplete(:items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']", label='Interests', multiple)
      small *indicates required field
    v-card-actions
      v-spacer
      v-btn(color='blue darken-1', text, @click="$emit('close')") Close
      v-btn(color='blue darken-1', text, @click="$emit('close')") Save
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import ProjectCard from '@/components/ProjectCard.vue'

@Component({ components: { ProjectCard } })
export default class AddProjectDialog extends Vue {
  @Prop() active!: boolean
}
</script>

<style scoped></style>
