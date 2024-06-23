<!-- 搜索表单 -->
<template>
  <div class="ces-search" style="width:100%;height:50px;">
    <el-form id="searchForm" :size="size" inline :label-width="labelWidth">
      <el-form-item v-for="item in searchForm" :key="item.prop" :label="item.label">
        <!-- 输入框 -->
        <el-input v-if="item.type==='Input'" v-model="searchData[item.prop]" size="mini" :placeholder="item.placeholder" :prefix-icon="item.prefixicon" :class="item.class" />
        <!-- 下拉框 -->
        <!-- <el-select v-if="item.type==='Select'" v-model="searchData[item.prop]" clearable placeholder="请选择" size="mini" @change="item.change(searchData[item.prop])">
          <el-option v-for="op in item.options" :key="op.value" :label="op.label" :value="op.value" />
        </el-select> -->
        <el-select v-if="item.type==='Select'" v-model="searchData[item.prop]" clearable placeholder="请选择" size="mini">
          <el-option v-for="op in item.options" :key="op.value" :label="op.label" :value="op.value" />
        </el-select>
        <!-- 单选 -->
        <el-radio-group v-if="item.type==='Radio'" v-model="searchData[item.prop]">
          <el-radio v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio>
        </el-radio-group>
        <!-- 单选按钮 -->
        <el-radio-group v-if="item.type==='RadioButton'" v-model="searchData[item.prop]" @change="item.change && item.change(searchData[item.prop])">
          <el-radio-button v-for="ra in item.radios" :key="ra.value" :label="ra.value">{{ ra.label }}</el-radio-button>
        </el-radio-group>
        <!-- 复选框 -->
        <el-checkbox-group v-if="item.type==='Checkbox'" v-model="searchData[item.prop]">
          <el-checkbox v-for="ch in item.checkboxs" :key="ch.value" :label="ch.value">{{ ch.label }}</el-checkbox>
        </el-checkbox-group>
        <!-- 日期 -->
        <el-date-picker v-if="item.type==='Date'" v-model="searchData[item.prop]" />
        <!-- 时间 -->
        <el-time-select v-if="item.type==='Time'" v-model="searchData[item.prop]" type="" />
        <!-- 日期时间 -->
        <el-date-picker v-if="item.type==='DateTime'" v-model="searchData[item.prop]" type="datetime" :disabled="item.disable && item.disable(searchData[item.prop])" />
        <!-- 滑块 -->
        <!-- <el-slider v-if="item.type==='Slider'" v-model="searchData[item.prop]"></el-slider> -->
        <!-- 开关 -->
        <el-switch v-if="item.type==='Switch'" v-model="searchData[item.prop]" />
      </el-form-item>
      <el-form-item v-for="item in searchHandle" :key="item.label">
        <el-button v-if="isHandle" :type="item.type" :icon="item.icon" :size="item.size || size" @click="item.handle(that)">{{ item.label }}</el-button>
      </el-form-item>
    </el-form>
    <el-form v-if="isHandle" id="buttonForm" :size="size" inline />
  </div>
</template>

<script>
export default {
  props: {
    that: { type: Object, default: this },
    isHandle: {
      type: Boolean,
      default: true
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    size: {
      type: String,
      default: 'mini'
    },
    searchForm: {
      type: Array,
      default: () => []
      // default: []
    },
    searchHandle: {
      type: Array,
      default: () => []
    },
    searchData: {
      type: Object,
      default: () => {}
      // default: {}
    }
  },
  data() {
    return {
    }
  }

}

</script>
<style>
  .ces-search{
    background: rgb(216, 217, 218);
    padding-top: 10px;

    border:1px solid;
    border-color: darkgrey;
    border-top-left-radius: 5px;
   border-top-right-radius: 5px;
   margin-bottom: 1px;
  }
  #searchForm{
    width: 100%;
    float: left;
    margin: auto;
  }
  #buttonForm{
    float: left;
    width: 25%;
  }
</style>
