<template>
  <div class="editor-container">
    <div class="editor-header">
      <div class="logo">
        <h2><i class="el-icon-s-promotion"></i> 设计工作台</h2>
      </div>
      <div class="actions">
        <el-button type="primary" size="small" @click="saveTemplate" icon="el-icon-upload2">保存模板</el-button>
        <el-button type="success" size="small" @click="previewTemplate" icon="el-icon-view">预览</el-button>
        <el-button type="default" size="small" @click="exportImage" icon="el-icon-download">导出图片</el-button>
      </div>
    </div>
    
    <div class="toolbar">
      <div class="toolbar-group">
        <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-refresh-left" @click="undo" :disabled="historyIndex <= 0" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="重做 (Ctrl+Y)" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-refresh-right" @click="redo" :disabled="historyIndex >= history.length - 1" class="toolbar-btn"></el-button>
        </el-tooltip>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group" v-if="activeWidget">
        <el-tooltip content="复制 (Ctrl+C)" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-copy-document" @click="quickCopy" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="删除 (Delete)" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-delete" @click="quickDelete" class="toolbar-btn"></el-button>
        </el-tooltip>
      </div>
      
      <div class="toolbar-divider" v-if="activeWidget"></div>
      
      <div class="toolbar-group" v-if="activeWidget">
        <el-tooltip content="置于顶层" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-top" @click="quickBringToFront" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="置于底层" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-bottom" @click="quickSendToBack" class="toolbar-btn"></el-button>
        </el-tooltip>
      </div>
      
      <div class="toolbar-divider" v-if="activeWidget && selectedWidgets.length > 1"></div>
      
      <div class="toolbar-group" v-if="activeWidget && selectedWidgets.length > 1">
        <el-tooltip content="左对齐" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-s-fold" @click="alignWidgets('left')" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="水平居中对齐" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-s-unfold" @click="alignWidgets('centerX')" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="右对齐" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-s-fold" @click="alignWidgets('right')" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="顶部对齐" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-s-grid" @click="alignWidgets('top')" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="垂直居中对齐" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-c-scale-to-original" @click="alignWidgets('centerY')" class="toolbar-btn"></el-button>
        </el-tooltip>
        <el-tooltip content="底部对齐" placement="bottom" effect="dark">
          <el-button size="small" icon="el-icon-menu" @click="alignWidgets('bottom')" class="toolbar-btn"></el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div class="editor-main">
      <div class="sidebar-left">
        <div class="widgets-panel">
          <h3 class="panel-title"><i class="el-icon-menu"></i> 组件库</h3>
          <div class="widget-list">
            <div 
              class="widget-item" 
              v-for="type in widgetTypes" 
              :key="type.type"
              draggable="true"
              @dragstart="onDragStart($event, type.type)"
              @click="addWidget(type.type)">
              <i :class="type.icon"></i>
              <span>{{ type.name }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="canvas-container" ref="canvasContainer" @dragover="onDragOver" @drop="onDrop" @dragleave="onDragLeave">
        <div class="canvas-wrapper">
          <div class="canvas" ref="canvas" 
               :style="{width: canvasSize.width + 'px', height: canvasSize.height + 'px'}"
               @click="handleCanvasClick">
            <!-- 放置组件的区域 -->
            <component
              v-for="item in widgets"
              :key="item.id"
              :is="item.type"
              :item="item"
              :ref="`widget_${item.id}`"
              @click.native.stop="selectWidget(item)"
              :class="{
                'selected': isWidgetSelected(item)
              }"
              @update:dragInfo="updateWidgetDragInfo(item, $event)"
              @update:state="updateWidgetState(item, $event)"
              @draggableChange="handleDraggableChange"
              @contextmenu.native.prevent="showContextMenu($event, item)"
            ></component>
          </div>
        </div>
        
        <!-- 组件上下文菜单 -->
        <div class="context-menu" v-show="contextMenuVisible" :style="contextMenuStyle">
          <div class="context-menu-item" @click="copyWidget">
            <i class="el-icon-copy-document"></i> 复制
          </div>
          <div class="context-menu-item" @click="deleteWidget">
            <i class="el-icon-delete"></i> 删除
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" @click="bringToFront">
            <i class="el-icon-top"></i> 置于顶层
          </div>
          <div class="context-menu-item" @click="sendToBack">
            <i class="el-icon-bottom"></i> 置于底层
          </div>
        </div>
      </div>
      
      <div class="sidebar-right">
        <div class="properties-panel">
          <h3 class="panel-title"><i class="el-icon-setting"></i> 属性编辑</h3>
          <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane label="画布属性" name="canvas">
              <div class="form-group">
                <div class="form-item">
                  <label>宽度</label>
                  <el-input-number v-model="canvasSize.width" :min="320" :max="1920" @change="updateCanvasSize" size="small" controls-position="right" class="custom-input-number"></el-input-number>
                </div>
                <div class="form-item">
                  <label>高度</label>
                  <el-input-number v-model="canvasSize.height" :min="240" :max="1080" @change="updateCanvasSize" size="small" controls-position="right" class="custom-input-number"></el-input-number>
                </div>
                <div class="form-item">
                  <label>背景色</label>
                  <el-color-picker v-model="canvasBackgroundColor" @change="updateCanvasBackground" show-alpha class="custom-color-picker"></el-color-picker>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="组件属性" name="widget" v-if="activeWidget">
              <!-- 根据选中的组件动态显示属性编辑区 -->
              <div class="property-panel">
                <portal-target name="control-target"></portal-target>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import html2canvas from 'html2canvas';

export default {
  name: 'Edit',
  components: {
    // 在实际项目中，这些组件会动态导入
    'text-widget': () => import('../components/widgets/TextWidget.vue'),
    'image-widget': () => import('../components/widgets/ImageWidget.vue'),
    'tellerNo': () => import('../components/widgets/TellerNoWidget.vue'),
    'queueInfo': () => import('../components/widgets/QueueInfoWidget.vue')
  },
  data() {
    return {
      activeTab: 'canvas',
      activeWidget: null,
      selectedWidgets: [], // 多选组件
      canvasSize: {
        width: 800,
        height: 600
      },
      canvasBackgroundColor: '#ffffff',
      widgets: [], // 存储画布上的所有组件
      widgetIdCounter: 0, // 组件ID计数器
      controlTarget: 'control-target',
      // 定义可用的组件类型
      widgetTypes: [
        { type: 'text-widget', name: '文本', icon: 'el-icon-edit-outline' },
        { type: 'image-widget', name: '图片', icon: 'el-icon-picture-outline' },
        { type: 'tellerNo', name: '号码', icon: 'el-icon-s-order' },
        { type: 'queueInfo', name: '队列信息', icon: 'el-icon-s-data' }
      ],
      // 上下文菜单相关
      contextMenuVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      contextMenuTargetWidget: null,
      // 历史记录
      history: [],
      historyIndex: -1,
      maxHistoryLength: 50,
      isShiftKeyPressed: false,
      isKeyMoving: false,
      keyMoveStartPosition: null,
      keyMoveTimer: null,
      propertyPanelClickHandler: null,
      propertyPanelMousedownHandler: null
    }
  },
  computed: {
    ...mapState({
      // 如果有状态需要从vuex中获取
    }),
    
    // 上下文菜单样式
    contextMenuStyle() {
      return {
        left: this.contextMenuPosition.x + 'px',
        top: this.contextMenuPosition.y + 'px'
      };
    }
  },
  watch: {
    // 监听activeWidget变化，更新selectedWidgets
    activeWidget(newVal) {
      if (newVal) {
        // 如果按住Shift键，则添加到多选数组
        if (this.isShiftKeyPressed && !this.selectedWidgets.includes(newVal)) {
          this.selectedWidgets.push(newVal);
        } else if (!this.isShiftKeyPressed) {
          // 如果没按Shift键，则只选中当前组件
          this.selectedWidgets = [newVal];
        }
      } else {
        this.selectedWidgets = [];
      }
    }
  },
  created() {
    // 从本地存储加载上次编辑的内容
    const savedTemplate = this.$getLocal('current_template');
    if (savedTemplate) {
      this.canvasSize = savedTemplate.canvasSize || this.canvasSize;
      this.canvasBackgroundColor = savedTemplate.canvasBackgroundColor || this.canvasBackgroundColor;
      
      // 修复可能存在的旧组件类型名称
      if (savedTemplate.widgets) {
        savedTemplate.widgets.forEach(widget => {
          if (widget.type === 'text') {
            widget.type = 'text-widget';
          } else if (widget.type === 'image') {
            widget.type = 'image-widget';
          }
        });
      }
      
      this.widgets = savedTemplate.widgets || [];
      this.widgetIdCounter = savedTemplate.widgetIdCounter || 0;
    }
  },
  mounted() {
    // 为每个组件设置控制目标
    this.$nextTick(() => {
      this.updateCanvasBackground();
      
      // 添加历史记录初始状态
      this.addHistoryRecord();
      
      // 添加属性面板点击保护
      const propertyPanel = document.querySelector('.sidebar-right');
      if (propertyPanel) {
        // 使用带有参数的箭头函数以便在销毁时正确移除它
        this.propertyPanelClickHandler = (e) => {
          // 检查目标元素
          const target = e.target;
          const isEditable = 
            // 编辑器元素
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' ||
            // Element UI 组件
            target.classList.contains('el-input') ||
            target.classList.contains('el-textarea') ||
            target.classList.contains('el-select') ||
            target.classList.contains('el-slider') ||
            target.classList.contains('el-color-picker') ||
            target.classList.contains('el-dropdown') ||
            target.closest('.el-select-dropdown') ||
            target.closest('.el-dropdown-menu') ||
            target.closest('.el-color-dropdown') ||
            target.closest('.editable-dropdown') ||
            target.closest('.editable-color-picker') ||
            target.closest('.editable-slider') ||
            target.closest('.el-slider__button') ||
            // 下拉菜单元素
            target.classList.contains('el-select-dropdown__item') ||
            target.classList.contains('el-color-dropdown__btn');
          
          // 如果点击的是可编辑元素，允许事件正常传播
          if (isEditable) {
            return;
          }
          
          // 其他情况阻止事件传播
          e.stopPropagation();
        };
        propertyPanel.addEventListener('click', this.propertyPanelClickHandler, true);
        
        // 添加鼠标按下事件监听，仅阻止冒泡
        this.propertyPanelMousedownHandler = (e) => {
          // 对于下拉菜单，颜色选择器等不阻止事件
          const target = e.target;
          const isDropdown = 
            target.classList.contains('el-select') ||
            target.classList.contains('el-color-picker') ||
            target.closest('.el-select') ||
            target.closest('.el-color-picker') ||
            target.classList.contains('el-select-dropdown__item') ||
            target.closest('.el-select-dropdown') ||
            target.closest('.el-color-dropdown');
            
          if (isDropdown) {
            return;
          }
          
          e.stopPropagation();
        };
        propertyPanel.addEventListener('mousedown', this.propertyPanelMousedownHandler, true);
      }
    });
    
    // 添加全局点击事件监听，用于隐藏上下文菜单
    document.addEventListener('click', this.hideContextMenu);
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  },
  beforeDestroy() {
    // 移除全局点击事件监听
    document.removeEventListener('click', this.hideContextMenu);
    
    // 移除键盘事件监听
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    // 移除属性面板点击保护
    const propertyPanel = document.querySelector('.sidebar-right');
    if (propertyPanel) {
      if (this.propertyPanelClickHandler) {
        propertyPanel.removeEventListener('click', this.propertyPanelClickHandler, true);
      }
      if (this.propertyPanelMousedownHandler) {
        propertyPanel.removeEventListener('mousedown', this.propertyPanelMousedownHandler, true);
      }
    }
  },
  methods: {
    ...mapActions([
      // 如果有需要的action
    ]),
    ...mapMutations([
      // 如果有需要的mutation
    ]),
    
    // 更新组件位置信息
    updateWidgetDragInfo(widget, dragInfo, addToHistory = true) {
      const index = this.widgets.findIndex(w => w.id === widget.id);
      if (index !== -1) {
        this.widgets[index].dragInfo = { ...dragInfo };
        // 只有当需要时才添加历史记录（如拖动开始和结束）
        if (addToHistory) {
          this.addHistoryRecord();
        }
      }
    },
    
    // 更新组件状态
    updateWidgetState(widget, state) {
      const index = this.widgets.findIndex(w => w.id === widget.id);
      if (index !== -1) {
        // 使用Vue.set确保状态更改被Vue检测到
        this.$set(this.widgets[index], 'state', { ...state });
        // 添加历史记录
        this.addHistoryRecord();
      }
    },
    
    // 组件拖拽配置
    draggableOptions(item) {
      return {
        enabled: !this.activeWidget || this.activeWidget.id === item.id,
        onDrag: (e, ui) => {
          // 更新组件位置
          item.dragInfo.x = ui.position.left;
          item.dragInfo.y = ui.position.top;
        }
      };
    },
    
    // 组件大小调整配置
    resizableOptions(item) {
      return {
        enabled: this.activeWidget && this.activeWidget.id === item.id,
        minWidth: 50,
        minHeight: 30,
        onResize: (e, ui) => {
          // 更新组件大小
          item.dragInfo.w = ui.size.width;
          item.dragInfo.h = ui.size.height;
        }
      };
    },
    
    // 拖拽开始
    onDragStart(e, type) {
      e.dataTransfer.setData('widgetType', type);
      e.dataTransfer.effectAllowed = 'copy';
    },
    
    // 拖拽经过画布
    onDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.$refs.canvasContainer.classList.add('drag-over');
    },
    
    // 拖拽离开画布
    onDragLeave() {
      this.$refs.canvasContainer.classList.remove('drag-over');
    },
    
    // 拖拽放置到画布
    onDrop(e) {
      e.preventDefault();
      this.$refs.canvasContainer.classList.remove('drag-over');
      const type = e.dataTransfer.getData('widgetType');
      if (!type) return;
      
      // 获取相对于画布的放置位置
      const canvasRect = this.$refs.canvas.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      
      // 创建新组件并添加到画布
      this.addWidgetAt(type, x, y);
    },
    
    // 在指定位置添加组件
    addWidgetAt(type, x, y) {
      // 根据类型设置默认尺寸
      let defaultWidth = 200;
      let defaultHeight = 100;
      
      // 根据组件类型设置不同的默认尺寸
      switch(type) {
        case 'image-widget':
          defaultWidth = 300;
          defaultHeight = 200;
          break;
        case 'tellerNo':
          defaultWidth = 350;
          defaultHeight = 80;
          break;
        case 'queueInfo':
          defaultWidth = 500;
          defaultHeight = 200;
          break;
        case 'text-widget':
        default:
          defaultWidth = 200;
          defaultHeight = 100;
          break;
      }
      
      // 计算居中位置，让鼠标指针位于组件中心
      const centeredX = Math.max(0, x - defaultWidth / 2);
      const centeredY = Math.max(0, y - defaultHeight / 2);
      
      const id = ++this.widgetIdCounter;
      const newWidget = {
        id,
        type,
        isCopied: false,
        dragInfo: {
          x: centeredX,
          y: centeredY,
          w: defaultWidth,
          h: defaultHeight
        },
        state: this.getDefaultState(type),
        zIndex: this.widgets.length + 1
      };
      
      this.widgets.push(newWidget);
      this.selectWidget(newWidget);
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 添加组件到画布（通过点击）
    addWidget(type) {
      // 将组件添加到画布中央
      const x = this.canvasSize.width / 2 - 100;
      const y = this.canvasSize.height / 2 - 50;
      this.addWidgetAt(type, x, y);
    },
    
    // 根据组件类型获取默认状态
    getDefaultState(type) {
      switch (type) {
        case 'text-widget':
          return {
            text: '请输入文本',
            style: {
              color: '#000000',
              fontSize: '16px',
              fontWeight: 'normal',
              textAlign: 'left',
              lineHeight: '1.5',
              fontFamily: 'Arial'
            }
          };
        case 'image-widget':
          return {
            imgSrc: '',
            style: {}
          };
        case 'tellerNo':
          return {
            text: 'A001',
            prefixText: '请',
            suffixText: '号到1号窗口',
            style: {
              display: 'flex',
              alignItems: 'center'
            },
            prefixStyle: {
              color: '#000000',
              fontSize: '24px'
            },
            infixStyle: {
              color: '#ff0000',
              fontSize: '36px',
              fontWeight: 'bold'
            },
            suffixStyle: {
              color: '#000000',
              fontSize: '24px'
            }
          };
        case 'queueInfo':
          return {
            count: 3,
            list: [],
            editFlag: true,
            lineStyle: {
              marginBottom: '10px',
              display: 'flex'
            },
            oneStyle: {
              backgroundColor: '#f5f5f5'
            },
            evenStyle: {
              backgroundColor: '#e8e8e8'
            },
            oddStyle: {
              backgroundColor: '#f0f0f0'
            },
            oneTextStyle: {
              color: '#000000',
              fontSize: '16px',
              marginRight: '5px'
            },
            oneTicketStyle: {
              color: '#ff0000',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '5px'
            },
            oneWinStyle: {
              color: '#0000ff',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '5px'
            },
            evenTextStyle: {
              color: '#000000',
              fontSize: '16px',
              marginRight: '5px'
            },
            evenTicketStyle: {
              color: '#ff0000',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '5px'
            },
            evenWinStyle: {
              color: '#0000ff',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '5px'
            },
            oddTextStyle: {
              color: '#000000',
              fontSize: '16px',
              marginRight: '5px'
            },
            oddTicketStyle: {
              color: '#ff0000',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '5px'
            },
            oddWinStyle: {
              color: '#0000ff',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '5px'
            },
            isHaveAnimation: 2,
            animationStyle: {
              animation: 'blink 1s infinite'
            }
          };
        default:
          return {};
      }
    },
    
    // 选中组件
    selectWidget(widget) {
      // 如果点击同一个组件，重置选中状态，但保持活动状态
      if (this.activeWidget && this.activeWidget.id === widget.id) {
        // 只保持激活状态，不重置
        return;
      }
      
      // 清除所有组件的活动状态
      this.clearAllActiveWidgets();
      
      // 设置新的激活组件
      this.activeWidget = widget;
      this.activeTab = 'widget';
    },
    
    // 清除所有组件的活动状态
    clearAllActiveWidgets() {
      // 先记录当前激活的组件是哪个
      const previousActiveWidget = this.activeWidget;
      
      // 清除状态
      this.activeWidget = null;
      this.activeTab = 'canvas';
      
      // 确保在DOM更新周期后，手动干预组件状态
      if (previousActiveWidget) {
        this.$nextTick(() => {
          this.widgets.forEach(widget => {
            const component = this.$refs[`widget_${widget.id}`];
            if (component && component.length > 0) {
              if (component[0].$refs && component[0].$refs.wrapper) {
                component[0].$refs.wrapper.isActive = false;
                if (component[0].$refs.wrapper.$refs.drag) {
                  // 强制vue-draggable-resizable组件进入非激活状态
                  component[0].$refs.wrapper.$refs.drag.active = false;
                }
              }
            }
          });
        });
      }
    },
    
    // 处理画布点击
    handleCanvasClick(e) {
      // 检查是否点击在属性面板或其子元素上
      const propertiesPanel = document.querySelector('.properties-panel');
      if (propertiesPanel && (propertiesPanel.contains(e.target) || e.target === propertiesPanel)) {
        // 如果点击的是属性面板，不执行任何操作
        e.stopPropagation();
        return;
      }
      
      // 如果点击的是画布背景（而不是组件内部）
      if (e.target === this.$refs.canvas || e.target === this.$refs.canvasContainer) {
        // 清除所有组件的选中状态
        this.clearAllActiveWidgets();
        
        // 隐藏右键菜单
        this.hideContextMenu();
        
        // 强制所有组件进入非激活状态
        this.$nextTick(() => {
          this.widgets.forEach(widget => {
            const component = this.$refs[`widget_${widget.id}`];
            if (component && component.length > 0) {
              component[0].$el.classList.remove('active');
              if (component[0].$refs.drag) {
                component[0].$refs.drag.active = false;
              }
            }
          });
        });
      }
    },
    
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
    
    // 更新画布大小
    updateCanvasSize() {
      this.saveTemplate();
    },
    
    // 更新画布背景
    updateCanvasBackground() {
      if (this.$refs.canvas) {
        this.$refs.canvas.style.backgroundColor = this.canvasBackgroundColor;
      }
    },
    
    // 处理组件拖拽状态变化
    handleDraggableChange(draggable) {
      // 当组件编辑状态变化时（如文本编辑时）需要禁用拖拽
      console.log('拖拽状态变化:', draggable);
    },
    
    // 保存模板
    saveTemplate() {
      const template = {
        canvasSize: this.canvasSize,
        canvasBackgroundColor: this.canvasBackgroundColor,
        widgets: this.widgets,
        widgetIdCounter: this.widgetIdCounter
      };
      
      this.$setLocal('current_template', template);
      this.$message.success('模板保存成功');
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 预览模板
    previewTemplate() {
      // 将当前模板信息存储到会话存储中
      this.$setSession('preview_template', {
        canvasSize: this.canvasSize,
        canvasBackgroundColor: this.canvasBackgroundColor,
        widgets: this.widgets
      });
      
      // 打开预览窗口
      window.open('/screen', '_blank');
    },
    
    // 导出图片
    exportImage() {
      const canvas = this.$refs.canvas;
      
      html2canvas(canvas, {
        useCORS: true,
        scale: 2,
        backgroundColor: this.canvasBackgroundColor
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = '设计_' + new Date().getTime() + '.png';
        link.href = imgData;
        link.click();
      });
    },
    
    // 显示上下文菜单
    showContextMenu(e, widget) {
      this.contextMenuPosition = { x: e.clientX, y: e.clientY };
      this.contextMenuVisible = true;
      this.contextMenuTargetWidget = widget;
      this.selectWidget(widget);
    },
    
    // 隐藏上下文菜单
    hideContextMenu() {
      this.contextMenuVisible = false;
    },
    
    // 复制组件
    copyWidget() {
      if (!this.contextMenuTargetWidget) return;
      
      const originalWidget = this.contextMenuTargetWidget;
      const id = ++this.widgetIdCounter;
      
      // 深拷贝组件数据
      const newWidget = JSON.parse(JSON.stringify(originalWidget));
      newWidget.id = id;
      newWidget.dragInfo = {
        ...newWidget.dragInfo,
        x: newWidget.dragInfo.x + 20,
        y: newWidget.dragInfo.y + 20
      };
      newWidget.isCopied = true;
      newWidget.zIndex = this.widgets.length + 1;
      
      this.widgets.push(newWidget);
      this.selectWidget(newWidget);
      this.hideContextMenu();
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 删除组件
    deleteWidget() {
      if (!this.contextMenuTargetWidget) return;
      
      const index = this.widgets.findIndex(w => w.id === this.contextMenuTargetWidget.id);
      if (index !== -1) {
        this.widgets.splice(index, 1);
      }
      
      if (this.activeWidget && this.activeWidget.id === this.contextMenuTargetWidget.id) {
        this.activeWidget = null;
        this.activeTab = 'canvas';
      }
      
      this.hideContextMenu();
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 将组件置于顶层
    bringToFront() {
      if (!this.contextMenuTargetWidget) return;
      
      const maxZIndex = Math.max(...this.widgets.map(w => w.zIndex));
      this.contextMenuTargetWidget.zIndex = maxZIndex + 1;
      
      this.hideContextMenu();
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 将组件置于底层
    sendToBack() {
      if (!this.contextMenuTargetWidget) return;
      
      const minZIndex = Math.min(...this.widgets.map(w => w.zIndex));
      this.contextMenuTargetWidget.zIndex = minZIndex - 1;
      
      this.hideContextMenu();
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 处理键盘快捷键
    handleKeyDown(e) {
      // 记录Shift键状态
      this.isShiftKeyPressed = e.shiftKey;
      
      // 当前有输入框聚焦时不处理快捷键
      if (document.activeElement.tagName === 'INPUT' || 
          document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      
      // Ctrl+C: 复制选中组件
      if (e.ctrlKey && e.key === 'c') {
        if (this.activeWidget) {
          this.contextMenuTargetWidget = this.activeWidget;
          this.copyWidget();
        }
      }
      
      // Ctrl+V: 粘贴组件（未实现剪贴板功能，暂不添加）
      
      // Delete: 删除选中组件
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.activeWidget) {
          this.contextMenuTargetWidget = this.activeWidget;
          this.deleteWidget();
        }
      }
      
      // Ctrl+Z: 撤销
      if (e.ctrlKey && e.key === 'z') {
        this.undo();
        e.preventDefault();
      }
      
      // Ctrl+Y: 重做
      if (e.ctrlKey && e.key === 'y') {
        this.redo();
        e.preventDefault();
      }
      
      // Esc: 取消选择
      if (e.key === 'Escape') {
        this.activeWidget = null;
        this.activeTab = 'canvas';
        this.contextMenuVisible = false;
      }
      
      // 方向键: 移动选中组件
      if (this.activeWidget && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const step = e.shiftKey ? 10 : 1; // Shift+方向键移动10px，否则移动1px
        
        // 首次按下方向键时，记录历史起点
        if (!this.isKeyMoving) {
          this.isKeyMoving = true;
          this.keyMoveStartPosition = { ...this.activeWidget.dragInfo };
        }
        
        switch (e.key) {
          case 'ArrowUp':
            this.activeWidget.dragInfo.y = Math.max(0, this.activeWidget.dragInfo.y - step);
            break;
          case 'ArrowDown':
            this.activeWidget.dragInfo.y += step;
            break;
          case 'ArrowLeft':
            this.activeWidget.dragInfo.x = Math.max(0, this.activeWidget.dragInfo.x - step);
            break;
          case 'ArrowRight':
            this.activeWidget.dragInfo.x += step;
            break;
        }
        
        // 阻止事件冒泡
        e.preventDefault();
        
        // 设置一个延时器，在键盘操作结束后记录历史终点
        clearTimeout(this.keyMoveTimer);
        this.keyMoveTimer = setTimeout(() => {
          if (this.isKeyMoving) {
            this.isKeyMoving = false;
            this.addHistoryRecord();
          }
        }, 500);
      }
    },
    
    // 处理键盘按键释放
    handleKeyUp(e) {
      if (e.key === 'Shift') {
        this.isShiftKeyPressed = false;
      }
      
      // 方向键释放时，如果当前正在移动组件，则记录历史记录
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && this.isKeyMoving) {
        this.isKeyMoving = false;
        clearTimeout(this.keyMoveTimer);
        this.addHistoryRecord();
      }
    },
    
    // 添加历史记录
    addHistoryRecord() {
      // 创建当前状态的快照
      const snapshot = {
        widgets: JSON.parse(JSON.stringify(this.widgets)), // 确保深拷贝
        canvasSize: { ...this.canvasSize },
        canvasBackgroundColor: this.canvasBackgroundColor,
        widgetIdCounter: this.widgetIdCounter
      };
      
      // 如果历史记录中有前进记录，则清除
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      
      // 添加新记录
      this.history.push(snapshot);
      this.historyIndex = this.history.length - 1;
      
      // 限制历史记录长度
      if (this.history.length > this.maxHistoryLength) {
        this.history.shift();
        this.historyIndex--;
      }
    },
    
    // 撤销
    undo() {
      if (this.historyIndex <= 0) return;
      
      this.historyIndex--;
      this.restoreFromHistory();
    },
    
    // 重做
    redo() {
      if (this.historyIndex >= this.history.length - 1) return;
      
      this.historyIndex++;
      this.restoreFromHistory();
    },
    
    // 从历史记录恢复
    restoreFromHistory() {
      const snapshot = this.history[this.historyIndex];
      if (!snapshot) return;
      
      this.widgets = JSON.parse(JSON.stringify(snapshot.widgets)); // 确保深拷贝
      this.canvasSize = { ...snapshot.canvasSize };
      this.canvasBackgroundColor = snapshot.canvasBackgroundColor;
      this.widgetIdCounter = snapshot.widgetIdCounter;
      
      // 如果当前选中的组件被删除，则取消选择
      if (this.activeWidget && !this.widgets.find(w => w.id === this.activeWidget.id)) {
        this.activeWidget = null;
        this.activeTab = 'canvas';
      }
    },
    
    // 快速复制当前选中组件
    quickCopy() {
      if (this.activeWidget) {
        this.contextMenuTargetWidget = this.activeWidget;
        this.copyWidget();
      }
    },
    
    // 快速删除当前选中组件
    quickDelete() {
      if (this.activeWidget) {
        this.contextMenuTargetWidget = this.activeWidget;
        this.deleteWidget();
      }
    },
    
    // 快速置顶当前选中组件
    quickBringToFront() {
      if (this.activeWidget) {
        this.contextMenuTargetWidget = this.activeWidget;
        this.bringToFront();
      }
    },
    
    // 快速置底当前选中组件
    quickSendToBack() {
      if (this.activeWidget) {
        this.contextMenuTargetWidget = this.activeWidget;
        this.sendToBack();
      }
    },
    
    // 对齐组件
    alignWidgets(alignType) {
      if (this.selectedWidgets.length <= 1) return;
      
      // 获取参考组件（第一个选中的组件）
      const referenceWidget = this.selectedWidgets[0];
      
      // 根据对齐类型计算目标位置
      this.selectedWidgets.slice(1).forEach(widget => {
        switch(alignType) {
          case 'left':
            widget.dragInfo.x = referenceWidget.dragInfo.x;
            break;
          case 'centerX':
            widget.dragInfo.x = referenceWidget.dragInfo.x + 
              (referenceWidget.dragInfo.w - widget.dragInfo.w) / 2;
            break;
          case 'right':
            widget.dragInfo.x = referenceWidget.dragInfo.x + 
              (referenceWidget.dragInfo.w - widget.dragInfo.w);
            break;
          case 'top':
            widget.dragInfo.y = referenceWidget.dragInfo.y;
            break;
          case 'centerY':
            widget.dragInfo.y = referenceWidget.dragInfo.y + 
              (referenceWidget.dragInfo.h - widget.dragInfo.h) / 2;
            break;
          case 'bottom':
            widget.dragInfo.y = referenceWidget.dragInfo.y + 
              (referenceWidget.dragInfo.h - widget.dragInfo.h);
            break;
        }
      });
      
      // 添加历史记录
      this.addHistoryRecord();
    },
    
    // 判断组件是否被选中（用于多选）
    isWidgetSelected(widget) {
      return this.selectedWidgets.includes(widget);
    }
  }
}
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  color: #2c3e50;
  background-color: #f9f9f9;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.editor-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.editor-header .logo h2 {
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 20px;
}

.editor-header .logo h2 i {
  margin-right: 12px;
  font-size: 24px;
  color: #3498db;
}

.editor-header .actions {
  display: flex;
  gap: 12px;
}

.editor-header .actions .el-button {
  border-radius: 4px;
  padding: 8px 16px;
  transition: all 0.25s ease;
  border: none;
}

.editor-header .actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.editor-header .actions .el-button.el-button--primary {
  background-color: #3498db;
}

.editor-header .actions .el-button.el-button--success {
  background-color: #2ecc71;
}

.editor-header .actions .el-button.el-button--default {
  background-color: #34495e;
  color: white;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar-left, .sidebar-right {
  width: 280px;
  background-color: #fff;
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  z-index: 10;
}

.sidebar-left {
  border-right: 1px solid #ebeef5;
}

.sidebar-right {
  border-left: 1px solid #ebeef5;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  position: relative;
  transition: background-color 0.3s ease;
}

.canvas-wrapper {
  position: relative;
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.canvas-wrapper:hover {
  box-shadow: 0 5px 24px rgba(0, 0, 0, 0.2);
}

.canvas {
  background-color: #fff;
  position: relative;
  overflow: hidden;
}

.panel-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #303133;
  display: flex;
  align-items: center;
}

.panel-title i {
  margin-right: 8px;
  color: #409EFF;
}

.widgets-panel, .properties-panel {
  padding: 20px;
}

.widget-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.widget-item {
  width: 100px;
  height: 80px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.widget-item:hover {
  transform: translateY(-5px);
  background-color: #f0f7ff;
  border-color: #409EFF;
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.15);
}

.widget-item i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #409EFF;
}

.widget-item span {
  font-size: 13px;
  color: #606266;
}

/* 拖拽时的样式 */
.widget-item:active {
  cursor: grabbing;
  transform: scale(0.95) translateY(0);
  opacity: 0.8;
}

.canvas-container.drag-over {
  background-color: #ecf5ff;
}

.form-group {
  padding: 8px;
  border-radius: 6px;
  background-color: #fafafa;
}

.form-item {
  margin-bottom: 18px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

/* 组件选中状态 */
.active {
  outline: 2px solid #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  z-index: 100 !important;
}

/* 多选状态 */
.selected:not(.active) {
  outline: 2px dashed #409EFF;
  z-index: 99 !important;
}

/* 组件拖拽样式 */
.canvas > * {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.canvas > *:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

/* 拖拽手柄样式 */
.resize-handle {
  background-color: #409EFF !important;
  border: 2px solid #fff;
  border-radius: 50%;
  z-index: 101;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.8;
  transition: all 0.2s ease;
}

.resize-handle:hover {
  transform: scale(1.2);
  opacity: 1;
}

/* 上下文菜单样式 */
.context-menu {
  position: fixed;
  z-index: 9999;
  background-color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 6px 0;
  min-width: 150px;
  animation: fadeIn 0.2s ease;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.context-menu-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
  transition: all 0.15s ease;
}

.context-menu-item:hover {
  background-color: #ecf5ff;
  color: #409EFF;
}

.context-menu-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 5px 0;
}

.context-menu-item i {
  margin-right: 8px;
  font-size: 16px;
}

/* 动画 */
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.toolbar {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-group {
  display: flex;
  align-items: center;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  margin: 0 15px;
  background-color: #ebeef5;
}

.toolbar-btn {
  border: none;
  background: transparent;
  margin-right: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.toolbar-btn:hover:not([disabled]) {
  background-color: #ecf5ff;
  color: #409EFF;
}

.toolbar-btn:active:not([disabled]) {
  transform: translateY(1px);
}

/* 自定义Element UI样式 */
.custom-tabs .el-tabs__item {
  height: 40px;
  line-height: 40px;
}

.custom-input-number.el-input-number {
  width: 100%;
}

.custom-color-picker {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .sidebar-left, .sidebar-right {
    width: 240px;
  }
}

/* 添加滚动条样式 */
.sidebar-left::-webkit-scrollbar,
.sidebar-right::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar-left::-webkit-scrollbar-thumb,
.sidebar-right::-webkit-scrollbar-thumb {
  background: #cfd8dc;
  border-radius: 10px;
}

.sidebar-left::-webkit-scrollbar-thumb:hover,
.sidebar-right::-webkit-scrollbar-thumb:hover {
  background: #b0bec5;
}

.sidebar-left::-webkit-scrollbar-track,
.sidebar-right::-webkit-scrollbar-track {
  background: #f5f5f5;
}

/* 选中和悬浮状态交互效果 */
.widget-item {
  position: relative;
  overflow: hidden;
}

.widget-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.widget-item:hover::after {
  opacity: 1;
}
</style> 