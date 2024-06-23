<template>
  <div>
    <el-row>
      <el-col :span="11">
        <cascadeSelectList
          ref="unSelect"
          :that="this"
          :list-data="data"
          :source-data="sourceData"
          :list-height="listHeight"
          :list-title="sourceListTitle"
          :search-props="sourceSearchProps"
          :search-btton-props="sourceSearchBttonProps"
          :handle-btton-props="sourceHandleBttonProps"
          :list-props="listProps"
          :select-props="sourceSelectProps"
          :left-table-cols="sourceLeftTableCols"
          :right-table-cols="sourceRightTableCols"
          show-type="unselected"
        />
      </el-col>
      <el-col :span="2">
        <el-row type="flex" justify="center" align="middle" :style="'height:'+middleLineHeight">
          {{ middleLineText }}
        </el-row>
      </el-col>
      <el-col :span="11">
        <cascadeSelectList
          ref="selected"
          :that="this"
          :list-data="data"
          :source-data="sourceData"
          :list-height="listHeight"
          :list-title="targetListTitle"
          :search-props="targetSearchProps"
          :search-btton-props="targetSearchBttonProps"
          :handle-btton-props="targetHandleBttonProps"
          :list-props="listProps"
          :select-props="targetSelectProps"
          :left-table-cols="targetLeftTableCols"
          :right-table-cols="targetRightTableCols"
          show-type="selected"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>

import cascadeSelectList from '@/@layouts/components/common/cascadeSelectList'
import { isNullOrUndefined } from 'util'

export default {
  components: {
    cascadeSelectList
  },
  props: {
    // 控件相关属性
    that: { // 组件父组件对象
      type: Object, default: this
    },
    data: { // Transfer 的数据源
      type: Array, default: () => []
    },
    sourceData: { // 选择的数据源
      type: Array, default: () => []
    },
    selectedData: { // 已选择的数据
      type: Array, default: () => []
    },
    title: { // 标题
      type: String, default: () => null
    },
    listHeight: { // 多选列表的高度
      type: String, default: '300px'
    },
    middleLineHeight: { // 多选列表的高度
      type: String, default: '350px'
    },
    middleLineText: { // 多选列表的高度
      type: String, default: '——'
    },
    sourceListTitle: { // 源多选列表名称
      type: String, default: '未选择列表'
    },
    sourceSearchProps: { // 源搜索输入框占位字符配置
      type: Object, default: () => ({ leftPlaceholder: '一级名称', rightPlaceholder: '二级名称' })
    },
    sourceSearchBttonProps: { // 源搜索按钮配置
      type: Object, default: () => ({ type: 'primary', buttonText: '搜索' })
    },
    listProps: { // 源多选列表选择按钮配置
      type: Object, default: () => ({
        leftCheckAllText: '全选', // 源左列表选择列表头名称
        leftKey: 'id', // 源左列表选择列的唯一key
        leftLabel: 'name', // 源左列表选择列的名称
        left2RightSelections: 'selections', // 源左列表用于目标列表选择的数据源列
        rightKey: 'id', // 源右列表选择列的唯一key
        rightCheckAllText: '全选', // 源右列表选择列表头名称
        rightLabel: 'name', // 源右列表选择列的名称
        selectedValue: 'selected' // 源已选择的标识属性
      })
    },
    sourceSelectProps: { // 源列表用于选择的配置项
      type: Object, default: () => ({
        leftValue: 'checked', // 左侧列表选择列的值
        rightValue: 'checked' // 右侧列表选择列的值
      })
    },
    sourceLeftTableCols: { // 源左侧列表表格列配置
      type: Array, default: () => []
    },
    sourceRightTableCols: { // 源右侧列表表格列配置
      type: Array, default: () => []
    },
    sourceHandleBttonProps: { // 源多选列表选择按钮配置
      type: Object, default: () => ({ type: 'primary', icon: 'el-icon-plus', buttonText: '添加' })
    },
    targetListTitle: { // 目标多选列表名称
      type: String, default: '已选择列表'
    },
    targetSearchProps: { // 目标搜索输入框占位字符配置
      type: Object, default: () => ({ leftPlaceholder: '一级名称', rightPlaceholder: '二级名称', buttonText: '搜索' })
    },
    targetSearchBttonProps: { // 目标搜索按钮配置
      type: Object, default: () => ({ type: 'primary', buttonText: '搜索' })
    },
    targetSelectProps: { // 目标列表用于选择的配置项
      type: Object, default: () => ({
        leftValue: 'unchecked', // 左侧列表选择列的值
        rightValue: 'unchecked' // 右侧列表选择列的值
      })
    },
    targetLeftTableCols: { // 源左侧列表表格列配置
      type: Array, default: () => []
    },
    targetRightTableCols: { // 源右侧列表表格列配置
      type: Array, default: () => []
    },
    targetHandleBttonProps: { // 目标多选列表选择按钮配置
      type: Object, default: () => ({ type: 'danger', icon: 'el-icon-minus', buttonText: '删除' })
    }
  },
  data() {
    return {
      // listData: this.data
    }
  },
  computed: {
  },
  watch: {
    selectedData: function(val) {
      this.$nextTick(() => this.setSelected(this.data, val))
    }
  },
  mounted() {
    // this.updateData(this.data)
  },
  methods: {
    /*
    功能：更新控件数据源
    参数：
      val：数据源
    */
    updateData(val) {
      // Vue 不允许在已经创建的实例上动态添加新的根级响应式属性 (root-level reactive property)。
      // 然而它可以使用 Vue.set(object, key, value) 方法将响应属性添加到嵌套的对象上
      // 添加对象属性 this.$set(this.data,"obj",value)

      // this.listData = val
    },
    /*
    功能：设置已选择的数据
    参数：
      val：数据源
    */
    setSelected(source, selecteds) {
      if (isNullOrUndefined(this.listProps.selectedValue)) {
        this.$set(this.listProps, 'selectedValue', 'selected')
      }
      source.forEach(data => {
        data[this.listProps.left2RightSelections].forEach(s => {
          this.$set(s, this.listProps.selectedValue, selecteds.some(h => h[this.listProps.rightKey] === s[this.listProps.rightKey]))
        })
      })
    }
  }
}
</script>
