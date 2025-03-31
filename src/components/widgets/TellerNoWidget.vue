<template>
  <widget-wrapper
    ref="wrapper"
    :item="item"
    :active.sync="isActive"
    :z-style="zStyle"
    @update:dragInfo="updateDragInfo"
    @activated="handleActivated"
    @deactivated="handleDeactivated"
    @click="handleClick"
  >
    <div class="teller-widget">
      <div class="teller-content">
        <span class="prefix" :style="prefixStyle">{{ prefixText }}</span>
        <span class="number" :style="infixStyle">{{ text }}</span>
        <span class="suffix" :style="suffixStyle">{{ suffixText }}</span>
        <!-- 渲染额外文本段 -->
        <span 
          v-for="(segment, index) in extraSegmentsComputed" 
          :key="`segment-${index}`"
          :style="segment.style"
          class="extra-segment"
        >
          {{ segment.text }}
        </span>
      </div>
      
      <!-- 使用一般控制面板结构，避免复杂嵌套 -->
      <portal v-if="isActive && !previewMode" to="control-target">
        <div class="teller-control-wrapper">
          <div class="control-section">
            <h3>基本文本段</h3>
            
            <!-- 简化标签结构 -->
            <div class="select-section">
              <el-radio-group v-model="activeSection" class="section-selector">
                <el-radio-button label="prefix">前缀</el-radio-button>
                <el-radio-button label="number">号码</el-radio-button>
                <el-radio-button label="suffix">后缀</el-radio-button>
              </el-radio-group>
            </div>
            
            <!-- 前缀控制面板 -->
            <div v-show="activeSection === 'prefix'" class="section-panel">
              <div class="control-item">
                <label>前缀文本</label>
                <el-input :value="prefixInput" @input="handlePrefixInput" ref="prefixInputEl"></el-input>
              </div>
              
              <div class="control-item">
                <label>文字颜色</label>
                <el-color-picker class="editable-color-picker" v-model="prefixStyleModel.color" @change="updateStyles"></el-color-picker>
              </div>
              
              <div class="control-item">
                <label>字体大小</label>
                <el-input-number v-model="prefixFontSize" :min="12" :max="72" @change="updatePrefixFontSize"></el-input-number>
              </div>
              
              <div class="control-item">
                <label>加粗</label>
                <el-switch v-model="isPrefixBold" @change="updatePrefixBold"></el-switch>
              </div>
            </div>
            
            <!-- 号码控制面板 -->
            <div v-show="activeSection === 'number'" class="section-panel">
              <div class="control-item">
                <label>号码文本</label>
                <el-input :value="textInput" @input="handleTextInput" ref="textInputEl"></el-input>
              </div>
              
              <div class="control-item">
                <label>文字颜色</label>
                <el-color-picker class="editable-color-picker" v-model="infixStyleModel.color" @change="updateStyles"></el-color-picker>
              </div>
              
              <div class="control-item">
                <label>字体大小</label>
                <el-input-number v-model="infixFontSize" :min="12" :max="72" @change="updateInfixFontSize"></el-input-number>
              </div>
              
              <div class="control-item">
                <label>加粗</label>
                <el-switch v-model="isInfixBold" @change="updateInfixBold"></el-switch>
              </div>
            </div>
            
            <!-- 后缀控制面板 -->
            <div v-show="activeSection === 'suffix'" class="section-panel">
              <div class="control-item">
                <label>后缀文本</label>
                <el-input :value="suffixInput" @input="handleSuffixInput" ref="suffixInputEl"></el-input>
              </div>
              
              <div class="control-item">
                <label>文字颜色</label>
                <el-color-picker class="editable-color-picker" v-model="suffixStyleModel.color" @change="updateStyles"></el-color-picker>
              </div>
              
              <div class="control-item">
                <label>字体大小</label>
                <el-input-number v-model="suffixFontSize" :min="12" :max="72" @change="updateSuffixFontSize"></el-input-number>
              </div>
              
              <div class="control-item">
                <label>加粗</label>
                <el-switch v-model="isSuffixBold" @change="updateSuffixBold"></el-switch>
              </div>
            </div>
          </div>
          
          <!-- <div class="control-section">
            <h3>附加文本段</h3>
            <div class="add-section-container">
              <el-button type="primary" @click.stop.prevent="addTextSegment" class="add-segment-button">
                <i class="el-icon-plus"></i> 添加文本段
              </el-button>
            </div>
            
            <div v-if="extraSegments && extraSegments.length > 0" class="segments-list">
              <div v-for="(segment, index) in extraSegments" :key="index" class="segment-item">
                <div class="segment-header">
                  <span>文本段 {{index + 1}}</span>
                  <el-button size="mini" type="danger" @click.stop.prevent="removeSegment(index)" class="delete-button">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                
                <div class="control-item">
                  <label>文本内容</label>
                  <el-input :value="segment.text" @input="(value) => handleSegmentInput(index, value)" :ref="`segmentInput_${index}`"></el-input>
                </div>
                
                <div class="control-item">
                  <label>文字颜色</label>
                  <el-color-picker class="editable-color-picker" v-model="segment.style.color" @change="updateExtraSegments"></el-color-picker>
                </div>
                
                <div class="control-item">
                  <label>字体大小</label>
                  <el-input-number v-model="segment.fontSize" :min="12" :max="72" @change="updateExtraSegmentFontSize(index)"></el-input-number>
                </div>
                
                <div class="control-item">
                  <label>加粗</label>
                  <el-switch v-model="segment.isBold" @change="updateExtraSegmentBold(index)"></el-switch>
                </div>
              </div>
            </div>
          </div> -->
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
    const state = this.item.state || {};
    const prefixStyle = state.prefixStyle || {};
    const infixStyle = state.infixStyle || {};
    const suffixStyle = state.suffixStyle || {};
    
    return {
      isActive: this.active,
      activeSection: 'prefix',
      
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
      
      // 粗体状态
      isPrefixBold: prefixStyle.fontWeight === 'bold',
      isInfixBold: infixStyle.fontWeight === 'bold',
      isSuffixBold: suffixStyle.fontWeight === 'bold',
      
      // 额外文本段
      extraSegments: state.extraSegments || []
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
    },
    
    // 额外文本段计算
    extraSegmentsComputed() {
      return this.wState.extraSegments || [];
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
    
    // 通用保持光标位置的辅助函数
    maintainCursorPosition(ref) {
      this.$nextTick(() => {
        let element = null;
        
        // 处理不同类型的ref（数组或单个元素）
        if (Array.isArray(ref) && ref.length > 0 && ref[0].$el) {
          element = ref[0].$el.querySelector('input');
        } else if (ref && ref.$el) {
          element = ref.$el.querySelector('input');
        }
        
        if (element) {
          const cursorPosition = element.selectionStart;
          this.$nextTick(() => {
            element.setSelectionRange(cursorPosition, cursorPosition);
          });
        }
      });
    },
    
    // 处理前缀文本输入，保留光标位置
    handlePrefixInput(value) {
      this.prefixInput = value;
      this.updateWidgetState({
        prefixText: value
      });
      
      this.maintainCursorPosition(this.$refs.prefixInputEl);
    },
    
    // 处理号码文本输入，保留光标位置
    handleTextInput(value) {
      this.textInput = value;
      this.updateWidgetState({
        text: value
      });
      
      this.maintainCursorPosition(this.$refs.textInputEl);
    },
    
    // 处理后缀文本输入，保留光标位置
    handleSuffixInput(value) {
      this.suffixInput = value;
      this.updateWidgetState({
        suffixText: value
      });
      
      this.maintainCursorPosition(this.$refs.suffixInputEl);
    },
    
    // 处理文本段输入，保留光标位置
    handleSegmentInput(index, value) {
      if (index >= 0 && index < this.extraSegments.length) {
        this.extraSegments[index].text = value;
        this.updateExtraSegments();
        
        this.maintainCursorPosition(this.$refs[`segmentInput_${index}`]);
      }
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
    
    // 更新前缀加粗
    updatePrefixBold() {
      this.prefixStyleModel.fontWeight = this.isPrefixBold ? 'bold' : 'normal';
      this.updateStyles();
    },
    
    // 更新号码加粗
    updateInfixBold() {
      this.infixStyleModel.fontWeight = this.isInfixBold ? 'bold' : 'normal';
      this.updateStyles();
    },
    
    // 更新后缀加粗
    updateSuffixBold() {
      this.suffixStyleModel.fontWeight = this.isSuffixBold ? 'bold' : 'normal';
      this.updateStyles();
    },
    
    // 添加文本段
    addTextSegment(event) {
      // 阻止事件冒泡
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      const newSegment = {
        text: '新文本',
        style: {
          color: '#333333',
          fontSize: '24px',
          fontWeight: 'normal'
        },
        fontSize: 24,
        isBold: false
      };
      
      // 确保extraSegments是一个数组
      if (!Array.isArray(this.extraSegments)) {
        this.extraSegments = [];
      }
      
      this.extraSegments.push(newSegment);
      this.updateExtraSegments();
      
      console.log('添加了新文本段，当前数量:', this.extraSegments.length);
    },
    
    // 移除文本段
    removeSegment(index, event) {
      // 阻止事件冒泡
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      this.extraSegments.splice(index, 1);
      this.updateExtraSegments();
      
      console.log('移除了文本段，当前数量:', this.extraSegments.length);
    },
    
    // 更新额外文本段
    updateExtraSegments() {
      this.updateWidgetState({
        extraSegments: [...this.extraSegments]
      });
    },
    
    // 更新额外文本段字体大小
    updateExtraSegmentFontSize(index) {
      const segment = this.extraSegments[index];
      segment.style.fontSize = `${segment.fontSize}px`;
      this.updateExtraSegments();
    },
    
    // 更新额外文本段粗体
    updateExtraSegmentBold(index) {
      const segment = this.extraSegments[index];
      segment.style.fontWeight = segment.isBold ? 'bold' : 'normal';
      this.updateExtraSegments();
    },
    
    // 处理组件激活
    handleActivated() {
      this.isActive = true;
      // 通知父组件更新属性编辑栏
      this.$emit('update:active', true);
    },
    
    // 处理组件取消激活
    handleDeactivated() {
      this.isActive = false;
      // 通知父组件更新属性编辑栏
      this.$emit('update:active', false);
    },
    
    // 处理组件点击
    handleClick(event) {
      // 阻止事件冒泡，防止触发画布的点击事件
      if (event) {
        event.stopPropagation();
      }
      
      // 通知父组件此组件被点击
      this.$emit('click');
    }
  },
  watch: {
    // 监听active prop的变化
    active: {
      immediate: true,
      handler(newVal) {
        // 只更新本地状态，避免再次触发事件
        this.isActive = newVal;
      }
    },
    'item.state': {
      handler(newState) {
        if (newState) {
          // 避免不必要地重设输入值，可能导致光标重置
          // 只在值实际不同时才更新
          if (this.prefixInput !== newState.prefixText && newState.prefixText !== undefined) {
            this.prefixInput = newState.prefixText || '';
          }
          
          if (this.textInput !== newState.text && newState.text !== undefined) {
            this.textInput = newState.text || '';
          }
          
          if (this.suffixInput !== newState.suffixText && newState.suffixText !== undefined) {
            this.suffixInput = newState.suffixText || '';
          }
          
          // 更新额外文本段
          this.extraSegments = newState.extraSegments || [];
          
          if (newState.prefixStyle) {
            this.prefixStyleModel = { ...newState.prefixStyle };
            this.prefixFontSize = parseInt(newState.prefixStyle.fontSize) || 24;
            this.isPrefixBold = newState.prefixStyle.fontWeight === 'bold';
          }
          
          if (newState.infixStyle) {
            this.infixStyleModel = { ...newState.infixStyle };
            this.infixFontSize = parseInt(newState.infixStyle.fontSize) || 36;
            this.isInfixBold = newState.infixStyle.fontWeight === 'bold';
          }
          
          if (newState.suffixStyle) {
            this.suffixStyleModel = { ...newState.suffixStyle };
            this.suffixFontSize = parseInt(newState.suffixStyle.fontSize) || 24;
            this.isSuffixBold = newState.suffixStyle.fontWeight === 'bold';
          }
        }
      },
      deep: true
    }
  },
  // 添加mounted钩子
  mounted() {
    // 当组件是通过拖放新建的，需要自动激活
    // 通过检查URL参数或其他方式判断是否为新建
    if (this.item && this.item.isNew) {
      this.$nextTick(() => {
        this.$emit('update:active', true);
      });
    }
  },
  
  // 添加beforeDestroy钩子
  beforeDestroy() {
    // 组件销毁前取消激活状态
    if (this.isActive) {
      // 不直接修改isActive，而是触发事件
      this.$emit('update:active', false);
      this.$emit('deactivated');
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
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.teller-control-wrapper {
  padding: 15px;
  max-width: 100%;
  position: relative;
  z-index: 9000;
}

.control-section {
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.control-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #409EFF;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.control-item {
  margin-bottom: 15px;
}

.control-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

/* 组件选择器 */
.select-section {
  margin-bottom: 15px;
}

.section-selector {
  width: 100%;
  display: flex;
}

.section-selector .el-radio-button {
  flex: 1;
}

.section-selector .el-radio-button__inner {
  width: 100%;
}

/* 段落面板 */
.section-panel {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

/* 额外文本段样式 */
.segments-list {
  margin-top: 15px;
}

.segment-item {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: relative;
  z-index: 201;
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.segment-header span {
  font-weight: bold;
  color: #606266;
}

.add-section-container {
  margin-top: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.add-segment-button {
  width: 100%;
  position: relative;
  z-index: 202;
  cursor: pointer !important;
}

.delete-button {
  cursor: pointer !important;
  position: relative;
  z-index: 203;
}

.extra-segment {
  margin: 0 2px;
}

/* 确保所有按钮可点击 */
.el-button {
  cursor: pointer !important;
  pointer-events: auto !important;
}

/* 为所有输入控件确保交互性 */
.el-input,
.el-input-number,
.el-switch,
.el-color-picker,
.el-radio-group,
.el-radio-button {
  pointer-events: auto !important;
}
</style> 