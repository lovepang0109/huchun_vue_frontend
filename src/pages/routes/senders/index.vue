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
                  <SenderCountries />
                </VWindowItem>
    
                <VWindowItem>
                  <SenderCustomers />
                </VWindowItem>
    
                <VWindowItem>
                  <SenderOperators />
                </VWindowItem>   
                
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import SenderCountries from "./sender-countries.vue";
import SenderCustomers from "./sender-customers.vue";
import SenderOperators from "./sender-operators.vue";
  
export default {
  components: {
    SenderCountries,
    SenderCustomers,
    SenderOperators,
  },
  data() {      
    return {
      tabs: [
        { icon: 'tabler-flag',    title: 'Country Sender' },
        { icon: 'tabler-users',   title: 'Customer Sender' },
        { icon: 'tabler-lock-access', title: 'Restriced Operators' },          
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
  