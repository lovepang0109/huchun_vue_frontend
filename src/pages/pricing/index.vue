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
                  <PricingCountries />
                </VWindowItem>
    
                <VWindowItem>
                  <PricingProviders />
                </VWindowItem>
    
                <VWindowItem>
                  <PricingCustomers />
                </VWindowItem>   

                <VWindowItem>
                  <PricingDefaults />
                </VWindowItem>   
                
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import PricingCountries from "./pricing-countries.vue";
import PricingProviders from "./pricing-providers.vue";
import PricingCustomers from "./pricing-customers.vue";
import PricingDefaults from "./pricing-defaults.vue";
  
export default {
  components: {
    PricingCountries,
    PricingCustomers,
    PricingProviders,
    PricingDefaults,
  },
  data() {      
    return {
      tabs: [
        { icon: 'tabler-flag',    title: 'Countries' },
        { icon: 'tabler-car',     title: 'Providers' },
        { icon: 'tabler-users',   title: 'Customers' },
        { icon: 'tabler-cloud',   title: 'Defaults' },          
      ],        
      userTab: null,         
    }
  },    
}
</script>  

<style>
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