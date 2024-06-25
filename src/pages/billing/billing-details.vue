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

              <td>{{ item.Ruta }}</td>
              <td>{{ item.MccMnc }}</td>
              <td>{{ item.NombreOperadora }}</td>
              <td>{{ item.IDProveedor }}</td>              
              <td>{{ item.NombreProveedor }}</td>
              <td>{{ item.NombreMasterProveedor }}</td>
              <td>{{ item.IDCliente }}</td>
              <td>{{ item.Cliente }}</td>
              <td>{{ item.NombreMasterCliente }}</td>
              <td>{{ item.Enviados }}</td>
              <td>{{ item.Entregados }}</td>
              <td>{{ item.Notificados }}</td>
              <td>{{ item.Errores }}</td>
              <td>{{ item.Reenviados }}</td>
              <td>{{ item.Precio_Cliente }} €</td>
              <td>{{ item.Precio_Proveedor }} €</td>
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
          { title: 'Destination Country', align: 'start', key: 'state', },
          { title: 'Route',              align: 'start', key: 'Ruta', },
          { title: 'MccMnc',            align: 'start', key: 'MccMnc', },
          { title: 'Operator',            align: 'start', key: 'NombreOperadora', },
          { title: 'ID Provider',           align: 'start', key: 'IDProveedor', },
          { title: 'Provider',           align: 'start', key: 'NombreProveedor' },
          { title: 'Master Provider',      align: 'start', key: 'NombreMasterProveedor' },            
          { title: 'ID Customer',        align: 'start', key: 'IDCliente' },            
          { title: 'Customer Name',        align: 'start', key: 'Cliente' },            
          { title: 'Master Customer',        align: 'start', key: 'NombreMasterCliente' },            
          { title: 'Submited',        align: 'start', key: 'Enviados' },            
          { title: 'Delivered',        align: 'start', key: 'Entregados' },
          { title: 'Notified',        align: 'start', key: 'Notificados' },            
          { title: 'Wrong',        align: 'start', key: 'Errores' },            
          { title: 'Forwarded',        align: 'start', key: 'Reenviados' },            
          { title: 'Price-Customer',        align: 'start', key: 'Precio_Cliente' },            
          { title: 'Price-Provider',        align: 'start', key: 'Precio_Proveedor' },            
      ], 
      countryModel: null,
      providerModel: null,
      customerModel: null,
      mccmncModel: null,
      connectionData: [], 
    }
  },
  computed: {
    ...mapGetters(['GetBillingDetailsData', 'GetReportMccMnc', 'IsLoading', 'GetError']),
    getCountries: function(){
      return this.GetBillingDetailsData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    },      
    getCustomers: function(){
      const customerList = this.GetBillingDetailsData?.customerList;
      if(!customerList) return [];
      return Object.keys(customerList)?.map( name => `${customerList[name].EMPRESA} [${customerList[name].ID_CLIENTE}]`);
    },     
    getProviders: function(){
      return this.GetBillingDetailsData?.providerList?.map( item => `${item.NOMBRE} [${item.ID_PROVEEDOR}]`);      
    },    
    getMccMnc: function(){
      return this.GetReportMccMnc?.map( item => `${item.OPERATOR} [${item.MCC}${item.MNC}]` ).sort() ?? [];
    },    
  },
  mounted() {
    const endDate   = new Date();
    const startDate = new Date(new Date().setDate(endDate.getDate() - 1));
    this.picker     = [startDate, endDate];

    this.fetchBillingDetailsData({  
        cFechaInicio:   startDate,
        cFechaFin:      endDate,        
      }).then(() => {
        this.connectionData = this.GetBillingDetailsData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchBillingDetailsData', 'fetchMccMncData']),    
    search() {
      this.fetchBillingDetailsData({  
        cFechaInicio:   this.picker[0],
        cFechaFin:      this.picker[1],        
        cPaises:        this.countryModel.join(','),
        iIDCliente:     parseInt( this.customerModel?.match(/\[(\d+)\]/)[1] ),
        iIDProveedor:   parseInt( this.providerModel?.match(/\[(\d+)\]/)[1] ),
        cMccMnc:        parseInt( this.mccmncModel?.match(/\[(\d+)\]/)[1] ),
      }).then(() => {
        this.connectionData = this.GetBillingDetailsData?.data;
      });     
    },
    Reset() {
      this.countryModel  = null,
      this.providerModel = null,
      this.customerModel = null,
      this.mccmncModel   = null;

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
  