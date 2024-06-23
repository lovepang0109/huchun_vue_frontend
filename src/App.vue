<script setup>
import { useThemeConfig } from '@core/composable/useThemeConfig';
import { useTheme } from 'vuetify';
import { useStore } from 'vuex';
import { hexToRgb } from './@layouts/utils';
import {useRoute} from 'vue-router'
const route = useRoute();
const store = useStore();
const { global } = useTheme();
const {
  syncInitialLoaderTheme,
  syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme,
  isAppRtl,
} = useThemeConfig();

// ℹ️ Sync current theme with initial loader theme
syncInitialLoaderTheme()
syncConfigThemeWithVuetifyTheme();

const sendMsg = () => {
  let f = (Math.random() + 1).toString(36).substring(7);
  let s = (Math.random() + 1).toString(36).substring(7);

  executeVariadic(f,s)
}

</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <RouterView />
    </VApp>
  </VLocaleProvider>
</template>
