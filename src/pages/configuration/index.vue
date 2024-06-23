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
                    <Account />
                  </VWindowItem>
                  
                  <VWindowItem>
                    <Customers />
                  </VWindowItem>
      
                </VWindow>
              </VCol>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </template>
  <script>
  import Account from "./account.vue";
  import Customers from "./customers.vue";  
    
  export default {
    components: {
      Account,
      Customers,      
    },
    data() {      
      return {
        tabs: [        
          { icon: 'tabler-settings', title: 'My Account' },
          { icon: 'tabler-users',  title: 'Customers' },
        ],        
        userTab: null,         
      }
    },    
  }
  </script>  