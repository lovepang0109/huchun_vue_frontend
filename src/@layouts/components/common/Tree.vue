<template>
  <div style="max-height:1000px;min-height:200px;overflow:auto;">
    <!-- <el-tree
      ref="tree"
      class="common-tree"
      style="width:100%;"
      :accordion="accordion"
      :data="data"
      :props="defaultProps"
      :show-checkbox="multiple"
      :node-key="nodeKey"
      :check-strictly="checkStrictly"
      :default-expand-all="isDefaultExpandAll"
      :default-expanded-keys="defaultExpandedKeys"
      :expand-on-click-node="false"
      :check-on-click-node="multiple"
      :highlight-current="true"
      :render-content="renderContent"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
      @check-change="handleCheckChange"
    /> -->
    <h1>Hello Tree.vue</h1>
  </div>
</template>

<script>
export default {
  name: 'Tree',
  props: {
    accordion: {
      type: Boolean,
      default() {
        return true
      }
    },
    // 树结构数据
    data: {
      type: Array,
      default() {
        return []
      }
    },
    defaultProps: {
      type: Object,
      default() {
        return {}
      }
    },
    // 配置是否可多选
    multiple: {
      type: Boolean,
      default() {
        return false
      }
    },
    // 是否默认展开所有的节点
    isDefaultExpandAll: {
      type: Boolean,
      default() {
        return false
      }
    },
    nodeKey: {
      type: String,
      default() {
        return 'id'
      }
    },
    // 显示复选框情况下，是否严格遵循父子不互相关联
    checkStrictly: {
      type: Boolean,
      default() {
        return false
      }
    },
    // 默认选中的节点key数组
    checkedKeys: {
      type: Array,
      default() {
        return []
      }
    },
    // 默认展开的节点key数组
    defaultExpandedKeys: {
      type: Array,
      default() {
        return []
      }
    },
    // 过滤结果是否包含子节点
    filterIncludeChildren: {
      type: Boolean,
      default() {
        return false
      }
    }
    // width: {
    //   type: Number,
    //   default() {
    //     return 280
    //   }
    // }
  },
  data() {
    return {
      selectedData: [], // 选中的节点(key)
      checkedIds: [],
      checkedData: []
    }
  },
  watch: {
    checkedKeys(val) {
      if (!val) return
      this.checkedKeys = val
      this.initCheckedData()
    }
  },
  mounted() {
  },
  methods: {
    
  }
}
</script>