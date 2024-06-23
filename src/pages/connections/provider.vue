<template>
  <div>
    <VRow class="match-height">
      <VCol cols="12" md="12" lg="12">
        <VCard class="text-center py-4" title="Provider Connections">
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
                      label="Master Providers"
                      :items="getMasterProviders"
                      v-model="masterProviderModel"
                      multiple
                    ></v-autocomplete>                
                  </VCol>
                  <VCol cols="12" md="4" sm="6"> 
                    <v-autocomplete
                      v-model="providerModel"
                      label="Provider"
                      :items="getProviders"
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
                  <td>{{ item.MasterProvider }}</td>
                  <td>{{ item.ID_Proveedor }}</td>
                  <td>{{ item.Proveedor }}</td>
                  <td>{{ item.TipoBulk }}</td>
                  <td>{{ item.Ruta }}</td>
                  <td>{{ item.Num_Conexiones }}</td>
                  <td>{{ item.Servidor }}</td>
                  
                  <td>
                    <VIcon :icon="item.Activa ? 'tabler-check' : 'tabler-x'" :color="item.Activa ? 'success' : 'warning'"/>
                  </td>
                  <td>                    
                    <VIcon :icon="item.Conectado ? 'tabler-check' : 'tabler-x'" :color="item.Conectado ? 'success' : 'warning'"/>
                  </td>
                  <td>
                    <VIcon :icon="item.Bindeado ? 'tabler-check' : 'tabler-x'" :color="item.Bindeado ? 'success' : 'warning'"/>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </VCard>
      </VCol>
    </VRow>
    <DialogBox :isVisable="isBox"></DialogBox>
  </div>
</template>
<script>
import DashboardNotify from "@/@core/components/DashboardNotify.vue";
import DialogBox from "@layouts/components/DialogBox.vue";
import { createNamespacedHelpers } from 'vuex';
import { notify, toArray, exportTableToExcel } from "@/utils";
import dateRanges from '@/utils/dateranges';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const { mapGetters, mapActions, mapState } = createNamespacedHelpers('dashboard');

export default {
  components: {
    DialogBox,
    DashboardNotify,
    VueDatePicker
  },
  data() {
    return {
      isBox: false,
      headers: [
          { title: 'ID Master Provider', align: 'start', key: 'MasterProvider', },
          { title: 'ID Provider',        align: 'start', key: 'ID_Proveedor' },
          { title: 'Proveedor',          align: 'start', key: 'Proveedor' },
          { title: 'Type of route',      align: 'start', key: 'TipoBulk' },
          { title: 'Ruta',               align: 'start', key: 'Ruta' },
          { title: 'Connection',         align: 'start', key: 'Num_Conexiones' },
          { title: 'Server',             align: 'start', key: 'Servidor' },
          { title: 'Active',             align: 'start', key: 'Activa' },
          { title: 'Connected',          align: 'start', key: 'Conectado' },
          { title: 'Linked',             align: 'start', key: 'Bindeado' },
      ], 
      masterProviderModel: null,
      providerModel: null,
      connectionData: [],
    }
  },
  computed: {
    ...mapGetters(['GetConnectProviderData', 'IsLoading',]),
    getMasterProviders: function(){
      return this.GetConnectProviderData?.masterProviderList?.map( item => `${item.NOMBRE}`).splice(0, 50);
    },
    getProviders: function(){      
      return this.GetConnectProviderData?.providerList?.map( item => `${item.NOMBRE} [${item.ID_PROVEEDOR}]`).splice(0, 50);
    },    
  },
  mounted() {

    this.fetchConnectProviderData({        
      }).then(() => {
        this.connectionData = this.GetConnectProviderData?.data;
      });     
  },
  methods: {
    ...mapActions(['fetchConnectProviderData', ]),    
    search() {            

      const mpList = this.masterProviderModel;
      const pdList = this.providerModel?.map( str => parseInt( str.match(/\[(\d+)\]/)[1] ) );

      this.connectionData = this.GetConnectProviderData?.data.
      filter( xx => !mpList?.length ? true : mpList.includes(xx.MasterProvider) ).
      filter( xx => !pdList?.length ? true : pdList.includes(xx.IDCliente) );
         
    },
    Reset() {
      this.masterProviderModel = null,
      this.providerModel = null,     

      this.search();
    },
    handleDate(value) {
      if (!value[1]) value[1] = value[0];
    },
    exportTable() {
      exportTableToExcel("providerTable", "provider_report.xlsx");
    }
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
