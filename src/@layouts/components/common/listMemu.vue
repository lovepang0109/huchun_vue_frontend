<!--
 * @Description: 菜单列表组件，如需隐藏，请使用v-show
 * @version:
 * @Author: Hayden
 * @Date: 2020-03-31 16:05:23
 * @LastEditors: Hayden
 * @LastEditTime: 2020-04-03 15:37:29
 -->
<template>
  <div ref="menu" style="display: inline-block;">
    <span>
      <svg-icon :icon-class="currentIcon" class="iconSize" @click="showMemu($event)" @click.stop.native />
    </span>
    <div v-show="menuListVisible" ref="menuList" class="menuList" :style="{width:listWidth,height:listHeight}" @click="memuListClick">
      <slot />
    </div>
  </div>
</template>
<script>

export default {
  props: {
    listWidth: {
      type: String,
      default: '130px'
    },
    listHeight: {
      type: String,
      default: '83px'
    },
    memuIcon: { // 菜单图标
      type: String,
      default: 'more_gray'
    },
    memuClickIcon: { // 点击菜单后的图标
      type: String,
      default: 'more_bule'
    },
    visibleList: { // 是否显示菜单列表
      type: Boolean,
      default: false
    }

  },
  data() {
    return {
      menuListVisible: this.visibleList
    }
  },
  computed: {
    currentIcon: { // 当前菜单图标
      get() {
        return this.menuListVisible ? this.memuClickIcon : this.memuIcon
      }
    }
  },
  watch: {
    visibleList: function(val) {
      if (this.menuListVisible !== val) {
        this.menuListVisible = val
      }
    }
  },
  created() {
    // 点击其他不在的区域触发事件
    document.addEventListener('click', (e) => {
      // console.log(this.$el.contains(e.target))
      if (!this.$el.contains(e.target)) {
        this.menuListVisible = false
      }
    })
  },
  mounted() {
    this.menuListVisible = this.visibleList
  },
  methods: {
    showMemu(event) {
      const listVisible = !this.menuListVisible
      if (listVisible) { // 如果显示列表，计数列表出现的位置
        var rect = event.target.getBoundingClientRect()
        var scrollX = rect.left
        var scrollY = rect.top
        this.$refs.menuList.style.left = scrollX + 25 + 'px'
        this.$refs.menuList.style.top = scrollY + 'px'
      }
      this.menuListVisible = listVisible
      this.$emit('clickMemu', this.menuListVisible) // 点击菜单按钮事件
    },
    hideMemu() { // 隐藏菜单
      this.menuListVisible = false
    },
    memuListClick() { // 菜单列表点击事件
      this.menuListVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.iconSize{
font-size: 18px;
cursor:pointer;
}
/* 1.实心矩形 */
        .menuList {
            // line-height: 30px;
            margin: 0 auto;
            // text-align: center;
            background:rgba(51,51,51,0.8);
            // position: absolute;
            position: fixed;
            display: inline-block;
            z-index: 1000;
            border-radius: 4px;
            margin-left: 5px;
            cursor: pointer;
            span{
                color: white;
                display: block;
                padding-top: 17px;
                margin-left: 10px;
            }
            span:focus,// 鼠标经过及点击后样式
            span:hover{
                // color:#409EFF;
                color:#a0cfff;
            }
        }

        /* 2.添加伪元素，在这里添加三角形 */
        .menuList:before {
            /*伪元素必须添加content*/
            content: "";
            width: 0;
            height: 0;
            /*IE6下，height:0;不顶用，可使用font-size:0; + overflow:hidden;修复此问题*/
            font-size:0;
            overflow:hidden;
            display: block;
            border-width: 5px;
            border-color:  transparent  rgba(51,51,51,0.8) transparent  transparent;
            /*为了兼容IE6，所有设置为透明（transparent）的边，需要设置为dashed；有颜色的边设置为solid*/
            border-style: dashed solid dashed dashed;
            position: absolute; /*绝对定位不占位置*/
            top: 9px; /* 向下移动 矩形的高度 + 矩形的上下内边距 + 下边框粗细*/
            left: -10px;  /*相对于矩形宽度的位置*/
        }
</style>
