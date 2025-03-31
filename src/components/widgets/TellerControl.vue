<template>
  <div class="teller-control">
    <h3>号码设置</h3>
    
    <div class="form-section">
      <h4>前缀文本</h4>
      <div class="form-item">
        <label>内容</label>
        <el-input v-model="prefixText" @input="updateWidget"></el-input>
      </div>
      
      <div class="form-item">
        <label>字体大小</label>
        <el-slider 
          v-model="prefixFontSize" 
          :min="12" 
          :max="72" 
          :format-tooltip="val => `${val}px`"
          @change="updateWidget"></el-slider>
      </div>
      
      <div class="form-item">
        <label>字体颜色</label>
        <el-color-picker 
          v-model="prefixColor" 
          show-alpha
          @change="updateWidget"></el-color-picker>
      </div>
    </div>
    
    <div class="form-section">
      <h4>号码文本</h4>
      <div class="form-item">
        <label>内容</label>
        <el-input v-model="text" @input="updateWidget"></el-input>
      </div>
      
      <div class="form-item">
        <label>字体大小</label>
        <el-slider 
          v-model="infixFontSize" 
          :min="12" 
          :max="72" 
          :format-tooltip="val => `${val}px`"
          @change="updateWidget"></el-slider>
      </div>
      
      <div class="form-item">
        <label>字体颜色</label>
        <el-color-picker 
          v-model="infixColor" 
          show-alpha
          @change="updateWidget"></el-color-picker>
      </div>
      
      <div class="form-item">
        <label>字体粗细</label>
        <el-select 
          v-model="infixFontWeight" 
          placeholder="选择字体粗细"
          @change="updateWidget">
          <el-option label="正常" value="normal"></el-option>
          <el-option label="粗体" value="bold"></el-option>
        </el-select>
      </div>
    </div>
    
    <div class="form-section">
      <h4>后缀文本</h4>
      <div class="form-item">
        <label>内容</label>
        <el-input v-model="suffixText" @input="updateWidget"></el-input>
      </div>
      
      <div class="form-item">
        <label>字体大小</label>
        <el-slider 
          v-model="suffixFontSize" 
          :min="12" 
          :max="72" 
          :format-tooltip="val => `${val}px`"
          @change="updateWidget"></el-slider>
      </div>
      
      <div class="form-item">
        <label>字体颜色</label>
        <el-color-picker 
          v-model="suffixColor" 
          show-alpha
          @change="updateWidget"></el-color-picker>
      </div>
    </div>
    
    <div class="form-section">
      <h4>整体布局</h4>
      <div class="form-item">
        <label>对齐方式</label>
        <el-radio-group 
          v-model="justifyContent"
          @change="updateWidget">
          <el-radio-button label="flex-start">左对齐</el-radio-button>
          <el-radio-button label="center">居中</el-radio-button>
          <el-radio-button label="flex-end">右对齐</el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TellerControl',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    const state = this.item.state || {};
    const style = state.style || {};
    const prefixStyle = state.prefixStyle || {};
    const infixStyle = state.infixStyle || {};
    const suffixStyle = state.suffixStyle || {};
    
    return {
      // 主文本
      text: state.text || '',
      prefixText: state.prefixText || '',
      suffixText: state.suffixText || '',
      
      // 样式
      justifyContent: style.justifyContent || 'flex-start',
      
      // 前缀样式
      prefixFontSize: parseInt(prefixStyle.fontSize) || 24,
      prefixColor: prefixStyle.color || '#000000',
      
      // 号码样式
      infixFontSize: parseInt(infixStyle.fontSize) || 36,
      infixColor: infixStyle.color || '#ff0000',
      infixFontWeight: infixStyle.fontWeight || 'bold',
      
      // 后缀样式
      suffixFontSize: parseInt(suffixStyle.fontSize) || 24,
      suffixColor: suffixStyle.color || '#000000'
    };
  },
  methods: {
    // 更新组件
    updateWidget() {
      // 整体样式
      const style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: this.justifyContent
      };
      
      // 前缀样式
      const prefixStyle = {
        fontSize: `${this.prefixFontSize}px`,
        color: this.prefixColor
      };
      
      // 号码样式
      const infixStyle = {
        fontSize: `${this.infixFontSize}px`,
        color: this.infixColor,
        fontWeight: this.infixFontWeight
      };
      
      // 后缀样式
      const suffixStyle = {
        fontSize: `${this.suffixFontSize}px`,
        color: this.suffixColor
      };
      
      // 触发更新事件
      this.$emit('update', {
        style,
        prefixStyle,
        infixStyle,
        suffixStyle,
        text: this.text,
        prefixText: this.prefixText,
        suffixText: this.suffixText
      });
    }
  }
}
</script>

<style scoped>
.teller-control {
  padding: 10px;
}

.form-section {
  margin-bottom: 20px;
  border-bottom: 1px dashed #ddd;
  padding-bottom: 15px;
}

.form-section:last-child {
  border-bottom: none;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #606266;
}
</style> 