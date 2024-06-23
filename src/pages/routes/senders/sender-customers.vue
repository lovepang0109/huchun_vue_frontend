<template>  
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center py-4" title="Sender Customer">
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
              <td>
                <VImg v-if="!item.PAIS_DESTINO || item.PAIS_DESTINO == '*'" :max-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :max-width="32" :src="`${serverUrl}/flags/${item.PAIS_DESTINO}.png`"/>
                {{ item.state }}
              </td>
              <td>{{ item.ID_CLIENTE }}</td>
              <td>{{ item.NOMBRE_CLIENTE }}</td>              
              <td>{{ item.REMITENTE }}</td>                    
              <td>{{ item.RUTA }}</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </VCard>
  </VCol>    
</template>
<script>
import { createNamespacedHelpers } from 'vuex';
import { notify, toArray, exportTableToExcel } from "@/utils";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const { mapGetters, mapActions, mapState } = createNamespacedHelpers('routing');

export default {
  components: {
    VueDatePicker
  },
  data() {
    
    return {
      isBox: false,
      serverUrl: window.configData.APP_BASE_URL,
      headers: [
          { title: 'Destination Country', align: 'start', key: 'state', },
          { title: 'ID Customer',         align: 'start', key: 'ID_CLIENTE', },
          { title: 'Customer',            align: 'start', key: 'NOMBRE_CLIENTE', },
          { title: 'Sender',           align: 'start', key: 'REMITENTE' },
          { title: 'Route',               align: 'start', key: 'RUTA' },            
      ], 
      countryModel: null,
      customerModel: null,
      typeRouteModel: null,
      connectionData: [],        
    }
  },
  computed: {
    ...mapGetters(['GetRoutingSenderCustomersData', 'IsLoading',]),
    getCountries: function(){
      return this.GetRoutingSenderCustomersData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    },     
  },
  mounted() {

    this.fetchRoutingSenderCustomersData({        
      }).then(() => {
        this.connectionData = this.GetRoutingSenderCustomersData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchRoutingSenderCustomersData', ]),    
    search() {            

      const ctList = this.countryModel;
      const trList = this.typeRouteModel?.map( str => parseInt( str.match(/\[(\d+)\]/)[1] ) );
      const csList = this.customerModel?.map( str => parseInt( str.match(/\[(\d+)\]/)[1] ) );

      this.connectionData = this.GetRoutingSenderCustomersData?.data.
      filter( xx => !ctList?.length ? true : ctList.includes(xx.PAIS_DESTINO) );
    },
    Reset() {
      this.countryModel = null,
      this.typeRouteModel = null,     

      this.search();
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
</style>
  