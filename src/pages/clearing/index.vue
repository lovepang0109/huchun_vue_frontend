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
                  <ClearingMccMnc />
                </VWindowItem>
                
                <VWindowItem>
                  <ClearingDate />
                </VWindowItem>
    
                <VWindowItem>
                  <ClearingProviderMccMnc />
                </VWindowItem>   
                
                <VWindowItem>
                  <ClearingProviderDate />
                </VWindowItem>                   
                
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import ClearingMccMnc from "./clearing-mccmnc.vue";
import ClearingDate from "./clearing-date.vue";
import ClearingProviderMccMnc from "./clearing-provider-mccmnc.vue";
import ClearingProviderDate from "./clearing-provider-date.vue";
  
export default {
  components: {
    ClearingMccMnc,
    ClearingDate,
    ClearingProviderMccMnc,
    ClearingProviderDate,    
  },
  data() {      
    return {
      tabs: [        
        { icon: 'tabler-users',       title: 'Clearing MccMnc' },
        { icon: 'tabler-user',        title: 'Clearing Date' },
        { icon: 'tabler-car',         title: 'Clearing Provider MccMnc' },
        { icon: 'tabler-car',         title: 'Clearing Provider Date' },        
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