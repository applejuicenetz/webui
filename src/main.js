import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router, { setupRouterGuards } from './router'

import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from './assets/icons'
import DocsComponents from './components/DocsComponents.vue'
import DocsExample from './components/DocsExample.vue'
import DocsIcons from './components/DocsIcons.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Router-Guards nach Pinia-Installation hinzufügen
setupRouterGuards()
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)
app.component('DocsComponents', DocsComponents)
app.component('DocsExample', DocsExample)
app.component('DocsIcons', DocsIcons)

app.mount('#app')
