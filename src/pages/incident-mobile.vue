<template>
    <div>
    <VRow class="match-height">
        <VCol cols="12" md="12" lg="12">
            <VCard class="text-center pb-4" title="Incidents Mobile" >

                <v-divider class="pb-1"></v-divider>
                
                <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate></v-progress-circular> 

                <v-data-table v-if="!IsLoading" :headers="headers" :items="getReportData" :sort-by="[{ key: 'calories', order: 'asc' }]"
                    class="elevation-1 px-4 py-2" style="min-height: 450px; font-size: 10pt;">
                    <template v-slot:top>
                        <VRow class="align-center">                            
                            <VCol cols="12" md="4" sm="6">
                                <v-text-field 
                                    label="Mobile Phone Number"
                                    v-model="phoneNumberModel"
                                ></v-text-field>
                            </VCol>
                            <VCol cols="12" md="4" sm="6">
                                <v-text-field 
                                    label="MsgID"
                                    v-model="msgIdModel"
                                ></v-text-field>
                            </VCol>
                            <VCol cols="12" md="4" sm="6">
                                <v-text-field 
                                    label="Providers"
                                    v-model="cRutaMsgIDModel"
                                ></v-text-field>
                            </VCol>
                        </VRow>                       
                        
                        <VRow class="mb-4 pb-4">
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
                            <VCol cols="12" md="4" sm="6"></VCol>                 
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
                        <td>{{ item.Movil }}</td>
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
                        <td>{{ item.Texto_Remitente }}</td>
                        <td>{{ item.Fecha_Salida }}</td>
                        <td>{{ item.Fecha_EntregaOperadora }}</td>
                        <td>{{ item.Fecha_Notificacion }}</td>
                        <td>{{ item.Ruta_MsgID }}</td>
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
              { title: 'Mobile',                align: 'start', key: 'Movil', },
              { title: 'Destination Country',   align: 'start', key: 'Pais_Destino', },
              { title: 'Route',                 align: 'start', key: 'Ruta', },
              { title: 'Route Real',            align: 'start', key: 'Ruta_Real' },
              { title: 'MCC',                   align: 'start', key: 'MCC' },
              { title: 'MNC',                   align: 'start', key: 'MNC' },
              { title: 'HLR',                   align: 'start', key: 'HLR' },
              { title: 'Client Name',           align: 'start', key: 'NombreCliente' },
              { title: 'Sender Text',           align: 'start', key: 'Texto_Remitente' },
              { title: 'Departure Date',        align: 'start', key: 'Fecha_Salida' },            
              { title: 'OperatorDeliveryDate',  align: 'start', key: 'Fecha_EntregaOperadora' },            
              { title: 'Notification',          align: 'start', key: 'Fecha_Notificacion' },            
              { title: 'Ruta MsgID',            align: 'start', key: 'Ruta_MsgID' },            
          ],  
          phoneNumberModel: null,
          cRutaMsgIDModel: null,
          msgIdModel: null,
          serverUrl: window.configData.APP_BASE_URL,    
          presetRanges: dateRanges.dayRanges,
          pickerFormat: dateRanges.dayFormat,  
        }
      },
      computed: {
        ...mapGetters(['GetMobileIncident', 'IsLoading', 'GetReportMccMnc']),
        getReportData: function(){  
            if(this.GetMobileIncident?.data){
                return this.GetMobileIncident?.data?.filter( item => item.Pais_Destino).map( xx => {
                    let dd = xx;
                        dd['OutText'] = decodeURIComponent(xx?.OutText);
                    return dd;
                });
            }else{
                return [];
            }
        },         
        periodPicker: function(){             
            return this.filterPeriod == 'Month'
        }   
      },
      mounted() {     
        const endDate   = new Date();
        const startDate = new Date(new Date().setDate(endDate.getDate() - 30));
        this.picker     = [startDate, endDate];
  
        this.fetchMobileIncidentData({
          cFechaInicio:     startDate,
          cFechaFin:        endDate,
          cMovil:           "",
          cRutaMsgID:       "",
          cMsgID:           "",
          iPagina:          "",
        });
  
      },  
      methods: {
        ...mapActions(['fetchMobileIncidentData', 'fetchMccMncData']),      
        searchResult(){
          this.fetchMobileIncidentData({
            cFechaInicio:   this.picker[0],
            cFechaFin:      this.picker[1],
            cMovil:         this.phoneNumberModel,
            cMsgID:         this.msgIdModel,
            cRutaMsgID:     this.cRutaMsgIDModel,
          });
        },        
        Reset(){
          this.phoneNumberModel = null;
          this.cRutaMsgIDModel = null;
          this.customerModel = null;
          const endDate   = new Date();
          const startDate = new Date(new Date().setDate(endDate.getDate() - 30));
          this.picker     = [startDate, endDate];     
        },   
        handleDate(value) {
            if (!value[1]) value[1] = value[0];
        },     
      },      
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