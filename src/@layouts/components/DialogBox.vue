<script>
export default{
  name: 'DialogBox',
  props: ['isVisable', 'text'],
  data(){
    return{
      isDialogVisible: this.isVisable
    }
  },
}
</script>
<template>
  <VDialog
    v-model="isDialogVisible"
    width="500"
  >
    <!-- Dialog Content -->
    <VCard title="Privacy Policy">
      <VCardText>
        {{ text }}
      </VCardText>

      <VCardText class="d-flex justify-end">
        <VBtn @click="isDialogVisible = false">
          Okay
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>