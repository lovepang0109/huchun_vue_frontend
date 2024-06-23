/* eslint-disable import/order */
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import ability from '@/plugins/casl/ability'
import layoutsPlugin from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import createRouter from "@/router"
import { abilitiesPlugin } from '@casl/vue'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import { createApp } from 'vue'
import Vue3Toasity from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { config } from './@layouts/config'
import store from './store'
import '@/assets/ui-icon/iconfont.css'
import JsonExcel from "vue-json-excel3";
import * as echarts from 'echarts';
import { MapChart } from 'echarts/charts';
import VueECharts from 'vue-echarts';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

loadFonts();

// Create vue app
const app = createApp(App)
const router = createRouter(store)

// Use plugins
app.use(vuetify)
app.use(store)
app.use(router)
app.use(layoutsPlugin)
app.use(abilitiesPlugin, ability, { useGlobalProperties: true })
app.use(Vue3Toasity)
app.use(VueDatePicker)
app.component("downloadExcel", JsonExcel);
app.component('v-chart', VueECharts);

// Mount vue app
app.mount('#app')