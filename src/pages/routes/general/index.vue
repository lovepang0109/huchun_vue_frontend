<template>
  <div>
    <VRow class="match-height">
      <VCol cols="12" md="12" lg="12">
        <VCard class="text-center py-4" >
            <VCol cols="12" md="12" lg="12">
              <VTabs v-model="userTab" class="v-tabs-pill">
                <VTab
                  v-for="tab in tabs"
                  :key="tab.icon"
                >
                  <VIcon
                    :size="18"
                    :icon="tab.icon"
                    class="me-1"
                  />
                  <span>{{ tab.title }}</span>
                </VTab>
              </VTabs>
    
              <VWindow
                v-model="userTab"
                class="mt-6 disable-tab-transition"
                :touch="false"
              >
                <VWindowItem>
                  <GeneralCountries />
                </VWindowItem>
    
                <VWindowItem>
                  <GeneralCustomers />
                </VWindowItem>
    
                <VWindowItem>
                  <GeneralMccmnc />
                </VWindowItem>
    
                <VWindowItem>
                  <GeneralCustomerMccmnc />
                </VWindowItem>
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import GeneralCountries from "./general-countries.vue";
import GeneralCustomers from "./general-customers.vue";
import GeneralMccmnc from "./general-mccmnc.vue";
import GeneralCustomerMccmnc from "./general-customer-mccmnc.vue";
  
export default {
  components: {
    GeneralCountries,
    GeneralCustomers,
    GeneralMccmnc,
    GeneralCustomerMccmnc
  },
  data() {      
    return {
      tabs: [
        { icon: 'tabler-flag', title: 'Countries' },
        { icon: 'tabler-users', title: 'Customers' },
        { icon: 'tabler-message', title: 'MccMnc' },          
        { icon: 'tabler-link', title: 'Customer - MccMnc' },
      ],        
      userTab: null,         
    }
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
  