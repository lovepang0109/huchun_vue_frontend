<!--
 * @Description:
 * @version:
 * @Author: Hayden
 * @Date: 2019-09-23 09:22:45
 * @LastEditors: hayden
 * @LastEditTime: 2019-12-25 10:28:38
 -->
<template>
  <transition name="el-fade-in">
    <!-- z-index的值不能太大，否则下拉框的内容被遮住 -->
    <div v-if="modalElement.visible" style="width:100%;height:100%;position:fixed;top:0px;left:0px;z-index:8;">
      <!-- 遮罩 -->
      <div class="ces-mask" />
      <div class="ces-modal-wrap">
        <div class="ces-modal" :style="{width:width}">
          <!-- 标题头部 -->
          <section v-if="isHeader" style="padding:10px;border-bottom: solid 1px #f1f1f1;height:48px;background:rgba(229,241,255,1);opacity:1;border-radius:4px 4px 0px 0px;">
            <div class="ces-modal__header">
              <div style="padding:15px 0px 0px 0px;">{{ modalElement.title }}</div>
              <i class="el-icon-close ces-modal-close" @click="modalElement.close(that)" />
            </div>
          </section>
          <!-- body -->
          <section v-loading="modalLoading" class="ces-modal__body" style="padding:10px;min-height: 204px;">
            <slot />
          </section>
          <!-- 操作底部 -->
          <section v-if="isHandle" style="padding:10px;border-top: solid 1px #f1f1f1;min-height:48px;background:rgba(229,241,255,1);opacity:1;border-radius:0px 0px 4px 4px;">
            <div class="ces-modal__footer">
              <span>
                <el-button
                  v-for="item in modalElement.handles"
                  :key="item.label"
                  :type="item.type"
                  :icon="item.icon"
                  :size="item.size"
                  :style="item.style"
                  :disabled="item.disabled"
                  @click="item.handle(that)"
                >{{ item.label }}</el-button>
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

export default {
  props: {
    that: { type: Object, default: this },
    modalElement: {
      type: Object,
      // visible: false,
      // title: '',
      // handles: []
      default: () => ({ visible: false, title: '', handles: [] })
    },
    width: {
      type: String,
      default: '60%'
    },
    isHeader: {
      type: Boolean,
      default: true
    },
    modalLoading: {
      type: Boolean,
      default: false
    },
    isHandle: {
      type: Boolean,
      default: true
    }

  },
  computed: {

  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style>
  .el-alert__title
  {
     font-size: 15px !important;
  }
</style>
