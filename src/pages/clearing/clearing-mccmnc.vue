<template>  
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center">
      <v-divider></v-divider>
      <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular>
      <div v-else class="px-4 py-4" style="min-height: 400px;">    
        <v-data-table id="providerTable" 
                      class="elevation-1 px-4"
                      :headers="headers" 
                      :items="connectionData" 
                      style="min-height: 450px; font-size: 10pt;"
                      :sort-by="[{ key: 'calories', order: 'asc' }]" >
          <template v-slot:top>
            <VRow class="align-center">
              <VCol cols="12" md="4" sm="6">                                
                  <VueDatePicker  auto-apply 
                                  v-model="picker" 
                                  range 
                                  :enable-time-picker="false" 
                                  :month-picker="periodPicker"
                                  @update:model-value="handleDate" 
                                  :preset-dates="presetRanges" 
                                  :format="pickerFormat"
                                  :preview-format="pickerFormat">
                  </VueDatePicker>                      
              </VCol>              
              <VCol cols="12" md="4" sm="6"> 
                <v-autocomplete
                  v-model="masterProviderModel"
                  label="Master Providers"
                  :items="getMasterProviders"
                  multiple
                ></v-autocomplete>               
              </VCol>
              <VCol cols="12" md="4" sm="12" class="text-right">
                <v-btn @click="search" color="info" dark class="btn border" size="small" prepend-icon="tabler-search">
                  Search
                </v-btn>    
                <v-btn color="secondary" dark class="btn border ml-4" size="small" prepend-icon="tabler-refresh"
                    @click="Reset">
                    Reset
                </v-btn>                    
              </VCol>              
            </VRow>            
          </template>
          <template v-slot:item="{ item, index }">
            <tr class="text-left">              
              <td>
                <VIcon :icon="item.Incompleto ? 'tabler-circle-check' : 'tabler-x'" :color="item.Incompleto ? 'success': 'warning'" />
              </td>              
              <td class="flag_country">
                <VImg v-if="!item.Pais_Destino || item.Pais_Destino == '*'" :min-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :min-width="32" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                {{ item.state }}
              </td>

              <td>{{ item.NombreMaster }}</td>
              <td>{{ item.Enviados }}</td>
              <td>{{ item.Entregados }}</td>
              <td>{{ item.Coste }} €</td>               
            </tr>
          </template>
        </v-data-table>
      </div>
    </VCard>
  </VCol>    
</template>
<script>
import { createNamespacedHelpers } from 'vuex';
import { notify } from '@/utils';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dateRanges from '@/utils/dateranges';
const { mapGetters, mapActions, mapState } = createNamespacedHelpers('clearing');

export default {  
  components: {    
    VueDatePicker
  },
  data() {    
    return {
      picker: '', 
      presetRanges: dateRanges.dayRanges,
      pickerFormat: dateRanges.dayFormat,        
      serverUrl: window.configData.APP_BASE_URL,
      headers: [
          { title: 'Complete',            align: 'start', key: 'Incompleto', },
          { title: 'Destination Country', align: 'start', key: 'state', },
          { title: 'Master',              align: 'start', key: 'NombreMaster', },
          { title: 'Submited',            align: 'start', key: 'Enviados', },
          { title: 'Delivered',           align: 'start', key: 'Entregados' },
          { title: 'Cost',                align: 'start', key: 'Coste', },          
      ], 
      masterProviderModel: null,      
      connectionData: [], 
    }
  },
  computed: {
    ...mapGetters(['GetClearingMccMncData', 'GetReportMccMnc', 'IsLoading', 'GetError']),    
    getMasterProviders: function(){
      return this.GetClearingMccMncData?.masterProviderList?.map( item => `${item.NOMBRE} [${item.ID_MASTER}]`);      
    },    
  },
  mounted() {
    const endDate   = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 7));
    this.picker     = [startDate, endDate];

    this.fetchClearingMccMncData({  
        cFechaInicio:   startDate,
        cFechaFin:      endDate,
        iIDMasterBulk: 1,        
      }).then(() => {
        this.connectionData = this.GetClearingMccMncData?.data;
        this.masterProviderModel = this.getMasterProviders[0];
      });     
  },
  methods: {
    ...mapActions(['fetchClearingMccMncData', 'fetchMccMncData']),    
    search() {
      const ids = this.masterProviderModel?.map( item => item.match(/\[(\d+)\]/)[1] ).join(',') ?? null;
      
      this.fetchClearingMccMncData({  
        cFechaInicio:   this.picker[0],
        cFechaFin:      this.picker[1],        
        iIDMasterBulk:  ids,        
      }).then(() => {
        this.connectionData = this.GetClearingMccMncData?.data;
      });     
    },
    Reset() {
      this.masterProviderModel = null;    

      this.search();
    },
    handleDate(value) {
      if (!value[1]) value[1] = value[0];
    },  
    getNumList(array){
      return Array.isArray(array) ? array.map(str => parseInt(str.match(/\d+/)[0])).join(',') : array;
    },     
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
<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";

.v-progress-circular {
  margin: 1rem;
}
</style>
  