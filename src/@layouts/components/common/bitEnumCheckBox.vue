<!--位操作枚举选择-->
<template>
  <div>
    <el-checkbox v-if="checkAllVisible" v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
      {{ checkAllItem.label }}
    </el-checkbox>
    <el-checkbox-group v-model="checkedOptions" @change="handleCheckedChange">
      <el-checkbox v-for="opt in enumOptions" :key="opt.value" :label="opt.value">{{ opt.label }}</el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script>
// import { Message } from 'element-ui'

export default {
  props: {
    checkAllItem: { // 全选选项
      type: Object, default: () => ({ label: '全选' })
    },
    checkAllVisible: { // 是否显示全选选项
      type: Boolean, default: () => true
    },
    enumOptions: { // 枚举选择项
      type: Array, default: () => []
    },
    value: { // 绑定值的枚举值
      type: Number, default: () => 0
    }
  },
  data() {
    return {
      currentValue: this.value, // 绑定值当前的值

      checkAll: false, // 是否全选
      checkedOptions: [], // 选择的枚举项
      isIndeterminate: false // 不确定状态，用于实现全选的效果
    }
  },
  computed: {
    enmuOptionValues: { // 枚举选择项的值集合
      get() {
        const checkedValues = []
        if (this.enumOptions !== null) {
          this.enumOptions.forEach(element => {
            checkedValues.push(element.value)
          })
        }
        return checkedValues
      }
    }
  },
  watch: {
    currentValue: function(val) { // 绑定值当前值变化时处理函数
      this.$emit('input', val)
      this.$emit('on-change', val)
    },
    value: function(val) { // 绑定值变化时处理函数
      this.updateValue(val)
    }
  },
  mounted() {
    this.updateValue(this.value)
  },
  methods: {
    updateValue(val) { // 更新绑定值当前值方法
      this.currentValue = val
      const checkedOpts = []
      if (val !== 0) {
        this.enumOptions.forEach(opt => {
          if ((val & opt.value) === opt.value) { checkedOpts.push(opt.value) }
        })
      }
      this.checkedOptions = checkedOpts
      const checkedCount = checkedOpts.length
      this.checkAll = checkedCount === this.enumOptions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.enumOptions.length
      // console.log(val)
    },
    handleCheckAllChange(val) { // 全选处理方法
      this.checkedOptions = val ? this.enmuOptionValues : []
      this.isIndeterminate = false
      // console.log(this.checkedOptions)
      this.handleCheckedEnmuValue()
    },
    handleCheckedChange(value) { // 单个checkbox选择处理方法
      const checkedCount = value.length
      this.checkAll = checkedCount === this.enumOptions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.enumOptions.length
      this.handleCheckedEnmuValue()
    },
    handleCheckedEnmuValue() { // 处理checkbox选择后绑定枚举值的变化
      let enmuVal = 0
      if (this.checkedOptions !== null) {
        this.checkedOptions.forEach(element => {
          enmuVal = (enmuVal | element)
        })
      }
      this.currentValue = enmuVal
    }

  }
}
</script>
