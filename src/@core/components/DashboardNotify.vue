<script setup>
// const props = defineProps(['statistics']);
const props = defineProps({
  stat: {
    type: String,
    required: true,
  },
  statistics: {
    type: Array,
    required: true
  }});
</script>

<template>
  <VCard :title="'Below Device Is ' + props.stat" min-height="300">
    <template #append>
      <!-- <span class="text-body-2">Updated 1 month ago</span> -->
    </template>
    <VCardText class="pt-6">
      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.machineName"
          cols="12"
          md="6"
        >
          <div class="d-flex">
            <VAvatar v-if="item.status==='Disconnected'"
              color="warning"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                size="24"
                icon="tabler-plug-connected-x"
              />
            </VAvatar>

            <VAvatar v-else-if="item.status==='Abnormal'"
              color="error"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                size="24"
                icon="tabler-circle-x"
              />
            </VAvatar>

            <VAvatar v-else-if="item.status==='Out Of Paper'"
              color="primary"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon
                size="24"
                icon="tabler-printer"
              />
            </VAvatar>

            <VAvatar v-else-if="item.status==='Normal'"
              color="success"
              variant="tonal"
              size="42"
              class="me-3"
            >
              <VIcon 
                size="24"
                icon="tabler-circle-check"
              />
            </VAvatar>

            <div class="d-flex flex-column">
              <span class="text-h6 font-weight-normal">{{ `( ${item.machineName} ) at ${item.libraryName} ${item.floor}/F` }}</span>
              <span class="font-weight-bold text-lg" :class="item.status=='Disconnected'? 'font-weight-bold text-lg text-warning':item.status=='Abnormal'?'font-weight-bold text-lg text-error':item.status=='Out Of Paper'?'font-weight-bold text-lg text-primary':item.status=='Normal'?'font-weight-bold text-lg text-success':'font-weight-bold text-lg text-error'">
                {{ item.status }}
              </span>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
