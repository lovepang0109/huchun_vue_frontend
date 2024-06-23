<!--
 * @Description: 折叠面板
 * @version:
 * @Author: Hayden
 * @Date: 2020-06-18 11:38:42
 * @LastEditors: Hayden
 * @LastEditTime: 2020-06-24 10:56:39
-->
<template>
  <div>
    <span>
      <svg-icon :icon-class="currentIcon" class="iconSize" @click="showFolded($event)" @click.stop.native />
      <span :style="titleStyle">{{ title }}</span>
    </span>
    <div v-show="!isFolding" ref="collapseDiv" class="collapseDiv">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: { // 折叠面板的标题
      type: String,
      default: ''
    },
    titleStyle: { // 折叠面板的标题的样式
      type: String,
      default: 'font-size: 16px;font-family: Microsoft YaHei, Microsoft YaHei-Bold;font-weight: 700;text-align: left;color: #666666;'
    },
    foldingIcon: { // 折叠时的图标
      type: String,
      default: 'collapse_folding'
    },
    expandedClickIcon: { // 展开时的图片
      type: String,
      default: 'collapse_expanded'
    },
    folding: { // 是否默认折叠
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isFolding: this.folding
    }
  },
  computed: {
    currentIcon: { // 当前显示图标
      get() {
        return this.isFolding ? this.foldingIcon : this.expandedClickIcon
      }
    },
    collapseDivHeight: { // 折叠div的高度值，数字
      get() {
        return this.$refs.collapseDiv.offsetHeight
      }
    }
  },
  watch: {
    folding: function(val) {
      if (this.isFolding !== val) {
        this.isFolding = val
      }
    }
  },
  created() {
  },
  mounted() {
    this.isFolding = this.folding
  },
  methods: {
    showFolded(event) {
      this.isFolding = !this.isFolding
      this.$emit('foldChange', this.isFolding)
    }
  }
}
</script>

<style lang="scss" scoped>
.iconSize{
font-size: 20px;
cursor:pointer;
}

.collapseDiv{
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
