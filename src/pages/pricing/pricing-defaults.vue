<template>  
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center py-4" title="Pricing Customers">
      <v-divider></v-divider>
      <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular>
      <div v-else class="px-4 pb-4" style="min-height: 400px;">    
        <v-data-table id="providerTable" 
                      class="elevation-1 px-4"
                      :headers="headers" 
                      :items="connectionData" 
                      style="min-height: 450px; font-size: 10pt;"
                      :sort-by="[{ key: 'calories', order: 'asc' }]" >
          <template v-slot:top>
            <VRow class="align-center">
              <VCol cols="12" md="3"  sm="6">
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
              <VCol cols="12" md="3" sm="6"> 
                <v-autocomplete
                  v-model="customerModel"
                  label="Customers"
                  :items="getCustomers"
                  multiple
                ></v-autocomplete>               
              </VCol>
              <VCol cols="12" md="3" sm="6"> 
                <v-autocomplete
                  v-model="typeRouteModel"
                  label="Type of Route"
                  :items="getRouteTypes"
                  multiple
                ></v-autocomplete>               
              </VCol>
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
                <VImg v-if="!item.PAIS_DESTINO || item.PAIS_DESTINO == '*'" :max-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :max-width="32" :src="`${serverUrl}/flags/${item.PAIS_DESTINO}.png`"/>
                {{ item.state }}
              </td>
              <td>{{ item.MCC }}</td>
              <td>{{ item.MNC }}</td>
              <td>{{ item.OPERADORA }}</td>              
              <td>{{ item.MONEDA }}</td>                    
              <td>{{ item.PRECIO }}</td>
              <td>{{ item.ID_TIPOCOBRO }}</td>
              <td>{{ item.ID_TIPOBULK }}</td>
              <td>{{ item.ID_MASTERBULK }}</td>
              <td>{{ item.FECHA }}</td>
              <td>{{ item.COMENTARIOS }}</td>
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
const { mapGetters, mapActions, mapState } = createNamespacedHelpers('pricing');

export default {  
  data() {
    
    return {
      isBox: false,
      serverUrl: window.configData.APP_BASE_URL,
      headers: [
          { title: 'Destination Country', align: 'start', key: 'state', },
          { title: 'Mcc',                 align: 'start', key: 'MCC', },
          { title: 'Mnc',                 align: 'start', key: 'MNC', },
          { title: 'Operator',            align: 'start', key: 'OPERADORA', },
          { title: 'Currency',            align: 'start', key: 'MONEDA' },
          { title: 'Price',               align: 'start', key: 'PRECIO' },
          { title: 'Type of Charge',      align: 'start', key: 'ID_TIPOCOBRO' },
          { title: 'Sending Mode',        align: 'start', key: 'ID_TIPOBULK' },
          { title: 'ID Master Provider',  align: 'start', key: 'ID_MASTERBULK' },
          { title: 'Date',                align: 'start', key: 'FECHA' },
          { title: 'Commentation',        align: 'start', key: 'COMENTARIOS' },
      ], 
      countryModel: null,
      customerModel: null,
      typeRouteModel: null,
      connectionData: [],        
    }
  },
  computed: {
    ...mapGetters(['GetPricingDefaultsData', 'IsLoading', 'GetError']),
    getCountries: function(){
      return this.GetPricingDefaultsData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    }, 
    getRouteTypes: function(){      
      return this.GetPricingDefaultsData?.routeList?.map( item => `${item.route} [${item.id}]`).splice(0, 50);
    }, 
    getCustomers: function(){
      const customerList = this.GetPricingDefaultsData?.customerList;
      if(!customerList) return [];
      return Object.keys(customerList)?.map( name => `${customerList[name].EMPRESA} [${customerList[name].ID_CLIENTE}]`);
    },     
  },
  mounted() {

    this.fetchPricingDefaultsData({        
      }).then(() => {
        this.connectionData = this.GetPricingDefaultsData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchPricingDefaultsData', ]),    
    search() {            

      const ctList = this.countryModel;
      const trList = this.typeRouteModel?.map( str => parseInt( str.match(/\[(\d+)\]/)[1] ) );
      const csList = this.customerModel?.map( str => parseInt( str.match(/\[(\d+)\]/)[1] ) );

      this.connectionData = this.GetPricingDefaultsData?.data.
      filter( xx => !ctList?.length ? true : ctList.includes(xx.PAIS_DESTINO) ).
      filter( xx => !csList?.length ? true : csList.includes(xx.ID_CLIENTE) ).
      filter( xx => !trList?.length ? true : trList.includes(xx.ID_TIPO) );
    },
    Reset() {
      this.countryModel = null,
      this.typeRouteModel = null, 
      this.customerModel = null;    

      this.search();
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