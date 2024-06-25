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
                  <BlacklistCountries />
                </VWindowItem>
    
                <VWindowItem>
                  <BlacklistCustomers />
                </VWindowItem>    
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import BlacklistCountries from "./blacklist-countries.vue";
import BlacklistCustomers from "./blacklist-customers.vue";
  
export default {
  components: {
    BlacklistCountries,
    BlacklistCustomers,
  },
  data() {      
    return {
      tabs: [
        { icon: 'tabler-flag',    title: 'Country Sender' },
        { icon: 'tabler-users',   title: 'Customer Sender' },
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