<template>
  <vue-draggable-resizable
    ref="drag"
    class="widget-wrapper"
    :class="{ 
      active: isActive,
      'hover-effect': !isActive && hovered
    }"
    :w="dragInfo.w"
    :h="dragInfo.h"
    :x="dragInfo.x"
    :y="dragInfo.y"
    :parent="true"
    :resizable="isActive && resizable"
    :draggable="draggable"
    :active="isActive"
    :min-width="50"
    :min-height="30"
    :z="'auto'"
    :handles="isActive ? ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'] : []"
    @activated="onActivated"
    @deactivated="onDeactivated"
    @dragstart="onDragStart"
    @dragging="onDrag"
    @resizestart="onResizeStart"
    @resizing="onResize"
    @dragstop="onDragStop"
    @resizestop="onResizeStop"
    :prevent-deactivation="true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="handleClick"
    :style="combinedStyle"
  >
    <div class="widget-content" :style="{zIndex: 'inherit', position: 'relative'}">
      <slot></slot>
    </div>
  </vue-draggable-resizable>
</template>

<script>
export default {
  name: 'WidgetWrapper',
  props: {
    item: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    zStyle: {
      type: Object,
      default: () => ({ zIndex: 'auto' })
    }
  },
  data() {
    return {
      isActive: this.active,
      draggable: true,
      resizable: true,
      hovered: false
    };
  },
  computed: {
    dragInfo() {
      return this.item.dragInfo || { w: 200, h: 100, x: 0, y: 0 };
    },
    combinedStyle() {
      return {
        ...this.zStyle
      };
    }
  },
  watch: {
    active(val) {
      this.isActive = val;
      this.updateDragAndResizeState();
    },
    'item.dragInfo': {
      handler(val) {
        // 已处理在props中
      },
      deep: true
    },
    'item.zIndex'(newVal) {
      // 监听zIndex变化，直接更新DOM
      this.$nextTick(() => {
        if (this.$el) {
          this.$el.style.zIndex = newVal;
        }
      });
    }
  },
  mounted() {
    // 确保组件挂载时正确设置zIndex
    this.$nextTick(() => {
      if (this.$el && this.item.zIndex) {
        this.$el.style.zIndex = this.item.zIndex;
      }
    });
  },
  methods: {
    onActivated() {
      this.$emit('update:active', true);
      this.$emit('activated');
      this.updateDragAndResizeState();
    },
    onDeactivated() {
      this.$emit('update:active', false);
      this.$emit('deactivated');
      this.updateDragAndResizeState();
    },
    updateDragAndResizeState() {
      // 如果需要可以在这里添加更多逻辑控制
    },
    onDragStart(left, top) {
      this.$emit('update:dragInfo', { ...this.dragInfo, x: left, y: top }, true);
    },
    onDrag(left, top) {
      this.$emit('update:dragInfo', { ...this.dragInfo, x: left, y: top }, false);
    },
    onResizeStart(left, top, width, height) {
      this.$emit('update:dragInfo', { x: left, y: top, w: width, h: height }, true);
    },
    onResize(left, top, width, height) {
      this.$emit('update:dragInfo', { x: left, y: top, w: width, h: height }, false);
    },
    onDragStop(left, top) {
      this.$emit('update:dragInfo', { ...this.dragInfo, x: left, y: top }, true);
      this.$emit('dragstop');
    },
    onResizeStop(left, top, width, height) {
      this.$emit('update:dragInfo', { x: left, y: top, w: width, h: height }, true);
      this.$emit('resizestop');
    },
    updateDragInfo(info) {
      this.$emit('update:dragInfo', { ...this.dragInfo, ...info });
    },
    setDraggable(val) {
      this.draggable = val;
    },
    handleClick(event) {
      event.stopPropagation();
      this.$emit('click');
    }
  }
};
</script>

<style scoped>
.widget-wrapper {
  position: absolute !important;
  box-sizing: border-box;
  transition: outline 0.2s ease;
}

.widget-wrapper.active {
  outline: 2px solid #409EFF;
}

.widget-wrapper.hover-effect {
  outline: 1px dashed #909399;
  cursor: move;
}

/* 隐藏非激活状态下的调整大小控制点 */
.widget-wrapper:not(.active) /deep/ .handle {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* 确保vue-draggable-resizable的内部样式不会覆盖我们的z-index */
.widget-wrapper /deep/ .vdr {
  z-index: inherit !important;
}

/* 使用更高优先级的选择器确保z-index应用 */
div.widget-wrapper {
  z-index: inherit !important;
}

/* 内容层应该继承z-index */
.widget-content {
  width: 100%;
  height: 100%;
}
</style> 