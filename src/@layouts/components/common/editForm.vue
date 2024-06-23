<template>
  <el-form ref="editForm" class="form" :size="size" inline :label-width="labelWidth" :model="editData" :rules="editRules" :width="width">
    <el-form-item v-for="item in editItems" :key="item.label" :label="item.label" :prop="item.prop" :style="item.style">
      <!-- 输入框 -->
      <el-input
        v-if="item.type==='input'"
        v-model="editData[item.prop]"
        :disabled="item.disabled"
        :style="{width:item.width}"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 密码输入框 -->
      <el-input
        v-if="item.type==='password'"
        :id="item.id"
        v-model="editData[item.prop]"
        :disabled="item.disabled"
        :style="{width:item.width}"
        type="password"
        show-password
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 数字 -->
      <el-input
        v-if="item.type==='number'"
        v-model.number="editData[item.prop]"
        type="number"
        :disabled="item.disabled"
        :style="{width:item.width}"
      />
      <!-- 文本域 -->
      <el-input
        v-if="item.type==='textarea'"
        v-model="editData[item.prop]"
        type="textarea"
        :rows="item.rowCount"
        :disabled="item.disabled"
        :style="{width:item.width}"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 下拉框 -->
      <el-select
        v-if="item.type==='select'"
        v-model="editData[item.prop]"
        :disabled="item.disabled"
        :style="{width:item.width}"
        :placeholder="placeholder"
        :filterable="item.filterable"
        @change="handleSelectChange(that,item)"
      >
        <el-option v-for="op in item.options" :key="op.value" :label="op.label" :value="op.value" />
      </el-select>
      <!-- 单选 -->
      <el-radio-group
        v-if="item.type==='radio'"
        v-model="editData[item.prop]"
        :style="{width:item.width}"
        :disabled="item.disabled && item.disabled(editData)"
        @change="item.change && item.change(editData[item.prop])"
      >
        <el-radio v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio>
      </el-radio-group>
      <!-- 单选按钮 -->
      <el-radio-group
        v-if="item.type==='radioButton'"
        v-model="editData[item.prop]"
        :disabled="item.disabled && item.disabled(editData)"
        @change="item.change && item.change(editData[item.prop])"
      >
        <el-radio-button v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio-button>
      </el-radio-group>
      <!-- 复选框 -->
      <el-checkbox-group
        v-if="item.type==='checkbox'"
        v-model="editData[item.prop]"
        :disabled="item.disabled && item.disabled(editData)"
        @change="item.handle && item.handle(editData[item.prop])"
      >
        <el-checkbox v-for="ch in item.checkboxs" :key="ch.value" :label="ch.value">{{ ch.label }}</el-checkbox>
      </el-checkbox-group>
      <!-- 日期 -->
      <el-date-picker
        v-if="item.type==='date'"
        v-model="editData[item.prop]"
        type="date"
        placement="editData[item.prop]"
        value-format="yyyy-MM-dd"
        :style="{width:item.width}"
        :disabled="item.disabled && item.disabled(editData)"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 时间 -->
      <el-time-select
        v-if="item.type==='time'"
        v-model="editData[item.prop]"
        type=""
        :style="{width:item.width}"
        :disabled="item.disabled && item.disabled(editData)"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 日期时间 -->
      <el-date-picker
        v-if="item.type==='dateTime'"
        v-model="editData[item.prop]"
        type="datetime"
        :style="{width:item.width}"
        value-format="yyyy-MM-dd HH:mm:ss"
        :disabled="item.disable && item.disable(editData[item.prop])"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 日期时间(不带秒) -->
      <el-date-picker
        v-if="item.type==='dateTimeWithowntSecond'"
        v-model="editData[item.prop]"
        type="datetime"
        :style="{width:item.width}"
        value-format="yyyy-MM-dd HH:mm"
        :disabled="item.disable && item.disable(editData[item.prop])"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 滑块 -->
      <!-- <el-slider v-if="item.type==='Slider'" v-model="editData[item.prop]"></el-slider> -->
      <!-- 开关 -->
      <el-switch
        v-if="item.type==='switch'"
        v-model="editData[item.prop]"
        :disabled="item.disabled && item.disabled(editData)"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 树下拉框 -->
      <treeselect
        v-if="item.type==='treeselectDisabled'"
        v-model="editData[item.prop]"
        :load-options="loadOptions"
        :multiple="treeselectMultiple"
        disabled
        :default-expanded-keys="item.defaultExpandedKeys"
        :options="item.options"
        :style="{width:item.width}"
        :placeholder="placeholder"
        @change="item.change && item.change(editData[item.prop])"
      />
      <!-- 树下拉框 -->
      <treeselect
        v-if="item.type==='treeselect'"
        v-model="editData[item.prop]"
        :load-options="loadOptions"
        :multiple="treeselectMultiple"
        :default-expanded-keys="item.defaultExpandedKeys"
        :options="item.options"
        :style="{width:item.width}"
        :placeholder="placeholder"
        @change="item.change && item.change(editData[item.prop])"
      />
      <el-alert
        v-if="item.type==='alert'"
        :title="editData[item.prop]"
        type="warning"
        effect="dark"
        :style="{width:item.width}"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
export default {
  components: { Treeselect },
  props: {
    labelWidth: {
      type: String,
      default: '120px'
    },
    width: {
      type: String,
      default: '120px'
    },
    size: {
      type: String,
      default: 'mini'
    },
    editItems: {
      type: Array,
      default: () => []
    },
    editData: {
      type: Object,
      default: () => {}
    },
    editRules: {
      type: Object,
      default: null
    },
    treeselectMultiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      // default: '请选择'
      default: 'Please select'
    },
    that: { type: Object, default: this } // 组件父组件对象
  },
  data() {
    return {
      // that: this
    }
  },
  methods: {
    // getThat(){
    //     this.$emit('that',this)
    // }
    async loadOptions({ action, callback }) {
      this.options = []
      callback(null, [])
    },
    handleSelectChange(that, selectObj) { // 按钮点击事件处理方法
      selectObj.change(that)
    }
  }

}

</script>
<style lang='scss' scoped>
 .el-icon-close {
  display: none;
}
.el-alert {
  font-size: large;
  font-weight: bold;
  margin-top: 10px;
}
</style>
