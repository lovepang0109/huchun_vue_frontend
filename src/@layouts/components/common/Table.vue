<!--表格组件 -->
<template>
  <section class="ces-table-page">

    <!-- 数据表格 -->
    <section class="ces-table">
      <el-table
        ref="cesTable"
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        :size="size"
        max-height="500"
        :border="isBorder"
        :default-selections="defaultSelections"
        @select="select"
        @select-all="selectAll"
        @row-click="rowClick"
      >
        <el-table-column v-if="isSelection" type="selection" align="center" />
        <el-table-column v-if="isIndex" type="index" :label="indexLabel" align="center" width="50" />
        <!-- 数据栏 -->
        <el-table-column
          v-for="item in tableCols"
          :key="item.id"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align"
          :render-header="item.require?renderHeader:null"
        >
          <template slot-scope="scope">
            <!-- html -->
            <span v-if="item.type==='html'" v-html="item.html(scope.row)" />
            <!-- 按钮 -->
            <span v-if="item.type==='button'">
              <el-button
                v-for="btn in item.btnList"
                v-show="!btn.show || btn.show(scope.row)"
                :key="btn.label"
                :disabled="btn.disabled && btn.disabled(scope.row)"
                :type="btn.type"
                :size="size || btn.size"
                :icon="btn.icon"
                @click="btn.handle(that,scope.row)"
              >{{ btn.label }}</el-button>
            </span>
            <!-- 输入框 -->
            <el-input
              v-if="item.type==='input'"
              v-model="scope.row[item.prop]"
              :size="size || btn.size"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @focus="item.focus && item.focus(scope.row)"
            />
            <!-- 下拉框 -->
            <el-select
              v-if="item.type==='select'"
              v-model="scope.row[item.prop]"
              :size="size || btn.size"
              :props="item.props"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(that,scope.row)"
            >
              <el-option v-for="op in item.options" :key="op.value" :label="op.label" :value="op.value" />
            </el-select>
            <!-- 单选 -->
            <el-radio-group
              v-if="item.type==='radio'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              :size="size || btn.size"
              @change="item.change && item.change(that,scope.row)"
            >
              <el-radio v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio>
            </el-radio-group>
            <!-- 复选框 -->
            <el-checkbox-group
              v-if="item.type==='checkbox'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              :size="size || btn.size"
              @change="item.change && item.change(that,scope.row)"
            >
              <el-checkbox v-for="ra in item.checkboxs" :key="ra.value" :label="ra.value">{{ ra.label }}</el-checkbox>
            </el-checkbox-group>
            <!-- 评价 -->
            <el-rate
              v-if="item.type==='rate'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              :size="size || btn.size"
              @change="item.change && item.change(scope.row)"
            />
            <!-- 开关 -->
            <el-switch
              v-if="item.type==='switch'"
              v-model="scope.row[item.prop]"
              :size="size || btn.size"
              :active-value="item.values&&item.values[0]"
              :inactive-value="item.values&&item.values[1]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              @change="item.change && item.change(scope.row)"
            />
            <!-- 图像 -->
            <img v-if="item.type==='image'" :src="scope.row[item.prop]" @click="item.handle && item.handle(scope.row)">
            <!-- 滑块 -->
            <el-slider
              v-if="item.type==='slider'"
              v-model="scope.row[item.prop]"
              :disabled="item.isDisabled && item.isDisabled(scope.row)"
              :size="size || btn.size"
              @change="item.change && item.change(scope.row)"
            />
            <!-- 默认 -->
            <span
              v-if="!item.type || item.formatter"
              :style="item.itemStyle && item.itemStyle(scope.row)"
              :size="size || btn.size"
              :class="item.itemClass && item.item.itemClass(scope.row)"
            >{{ (item.formatter && item.formatter(scope.row)) || scope.row[item.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
    <!-- 表格操作按钮 -->
    <section v-if="isHandle" class="ces-handle">
      <el-button
        v-for="item in tableHandles"
        :key="item.label"
        :size="size || item.size"
        :type="item.type"
        :icon="item.icon"
        :disabled="disabled"
        @click="item.handle(that, operationType)"
      >{{ item.label }}</el-button>
    </section>
    <!-- 分页 -->
    <section v-if="isPagination" class="ces-pagination">
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
  </section>
</template>

<script>

export default {
  props: {
    that: { type: Object, default: this },
    operationType: { type: String, default: '1' },
    // 表格型号：mini,medium,small
    size: { type: String, default: 'medium' },
    isBorder: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    // 表格操作
    isHandle: { type: Boolean, default: false },
    tableHandles: { type: Array, default: () => [] },
    // 表格数据
    tableData: { type: Array, default: () => [] },
    // 表格列配置
    tableCols: { type: Array, default: () => [] },
    // 是否显示表格复选框
    isSelection: { type: Boolean, default: false },
    defaultSelections: { type: [Array, Object], default: () => null },
    // 是否显示表格索引
    isIndex: { type: Boolean, default: false },
    indexLabel: { type: String, default: '序号' },
    // 是否显示分页
    isPagination: { type: Boolean, default: true },
    // 分页数据
    tablePage: { type: Object, default: () => ({ pageSize: 20, sizes: [10, 20, 30, 40, 50, 100], pageNum: 1, total: 0 }) },
    disabled: { type: Boolean, default: false }

  },
  data() {
    return {
    }
  },
  watch: {
    'defaultSelections'(val) {
      this.$nextTick(function() {
        if (Array.isArray(val)) {
          val.forEach(row => {
            this.$refs.cesTable.toggleRowSelection(row)
          })
        } else {
          this.$refs.cesTable.toggleRowSelection(val)
        }
      })
    }
  },
  methods: {
    // 表格勾选
    select(rows, row) {
      this.$emit('select', rows, row)
    },
    // 全选
    selectAll(rows) {
      this.$emit('select', rows)
    },
    rowClick(row) {
      this.$emit('rowClick', row)
    },
    //
    handleCurrentChange(val) {
      this.tablePage.pageNum = val
      this.$emit('refresh')
    },
    handleSizeChange(val) {
      this.tablePage.pageSize = val
      this.$emit('refresh')
    },
    // tableRowClassName({rowIndex}) {
    //     if (rowIndex % 2 === 0) {
    //         return "stripe-row";
    //     }
    //     return "";
    // }
    renderHeader(h, obj) {
      return h('span', { class: 'ces-table-require' }, obj.column.label)
    }
  }
}
</script>
<style lang='scss' scoped>
.ces-table-require::before{
  content:'*';
  color:red;
}
.el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #d9eba3;
}
.ces-table{height: auto;}
.el-table__body tr.current-row>td{
  background-color: #abc9ee;
}
.ces-handle{
  background: rgb(216, 217, 218);
  margin-top: 5px;
  padding-left: 10px;
}
</style>
