<template>
  <widget-wrapper
    ref="wrapper"
    :item="item"
    @update:dragInfo="updateDragInfo"
    @activated="isActive = true"
    @deactivated="isActive = false"
  >
    <div class="text-widget">
      <!-- 如果有图片背景则显示 -->
      <img 
        v-show="imgSrc" 
        :src="imgSrc" 
        style="width: 100%; height: 100%; position: absolute;">
      
      <div style="width: 100%; height: 100%; position: absolute;">
        <!-- 编辑模式 -->
        <div 
          v-if="isEditing" 
          class="text-container editing" 
          :style="textStyle" 
          v-clickoutside="saveText">
          <div 
            ref="textContainer" 
            style="width: 100%; white-space: pre-wrap;" 
            contenteditable="true">{{ text }}</div>
        </div>
        
        <!-- 显示模式 -->
        <div 
          v-else 
          class="text-container" 
          :style="textStyle" 
          contenteditable="false"
          @dblclick="startEditing">
          <div style="width: 100%; white-space: pre-wrap;">{{ text }}</div>
        </div>
      </div>
      
      <!-- 控制面板入口 -->
      <portal v-if="isActive && !previewMode" to="control-target">
        <div class="text-control-wrapper">
          <text-control :item="item" @update="updateStyle"></text-control>
        </div>
      </portal>
    </div>
  </widget-wrapper>
</template>

<script>
import WidgetWrapper from './WidgetWrapper.vue';

export default {
  name: 'TextWidget',
  components: {
    WidgetWrapper,
    'text-control': () => import('./TextControl.vue')
  },
  directives: {
    clickoutside: {
      bind(el, binding) {
        const handler = (e) => {
          if (el && !el.contains(e.target)) {
            binding.value(e);
          }
        };
        el._clickOutside = handler;
        document.addEventListener('click', handler);
      },
      unbind(el) {
        document.removeEventListener('click', el._clickOutside);
        delete el._clickOutside;
      }
    }
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    previewMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isEditing: false,
      isActive: false,
      controlTarget: 'control-target'
    };
  },
  computed: {
    // 获取组件状态
    wState() {
      return this.item.state || {};
    },
    // 文本内容
    text() {
      return this.wState.text || '';
    },
    // 图片源
    imgSrc() {
      return this.wState.imgSrc || '';
    },
    // 文本样式
    textStyle() {
      return this.wState.style || {};
    }
  },
  watch: {
    isEditing(val) {
      // 编辑状态下禁用拖拽
      if (this.$refs.wrapper) {
        this.$refs.wrapper.setDraggable(!val);
      }
      // 通知Edit组件拖拽状态变化
      this.$emit('draggableChange', !val);
    }
  },
  created() {
    // 只有在初始化组件需要时才应用默认设置，现在由拖拽位置决定
  },
  methods: {
    // 更新组件位置信息
    updateDragInfo(dragInfo, addToHistory) {
      this.$emit('update:dragInfo', { ...this.item.dragInfo, ...dragInfo }, addToHistory);
    },
    
    // 开始编辑文本
    startEditing() {
      if (this.previewMode) return;
      
      this.isEditing = true;
      
      this.$nextTick(() => {
        const textContainer = this.$refs.textContainer;
        if (textContainer) {
          textContainer.focus();
          // 将光标放到文本末尾
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(textContainer);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    },
    
    // 保存编辑的文本
    saveText() {
      if (!this.isEditing) return;
      
      this.isEditing = false;
      
      const textContainer = this.$refs.textContainer;
      if (textContainer) {
        // 更新文本内容
        this.updateWidgetState({ text: textContainer.innerText });
      }
    },
    
    // 更新组件状态
    updateWidgetState(newState) {
      this.$emit('update:state', { ...this.wState, ...newState });
    },
    
    // 更新样式
    updateStyle(newState) {
      // 检查newState是否包含完整状态
      if (newState.text !== undefined) {
        // 这是一个完整的状态更新
        this.updateWidgetState(newState);
      } else {
        // 这是只更新样式的情况
        this.updateWidgetState({ style: newState });
      }
    }
  }
}
</script>

<style scoped>
.text-widget {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.text-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding: 5px;
}

.text-container.editing {
  border: 1px dashed #409EFF;
  background-color: rgba(255, 255, 255, 0.8);
}
</style> 