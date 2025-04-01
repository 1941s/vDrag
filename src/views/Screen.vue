<template>
  <div class="screen-container">
    <div class="preview-header">
      <h2>预览模式</h2>
      <div class="actions">
        <el-button type="primary" size="small" @click="exportImage">导出图片</el-button>
        <el-button type="default" size="small" @click="goBack">返回编辑</el-button>
      </div>
    </div>
    
    <div class="preview-content">
      <div class="canvas-wrapper">
        <div class="canvas" ref="canvas" 
             :style="{
               width: template.canvasSize.width + 'px', 
               height: template.canvasSize.height + 'px',
               backgroundColor: template.canvasBackgroundColor
             }">
          <!-- 渲染组件 -->
          <component
            v-for="item in template.widgets"
            :key="item.id"
            :is="item.type"
            :item="item"
            :style="getWidgetStyle(item)"
            :preview-mode="true"
          ></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';

export default {
  name: 'Screen',
  components: {
    // 在实际项目中，这些组件会动态导入
    'text-widget': () => import('../components/widgets/TextWidget.vue'),
    'image-widget': () => import('../components/widgets/ImageWidget.vue'),
    'tellerNo': () => import('../components/widgets/TellerNoWidget.vue'),
    'queueInfo': () => import('../components/widgets/QueueInfoWidget.vue')
  },
  data() {
    return {
      template: {
        canvasSize: {
          width: 800,
          height: 600
        },
        canvasBackgroundColor: '#ffffff',
        widgets: []
      }
    }
  },
  created() {
    // 从会话存储加载模板信息
    const previewTemplate = this.$getSession('preview_template');
    if (previewTemplate) {
      this.template = previewTemplate;
    } else {
      // 如果没有预览模板，尝试从本地存储加载最后保存的模板
      const savedTemplate = this.$getLocal('current_template');
      if (savedTemplate) {
        this.template.canvasSize = savedTemplate.canvasSize;
        this.template.canvasBackgroundColor = savedTemplate.canvasBackgroundColor;
        this.template.widgets = savedTemplate.widgets;
      }
    }
    
    // 修复可能存在的旧组件类型名称
    if (this.template.widgets && this.template.widgets.length > 0) {
      this.template.widgets.forEach(widget => {
        if (widget.type === 'text') {
          widget.type = 'text-widget';
        } else if (widget.type === 'image') {
          widget.type = 'image-widget';
        }
      });
    }
    
    // 创建模拟数据用于队列信息组件
    this.createMockData();
  },
  methods: {
    // 获取组件样式
    getWidgetStyle(item) {
      return {
        position: 'absolute',
        left: item.dragInfo.x + 'px',
        top: item.dragInfo.y + 'px',
        width: item.dragInfo.w + 'px',
        height: item.dragInfo.h + 'px',
        zIndex: item.zIndex
      };
    },
    
    // 创建模拟数据
    createMockData() {
      // 为队列组件创建模拟数据
      this.template.widgets.forEach(widget => {
        if (widget.type === 'queueInfo') {
          const mockList = [];
          for (let i = 0; i < (widget.state.count || 3); i++) {
            mockList.push({
              text: '请',
              ticket: 'A' + (1001 + i),
              window: `到${i + 1}号窗口`
            });
          }
          widget.state.list = mockList;
          widget.state.editFlag = false; // 在预览模式下使用真实数据
        }
      });
    },
    
    // 导出图片
    exportImage() {
      const canvas = this.$refs.canvas;
      
      html2canvas(canvas, {
        useCORS: true,
        scale: 2,
        backgroundColor: this.template.canvasBackgroundColor
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = '设计预览_' + new Date().getTime() + '.png';
        link.href = imgData;
        link.click();
      });
    },
    
    // 返回编辑页面
    goBack() {
      window.close(); // 关闭当前窗口
      // 或者导航回编辑页面
      // this.$router.push('/edit');
    }
  }
}
</script>

<style scoped>
.screen-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.preview-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ddd;
  background-color: #fff;
}

.preview-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 20px;
  overflow: auto;
}

.canvas-wrapper {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.canvas {
  position: relative;
  overflow: hidden;
}
</style> 