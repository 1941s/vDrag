<template>
  <widget-wrapper
    ref="wrapper"
    :item="item"
    :active.sync="isActive"
    @update:dragInfo="updateDragInfo"
  >
    <div class="queue-widget">
      <div class="queue-list">
        <div 
          v-for="(item, index) in queueItems" 
          :key="index"
          class="queue-item"
          :class="{ 'odd': index % 2 !== 0 }"
          :style="getItemStyle(index)">
          <span class="text" :style="getTextStyle(index)">{{ item.text }}</span>
          <span class="ticket" :style="getTicketStyle(index)">{{ item.ticket }}</span>
          <span class="window" :style="getWinStyle(index)">{{ item.window }}</span>
        </div>
      </div>
      
      <!-- 控制面板入口 -->
      <portal v-if="isActive && !previewMode" to="control-target">
        <div class="queue-control-wrapper">
          <div class="queue-control">
            <div class="control-section">
              <h3>队列设置</h3>
              <div class="control-item">
                <label>显示条数</label>
                <el-input-number v-model="countInput" :min="1" :max="20" @input="updateCount"></el-input-number>
              </div>
            </div>
            
            <div class="control-section">
              <h3>队列数据</h3>
              <!-- 循环队列数据 -->
              <div v-for="(item, index) in queueData" :key="index" class="queue-item">
                <div class="control-item">
                  <label>呼叫文本</label>
                  <el-input v-model="item.text" @input="updateQueueData"></el-input>
                </div>
                <div class="control-item">
                  <label>票号</label>
                  <el-input v-model="item.ticketNo" @input="updateQueueData"></el-input>
                </div>
                <div class="control-item">
                  <label>窗口号</label>
                  <el-input v-model="item.windowNo" @input="updateQueueData"></el-input>
                </div>
                <div style="margin-bottom: 10px; border-bottom: 1px dashed #ddd; padding-bottom: 10px;"></div>
              </div>
            </div>
            
            <div class="control-section">
              <h3>样式设置</h3>
              <div class="control-item">
                <label>奇数行背景</label>
                <el-color-picker v-model="oddStyle.backgroundColor" @input="updateOddStyle"></el-color-picker>
              </div>
              <div class="control-item">
                <label>偶数行背景</label>
                <el-color-picker v-model="evenStyle.backgroundColor" @input="updateEvenStyle"></el-color-picker>
              </div>
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
  name: 'QueueInfoWidget',
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
    }
  },
  data() {
    const state = this.item.state || {};
    const count = state.count || 3;
    const mockData = [];
    
    // 生成模拟数据
    for (let i = 0; i < Math.max(count, 10); i++) {
      if (state.list && state.list[i]) {
        mockData.push(state.list[i]);
      } else {
        mockData.push({
          text: `请`,
          ticket: `A${1001 + i}`,
          window: `到${i + 1}号窗口`
        });
      }
    }
    
    return {
      isActive: false,
      
      // 队列设置
      countModel: count,
      animationTypeModel: state.isHaveAnimation || 0,
      queueDataModel: mockData,
      
      // 样式设置
      activeStyleTab: 'odd',
      oddStyleModel: { ...state.oddStyle } || { backgroundColor: '#f0f0f0' },
      evenStyleModel: { ...state.evenStyle } || { backgroundColor: '#e8e8e8' },
      oddTextStyleModel: { ...state.oddTextStyle } || { color: '#000000' },
      evenTextStyleModel: { ...state.evenTextStyle } || { color: '#000000' },
      oddTicketStyleModel: { ...state.oddTicketStyle } || { color: '#ff0000' },
      evenTicketStyleModel: { ...state.evenTicketStyle } || { color: '#ff0000' },
      oddWinStyleModel: { ...state.oddWinStyle } || { color: '#0000ff' },
      evenWinStyleModel: { ...state.evenWinStyle } || { color: '#0000ff' }
    };
  },
  computed: {
    // 获取组件状态
    wState() {
      return this.item.state || {};
    },
    
    // 队列项数
    queueCount() {
      return this.wState.count || 3;
    },
    
    // 队列数据
    queueItems() {
      const count = this.queueCount;
      
      if (this.wState.list && this.wState.list.length > 0) {
        return this.wState.list.slice(0, count);
      }
      
      // 默认数据
      const defaultItems = [];
      for (let i = 0; i < count; i++) {
        defaultItems.push({
          text: `请`,
          ticket: `A${1001 + i}`,
          window: `到${i + 1}号窗口`
        });
      }
      
      return defaultItems;
    },
    
    // 样式计算
    oddStyle() {
      return this.wState.oddStyle || { backgroundColor: '#f0f0f0' };
    },
    
    evenStyle() {
      return this.wState.evenStyle || { backgroundColor: '#e8e8e8' };
    },
    
    oddTextStyle() {
      return this.wState.oddTextStyle || { color: '#000000' };
    },
    
    evenTextStyle() {
      return this.wState.evenTextStyle || { color: '#000000' };
    },
    
    oddTicketStyle() {
      return this.wState.oddTicketStyle || { color: '#ff0000' };
    },
    
    evenTicketStyle() {
      return this.wState.evenTicketStyle || { color: '#ff0000' };
    },
    
    oddWinStyle() {
      return this.wState.oddWinStyle || { color: '#0000ff' };
    },
    
    evenWinStyle() {
      return this.wState.evenWinStyle || { color: '#0000ff' };
    },
    
    // 动画样式
    animationStyle() {
      if (this.wState.isHaveAnimation === 1) {
        return { animation: 'fade 2s infinite' };
      } else if (this.wState.isHaveAnimation === 2) {
        return { animation: 'blink 1s infinite' };
      }
      return {};
    }
  },
  watch: {
    // 监听active prop的变化
    active: {
      immediate: true,
      handler(newVal) {
        this.isActive = newVal;
      }
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
    
    // 更新队列项数
    updateCount() {
      this.updateWidgetState({ count: this.countModel });
    },
    
    // 更新动画设置
    updateAnimation() {
      this.updateWidgetState({ isHaveAnimation: this.animationTypeModel });
    },
    
    // 更新队列数据
    updateQueueData() {
      this.updateWidgetState({ list: [...this.queueDataModel] });
    },
    
    // 更新样式
    updateOddStyle() {
      this.updateWidgetState({ oddStyle: { ...this.oddStyleModel } });
    },
    
    updateEvenStyle() {
      this.updateWidgetState({ evenStyle: { ...this.evenStyleModel } });
    },
    
    updateOddTextStyle() {
      this.updateWidgetState({ oddTextStyle: { ...this.oddTextStyleModel } });
    },
    
    updateEvenTextStyle() {
      this.updateWidgetState({ evenTextStyle: { ...this.evenTextStyleModel } });
    },
    
    updateOddTicketStyle() {
      this.updateWidgetState({ oddTicketStyle: { ...this.oddTicketStyleModel } });
    },
    
    updateEvenTicketStyle() {
      this.updateWidgetState({ evenTicketStyle: { ...this.evenTicketStyleModel } });
    },
    
    // 获取项目样式
    getItemStyle(index) {
      if (index % 2 === 0) {
        return { ...this.evenStyle, ...this.animationStyle };
      } else {
        return { ...this.oddStyle, ...this.animationStyle };
      }
    },
    
    // 获取文本样式
    getTextStyle(index) {
      return index % 2 === 0 ? this.evenTextStyle : this.oddTextStyle;
    },
    
    // 获取号码样式
    getTicketStyle(index) {
      return index % 2 === 0 ? this.evenTicketStyle : this.oddTicketStyle;
    },
    
    // 获取窗口样式
    getWinStyle(index) {
      return index % 2 === 0 ? this.evenWinStyle : this.oddWinStyle;
    }
  }
}
</script>

<style scoped>
.queue-widget {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px;
  box-sizing: border-box;
}

.widget-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 8px;
  box-sizing: border-box;
  min-width: 120px;
  min-height: 40px;
}

.queue-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.queue-item.odd {
  background-color: #f0f0f0;
}

.text, .ticket, .window {
  margin-right: 10px;
}

.ticket {
  font-weight: bold;
}

.queue-control {
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

.queue-item-editor {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-bottom: 15px;
}

.queue-item-editor h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

@keyframes fade {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style> 