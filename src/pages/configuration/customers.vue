<template>  
  <VCol cols="12" md="12" lg="12">      

      <VCard class="text-center my-4">
          <v-divider></v-divider>
          <v-progress-circular v-if="IsLoading" :size="50" color="primary" indeterminate style="min-height: 400px;"></v-progress-circular>
          <div v-else class="px-4 py-4" style="min-height: 400px;">
          <VCol cols="12" md="4" sm="6" class="text-left">
              <v-btn @click="newDialog = true" color="info" dark class="btn border" size="small" prepend-icon="tabler-plus">
                  Add New Customer
              </v-btn>
          </VCol>          
          <v-data-table   class="elevation-1 px-4"
                          :headers="headers" 
                          :items="connectionData" 
                          style="min-height: 450px; font-size: 10pt;"
                          :sort-by="[{ key: 'calories', order: 'asc' }]" >                
              <template v-slot:item="{ item, index }">
                <tr class="text-left cursor-pointer" @click="clickEdit(item)">              
                  <td>{{ item.BULK_MASTERPROVIDER }}</td>    
                  <td>{{ item.MASTERPROVIDER }}</td>
                  <td>{{ item.ID_CLIENTE }}</td>                  
                  <td>{{ item.EMPRESA }}</td>                  
                  <td>{{ item.FIRMANTE }}</td>                  
                  <td>{{ item.IVA }}</td>                  
                  <td>{{ item.CIF }}</td>                  
                  <td>{{ item.PAIS }}</td>                  
                  <td>{{ item.DIRECCION }}</td>                  
                  <td>{{ item.EMAIL_ADMIN }}</td>                  
                  <td>{{ item.EMAIL_COMERCIAL }}</td>                  
                  <td>{{ item.EMAIL_TECNICO }}</td>                  
                  <td>{{ item.EMAIL_ROUTING }}</td>                  
                </tr>
              </template>
          </v-data-table>
          </div>
      </VCard>

      <!-- Update Window -->            
      <VDialog v-model="dialog" :width="$vuetify.display.smAndDown ? 'auto' : 700">
          <VCard class="pa-1">
          <VCardItem class="text-center">
              <VCardTitle class="text-h5">
              Edit Customer Data
              </VCardTitle>                  
          </VCardItem>

          <VCardText>
              <VForm class="mt-6" @submit.prevent="onCustomerUpdate">
              <VRow class="border mb-4">
                  <VCol cols="12" md="6">
                    <VTextField label="ID Customer" v-model="ctIdCustomer" readonly/>
                  </VCol>

                  <VCol cols="12" md="6">                    
                    <VSelect                        
                        label="ID Master"
                        :items="getMasterList"  
                        v-model="ctIdMaster"                        
                    />
                  </VCol>                  

                  <VCol cols="12" md="6">                    
                    <VTextField label="Company" v-model="ctCompany" />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Signatory" v-model="ctSignatory"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="CIF/VAT Number" v-model="ctCif"/>
                  </VCol>

                  <VCol cols="12" md="6">                    
                    <VTextField label="TAX(%)" type="number" step="0.01" min="0.00" v-model="ctTax">
                    </VTextField>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Address" v-model="ctAddress"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Country" v-model="ctCountry"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Admin" v-model="ctEmailAdmin"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Comercial" v-model="ctEmailComercial"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Routing" v-model="ctEmailRoute"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Technical" v-model="ctEmailTech"/>
                  </VCol>
              </VRow>
              
              <VCol cols="12" class="d-flex flex-wrap justify-center">                    
                  <v-progress-circular v-if="IsLoading" :size="45" color="primary" indeterminate></v-progress-circular>
                  <div v-else class="d-flex flex-wrap justify-center gap-4">
                      <VBtn type="submit" >Update</VBtn>                     
                      <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                  </div>
              </VCol>
              </VForm>
          </VCardText>
          </VCard>
      </VDialog>
      <!-- Add New Customer Window -->            
      <VDialog v-model="newDialog" :width="$vuetify.display.smAndDown ? 'auto' : 700">
          <VCard class="pa-1">
          <VCardItem class="text-center">
              <VCardTitle class="text-h5">
              Add New Customer
              </VCardTitle>                  
          </VCardItem>

          <VCardText>
              <VForm class="mt-6" @submit.prevent="onCustomerAddNew">
                <VRow class="border mb-4">
                  <VCol cols="12" md="6">
                    <VSelect label="ID Customer"
                            :items="getCustomerList"
                             v-model="nCtIdCustomer"/>
                  </VCol>

                  <VCol cols="12" md="6">                    
                    <VSelect                        
                        label="ID Master"
                        :items="getMasterList"  
                        v-model="nCtIdMaster"                        
                    />
                  </VCol>                  

                  <VCol cols="12" md="6">                    
                    <VTextField label="Company" v-model="nCtCompany" />
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Signatory" v-model="nCtSignatory"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="CIF/VAT Number" v-model="nCtCif"/>
                  </VCol>

                  <VCol cols="12" md="6">                    
                    <VTextField label="TAX(%)" type="number" step="0.01" min="0.00" v-model="nCtTax">
                    </VTextField>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Address" v-model="nCtAddress"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Country" v-model="nCtCountry"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Admin" v-model="nCtEmailAdmin"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Comercial" v-model="nCtEmailComercial"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Routing" v-model="nCtEmailRoute"/>
                  </VCol>

                  <VCol cols="12" md="6">
                    <VTextField label="Email: Technical" v-model="nCtEmailTech"/>
                  </VCol>
              </VRow>

              <VCol cols="12" class="d-flex flex-wrap justify-center">                    
                  <v-progress-circular v-if="IsLoading" :size="45" color="primary" indeterminate></v-progress-circular>
                  <div v-else class="d-flex flex-wrap justify-center gap-4 mt-4 pt-4">
                      <VBtn type="submit" >Create</VBtn>                        
                      <VBtn color="secondary" variant="tonal" @click="onFormReset">Cancel</VBtn>
                  </div>
              </VCol>
              </VForm>
          </VCardText>
          </VCard>
      </VDialog>
  </VCol>    
</template>
<script>
import { createNamespacedHelpers } from 'vuex';
import { notify } from '@/utils';
import { getAuthName, getUserPhone, getUserEmail } from '@/utils/auth';
import UserInfoEditDialog from '@/@core/components/UserInfoEditDialog.vue';

const passPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,20}|(?=.*[a-zA-Z])(?=.*\d).{10,20}$/;

const { mapGetters, mapActions, mapState } = createNamespacedHelpers('configuration');
export default {  
components: {  
  UserInfoEditDialog  
},
data() {    
  return {
    authName: getAuthName(),
    authEmail: getUserEmail(),
    authMobile: getUserPhone(),        
    serverUrl: window.configData.APP_BASE_URL,
    headers: [
        { title: 'ID Master',        align: 'start', key: 'BULK_MASTERPROVIDER', },
        { title: 'Master',           align: 'start', key: 'MASTERPROVIDER', },
        { title: 'ID Customer',      align: 'start', key: 'ID_CLIENTE', },
        { title: 'Company',          align: 'start', key: 'EMPRESA', },
        { title: 'Signatory',        align: 'start', key: 'FIRMANTE' },
        { title: 'TAX(%)',           align: 'start', key: 'IVA', },          
        { title: 'CIF/VAT Number',   align: 'start', key: 'CIF', },          
        { title: 'Country',          align: 'start', key: 'PAIS', },
        { title: 'Address',          align: 'start', key: 'DIRECCION', },          
        { title: 'Email:Admin',      align: 'start', key: 'EMAIL_ADMIN', },          
        { title: 'Email:Comercial',  align: 'start', key: 'EMAIL_COMERCIAL', },          
        { title: 'Email:Technical',  align: 'start', key: 'EMAIL_TECNICO', },          
        { title: 'Email:Routing',    align: 'start', key: 'EMAIL_ROUTING', },          
    ],     
    connectionData: [], 
    //      
    errors: {},
    dialog: false,
    newDialog: false,

    //customer Update      
    ctIdMaster: null,
    ctMaster: null,
    ctIdCustomer: null,
    ctCompany: null,
    ctSignatory: null,
    ctTax: 0,
    ctCif: null,
    ctCountry: null,
    ctAddress: null,
    ctEmailAdmin: null,
    ctEmailComercial: null,
    ctEmailTech: null,
    ctEmailRoute: null,

    //customer Update      
    ctIdMaster: null,
    ctMaster: null,
    ctIdCustomer: null,
    ctCompany: null,
    ctSignatory: null,
    ctTax: 0,
    ctCif: null,
    ctCountry: null,
    ctAddress: null,
    ctEmailAdmin: null,
    ctEmailComercial: null,
    ctEmailTech: null,
    ctEmailRoute: null,

    //customer Add New      
    nCtIdMaster: null,
    nCtMaster: null,
    nCtIdCustomer: null,
    nCtCompany: null,
    nCtSignatory: null,
    nCtTax: 0,
    nCtCif: null,
    nCtCountry: null,
    nCtAddress: null,
    nCtEmailAdmin: null,
    nCtEmailComercial: null,
    nCtEmailTech: null,
    nCtEmailRoute: null,
  }
},
computed: {
  ...mapGetters(['GetConfigurationCustomersData', 'IsLoading', 'GetError']),   
  getMasterList(){
    return this.GetConfigurationCustomersData?.masterList?.map( item => `${item.NOMBRE} [${item.ID_MASTER}]`);
  },   
  getCustomerList(){
    return this.GetConfigurationCustomersData?.customerList?.map( item => `${item.EMPRESA} [${item.ID_CLIENTE}]`);
  },   
},
mounted() {
  this.fetchConfigurationCustomersData({      
  }).then(() => {
      this.connectionData = this.GetConfigurationCustomersData?.data;        
  });     
},
methods: {
  ...mapActions([ 'fetchConfigurationCustomersData', 'fetchConfigurationCustomerUpdateData', 'fetchConfigurationCustomerAddNewData']),
  getNumList(array){
      return Array.isArray(array) ? array.map(str => parseInt(str.match(/\d+/)[0])).join(',') : array;
  },   
  onFormReset(){
      this.dialog     = false;        
      this.newDialog  = false;        
  },  
  onCustomerUpdate(){      
      this.fetchConfigurationCustomerUpdateData({
        iIDCliente:       this.ctIdCustomer,        
        iIDMasterCliente: this.ctIdMaster.match(/\[(\d+)\]/) ? 
                          parseInt( this.ctIdMaster.match(/\[(\d+)\]/)[1] ) : 
                          this.ctIdMaster,

        cEmpresa:         this.ctCompany,
        cFirmante:        this.ctSignatory,
        cCif:             this.ctCif,        
        cIva:             this.ctTax,
        cDireccion:       this.ctAddress,
        cPais:            this.ctCountry,
        cEmail_Admin:     this.ctEmailAdmin,
        cEmail_Comercial: this.ctEmailComercial,
        cEmail_Routing:   this.ctEmailRoute,
        cEmail_Tecnico:   this.ctEmailTech,
      });
  },
  onCustomerAddNew(){      
      this.fetchConfigurationCustomerAddNewData({                    
        iIDCliente:       this.nCtIdCustomer.match(/\[(\d+)\]/) ? 
                          parseInt( this.nCtIdCustomer.match(/\[(\d+)\]/)[1] ) : 
                          this.nCtIdCustomer, 

        iIDMasterCliente: this.nCtIdMaster.match(/\[(\d+)\]/) ? 
                          parseInt( this.nCtIdMaster.match(/\[(\d+)\]/)[1] ) : 
                          this.nCtIdMaster,

        cEmpresa:         this.nCtCompany,
        cFirmante:        this.nCtSignatory,
        cCif:             this.nCtCif,        
        cIva:             this.nCtTax,
        cDireccion:       this.nCtAddress,
        cPais:            this.nCtCountry,
        cEmail_Admin:     this.nCtEmailAdmin,
        cEmail_Comercial: this.nCtEmailComercial,
        cEmail_Routing:   this.nCtEmailRoute,
        cEmail_Tecnico:   this.nCtEmailTech,          
      });
  },
  clickEdit(data){
    this.dialog=true; 

    //    
    this.ctIdMaster = this.getMasterList.find( x => parseInt(x.match(/\[(\d+)\]/)[1]) == data.BULK_MASTERPROVIDER );     
    this.ctMaster = data.MASTERPROVIDER, 
    this.ctIdCustomer = data.ID_CLIENTE, 
    this.ctCompany = data.EMPRESA, 
    this.ctSignatory = data.FIRMANTE, 
    this.ctTax = data.IVA, 
    this.ctCif = data.CIF, 
    this.ctCountry = data.PAIS,                      
    this.ctAddress = data.DIRECCION, 
    this.ctEmailAdmin = data.EMAIL_ADMIN, 
    this.ctEmailComercial = data.EMAIL_COMERCIAL, 
    this.ctEmailTech = data.EMAIL_TECNICO, 
    this.ctEmailRoute = data.EMAIL_ROUTING;
    //
  }
},
watch: {     
  GetError(value){
      if(value != null){
          notify(value, 'error');        
      }
  },    
}
}
</script>