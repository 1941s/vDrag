<template>
  <widget-wrapper
    ref="wrapper"
    :item="item"
    :active.sync="isActive"
    @update:dragInfo="updateDragInfo"
  >
    <div class="image-widget">
      <img 
        v-if="imgSrc" 
        :src="imgSrc" 
        style="width: 100%; height: 100%; object-fit: contain;">
      <div v-else class="image-placeholder">
        <i class="el-icon-picture-outline"></i>
        <p>请添加图片</p>
      </div>
      
      <!-- 控制面板入口 -->
      <portal v-if="isActive && !previewMode" to="control-target">
        <div class="image-control-wrapper">
          <div class="image-control">
            <div class="control-section">
              <h3>图片设置</h3>
              <div class="control-item">
                <label>图片URL</label>
                <el-input
                  v-model="imgSrcInput"
                  placeholder="输入图片URL"
                  @input="updateImgSrc"
                ></el-input>
              </div>
              
              <el-button type="primary" size="small" @click="updateImgSrc">应用</el-button>
            </div>
          </div>
        </div>
      </portal>
    </div>
  </widget-wrapper>
</template>

<script>
import WidgetWrapper from './WidgetWrapper.vue';

export default {
  name: 'ImageWidget',
  components: {
    WidgetWrapper
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    previewMode: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isActive: this.active,
      imgSrcInput: this.item && this.item.state ? this.item.state.imgSrc || '' : ''
    };
  },
  computed: {
    // 获取组件状态
    wState() {
      return this.item.state || {};
    },
    // 图片源
    imgSrc() {
      return this.wState.imgSrc || '';
    }
  },
  watch: {
    // 监听active prop变化
    active: {
      immediate: true,
      handler(newVal) {
        this.isActive = newVal;
      }
    },
    imgSrc: {
      handler(newVal) {
        this.imgSrcInput = newVal;
      },
      immediate: true
    }
  },
  created() {
    // 只有在初始化组件需要时才应用默认设置，现在由拖拽位置决定
  },
  mounted() {
    // 当组件是通过拖放新建的，需要自动激活
    if (this.item && this.item.isNew) {
      this.$nextTick(() => {
        this.$emit('update:active', true);
      });
    }
  },
  methods: {
    // 更新组件位置信息
    updateDragInfo(dragInfo, addToHistory) {
      this.$emit('update:dragInfo', { ...this.item.dragInfo, ...dragInfo }, addToHistory);
    },
    
    // 更新组件状态
    updateWidgetState(newState) {
      this.$emit('update:state', { ...this.wState, ...newState });
    },
    
    // 更新图片源
    updateImgSrc() {
      this.updateWidgetState({ imgSrc: this.imgSrcInput });
    }
  }
}
</script>

<style scoped>
.image-widget {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.image-placeholder i {
  font-size: 36px;
  margin-bottom: 10px;
}

.image-control {
  padding: 15px;
}

.control-section {
  margin-bottom: 20px;
}

.control-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #409EFF;
}

.control-item {
  margin-bottom: 15px;
}

.control-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
}
</style> 