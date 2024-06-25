<template>
  <div>
  <VRow class="match-height">
    <VCol cols="12" md="12" lg="12">
      <VCard class="text-center pb-4" title="Last Messages" >

        <v-divider class="pb-1"></v-divider>
        
        <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular> 

        <v-data-table v-if="!IsLoading" :headers="headers" :items="getReportData" :sort-by="[{ key: 'calories', order: 'asc' }]"
            class="elevation-1 px-4 py-2" style="min-height: 450px; font-size: 10pt;">
            <template v-slot:top>
                <VRow class="align-center">                  
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
                  <VCol cols="12" md="4" sm="6">
                    <v-autocomplete
                      label="Type of route"
                      :items="getTypeRoute"
                      v-model="typeRouteModel"
                      multiple
                    ></v-autocomplete>
                  </VCol>                  
                </VRow>

                <VRow class="align-center pb-4 mb-4">
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
                  <VCol cols="12" md="4" sm="6" class="text-right">
                    <v-btn @click="searchResult" color="info" dark class="btn border" size="small" prepend-icon="tabler-search">
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
                  <VImg :min-width="32" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                  <span>{{ item.state }}</span>
                </td>
                <td>{{ item.Ruta }}</td>
                <td>{{ item.Ruta_Real }}</td>
                <td>{{ item.MCC }}</td>
                <td>{{ item.MNC }}</td>
                <td>{{ item.HLR }}</td>
                <td>{{ item.NombreCliente }}</td>
                <td>{{ item.Movil }}</td>
                <td>{{ item.Texto_Remitente }}</td>
                <td>{{ item.Fecha_Salida }}</td>
                <td>{{ item.Fecha_EntregaOperadora }}</td>
                <td>{{ item.Fecha_Notificacion }}</td>
                <td>{{ item.Estado }}</td>
                <td>{{ item.Identificador }}</td>
              </tr>              
            </template>                  
        </v-data-table>                            
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
  
  const { mapGetters, mapActions, mapState } = createNamespacedHelpers('dashboard');
  
  export default{  
    components: {
      DialogBox,
      DashboardNotify,
      VueDatePicker
    },  
    data(){
      return {
        isBox: false,      
        headers: [
            { title: 'Destination Country',     align: 'start', key: 'Pais_Destino', },
            { title: 'Ruta',                    align: 'start', key: 'Ruta' },
            { title: 'Ruta Real',               align: 'start', key: 'Ruta_Real' },
            { title: 'MCC',                     align: 'start', key: 'MCC' },
            { title: 'MNC',                     align: 'start', key: 'MNC' },
            { title: 'HLR',                     align: 'start', key: 'HLR' },            
            { title: 'Client Name',             align: 'start', key: 'NombreCliente' },            
            { title: 'Mobile',                  align: 'start', key: 'Movil' },            
            { title: 'Send Text',               align: 'start', key: 'Texto_Remitente' },            
            { title: 'Departure Date',          align: 'start', key: 'Fecha_Salida' },            
            { title: 'Operator Delivery Date',  align: 'start', key: 'Fecha_EntregaOperadora' },            
            { title: 'Notification',            align: 'start', key: 'Fecha_Notificacion' },            
            { title: 'State',                   align: 'start', key: 'Estado' },            
            { title: 'Identifier',              align: 'start', key: 'Identificador' },            
        ],  
        countryModel: null,
        providerModel: null,
        customerModel: null,
        typeRouteModel: null,
        mccmncModel: null,
        serverUrl: window.configData.APP_BASE_URL,      
      }
    },
    computed: {
      ...mapGetters(['GetLastMessage', 'IsLoading', 'GetReportMccMnc']),
      getReportData: function(){  
          if(this.GetLastMessage?.data){
              return this.GetLastMessage?.data?.filter( item => item.Pais_Destino).map( xx => {
                  let dd = xx;
                      dd['OutText'] = decodeURIComponent(xx?.OutText);
                  return dd;
              });
          }else{
              return [];
          }
      }, 
      getCountries: function(){
        return this.GetLastMessage?.countryList?.map( item => {
          return {
            code: item.code,
            state: item.state,
            flag: `${this.serverUrl}/flags/${item.code}.png`,
          }
        })
      },
      getProviders: function(){
        return this.GetLastMessage?.providerList?.map( item => `${item.NOMBRE}[${item.ID_PROVEEDOR}]`).splice(0, 50);
      },
      getCustomers: function(){        
        return this.GetLastMessage?.customerList?.map( item => `${item.EMPRESA} [${item.ID_CLIENTE}]`).splice(0, 50);
      },
      getTypeRoute: function(){
        const routes = this.GetLastMessage?.typeRoute || {};
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
      this.fetchLastMessageData({
        cPaises:        "",
        iIDCliente:     "",
        iIDProveedor:   "",
        iIDTipoRuta:    -1,
        cMccMnc:        "",
      });

    },  
    methods: {
      ...mapActions(['fetchLastMessageData', 'fetchMccMncData']),      
      searchResult(){
        this.fetchLastMessageData({          
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
      },
      getNumList(array){
        return Array.isArray(array) ? array.map(str => parseInt(str.match(/\d+/)[0])).join(',') : array;
      },
    },
    watch: {          
    }
  }
  </script>
  
  <style lang="scss">
  @use "@core/scss/template/libs/apex-chart.scss";  
  .v-progress-circular {
    margin: 1rem;
  }


.flag_country div:first-child{
  display: inline-block;
  vertical-align: middle;

}
.flag_country span{
  margin-left:15px;
}

.flag_country{
    text-align: left;
}
  </style>