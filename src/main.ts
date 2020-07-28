import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/main.scss'
import { setDarkMode, isDarkMode } from '@/electron/db'
import { onSystemDarkModeChange } from '@/utils'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
  mounted() {
    this.$vuetify.theme.dark = isDarkMode()

    onSystemDarkModeChange(mode => (this.$vuetify.theme.dark = mode))
  },
  watch: {
    '$vuetify.theme.dark': setDarkMode
  }
}).$mount('#app')
