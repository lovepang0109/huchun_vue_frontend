<template>
  <transition name="el-fade-in">
    <el-dialog
      :width="width"
      :title="modalElement.title"
      :visible.sync="isShow"
      :close-on-click-modal="false"
      @close="close"
    >
      <ces-edit
        ref="cesEdit"
        :that="that"
        :edit-items="modalElement.editItems"
        :edit-data="modalElement.editData"
        :edit-rules="modalElement.editRules"
      />
      <div slot="footer" class="dialog-footer">
        <el-button
          v-for="item in modalElement.handles"
          :key="item.label"
          :type="item.type"
          :icon="item.icon"
          :size="item.size"
          :disabled="item.disabled"
          @click="item.handle(that)"
        >{{ item.label }}</el-button>
      </div>
    </el-dialog>
  </transition>
</template>

<script>
import cesEdit from '@/@layouts/components/common/editForm'
export default {
  components: {
    cesEdit
  },
  props: {
    visible: { type: Boolean, default: true },
    width: { type: String, default: '50%' },
    title: { type: String, default: '' },
    that: { type: Object, default: this },
    modalElement: { type: Object, default: () => {} },
    editItems: { type: Array, default: () => [] },
    editData: { type: Object, default: () => {} },
    editRules: { type: Object, default: null },
    handles: { type: Array, default: () => [] },
    isHandle: { type: Boolean, default: true }
  },
  computed: {
    isShow: {
      get() {
        return this.modalElement.visible
      },
      set() {}
    }
  },
  methods: {
    close() {
      this.$refs.cesEdit.$refs.editForm.resetFields()
      this.$emit('close')
    },
    validate(valid) {
      var res = this.$refs.editForm.validate(valid)
      return res
    }
  }
}
</script>
