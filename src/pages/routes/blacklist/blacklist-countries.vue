<template>  
  <VCol cols="12" md="12" lg="12">
    <VCard class="text-center py-4" title="Blacklist Sender Countries">
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
              <td class="flag_country">
                <VImg v-if="!item.PAIS_DESTINO || item.PAIS_DESTINO == '*'" :min-width="32" :src="`${serverUrl}/flags/0.png`"/>
                <VImg v-else :min-width="32" :src="`${serverUrl}/flags/${item.PAIS_DESTINO}.png`"/>
                {{ item.state }}
              </td>
              <td>{{ item.tyepRoute }}</td>
              <td>{{ item.REMITENTE }}</td>                    
              <td>{{ item.FECHA_HORA }}</td>
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
          { title: 'Type of route',       align: 'start', key: 'tyepRoute' },
          { title: 'Sender',              align: 'start', key: 'REMITENTE' },            
          { title: 'Banned',              align: 'start', key: 'FECHA_HORA' },
      ], 
      countryModel: null,
      typeRouteModel: null,
      connectionData: [],        
    }
  },
  computed: {
    ...mapGetters(['GetRoutingBlacklistCountriesData', 'IsLoading',]),
    getCountries: function(){
      return this.GetRoutingBlacklistCountriesData?.countryList?.map( item => {
        return {
          code: item.code,
          state: item.state,
          flag: `${this.serverUrl}/flags/${item.code}.png`,
        }
      })
    },
    getRouteTypes: function(){      
      return this.GetRoutingBlacklistCountriesData?.routeList?.map( item => `${item.route} [${item.id}]`).splice(0, 50);
    },    
  },
  mounted() {

    this.fetchRoutingBlacklistCountriesData({        
      }).then(() => {
        this.connectionData = this.GetRoutingBlacklistCountriesData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchRoutingBlacklistCountriesData', ]),    
    search() {            

      const ctList = this.countryModel;
      const trList = this.typeRouteModel?.map( str => parseInt( str.match(/\[(\d+)\]/)[1] ) );

      this.connectionData = this.GetRoutingBlacklistCountriesData?.data.
      filter( xx => !ctList?.length ? true : ctList.includes(xx.PAIS_DESTINO) ).
      filter( xx => !trList?.length ? true : trList.includes(xx.ID_TIPO) );
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
  