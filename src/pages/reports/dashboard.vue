<template>
  <div>
    <VRow class="match-height">
      <!-- 👉  Vertical -->
      <VCol cols="12" md="3" sm="6">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <h6 class="text-h6">Countries</h6>
              <div class="d-flex align-center gap-2 my-2">
                <span>Month:</span>
                <span :class="true ? 'text-success' : 'text-error'">{{ getCountriesMonth }}</span>
              </div>
              <div class="d-flex align-center gap-2 mt-2">
                <span>Yesterday:</span>
                <span :class="true ? 'text-success' : 'text-error'">{{ getCountriesYest }}</span>
              </div>
            </div>
            <VAvatar
              variant="tonal"
              rounded
              color="success"
              icon="tabler-flag"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3" sm="6">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <h6 class="text-h6">Providers</h6>
              <div class="d-flex align-center gap-2 my-2">
                <span>Month:</span>
                <span :class="true ? 'text-warning' : 'text-error'">{{ getProvidersMonth }}</span>
              </div>
              <div class="d-flex align-center gap-2 mt-2">
                <span>Yesterday:</span>
                <span :class="true ? 'text-warning' : 'text-error'">{{ getProvidersYest }}</span>
              </div>
            </div>
            <VAvatar
              variant="tonal"
              rounded
              color="warning"
              icon="tabler-car"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3" sm="6">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <h6 class="text-h6">Customers</h6>
              <div class="d-flex align-center gap-2 my-2">
                <span>Month:</span>
                <span :class="true ? 'text-error' : 'text-error'">{{ getCustomersMonth }}</span>
              </div>
              <div class="d-flex align-center gap-2 mt-2">
                <span>Yesterday:</span>
                <span :class="true ? 'text-error' : 'text-error'">{{ getCustomersYest }}</span>
              </div>
            </div>
            <VAvatar
              variant="tonal"
              rounded
              color="error"
              icon="tabler-users"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="3" sm="6">
        <VCard>
          <VCardText class="d-flex justify-space-between">
            <div>
              <h6 class="text-h6">Messages</h6>
              <div class="d-flex align-center gap-2 my-2">
                <span>Month:</span>
                <span :class="true ? 'text-primary' : 'text-error'">{{ getMessagesMonth }}</span>
              </div>
              <div class="d-flex align-center gap-2 mt-2">
                <span>Yesterday:</span>
                <span :class="true ? 'text-primary' : 'text-error'">{{ getMessagesYest }}</span>
              </div>
            </div>
            <VAvatar
              variant="tonal"
              rounded
              color="primary"
              icon="tabler-message"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    
    <VRow class="match-height">
      <VCol cols="12" md="12" lg="12">
        <VCard>
          <v-card-title class="text-center pt-4">Countries</v-card-title>  
          <VRow v-if="IsLoading">
            <VCol cols="12" md="12" sm="12" class="text-center">
              <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            </VCol>
          </VRow>
          <VRow v-else class="px-2 py-2">
            <VCol cols="12" md="6" sm="12">
              <VTable class="text-no-wrap text-center pb-4">
                <thead class="text-center">
                  <tr>
                    <th scope="col" class="text-center">Country frefrefr</th>
                    <th scope="col" class="text-center">Mensajes Ayer</th>
                    <th scope="col" class="text-center">Promedio Mes</th>
                    <th scope="col" class="text-center">Mensajes Mes</th>                
                  </tr>
                </thead>
                <tbody class="text-center">
                  <tr v-for="(item, key) in getCountriMessages" :key="key">
                    <td>                      
                      <VImg :max-width="30" class="mx-auto" :src="`${serverUrl}/flags/${item.Pais_Destino}.png`"/>
                      <span>{{ item.code }}</span>
                    </td>
                    <td>{{ item.Mensajes.toLocaleString("en-US") }}</td>
                    <td>{{ item.PromedioMes }}</td>
                    <td>{{ item.MensajesMes }}</td>
                  </tr>

                  <tr>
                    <th scope="col" class="text-center">Total</th>
                    <th scope="col" class="text-center">{{getTotalCountriMessages[0]}}</th>
                    <th scope="col" class="text-center">ssss</th>
                    <th scope="col" class="text-center">ssss</th>                
                  </tr>

                </tbody>

              </VTable> 
            </VCol>

            <VCol v-if="getDataSets && getDataSets.length" cols="12" md="6" sm="12">              
              <ChartJsBarChart title="Countries Statistics" :labels="getChartLabels" :datasets="getDataSets"/>
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>

    <VRow class="match-height">
      <VCol cols="12" md="12" lg="12">
        <VCard class="text-center pt-0">
          <VRow class="px-2 py-2">
            <VCol cols="12" md="6" lg="6">
              <v-card-title class="text-center pt-4">Providers</v-card-title>
              <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular>
              <VTable class="text-no-wrap text-center pb-4">
                <thead class="text-center">
                  <tr>
                    <th scope="col" class="text-center">Provider</th>
                    <th scope="col" class="text-center">Mensajes Ayer</th>
                    <th scope="col" class="text-center">Promedio Mes</th>
                    <th scope="col" class="text-center">Mensajes Mes</th>                
                  </tr>
                </thead>
                <tbody class="text-center"> 
                  <tr v-for="(item, key) in getProviders" :key="key">
                    <td>{{ item.NombreProveedor }}</td>
                    <td>{{ item.Mensajes }}</td>
                    <td>{{ item.PromedioMes.toLocaleString("en-US") }}</td>
                    <td>{{ item.MensajesMes }}</td>
                  </tr>               
                </tbody>
              </VTable>               
            </VCol>

            <VCol cols="12" md="6" lg="6">
              <v-card-title class="text-center pt-4">Customers</v-card-title>
              <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular>
              <VTable class="text-no-wrap text-center pb-4">
                <thead class="text-center">
                  <tr>
                    <th scope="col" class="text-center">Customer</th>
                    <th scope="col" class="text-center">Mensajes Ayer</th>
                    <th scope="col" class="text-center">Promedio Mes</th>
                    <th scope="col" class="text-center">Mensajes Mes</th>                
                  </tr>
                </thead>
                <tbody class="text-center">   
                  <tr v-for="(item, key) in getCustomers" :key="key">
                    <td>{{ item.NombreCliente }}</td>
                    <td>{{ item.Mensajes }}</td>
                    <td>{{ item.PromedioMes.toLocaleString("en-US") }}</td>
                    <td>{{ item.MensajesMes }}</td>
                  </tr>              
                </tbody>                
              </VTable>               
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>

    <DialogBox :isVisable="isBox"></DialogBox>    
  </div>
</template>
<script>
import DashboardNotify from "@/@core/components/DashboardNotify.vue";
import DialogBox from "@layouts/components/DialogBox.vue";
import ChartJsBarChart from '@/views/charts/chartjs/ChartJsBarChart.vue'
import { config } from '@layouts/config';
import { createNamespacedHelpers } from 'vuex';
const { mapGetters, mapActions, mapState } = createNamespacedHelpers('dashboard');

export default{  
  components: {
    DialogBox,
    DashboardNotify,
    ChartJsBarChart, 
  },  
  data(){
    return {
      isBox: false,
      isDialogVisible: true,
      selectedStat: 'UnSubscribers',  
      serverUrl: window.configData.APP_BASE_URL,
      total_country_Mensajes: [],      
    }
  },
  computed: {
    ...mapGetters(['GetDashData', 'IsLoading']),

    getCountriesMonth: function(){
      return  this.GetDashData?.major?.iNumPaisesMes ?? 0;
    },
    getCountriesYest: function(){
      return  this.GetDashData?.major?.iNumPaisesHoy ?? 0;
    },

    getProvidersMonth: function(){
      return  this.GetDashData?.major?.iNumProveedoresMes ?? 0;
    },
    getProvidersYest: function(){
      return  this.GetDashData?.major?.iNumProveedoresHoy ?? 0;
    },

    getCustomersMonth: function(){
      return  this.GetDashData?.major?.iNumClientesMes ?? 0;
    },
    getCustomersYest: function(){
      return  this.GetDashData?.major?.iNumClientesHoy ?? 0;
    },

    getMessagesMonth: function(){
      return  this.GetDashData?.major?.iNumMensajesMes.toLocaleString('en-US') ?? 0;
    },
    getMessagesYest: function(){
      return  this.GetDashData?.major?.iNumMensajesHoy.toLocaleString('en-US') ?? 0;
    },

    getCountriMessages: function(){
      return this.GetDashData?.countries?.map( (item) => {
        const today = new Date();
        const yest = this.GetDashData?.yesterdayCountries;
        const averageMonth = Math.round( yest[item.Pais_Destino]?.Mensajes/today.getDate()*100 )/100
        return {
          "Pais_Destino": item.Pais_Destino,
          "Mensajes" : item.Mensajes,
          "code": item.code,
          "PromedioMes": averageMonth.toLocaleString('en-US'),
          "MensajesMes": yest[item.Pais_Destino]?.Mensajes.toLocaleString('en-US'),
        }
      });
    },

    getTotalCountriMessages: function(){
        this.GetDashData?.countries?.map( (item) => {
          const today = new Date();
          const yest = this.GetDashData?.yesterdayCountries;
          const averageMonth = Math.round( yest[item.Pais_Destino]?.Mensajes/today.getDate()*100 )/100;
        
          this.total_country_Mensajes[0] += item.Mensajes;
          this.total_country_Mensajes[1] += averageMonth.toLocaleString('en-US');
          this.total_country_Mensajes[2] += yest[item.Pais_Destino]?.Mensajes.toLocaleString('en-US');
      });

       return {
          
          "Mensajes" : this.total_country_Mensajes["Mensajes"],
          "PromedioMes": this.total_country_Mensajes["PromedioMes"],
          "MensajesMes": this.total_country_Mensajes["MensajesMes"],
        }
    },

    getChartLabels: function(){
      return Object.keys( this.GetDashData?.chartCountries || {} );
    },

    getDataSets: function(){      
      const colors = ['#f87979', '#3D5B96', '#1EFFFF', '#34DF8B', '#2A349F', '#BB2AFD'];
      const chartCountries = this.GetDashData?.chartCountries || {};

      const result = {};
      Object.keys( chartCountries ).forEach(date => {
        Object.keys(chartCountries[date]).forEach(country => {
          if(!result[country]){
            result[country]=[];
          }
          result[country].push( chartCountries[date][country] );
        });
      });      
      
      return this.GetDashData?.chartCountriesKeys?.map( (item, key) => {
        const label = Object.keys(item)[0];
        const country = Object.values(item)[0];
        return {
          label: label,
          backgroundColor: colors[key],
          borderColor: 'transparent',
          data: result[country]
        }
      });
    },

    getProviders: function(){     

      return this.GetDashData?.suppliers?.map( (item) => {
        const today = new Date();
        const yest = this.GetDashData?.yesterdaySuppliers;
        const msgMonth = yest[item.IDProveedor]?.Mensajes;

        return {
          "NombreProveedor": decodeURI(item.NombreProveedor).replaceAll('+', ' '),
          "Mensajes" : item.Mensajes.toLocaleString('en-US'),          
          "PromedioMes": Math.ceil( msgMonth/today.getDate()*100 )/100,
          "MensajesMes": msgMonth.toLocaleString('en-US'),
        }
      });
    },

    getCustomers: function(){     

      return this.GetDashData?.customers?.map( (item) => {
        const today = new Date();
        const yest = this.GetDashData?.yesterdayCustomers;
        const msgMonth = yest[item.IDCliente]?.Mensajes;

        return {
          "NombreCliente": decodeURI(item.NombreCliente).replaceAll('+', ' '),
          "Mensajes" : item.Mensajes.toLocaleString('en-US'),          
          "PromedioMes": Math.ceil( msgMonth/today.getDate()*100 )/100,
          "MensajesMes": msgMonth.toLocaleString('en-US'),
        }
      });
    },

    
  },
  mounted() {
    this.fetchDashData();
  },  
  methods: {
    ...mapActions(['fetchDashData', ]),    
  },
  watch: {    

  }
}
</script>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";
.chart {
  height: 400px;
}
.v-progress-circular {
  margin: 1rem;
}
</style>