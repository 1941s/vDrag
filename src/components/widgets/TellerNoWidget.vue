<template>
  <widget-wrapper
    ref="wrapper"
    :item="item"
    @update:dragInfo="updateDragInfo"
    @activated="isActive = true"
    @deactivated="isActive = false"
  >
    <div class="teller-widget">
      <div class="teller-content">
        <span class="prefix" :style="prefixStyle">{{ prefixText }}</span>
        <span class="number" :style="infixStyle">{{ text }}</span>
        <span class="suffix" :style="suffixStyle">{{ suffixText }}</span>
      </div>
      
      <!-- 控制面板入口 -->
      <portal v-if="isActive && !previewMode" to="control-target">
        <div class="teller-control-wrapper">
          <div class="teller-control">
            <div class="control-section">
              <h3>号码设置</h3>
              
              <div class="control-item">
                <label>前缀文本</label>
                <el-input v-model="prefixInput" @input="updateContent"></el-input>
              </div>
              
              <div class="control-item">
                <label>号码文本</label>
                <el-input v-model="textInput" @input="updateContent"></el-input>
              </div>
              
              <div class="control-item">
                <label>后缀文本</label>
                <el-input v-model="suffixInput" @input="updateContent"></el-input>
              </div>
            </div>
            
            <div class="control-section">
              <h3>前缀样式</h3>
              <div class="control-item">
                <label>文字颜色</label>
                <el-color-picker v-model="prefixStyleModel.color" @input="updateStyles"></el-color-picker>
              </div>
              <div class="control-item">
                <label>字体大小</label>
                <el-input-number v-model="prefixFontSize" :min="12" :max="72" @input="updatePrefixFontSize"></el-input-number>
              </div>
            </div>
            
            <div class="control-section">
              <h3>号码样式</h3>
              <div class="control-item">
                <label>文字颜色</label>
                <el-color-picker v-model="infixStyleModel.color" @input="updateStyles"></el-color-picker>
              </div>
              <div class="control-item">
                <label>字体大小</label>
                <el-input-number v-model="infixFontSize" :min="12" :max="72" @input="updateInfixFontSize"></el-input-number>
              </div>
              <div class="control-item">
                <label>加粗</label>
                <el-switch v-model="isInfixBold" @input="updateInfixBold"></el-switch>
              </div>
            </div>
            
            <div class="control-section">
              <h3>后缀样式</h3>
              <div class="control-item">
                <label>文字颜色</label>
                <el-color-picker v-model="suffixStyleModel.color" @input="updateStyles"></el-color-picker>
              </div>
              <div class="control-item">
                <label>字体大小</label>
                <el-input-number v-model="suffixFontSize" :min="12" :max="72" @input="updateSuffixFontSize"></el-input-number>
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
  name: 'TellerNoWidget',
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
    const prefixStyle = state.prefixStyle || {};
    const infixStyle = state.infixStyle || {};
    const suffixStyle = state.suffixStyle || {};
    
    return {
      isActive: false,
      
      // 编辑字段
      prefixInput: state.prefixText || '请',
      textInput: state.text || 'A001',
      suffixInput: state.suffixText || '号到1号窗口',
      
      // 样式模型
      prefixStyleModel: { ...prefixStyle },
      infixStyleModel: { ...infixStyle },
      suffixStyleModel: { ...suffixStyle },
      
      // 字体大小
      prefixFontSize: parseInt(prefixStyle.fontSize) || 24,
      infixFontSize: parseInt(infixStyle.fontSize) || 36,
      suffixFontSize: parseInt(suffixStyle.fontSize) || 24,
      
      isInfixBold: infixStyle.fontWeight === 'bold'
    };
  },
  computed: {
    // 获取组件状态
    wState() {
      return this.item.state || {};
    },
    
    // 前缀文本
    prefixText() {
      return this.wState.prefixText || '请';
    },
    
    // 号码文本
    text() {
      return this.wState.text || 'A001';
    },
    
    // 后缀文本
    suffixText() {
      return this.wState.suffixText || '号到1号窗口';
    },
    
    // 样式计算
    prefixStyle() {
      return this.wState.prefixStyle || {
        color: '#000000',
        fontSize: '24px'
      };
    },
    
    infixStyle() {
      return this.wState.infixStyle || {
        color: '#ff0000',
        fontSize: '36px',
        fontWeight: 'bold'
      };
    },
    
    suffixStyle() {
      return this.wState.suffixStyle || {
        color: '#000000',
        fontSize: '24px'
      };
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
    
    // 更新组件状态
    updateWidgetState(newState) {
      this.$emit('update:state', { ...this.wState, ...newState });
    },
    
    // 更新内容
    updateContent() {
      this.updateWidgetState({
        prefixText: this.prefixInput,
        text: this.textInput,
        suffixText: this.suffixInput
      });
    },
    
    // 更新样式
    updateStyles() {
      this.updateWidgetState({
        prefixStyle: this.prefixStyleModel,
        infixStyle: this.infixStyleModel,
        suffixStyle: this.suffixStyleModel
      });
    },
    
    // 更新前缀字体大小
    updatePrefixFontSize() {
      this.prefixStyleModel.fontSize = `${this.prefixFontSize}px`;
      this.updateStyles();
    },
    
    // 更新号码字体大小
    updateInfixFontSize() {
      this.infixStyleModel.fontSize = `${this.infixFontSize}px`;
      this.updateStyles();
    },
    
    // 更新后缀字体大小
    updateSuffixFontSize() {
      this.suffixStyleModel.fontSize = `${this.suffixFontSize}px`;
      this.updateStyles();
    },
    
    // 更新号码加粗
    updateInfixBold() {
      this.infixStyleModel.fontWeight = this.isInfixBold ? 'bold' : 'normal';
      this.updateStyles();
    }
  }
}
</script>

<style scoped>
.teller-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.teller-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.teller-control {
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