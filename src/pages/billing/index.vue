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
                  <BillingDefaults />
                </VWindowItem>
                
                <VWindowItem>
                  <BillingCustomerDate />
                </VWindowItem>
    
                <VWindowItem>
                  <BillingCustomerMccMnc />
                </VWindowItem>   
                
                <VWindowItem>
                  <BillingProviderDate />
                </VWindowItem>   

                <VWindowItem>
                  <BillingProviderMccMnc />
                </VWindowItem>   
                
                <VWindowItem>
                  <BillingDetail />
                </VWindowItem>   
                
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import BillingDefaults from "./billing-defaults.vue";
import BillingCustomerDate from "./billing-customer-date.vue";
import BillingCustomerMccMnc from "./billing-customer-mccmnc.vue";
import BillingProviderDate from "./billing-provider-date.vue";
import BillingProviderMccMnc from "./billing-provider-mccmnc.vue";
import BillingDetail from "./billing-details.vue";
  
export default {
  components: {
    BillingDefaults,
    BillingCustomerDate,
    BillingCustomerMccMnc,
    BillingProviderDate,
    BillingProviderMccMnc,
    BillingDetail 
  },
  data() {      
    return {
      tabs: [
        { icon: 'tabler-report-money',title: 'Billing' },          
        { icon: 'tabler-users',       title: 'Customer - Date' },
        { icon: 'tabler-user',        title: 'Customer - MccMnc' },
        { icon: 'tabler-car',         title: 'Provider - Date' },
        { icon: 'tabler-car',         title: 'Provider - MccMnc' },
        { icon: 'tabler-pencil',      title: 'Detail' },
      ],        
      userTab: null,         
    }
  },    
}
</script>  