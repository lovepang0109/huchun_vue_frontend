<script setup >
import { useTheme } from 'vuetify'
import BarChart from '@/@core/libs/chartjs/components/BarChart'
import { getLatestStackBarChartConfig } from '@core/libs/chartjs/chartjsConfig'

const vuetifyTheme = useTheme();
const props = defineProps(['title', 'labels', 'datasets'])
const chartOptions = computed(() => getLatestStackBarChartConfig(vuetifyTheme.current.value, props.title));

const data = {
  // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  labels: props.labels,
  datasets: props.datasets,  
};
</script>

<template>
  <BarChart
    :height="400"
    :chart-data="data"
    :chart-options="chartOptions"
  />
</template>
