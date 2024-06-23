<template>
  <div :style="{width:width}">
    <el-row>
      <span>{{ title }}</span>
      <!-- <el-button type="primary" icon="el-icon-refresh" size="mini" @click="handleRefresh" /> -->
      <el-tooltip v-if="showRefresh" class="item" effect="dark" content="刷新" placement="right">
        <i class="el-icon-refresh" style="cursor:pointer" @click="handleRefresh" />
      </el-tooltip>
    </el-row>
    <el-row>
      <el-input v-model="filterText" :placeholder="filterPlaceholder" prefix-icon="el-icon-search" @change="filterTextChange" />
    </el-row>
    <el-row>
      <div
        class="scroll-bar"
        :style="{maxHeight:treeMaxHeight}"
      >
        <el-tree
          ref="tree"
          v-loading="loading"
          class="filter-tree"
          :data="treeDate"
          :props="defaultProps"
          :node-key="defaultProps.key"
          :default-expand-all="defaultExpandAll"
          :accordion="accordion"
          :default-expanded-keys="[selectedKey]"
          :filter-node-method="filterNode"
          :expand-on-click-node="expandOnClickNode"
          :style="treeSytle"
          @node-click="handleNodeClick"
        >
          <span slot-scope="{ node, data }" class="span-ellipsis">
            <span v-if="showSelecte(data)" style="margin-left:0px;">
              <el-button size="middle" type="text" @click="setSelected(data)"><b>{{ selecteBtnText }}</b></el-button>
            </span>
            <span v-if="isSelected(data)" style="color:blue;"><b>({{ selectedText }})</b></span>
            <span :title="node.label">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </el-row>
  </div>
</template>
<script>
import { isNullOrUndefined } from 'util'
// import { log } from 'util'
export default {
  props: {
    width: { type: String, default: () => '300px' },
    treeMaxHeight: { type: String, default: () => '500px' },
    treeSytle: { type: String, default: () => '' },
    title: { type: String, default: () => '单选树状图' },
    showRefresh: { type: Boolean, default: () => false },
    filterPlaceholder: { type: String, default: () => '请输入关键字' },
    loading: { type: Boolean, default: false }, // 树是否显示加载数据动画
    nodeClickSelect: { type: Boolean, default: true }, // 树是否单击选择数据
    defaultExpandAll: { type: Boolean, default: false }, // 树是否默认展开所有
    accordion: { type: Boolean, default: true }, // 树是否手风琴模式，对于同一级的节点，每次只能展开一个
    expandOnClickNode: { type: Boolean, default: true }, // 树是否在点击节点的时候展开或者收缩节点， 默认值为 true
    treeDate: { type: Array, default: () => [] }, // 树数据
    selecteProp: { type: Object, default: () => null }, // 可进行选择的配置，默认为空，为空时所有节点都可选择,格式：{name:'name',value:'123'}
    selectedKey: { type: String, default: () => null }, // 已选择节点的Key
    selectedText: { type: String, default: () => '已选择' }, // 已选择节点的显示文本
    selecteBtnText: { type: String, default: () => '选择' }, // 选择按钮的显示文本
    defaultProps: { type: Object, default: () => null }, // 树节点配置,如{key:'id',label:'name',children:'son'}
    filterIncludeChildren: { type: Boolean, default: () => true }// 过滤结果是否包含子节点
  },
  data() {
    return {
      filterText: '', // 过滤数据文本
      currentNode: null // 当前选择树节点
    }
  },
  methods: {
    // 过滤关键字
    filterTextChange(val) {
      this.$refs.tree.filter(val)
    },
    // 节点过滤函数
    filterNode(value, data, node) {
      // 如果什么都没填就直接返回
      if (!value) return true
      // 如果传入的value和data中的label相同说明是匹配到了
      if (data[this.defaultProps.label].indexOf(value) !== -1) {
        return true
      }
      if (this.filterIncludeChildren) {
      // 否则要去判断它是不是选中节点的子节点
        return this.checkBelongToChooseNode(value, data, node)
      }
    },
    // 判断传入的节点是不是选中节点的子节点
    checkBelongToChooseNode(value, data, node) {
      const level = node.level
      // 如果传入的节点本身就是一级节点就不用校验了
      if (level === 1) {
        return false
      }
      // 先取当前节点的父节点
      let parentData = node.parent
      // 遍历当前节点的父节点
      let index = 0
      while (index < level - 1) {
        // 如果匹配到直接返回
        if (parentData.data[this.defaultProps.label].indexOf(value) !== -1) {
          return true
        }
        // 否则的话再往上一层做匹配
        parentData = parentData.parent
        index++
      }
      // 没匹配到返回false
      return false
    },
    handleRefresh() {
      this.$emit('refresh')
    },
    handleNodeClick(data) {
      this.currentNode = data
      this.$emit('nodeClick', data)
    },
    /*
    功能：节点是否已选择
    参数：
      data：选择数据
    */
    isSelected(data) {
      return this.nodeClickSelect &&
      !isNullOrUndefined(this.selectedKey) &&
      this.selectedKey === data[this.defaultProps.key]
    },
    /*
    功能：节点能否显示选择按钮
    参数：
      data：选择数据
    */
    showSelecte(data) {
      return (isNullOrUndefined(this.selecteProp) || data[this.selecteProp.name] === this.selecteProp.value) &&
      this.nodeClickSelect &&
      (isNullOrUndefined(this.selectedKey) || this.selectedKey !== data[this.defaultProps.key]) &&
      this.currentNode !== null &&
      data[this.defaultProps.key] === this.currentNode[this.defaultProps.key]
    },
    /*
    功能：设置为选择节点
    参数：
      data：选择数据
    */
    setSelected(data) {
      if (this.nodeClickSelect) {
        this.handleNodeClickSelect(data)
      }
    },
    /*
    功能：处理树节点选择
    参数：
      data：选择数据
    */
    handleNodeClickSelect(data) {
      this.$emit('nodeClickSelect', data)
      // const node = this.$refs.tree.getNode(data)
      // const parentKeys = this.getParentNodeKey(node)
      // this.$emit('nodeClickSelect', data, parentKeys)
    },
    /*
    功能：获取树节点的父节点Key
    参数：
      node：树节点
    */
    getParentNodeKey(node) {
      let keys = []
      if (node.parent != null) {
        keys = this.getParentNodeKey(node.parent)
        keys.push(node.parent.key)
      }
      return keys
    }

  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 20px;
  }
  .span-ellipsis {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
  .el-tree {
    width: 100%;
    overflow:auto;
  }

  .el-tree>.el-tree-node {
    display: inline-block;
    min-width: 100%;
  }
</style>

