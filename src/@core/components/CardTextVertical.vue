<script setup>

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
  icon: {
    type: String,
    required: true,
  },
  stats: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  secondStats: {
    type: String,
    required: false,
  },  
})
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-column text-center pb-4">
      <VAvatar
        v-if="props.icon"
        size="62"
        variant="tonal"
        :color="props.color"
        :icon="props.icon"
        class="ma-auto mb-4"
      />

      <span class="text-xl font-weight-bold">{{ props.title }}</span>
      <h6 class="text-h4 mt-4 mb-1">
        {{ props.stats }}        
      </h6>
      <h6 class="text-h4 mb-1">
        {{ props.secondStats || '' }}
      </h6>
    </VCardText>    
  </VCard>
</template>
