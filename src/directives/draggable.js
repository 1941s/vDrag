export default {
  bind(el, binding) {
    // 默认设置
    const options = binding.value || {};
    const position = { x: 0, y: 0 };
    const enabled = options.enabled !== false;
    
    // 添加定位样式
    el.style.position = 'absolute';
    el.style.cursor = 'move';
    
    // 保存初始位置
    const saveInitialPosition = () => {
      position.x = el.offsetLeft;
      position.y = el.offsetTop;
    };
    
    saveInitialPosition();
    
    // 拖拽开始
    const onMouseDown = (e) => {
      if (!enabled) return;
      // 排除文本框和按钮等交互元素
      if (e.target.tagName.toLowerCase() === 'input' || 
          e.target.tagName.toLowerCase() === 'textarea' ||
          e.target.tagName.toLowerCase() === 'button' ||
          e.target.tagName.toLowerCase() === 'select') {
        return;
      }
      
      e.preventDefault();
      saveInitialPosition();
      
      // 防止冒泡到父元素
      e.stopPropagation();
      
      // 添加激活样式
      el.classList.add('dragging');
      
      // 相对点击位置与元素位置的偏移
      const offsetX = e.clientX - position.x;
      const offsetY = e.clientY - position.y;
      
      // 拖拽过程中
      const onMouseMove = (e) => {
        // 计算新位置
        const left = Math.max(0, e.clientX - offsetX);
        const top = Math.max(0, e.clientY - offsetY);
        
        // 设置元素位置
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        
        // 回调
        if (options.onDrag) {
          options.onDrag(e, {
            position: { left, top },
            offset: { x: left - position.x, y: top - position.y }
          });
        }
      };
      
      // 拖拽结束
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        // 移除激活样式
        el.classList.remove('dragging');
        
        // 回调
        if (options.onDragEnd) {
          options.onDragEnd();
        }
      };
      
      // 添加事件监听
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    // 保存监听器引用
    el._dragMouseDown = onMouseDown;
    
    // 添加事件监听
    el.addEventListener('mousedown', onMouseDown);
    
    // 触摸设备支持
    el.addEventListener('touchstart', (e) => {
      if (!enabled) return;
      
      const touch = e.touches[0];
      saveInitialPosition();
      
      // 相对点击位置与元素位置的偏移
      const offsetX = touch.clientX - position.x;
      const offsetY = touch.clientY - position.y;
      
      const onTouchMove = (e) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          
          // 计算新位置
          const left = Math.max(0, touch.clientX - offsetX);
          const top = Math.max(0, touch.clientY - offsetY);
          
          // 设置元素位置
          el.style.left = `${left}px`;
          el.style.top = `${top}px`;
          
          // 回调
          if (options.onDrag) {
            options.onDrag(e, {
              position: { left, top },
              offset: { x: left - position.x, y: top - position.y }
            });
          }
        }
      };
      
      const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        
        // 回调
        if (options.onDragEnd) {
          options.onDragEnd();
        }
      };
      
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
      
      e.preventDefault();
    });
  },
  
  update(el, binding) {
    // 更新选项
    const options = binding.value || {};
    const enabled = options.enabled !== false;
    
    // 更新启用状态
    el._dragEnabled = enabled;
    
    // 更新鼠标样式
    el.style.cursor = enabled ? 'move' : 'default';
  },
  
  unbind(el) {
    // 移除事件监听
    el.removeEventListener('mousedown', el._dragMouseDown);
    delete el._dragMouseDown;
  }
}; 