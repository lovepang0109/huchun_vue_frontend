<!--表格组件 -->
<template>
  <!-- 分页 -->
  <section class="ces-pagination">
    <el-pagination
      style="display: flex;justify-content: center;height: 100%;align-items: center;"
      layout="total,sizes ,prev, pager, next,jumper"
      :page-size="tablePage.pageSize"
      :page-sizes="tablePage.sizes"
      :current-page="tablePage.pageNum"
      :total="tablePage.total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </section>
</template>
<script>
export default {
  props: {
    // 分页数据
    tablePage: { type: Object, default: () => ({ pageSize: 20, sizes: [10, 20, 30, 40, 50, 100], pageNum: 1, total: 0 }) }
  },
  data() {
    return {
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.tablePage.pageNum = val
      this.$emit('refresh')
    },
    handleSizeChange(val) {
      this.tablePage.pageSize = val
      this.$emit('refresh')
    }
  }
}
</script>
