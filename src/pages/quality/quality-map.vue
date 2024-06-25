<template>  
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center">
      <v-divider></v-divider>
      <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular>
      <div v-else class="px-4 py-4" style="min-height: 400px;">  

        <div ref="chart" class="mb-4 pb-4"></div>  

        <v-data-table id="providerTable" 
                      class="elevation-1 px-4"
                      :headers="headers" 
                      :items="connectionData" 
                      style="min-height: 450px; font-size: 10pt;"
                      :sort-by="[{ key: 'calories', order: 'asc' }]" >          
          <template v-slot:item="{ item, index }">
            <tr class="text-left">                           
              <td class="flag_country">
                <VImg v-if="!item.Pais_Destino || item.Pais_Destino == '*'" :min-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :min-width="32" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                {{ item.state }}
              </td>

              <td>{{ item.Sms_Submitted }}</td>
              <td>{{ item.Promedio_Submitted }}</td>
              <td>{{ item.Sms_Delivered }}</td>
              <td>{{ item.Promedio_Delivered }}</td>               
            </tr>
          </template>
        </v-data-table>
      </div>
    </VCard>
  </VCol>    
</template>

<script>
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'
import mapDataWorld from '../../world.json'

import { createNamespacedHelpers } from 'vuex';
import { notify } from '@/utils';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dateRanges from '@/utils/dateranges';
const { mapGetters, mapActions, mapState } = createNamespacedHelpers('quality');

HighchartsMap(Highcharts);

export default {
  name: 'WorldMap',
  data() {
    return {      
      presetRanges: dateRanges.dayRanges,
      pickerFormat: dateRanges.dayFormat,        
      serverUrl: window.configData.APP_BASE_URL,
      headers: [
          { title: 'Destination Country', align: 'start', key: 'state', },
          { title: 'Sms Submited',        align: 'start', key: 'Sms_Submitted', },
          { title: 'Average Submited',    align: 'start', key: 'Promedio_Submitted', },
          { title: 'Sms Delivered',       align: 'start', key: 'Sms_Delivered', },
          { title: 'Average Delivered',   align: 'start', key: 'Promedio_Delivered' },          
      ],       
      connectionData: [], 
      mapData: [],
      chartOptions: {
        chart: {
          map: 'custom/world',
        },
        title: {
          text: 'World Map'
        },
        series: [
          {            
            mapData: mapDataWorld,
            // data: [],
            joinBy: ['hc-key', 'code'],
            name: 'Tiempos',
            tooltip: {
              valueSuffix: 's'
            },
            borderWidth: 0.5,
            states: {
              hover: {
                color: '#ca913a'
              }
            }
          },                 
        ],
        credits: {
          enabled: false
        },
        chart: {
          backgroundColor: "#484850",
          borderWidth: 1,
          marginRight: 20 // for the legend
        },
        title: {
          text: 'Average quality of routes per country (seconds)',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: "#FFF"
          }
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          floating: true,
          backgroundColor: 'rgba(255, 255, 255, 0.85)'
        },
        mapNavigation: {
          enabled: true
        },
        colorAxis: {
          min: 0,
          max: 120,
          tickInterval: 15,
          stops: [
            [0.000, '#61BD7B'],
            [0.125, '#89C87E'],
            [0.250, '#D7DE82'],
            [0.375, '#D7DE82'],
            [0.500, '#FEEA85'],
            [0.625, '#FDCA7F'],
            [0.750, '#FBA978'],
            [0.875, '#F98972'],
            [1.000, '#F7686A']
          ],
          labels: {
            format: '{value}'
          }
        },

        plotOptions: {
          mapline: {
              showInLegend: false,
              enableMouseTracking: true
          },
          series: {
            events: {
              click: function (e) {                    
              }
            }
          }
        },
      }
    }
  },  
  computed: {
    ...mapGetters(['GetQualityMapData', 'GetReportMccMnc', 'IsLoading', 'GetError']),    
    getMasterProviders: function(){
      return this.GetQualityMapData?.masterProviderList?.map( item => `${item.NOMBRE} [${item.ID_MASTER}]`);      
    },    
  },
  mounted() {    
    
    this.fetchQualityMapData({     
        // cFechaInicio: new Date(),
      }).then(() => {
        this.connectionData = this.GetQualityMapData?.data;  
        
        const mpData = this.GetQualityMapData?.data.map( item => { return { code : item.code.toLowerCase(), value : item.Tiempo_Delivered } } );        
        
        // Check if chartOptions has series array and it's not empty
        if (Array.isArray(this.chartOptions.series) && this.chartOptions.series.length > 0) {
          
          this.chartOptions.series[0].data = mpData;

          this.chart = Highcharts.mapChart(this.$refs.chart, this.chartOptions);
        }

      });     
  },
  methods: {
    ...mapActions(['fetchQualityMapData', ]),    
  },
  watch: {     
    GetError(value){
      if(value != null){
        notify(value, 'error');        
      }
    }   
  }
}
</script>