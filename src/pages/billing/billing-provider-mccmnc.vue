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
              <VCol cols="12" md="4" sm="6"> 
                <v-autocomplete
                  v-model="providerModel"
                  label="Providers"
                  :items="getProviders"
                  multiple
                ></v-autocomplete>               
              </VCol>
              <VCol cols="12" md="4" sm="6"> 
                <v-autocomplete
                  v-model="customerModel"
                  label="Customers"
                  :items="getCustomers"
                  multiple
                ></v-autocomplete>               
              </VCol>
              <VCol cols="12" md="4" sm="6"> 
                <v-autocomplete
                  v-model="mccmncModel"
                  label="MccMnc"
                  :items="getMccMnc"
                  :disabled="!getMccMnc.length"
                  multiple
                ></v-autocomplete>               
              </VCol>
              <VCol cols="12" md="4" sm="6"> 
                <v-autocomplete
                  v-model="typeRouteModel"
                  label="Type of Route"
                  :items="getTypeRoutes"
                  multiple
                ></v-autocomplete>               
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12" md="9" sm="12"></VCol>
              <VCol cols="12" md="3" sm="12" class="text-right">
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

              <td>{{ item.Master_Proveedor }}</td>
              <td>{{ item.Proveedor }}</td>
              <td class="flag_country">
                <VImg v-if="!item.Pais_Destino || item.Pais_Destino == '*'" :min-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :min-width="32" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                {{ item.state }}
              </td>
              <td>{{ item.Enviados }}</td>
              <td>{{ item.Reenviados }}</td>              
              <td>{{ item.Entregados }}</td>                    
              <td>{{ item.Precio_Proveedor }} €</td>
              <td>{{ item.Total_Proveedor }} €</td>
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
const { mapGetters, mapActions, mapState } = createNamespacedHelpers('billing');

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
          { title: 'Master',              align: 'start', key: 'Master_Proveedor', },
          { title: 'Provider',            align: 'start', key: 'Proveedor', },
          { title: 'Destination Country', align: 'start', key: 'state', },
          { title: 'Submited',            align: 'start', key: 'Enviados', },
          { title: 'Forwarded',           align: 'start', key: 'Reenviados', },
          { title: 'Delivered',           align: 'start', key: 'Entregados' },
          { title: 'Price: Average',      align: 'start', key: 'Precio_Proveedor' },            
          { title: 'Price: Total',        align: 'start', key: 'Total_Proveedor' },            
      ], 
      countryModel: null,
      providerModel: null,
      customerModel: null,
      typeRouteModel: null,
      mccmncModel: null,
      connectionData: [], 
    }
  },
  computed: {
    ...mapGetters(['GetBillingProviderMccMncData', 'GetReportMccMnc', 'IsLoading', 'GetError']),
    getCountries: function(){
      return this.GetBillingProviderMccMncData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    }, 
    getTypeRoutes: function(){      
      const routes = this.GetBillingProviderMccMncData?.typeRoute || {};
      return Object.keys(routes)?.map( route => `${routes[route]} [${route.substr(1,1)}]`);
    }, 
    getCustomers: function(){
      const customerList = this.GetBillingProviderMccMncData?.customerList;
      if(!customerList) return [];
      return Object.keys(customerList)?.map( name => `${customerList[name].EMPRESA} [${customerList[name].ID_CLIENTE}]`);
    },     
    getProviders: function(){
      return this.GetBillingProviderMccMncData?.providerList?.map( item => `${item.NOMBRE} [${item.ID_PROVEEDOR}]`);      
    },    
    getMccMnc: function(){
      return this.GetReportMccMnc?.map( item => `${item.OPERATOR} [${item.MCC}${item.MNC}]` ).sort() ?? [];
    },    
  },
  mounted() {
    const endDate   = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 7));
    this.picker     = [startDate, endDate];

    this.fetchBillingProviderMccMncData({  
        cFechaInicio:   startDate,
        cFechaFin:      endDate,        
      }).then(() => {
        this.connectionData = this.GetBillingProviderMccMncData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchBillingProviderMccMncData', 'fetchMccMncData']),    
    search() {
      this.fetchBillingProviderMccMncData({  
        cFechaInicio:   this.picker[0],
        cFechaFin:      this.picker[1],        
        cPaises:        this.countryModel.join(','),
        iIDCliente:     parseInt( this.customerModel?.match(/\[(\d+)\]/)[1] ),
        iIDProveedor:   parseInt( this.providerModel?.match(/\[(\d+)\]/)[1] ),
        iIDTipoRuta:    parseInt( this.typeRouteModel?.match(/\[(\d+)\]/)[1] ),
        cMccMnc:        parseInt( this.mccmncModel?.match(/\[(\d+)\]/)[1] ),
      }).then(() => {
        this.connectionData = this.GetBillingProviderMccMncData?.data;
      });     
    },
    Reset() {
      this.countryModel = null,
      this.typeRouteModel = null, 
      this.customerModel = null;    

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
    countryModel: function(array){
      const codes = this.getNumList(array);        
      if(!codes) return;
      this.fetchMccMncData({
        codes: codes
      });
    },
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
  