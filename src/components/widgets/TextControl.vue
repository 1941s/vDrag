<template>
  <div class="text-control">
    <div class="control-section">
      <h3>文本内容</h3>
      <el-input
        type="textarea"
        v-model="text"
        placeholder="请输入文本内容"
        :rows="3"
        @input="updateText"
      ></el-input>
    </div>
    
    <div class="control-section">
      <h3>文本样式</h3>
      
      <div class="control-item">
        <label>文字颜色</label>
        <el-color-picker 
          v-model="style.color" 
          @change="updateStyle"
          class="editable-color-picker"
        ></el-color-picker>
      </div>
      
      <div class="control-item">
        <label>字体大小</label>
        <el-select 
          v-model="fontSize" 
          placeholder="字体大小" 
          @change="updateFontSize"
          class="editable-dropdown"
        >
          <el-option
            v-for="size in fontSizes"
            :key="size"
            :label="`${size}px`"
            :value="size"
          ></el-option>
        </el-select>
      </div>
      
      <div class="control-item">
        <label>字体粗细</label>
        <el-select 
          v-model="style.fontWeight" 
          placeholder="字体粗细" 
          @change="updateStyle"
          class="editable-dropdown"
        >
          <el-option label="正常" value="normal"></el-option>
          <el-option label="粗体" value="bold"></el-option>
        </el-select>
      </div>
      
      <div class="control-item">
        <label>对齐方式</label>
        <el-radio-group v-model="style.textAlign" @input="updateStyle">
          <el-radio-button label="left">
            <i class="el-icon-s-fold"></i>
          </el-radio-button>
          <el-radio-button label="center">
            <i class="el-icon-s-unfold"></i>
          </el-radio-button>
          <el-radio-button label="right">
            <i class="el-icon-s-fold"></i>
          </el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="control-item">
        <label>行高</label>
        <div class="input-container">
          <el-input-number 
            v-model="lineHeight" 
            :min="1" 
            :max="3" 
            :step="0.1" 
            :precision="1"
            @change="updateLineHeight"
            :controls="false"
            class="editable-input">
          </el-input-number>
        </div>
      </div>
      
      <div class="control-item">
        <label>背景图片</label>
        <el-input
          v-model="imgSrc"
          placeholder="图片URL"
          @input="updateImgSrc"
        ></el-input>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextControl',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    // 从组件状态中提取样式
    const state = this.item.state || {};
    const style = state.style || {
      color: '#000000',
      fontSize: '16px',
      fontWeight: 'normal',
      textAlign: 'left',
      lineHeight: '1.5'
    };
    
    // 提取字体大小和行高，去掉单位
    const fontSize = parseInt(style.fontSize) || 16;
    const lineHeight = parseFloat(style.lineHeight) || 1.5;
    
    return {
      text: state.text || '',
      imgSrc: state.imgSrc || '',
      style: { ...style },
      fontSize,
      lineHeight,
      fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]
    };
  },
  methods: {
    // 更新文本内容
    updateText() {
      // 创建一个新的状态对象，包含当前样式和更新的文本
      const newState = {
        text: this.text,
        style: this.style,
        imgSrc: this.imgSrc
      };
      this.$emit('update', newState);
    },
    
    // 更新字体大小
    updateFontSize() {
      this.style.fontSize = `${this.fontSize}px`;
      this.updateStyle();
    },
    
    // 更新行高
    updateLineHeight() {
      console.log('更新行高前:', this.lineHeight, this.style.lineHeight);
      this.style.lineHeight = this.lineHeight.toString();
      console.log('更新行高后:', this.style.lineHeight);
      
      // 直接创建新状态并触发更新
      const newState = {
        text: this.text,
        style: { 
          ...this.style,
          lineHeight: this.lineHeight.toString()
        },
        imgSrc: this.imgSrc
      };
      this.$emit('update', newState);
    },
    
    // 更新背景图片
    updateImgSrc() {
      const newState = {
        text: this.text,
        style: this.style,
        imgSrc: this.imgSrc
      };
      this.$emit('update', newState);
    },
    
    // 更新样式
    updateStyle() {
      const newState = {
        text: this.text,
        style: { ...this.style },
        imgSrc: this.imgSrc
      };
      this.$emit('update', newState);
    }
  },
  watch: {
    'item.state': {
      handler(newState) {
        if (newState) {
          // 更新本地数据
          this.text = newState.text || '';
          this.imgSrc = newState.imgSrc || '';
          
          if (newState.style) {
            this.style = { ...newState.style };
            // 更新衍生值
            this.fontSize = parseInt(newState.style.fontSize) || 16;
            this.lineHeight = parseFloat(newState.style.lineHeight) || 1.5;
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    // 确保滑块能够正确响应点击事件
    this.$nextTick(() => {
      const sliderEl = this.$el.querySelector('.editable-slider');
      if (sliderEl) {
        sliderEl.addEventListener('mousedown', (e) => {
          // 阻止事件冒泡，确保点击事件不会传播到canvas
          e.stopPropagation();
        });
      }
    });
  }
}
</script>

<style>
/* 清除之前的全局样式 */
</style>

<style scoped>
.text-control {
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

.el-select {
  width: 100%;
  z-index: 9999 !important;
}

.input-container {
  display: flex;
  align-items: center;
}

.editable-input {
  width: 100%;
}

.editable-input >>> input {
  pointer-events: auto !important;
}

/* 确保控件可编辑 */
.editable-dropdown,
.editable-color-picker,
.editable-slider,
.editable-input {
  pointer-events: auto !important;
}

.slider-container {
  display: flex;
  align-items: center;
}

.slider-value {
  margin-left: 8px;
  min-width: 30px;
  text-align: center;
}

/* 增强滑块控件的交互性 */
.editable-slider {
  flex: 1;
  margin: 10px 0;
}

.editable-slider >>> .el-slider__runway,
.editable-slider >>> .el-slider__bar,
.editable-slider >>> .el-slider__button,
.editable-slider >>> .el-slider__button-wrapper {
  pointer-events: auto !important;
  z-index: 999 !important;
}
</style> 