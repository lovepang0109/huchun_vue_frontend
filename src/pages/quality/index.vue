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
                  <QualityMap />
                </VWindowItem>
                
                <VWindowItem>
                  <QualityCountries />
                </VWindowItem>
    
                <VWindowItem>
                  <QualityMccMnc />
                </VWindowItem>   
                
              </VWindow>
            </VCol>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
<script>
import QualityMap from "./quality-map.vue";
import QualityCountries from "./quality-countries.vue";
import QualityMccMnc from "./quality-mccmnc.vue";
  
export default {
  components: {
    QualityMap,
    QualityCountries,
    QualityMccMnc,    
  },
  data() {      
    return {
      tabs: [        
        { icon: 'tabler-world', title: 'Quality Map' },
        { icon: 'tabler-flag',  title: 'Quality Country' },
        { icon: 'tabler-car',   title: 'Quality MccMnc' },        
      ],        
      userTab: null,         
    }
  },    
}
</script>  