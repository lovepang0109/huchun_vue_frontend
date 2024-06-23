<template>
  <div class="ces-modal" style="min-width:330px;border: solid 1px #E6E6E6;border-top-left-radius: 5px;border-top-right-radius: 5px;">
    <!-- 标题头部 -->
    <section v-if="isHeader" style="padding:10px;background: rgb(210, 228, 255);border-bottom: solid 1px #E6E6E6;border-top-left-radius: 5px;border-top-right-radius: 5px;">
      <div class="ces-modal__header">
        <div>{{ container.title }}</div>
      </div>
    </section>
    <!-- body -->
    <section v-loading="modalLoading" class="ces-modal__body" style="padding:10px;">
      <slot />
    </section>
    <!-- 操作底部 -->
    <section v-if="isHandle" style="padding:10px;background: rgb(210, 228, 255);border-top: solid 1px #E6E6E6;">
      <div class="ces-modal__footer">
        <span>
          <el-input
            v-model="container.input.value"
            style="width:150px;float:left;margin-right:10px;"
            size="mini"
            placeholder="请输入内容"
          />
          <el-button
            :key="container.button.label"
            style="float:left;"
            :type="container.button.type"
            :icon="container.button.icon"
            :size="container.button.size"
            :disabled="container.button.disabled"
            @click="container.button.handle(that)"
          >{{ container.button.label }}</el-button>

          <!-- <el-button
            v-for="item in container.handles"
            :key="item.label"
            :type="item.type"
            :icon="item.icon"
            :size="item.size"
            :disabled="item.disabled"
            @click="item.handle(that)"
          >{{ item.label }}</el-button> -->
        </span>
      </div>
    </section>
  </div>
</template>

<script>

export default {
  props: {
    that: { type: Object, default: this },
    container: {
      type: Object,
      default: () => ({ title: '', input: { handle: null, value: '' }, button: {}})
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
  }
}
</script>
