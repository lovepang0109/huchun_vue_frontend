<!--
    /**
     * 树形下拉选择组件，下拉框展示树形结构，提供选择某节点功能，方便其他模块调用
     * 调用示例：
     * <tree-select :height="400" // 下拉框中树形高度
     *              :width="200" // 下拉框中树形宽度
     *              size="small"  // 输入框的尺寸: medium/small/mini
     *              :data="data" // 树结构的数据
     *              :defaultProps="defaultProps" // 树结构的props
     *              multiple   // 多选
     *              clearable   // 可清空选择
     *              collapseTags   // 多选时将选中值按文字的形式展示
     *              checkStrictly // 多选时，严格遵循父子不互相关联
     *              :nodeKey="nodeKey"   // 绑定nodeKey，默认绑定'id'
     *              :checkedKeys="defaultCheckedKeys"  // 传递默认选中的节点key组成的数组
     *              @popoverHide="popoverHide"> // 事件有两个参数：第一个是所有选中的节点ID，第二个是所有选中的节点数据
     *              </tree-select>
     */
-->
<template>
  <div style="max-height:600px;overflow:auto;">
    <el-tree
      ref="tree"
      class="common-tree"
      style="width:100%;"
      :accordion="accordion"
      :data="treedata"
      :props="defaultProps"
      :show-checkbox="multiple"
      :node-key="nodeKey"
      :check-strictly="checkStrictly"
      default-expand-all
      :expand-on-click-node="false"
      :check-on-click-node="checkOnClickNode"
      :highlight-current="true"
      @node-click="handleNodeClick"
      @check-change="handleCheckChange"
    >
      <span slot-scope="{ node,data}" :class="data.className">
        <span :title="node.label">
          <img v-show="data.isAlarm" :src="derviceIcon(data)">
          <svg-icon v-show="!data.isAlarm" :icon-class="derviceIcon(data)" class="iconSize" />
          <!-- <svg-icon :icon-class="derviceIcon(data)" class="iconSize" /> -->
        </span>
        <span>{{ node.label }}</span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import { isEmpty, showDerviceIcon } from '@/utils/index.js'
import enums from '@/utils/enums'
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
    treedata: {
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
    checkOnClickNode: {
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
      selectedData: [], // 选中的节点
      checkedIds: [],
      checkedData: []
    }
  },
  computed: {
    derviceIcon() {
      return function(data) {
        var iconName = data.iconName
        if (!isEmpty(this.$store.state.dervice.derviceState)) {
          // 动态切换设备状态
          var dervice = JSON.parse(this.$store.state.dervice.derviceState)
          if (data.id === dervice.Id) {
            // 设备状态
            var state = dervice.State
            // 设备类型
            var derviceType = dervice.DeviceType
            iconName = showDerviceIcon(state, derviceType)
            if (iconName === 'alarm') {
              data.isAlarm = true
            } else {
              data.isAlarm = false
            }
          }
        }
        // 设备报警时显示GIF图,其他状态显示svg
        if (!data.isAlarm) {
          data.iconName = iconName
          return iconName
        } else {
          if (data.deviceType === enums.deviceTypeEnum.Controller.value) {
            return require('@/assets/images/network_controller_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.LocalController.value) {
            return require('@/assets/images/control_pillar_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.FireInput.value) {
            return require('@/assets/images/tree_firein_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.AuxiliaryInput.value) {
            return require('@/assets/images/tree_in_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.AuxiliaryOutput.value) {
            return require('@/assets/images/tree_out_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.Door.value) {
            return require('@/assets/images/door_close_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.Reader.value) {
            return require('@/assets/images/card_reader_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.FaceDevice.value) {
            return require('@/assets/images/face_machine_small.gif')
          }
          if (data.deviceType === enums.deviceTypeEnum.FingerprintDevice.value) {
            return require('@/assets/images/finger_prints_small.gif')
          }
        }
        this.$emit('stateChange', data)
      }
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
    this.initCheckedData()
  },
  methods: {
    // 单选时点击tree节点，设置select选项
    setSelectOption(node) {
      const tmpMap = {}
      tmpMap.value = node.key
      tmpMap.label = node.label
      this.options = []
      this.options.push(tmpMap)
      this.selectedData = []
      this.selectedData.push(node.key)
      // this.selectedData = node.key
    },
    // 单选，选中传进来的节点
    checkSelectedNode(checkedKeys) {
      var item = checkedKeys[0]
      this.$refs.tree.setCurrentKey(item)
      var node = this.$refs.tree.getNode(item)
      this.setSelectOption(node)
    },
    // 多选，勾选上传进来的节点
    checkSelectedNodes(checkedKeys) {
      this.$refs.tree.setCheckedKeys(checkedKeys)
    },
    // 单选，清空选中
    clearSelectedNode() {
      this.selectedData = ''
      this.$refs.tree.setCurrentKey(null)
    },
    // 多选，清空所有勾选
    clearSelectedNodes() {
      var checkedKeys = this.$refs.tree.getCheckedKeys() // 所有被选中的节点的 key 所组成的数组数据
      for (let i = 0; i < checkedKeys.length; i++) {
        this.$refs.tree.setChecked(checkedKeys[i], false)
      }
    },
    initCheckedData() {
      if (this.multiple) {
        // 多选
        if (this.checkedKeys.length > 0) {
          this.checkSelectedNodes(this.checkedKeys)
        } else {
          this.clearSelectedNodes()
        }
      } else {
        // 单选
        if (this.checkedKeys.length > 0) {
          this.checkSelectedNode(this.checkedKeys)
        } else {
          this.clearSelectedNode()
        }
      }
    },
    // 单选，节点被点击时的回调,返回被点击的节点数据
    handleNodeClick(data, node) {
      this.$emit('nodeClick', data)
      // if (!data.IsLeaf) {
      //   if (!this.multiple) {
      //     // this.setSelectOption(node)
      //     // this.$emit('change', this.selectedData)
      //     this.$emit('nodeClick', this.data)
      //   }
      // }
    },
    // 多选，节点勾选状态发生变化时的回调
    handleCheckChange() {
      var checkedKeys = this.$refs.tree.getCheckedKeys() // 所有被选中的节点的 key 所组成的数组数据
      this.options = checkedKeys.map((item) => {
        var node = this.$refs.tree.getNode(item) // 所有被选中的节点对应的node
        const tmpMap = {}
        tmpMap.value = node.key
        tmpMap.label = node.label
        return tmpMap
      })
      this.selectedData = this.options.map((item) => {
        return item.value
      })
      this.$emit('change', this.selectedData)
    },
    // 多选,删除任一select选项的回调
    removeSelectedNodes(val) {
      this.$refs.tree.setChecked(val, false)
      var node = this.$refs.tree.getNode(val)
      if (!this.checkStrictly && node.childNodes.length > 0) {
        this.treeToList(node).map(item => {
          if (item.childNodes.length <= 0) {
            this.$refs.tree.setChecked(item, false)
          }
        })
        this.handleCheckChange()
      }
      this.$emit('change', this.selectedData)
    },
    treeToList(tree) { // 返回节点所有子节点，如果没有子节点，返回自身
      var queen = []
      var out = []
      queen = queen.concat(tree)
      while (queen.length) {
        var first = queen.shift()
        if (first.childNodes) {
          queen = queen.concat(first.childNodes)
        }
        out.push(first)
      }
      return out
    },
    // 单选,清空select输入框的回调
    removeSelectedNode() {
      this.clearSelectedNode()
      this.$emit('change', this.selectedData)
    },
    // 选中的select选项改变的回调
    changeSelectedNodes(selectedData) {
      // 多选,清空select输入框时，清除树勾选
      if (this.multiple && selectedData.length <= 0) {
        this.clearSelectedNodes()
      }
      this.$emit('change', this.selectedData)
    },
    /*
          <svg class='icon' aria-hidden='true'>
            <use href={data.iconName} />
          </svg>
     */
    // renderContent(h, { node, data, store }) { // 自下定义渲染节点内容，当后端对节点的className修改为SelectedNode时，将显现背景色
    //   return (
    //     <span class={data.className} id='treeNode' style='display:inline;'>
    //       <svg-icon icon-class={this.derviceIcon(data)} />
    //       <span style='margin-left:5px;'>{node.label }</span>
    //       <span style='margin-left:80px;' class={data.displaySpanClassName}>
    //         <el-button class={data.displayButtonClassName1} size='middle' type='text' on-click={ () => this.Isolate(data)}>隔离</el-button>
    //         <el-button class={data.displayButtonClassName2} size='middle' type='text' on-click={ () => this.Relieve(data) }>解除隔离</el-button>
    //       </span>
    //     </span>
    //   )
    // },
    Isolate(data) {
      this.$emit('Isolate', data)
    },
    Relieve(data) {
      this.$emit('Relieve', data)
    }
  }
}
</script>
<style>
/*对.SelectedNode只能使用全局样式，因为使用scoped时，html内容形如.SelectedNode[]，导致背景色不出现*/
/* .SelectedNode{
  background-color:coral;
} */
/* .DisplaySpan{
  display:inline-block;
}
.HiddenSpan{
  display:none;
}
.DisplayButton1{
  display:inline-block;
}
.HiddenButton1{
  display: none;
}
.DisplayButton2{
  display:inline-block;
}
.HiddenButton2{
  display: none;
}
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
} */
.iconSize{
font-size: 20px;
}
</style>
