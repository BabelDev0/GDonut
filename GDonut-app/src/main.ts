import { createApp } from 'vue'
import App from './App.vue'

import { Quasar, Dialog } from 'quasar'
import 'quasar/src/css/index.sass'
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

createApp(App).use(Quasar, { plugins: { Dialog } }).mount('#app')
