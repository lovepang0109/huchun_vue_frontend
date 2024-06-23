<template>
  <div>
  <VRow class="match-height">
    <VCol cols="12" md="12" lg="12">
      <VCard class="text-center pb-4" title="Search Reports for Countries" >

        <v-divider class="pb-1"></v-divider>
        
        <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular> 
        
        <v-data-table v-if="!IsLoading" 
                      :headers="headers" 
                      :items="getReportData" 
                      :sort-by="[{ key: 'calories', order: 'asc' }]"
                      :pagination.sync="pagination"
                      :items-per-page="pagination.itemsPerPage"
                      :footer-props="footerProps"
                      class="elevation-1 px-4 py-2" style="min-height: 450px;">
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
                      label="Providers"
                      :items="getProviders"
                      v-model="providerModel"
                      multiple
                    ></v-autocomplete>
                  </VCol>                    
                </VRow>

                <VRow class="align-center">
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
                      multiple
                      :disabled="!getMccMnc.length"
                    ></v-autocomplete>
                  </VCol>
                  <VCol cols="12" md="4" sm="6">
                    <v-autocomplete
                      label="Type of route"
                      :items="getTypeRoute"
                      v-model="typeRouteModel"
                      multiple
                    ></v-autocomplete>
                  </VCol>
                </VRow>

                <VRow>
                  <VCol cols="12" md="12" sm="12" class="text-right">
                    <v-btn @click="searchResult" color="info" dark class="btn border" size="small" prepend-icon="tabler-search">
                        Search
                    </v-btn>
                    <v-btn color="secondary" dark class="btn border ml-4" size="small" prepend-icon="tabler-refresh"
                        @click="Reset">
                        Reset
                    </v-btn>
                  </VCol>
                  <VCol cols="12" md="3" sm="12"></VCol>
                </VRow>
            </template>  

            <template v-slot:item="{ item, index }">
              <tr class="text-left">                
                <td>
                  <VImg :max-width="32" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                  <span>{{ item.state }}</span>
                </td>
                <td>{{ item.Enviados }}</td>
                <td>{{ item.Notificados }}</td>
                <td>{{ item.Errores }}</td>
                <td>{{ item.Reenviados }}</td>
                <td>{{ item.Entregados }}</td>
              </tr>              
            </template> 
            
            <template v-slot:footer>
              <tr>
                <td>Total:</td>
                <td><strong>{{ totalCalories }}</strong></td>
                <td><strong>{{ totalFat }}</strong></td>
                <td><strong>{{ totalCarbs }}</strong></td>
                <td><strong>{{ totalProtein }}</strong></td>
                <td></td>
              </tr>
            </template>
        </v-data-table>

        <VCol cols="12" md="12" lg="12" class="text-right">
          <table>
            <thead>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </thead>
            <tbody>
              <tr>
                <td>Total:</td>
                <td><strong>{{ totalCalories }}</strong></td>
                <td><strong>{{ totalFat }}</strong></td>
                <td><strong>{{ totalCarbs }}</strong></td>
                <td><strong>{{ totalProtein }}</strong></td>
                <td></td>
              </tr> 
            </tbody>
          </table>
        </VCol>  
      </VCard>
    </VCol>

  </VRow>
  <DialogBox :isVisable="isBox"></DialogBox>    
  </div>
  </template>
  <script>
  import DashboardNotify from "@/@core/components/DashboardNotify.vue";  
  import DialogBox from "@layouts/components/DialogBox.vue";
  import { config } from '@layouts/config';
  import { createNamespacedHelpers } from 'vuex';
  import VueDatePicker from '@vuepic/vue-datepicker';
  import '@vuepic/vue-datepicker/dist/main.css';
  import { notify } from "@/utils";
  import dateRanges from '@/utils/dateranges';
  
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('dashboard');
  
  export default{  
    components: {
      DialogBox,
      DashboardNotify,
      VueDatePicker
    },  
    data(){
      return {
        picker: '', 
        isBox: false,      
        headers: [
            { title: 'Destination Country', align: 'start', key: 'Pais_Destino', },
            { title: 'Submited', align: 'start', key: 'Enviados' },
            { title: 'Notified', align: 'start', key: 'Notificados' },
            { title: 'Wrong', align: 'start', key: 'Errores' },            
            { title: 'Forwarded', align: 'start', key: 'Reenviados' },
            { title: 'Delivered', align: 'start', key: 'Entregados' },            
        ],   
        pagination: {
          itemsPerPage: -1 // All
        },       
        countryModel: null,
        providerModel: null,
        customerModel: null,
        typeRouteModel: null,
        mccmncModel: null,
        serverUrl: window.configData.APP_BASE_URL,  
        presetRanges: dateRanges.dayRanges,
        pickerFormat: dateRanges.dayFormat,  
        footerProps: {
          itemsPerPageOptions: [],
          showCurrentPage: false,
          showFirstLastPage: false
        }   
      }
    },
    computed: {
      ...mapGetters(['GetReportCountries', 'IsLoading', 'GetReportMccMnc']),
      totalCalories() {
        return this.getReportData.reduce((acc, item) => acc + item.Enviados, 0);
      },
      totalFat() {
        return this.getReportData.reduce((acc, item) => acc + item.Notificados, 0);
      },
      totalCarbs() {
        return this.getReportData.reduce((acc, item) => acc + item.Errores, 0);
      },
      totalProtein() {
        return this.getReportData.reduce((acc, item) => acc + item.Entregados, 0);
      },
      getReportData: function(){  
          if(this.GetReportCountries?.data?.length){
              return this.GetReportCountries?.data?.map( xx => {
                  let dd = xx;
                      dd['OutText'] = decodeURIComponent(xx?.OutText);
                  return dd;
              });
          }else{
              return [];
          }
      }, 
      getCountries: function(){        
        return this.GetReportCountries?.countryList?.map( item => {
          return {
            code: item.code,
            state: item.state,
            flag: `${this.serverUrl}/flags/${item.code}.png`,
          }
        })
      },
      getProviders: function(){
        return this.GetReportCountries?.providerList?.map( item => `${item.NOMBRE}[${item.ID_PROVEEDOR}]`).splice(0, 50);
      },
      getCustomers: function(){                
        return this.GetReportCountries?.customerList?.map( item => `${item.EMPRESA} [${item.ID_CLIENTE}]`).splice(0, 50);
      },
      getTypeRoute: function(){
        const routes = this.GetReportCountries?.typeRoute || {};
        return Object.keys(routes)?.map( route => `${routes[route]} [${route.substr(1,1)}]`);
      },
      getMccMnc: function(){
        return this.GetReportMccMnc?.map( item => `${item.OPERATOR} [${item.MCC}${item.MNC}]` ).sort() ?? [];
      },
      periodPicker: function(){             
          return this.filterPeriod == 'Month'
      }   
    },
    mounted() {     
      const endDate   = new Date();
      const startDate = new Date(new Date().setDate(endDate.getDate() - 1));
      this.picker     = [startDate, endDate];

      this.fetchReportCountryData({
        cFechaInicio:   startDate,
        cFechaFin:      endDate,
        cPaises:        "",
        iIDCliente:     "",
        iIDProveedor:   "",
        iIDTipoRuta:    -1,
        cMccMnc:        "",
      });

    },  
    methods: {
      ...mapActions(['fetchReportCountryData', 'fetchMccMncData']),      
      searchResult(){
        this.fetchReportCountryData({
          cFechaInicio:   this.picker[0],
          cFechaFin:      this.picker[1],
          cPaises:        this.getNumList(this.countryModel),
          iIDCliente:     this.getNumList(this.customerModel),
          iIDProveedor:   this.getNumList(this.providerModel),
          iIDTipoRuta:    this.getNumList(this.typeRouteModel),
          cMccMnc:        this.getMccMncLists(this.mccmncModel),
        });
      },
      getMccMncLists(value){
        const data = JSON.parse( JSON.stringify(value) );
        if(!data) return "";
        return data.map( item => parseInt(item.match(/\d+/)[0])).join(',');
      },
      Reset(){
        this.countryModel = null;
        this.providerModel = null;
        this.customerModel = null;
        this.typeRouteModel = null;
        this.mccmncModel = null;   
        //
        const endDate   = new Date();
        const startDate = new Date(new Date().setDate(endDate.getDate() - 1));
        this.picker     = [startDate, endDate];     
      },
      getNumList(array){
        return Array.isArray(array) ? array.map(str => parseInt(str.match(/\d+/)[0])).join(',') : array;
      },
      handleDate(value) {
        if (!value[1]) value[1] = value[0];
      },
    },
    watch: {    
      // countryModel: function(array){
      //   const codes = this.getNumList(array);        
      //   if(!codes) return;
      //   this.fetchMccMncData({
      //     codes: codes
      //   });
      // }
    }
  }
  </script>
  
  <style lang="scss">
  @use "@core/scss/template/libs/apex-chart.scss";  
  .v-progress-circular {
    margin: 1rem;
  }
  </style>