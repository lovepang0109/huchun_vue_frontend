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
              <VCol cols="12" md="4"  sm="6">
                <v-autocomplete
                  label="Countries"
                  :items="getCountries"
                  v-model="countryModel"
                  item-title="state"
                  item-value="code"
                  chips
                  closable-chips
                  multiple
                >
                  <template v-slot:chip="{ props, item }">
                    <v-chip
                      v-bind="props"
                      :prepend-avatar="item.raw.flag"
                      :text="item.raw.state"
                    ></v-chip>
                  </template>

                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="item.raw.flag"
                      :title="item.raw.state"
                    ></v-list-item>
                  </template>
                </v-autocomplete>                      
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
              <td class="flag_country">
                <VImg v-if="!item.Pais_Destino || item.Pais_Destino == '*'" :min-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :min-width="32" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                {{ item.state }}
              </td>

              <td>{{ item.IDProveedor }}</td>
              <td>{{ item.NombreProveedor }}</td>
              <td>{{ item.Ruta }}</td>
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
import { createNamespacedHelpers } from 'vuex';
import { notify } from '@/utils';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import dateRanges from '@/utils/dateranges';
const { mapGetters, mapActions, mapState } = createNamespacedHelpers('quality');

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
        { title: 'Destination Country', align: 'start', key: 'state', },
        { title: 'ID',                  align: 'start', key: 'IDProveedor', },
        { title: 'Provider',            align: 'start', key: 'NombreProveedor', },
        { title: 'Route',               align: 'start', key: 'Ruta', },
        { title: 'SMS Submited',        align: 'start', key: 'Sms_Submitted' },
        { title: 'Average Submited',    align: 'start', key: 'Promedio_Submitted', },          
        { title: 'SMS Delivered',       align: 'start', key: 'Sms_Delivered', },          
        { title: 'Average Delivered',   align: 'start', key: 'Promedio_Delivered', },          
      ], 
      countryModel: null,
      connectionData: [], 
    }
  },
  computed: {
    ...mapGetters(['GetQualityCountryData', 'GetReportMccMnc', 'IsLoading', 'GetError']),    
    getCountries: function(){
      return this.GetQualityCountryData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    },    
  },
  mounted() {
    const endDate   = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 7));
    this.picker     = [startDate, endDate];

    this.fetchQualityCountryData({  
        cFechaInicio:   startDate,
        cFechaFin:      endDate,             
      }).then(() => {
        this.connectionData = this.GetQualityCountryData?.data;        
      });     
  },
  methods: {
    ...mapActions(['fetchQualityCountryData', 'fetchMccMncData']),    
    search() {
      this.fetchQualityCountryData({  
        cFechaInicio:   this.picker[0],
        cFechaFin:      this.picker[1],        
        cPaises:        this.countryModel ? this.countryModel.join(',') : null,     
      }).then(() => {
        this.connectionData = this.GetQualityCountryData?.data;
      });     
    },
    Reset() {
      this.countryModel = null,      

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
  