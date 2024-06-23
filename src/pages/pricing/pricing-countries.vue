<template>  
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center py-4" title="Pricing Countries">
      <v-divider></v-divider>
      <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular>
      <div v-else class="px-4 pb-4" style="min-height: 400px;">                        
        <v-data-table id="providerTable" 
                      class="elevation-1 px-4 py-2"
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
                  v-model="typeRouteModel"
                  label="Type of Route"
                  :items="getRouteTypes"
                ></v-autocomplete>               
              </VCol>
              <VCol cols="12" md="3" sm="6"> 
                <v-autocomplete
                  v-model="providerModel"
                  label="Provider"
                  :items="getProviders"
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
              <td>{{ item.NOMBRE_PROVEEDOR }}</td>
              <td>{{ item.ID_PROVEEDOR }}</td>                    
              <td>{{ item.ID_TIPOBULK }}</td>
              <td>{{ item.MCC }}</td>
              <td>{{ item.paymentPrices.payment0 }}</td>
              <td>{{ item.paymentPrices.payment1 }}</td>
              <td>{{ item.paymentPrices.payment2 }}</td>
              <td>{{ item.paymentPrices.payment3 }}</td>
              <td>{{ item.paymentPrices.payment4 }}</td>
              <td>{{ item.paymentPrices.payment5 }}</td>
              <td>{{ item.paymentPrices.payment6 }}</td>
              <td>{{ item.paymentPrices.payment7 }}</td>
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
  components: {    
  },
  data() {
    
    return {
      serverUrl: window.configData.APP_BASE_URL,
      headers: [
          { title: 'Destination Country',   align: 'start', key: 'state', },
          { title: 'Provider',              align: 'start', key: 'NOMBRE_PROVEEDOR' },
          { title: 'ID',                    align: 'start', key: 'ID_PROVEEDOR' },            
          { title: 'Route',                 align: 'start', key: 'ID_TIPOBULK' },
          { title: 'Mcc',                   align: 'start', key: 'MCC' },
          { title: 'Price 0',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 1',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 2',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 3',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 4',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 5',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 6',               align: 'start', key: 'paymentPrices' },
          { title: 'Price 7',               align: 'start', key: 'paymentPrices' },
      ], 
      countryModel: null,
      typeRouteModel: null,
      providerModel: null,
      connectionData: [],        
    }
  },
  computed: {
    ...mapGetters(['GetPricingCountriesData', 'IsLoading', 'GetError']),
    getCountries: function(){
      return this.GetPricingCountriesData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    },
    getRouteTypes: function(){      
      return this.GetPricingCountriesData?.routeList?.map( item => `${item.route} [${item.id}]`).splice(0, 50);
    }, 
    getProviders: function(){
      return this.GetPricingCountriesData?.masterProviderList?.map( item => `${item.NOMBRE}[${item.ID_MASTER}]`).splice(0, 50);
    }   
  },
  mounted() {

    this.fetchPricingCountriesData({        
      }).then(() => {
        this.connectionData = this.GetPricingCountriesData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchPricingCountriesData', ]),    
    search() {
      //
      this.fetchPricingCountriesData({ 
        cPaisDestino:   this.countryModel,
        iIDTipoBulk:    parseInt( this.typeRouteModel?.match(/\[(\d+)\]/)[1] ),
        iIDMasterBulk:  parseInt( this.providerModel?.match(/\[(\d+)\]/)[1] )
      }).then(() => {
        this.connectionData = this.GetPricingCountriesData?.data;        
      });

    },
    Reset() {
      this.countryModel = null,
      this.typeRouteModel = null,  
      this.providerModel = null;   

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
  
<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";

.v-progress-circular {
  margin: 1rem;
}
</style>
  