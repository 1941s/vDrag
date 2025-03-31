export default {
  bind(el, binding) {
    // 默认设置
    const options = binding.value || {};
    const enabled = options.enabled !== false;
    const minWidth = options.minWidth || 20;
    const minHeight = options.minHeight || 20;
    
    // 创建调整手柄
    const createHandles = () => {
      const positions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
      const handles = {};
      
      // 处理点击手柄开始调整大小
      const startResize = (e, direction) => {
        if (!enabled) return;
        e.preventDefault();
        e.stopPropagation();
        
        // 添加调整中样式
        el.classList.add('resizing');
        
        // 初始位置和尺寸
        const startX = e.clientX || e.touches[0].clientX;
        const startY = e.clientY || e.touches[0].clientY;
        const startWidth = el.offsetWidth;
        const startHeight = el.offsetHeight;
        const startLeft = el.offsetLeft;
        const startTop = el.offsetTop;
        
        // 移动事件处理
        const move = (e) => {
          const currentX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : startX);
          const currentY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : startY);
          
          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;
          
          // 根据方向计算新尺寸和位置
          if (direction.includes('e')) {
            newWidth = Math.max(minWidth, startWidth + currentX - startX);
          }
          if (direction.includes('s')) {
            newHeight = Math.max(minHeight, startHeight + currentY - startY);
          }
          if (direction.includes('w')) {
            const deltaX = startX - currentX;
            newWidth = Math.max(minWidth, startWidth + deltaX);
            if (newWidth !== startWidth) {
              newLeft = startLeft - (newWidth - startWidth);
            }
          }
          if (direction.includes('n')) {
            const deltaY = startY - currentY;
            newHeight = Math.max(minHeight, startHeight + deltaY);
            if (newHeight !== startHeight) {
              newTop = startTop - (newHeight - startHeight);
            }
          }
          
          // 应用新尺寸和位置
          el.style.width = `${newWidth}px`;
          el.style.height = `${newHeight}px`;
          el.style.left = `${newLeft}px`;
          el.style.top = `${newTop}px`;
          
          // 回调
          if (options.onResize) {
            options.onResize(e, {
              size: { width: newWidth, height: newHeight },
              position: { left: newLeft, top: newTop }
            });
          }
        };
        
        // 结束事件处理
        const end = () => {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('touchmove', move);
          document.removeEventListener('mouseup', end);
          document.removeEventListener('touchend', end);
          
          // 移除调整中样式
          el.classList.remove('resizing');
          
          // 回调
          if (options.onResizeEnd) {
            options.onResizeEnd({
              size: { width: el.offsetWidth, height: el.offsetHeight },
              position: { left: el.offsetLeft, top: el.offsetTop }
            });
          }
        };
        
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move);
        document.addEventListener('mouseup', end);
        document.addEventListener('touchend', end);
      };
      
      // 创建各个方向的手柄
      positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-handle-${pos}`;
        handle.style.position = 'absolute';
        
        // 设置手柄样式和位置
        switch (pos) {
          case 'n':
            handle.style.top = '-4px';
            handle.style.left = '50%';
            handle.style.transform = 'translateX(-50%)';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'n-resize';
            break;
          case 'e':
            handle.style.top = '50%';
            handle.style.right = '-4px';
            handle.style.transform = 'translateY(-50%)';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'e-resize';
            break;
          case 's':
            handle.style.bottom = '-4px';
            handle.style.left = '50%';
            handle.style.transform = 'translateX(-50%)';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 's-resize';
            break;
          case 'w':
            handle.style.top = '50%';
            handle.style.left = '-4px';
            handle.style.transform = 'translateY(-50%)';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'w-resize';
            break;
          case 'ne':
            handle.style.top = '-4px';
            handle.style.right = '-4px';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'ne-resize';
            break;
          case 'se':
            handle.style.bottom = '-4px';
            handle.style.right = '-4px';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'se-resize';
            break;
          case 'sw':
            handle.style.bottom = '-4px';
            handle.style.left = '-4px';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'sw-resize';
            break;
          case 'nw':
            handle.style.top = '-4px';
            handle.style.left = '-4px';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.cursor = 'nw-resize';
            break;
        }
        
        handle.style.backgroundColor = 'white';
        handle.style.border = '1px solid #409EFF';
        handle.style.borderRadius = '50%';
        handle.style.zIndex = '999';
        
        // 添加事件监听
        handle.addEventListener('mousedown', (e) => startResize(e, pos));
        handle.addEventListener('touchstart', (e) => startResize(e, pos));
        
        // 添加到父元素
        el.appendChild(handle);
        handles[pos] = handle;
      });
      
      return handles;
    };
    
    // 创建手柄并保存引用
    el._resizeHandles = createHandles();
    
    // 初始状态更新
    if (!enabled) {
      Object.values(el._resizeHandles).forEach(handle => {
        handle.style.display = 'none';
      });
    }
  },
  
  update(el, binding) {
    // 更新选项
    const options = binding.value || {};
    const enabled = options.enabled !== false;
    
    // 更新手柄可见性
    if (el._resizeHandles) {
      Object.values(el._resizeHandles).forEach(handle => {
        handle.style.display = enabled ? 'block' : 'none';
      });
    }
  },
  
  unbind(el) {
    // 移除手柄
    if (el._resizeHandles) {
      Object.values(el._resizeHandles).forEach(handle => {
        if (handle.parentNode === el) {
          el.removeChild(handle);
        }
      });
      delete el._resizeHandles;
    }
  }
}; 