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
                  <BackupCountries />
                </VWindowItem>
    
                <VWindowItem>
                  <BackupCustomers />
                </VWindowItem>
    
                <VWindowItem>
                  <BackupMccmnc />
                </VWindowItem>
    
                <VWindowItem>
                  <BackupRoutes />
                </VWindowItem>
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import BackupCountries from "./backup-countries.vue";
import BackupCustomers from "./backup-customers.vue";
import BackupMccmnc from "./backup-mccmnc.vue";
import BackupRoutes from "./backup-routes.vue";
  
export default {
  components: {
    BackupCountries,
    BackupCustomers,
    BackupMccmnc,
    BackupRoutes
  },
  data() {      
    return {
      tabs: [
        { icon: 'tabler-flag', title: 'Countries' },
        { icon: 'tabler-users', title: 'Customers' },
        { icon: 'tabler-message', title: 'MccMnc' },          
        { icon: 'tabler-link', title: 'Routes' },
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