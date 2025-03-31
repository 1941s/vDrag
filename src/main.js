import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import Directives from './directives'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
import PortalVue from 'portal-vue'

// 注册组件
Vue.component('vue-draggable-resizable', VueDraggableResizable)

// 使用自定义指令
Vue.use(Directives)

// 使用插件
Vue.use(PortalVue)

// 设置中文locale
moment.locale('zh-cn', {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY-MM-DD',
    LL: 'YYYY年MM月DD日',
    LLL: 'YYYY年MM月DD日Ah点mm分',
    LLLL: 'YYYY年MM月DD日ddddAh点mm分',
    l: 'YYYY-M-D',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日dddd HH:mm'
  }
})

// 全局变量和方法
const POSTER_EDITOR_PREFIX = 'POSTER_EDITOR_'

// 本地存储相关方法
const storage = {
  setLocal(key, value) {
    if (!value) localStorage.removeItem(POSTER_EDITOR_PREFIX + key)
    localStorage.setItem(POSTER_EDITOR_PREFIX + key, JSON.stringify(value))
  },
  getLocal(key) {
    return JSON.parse(localStorage.getItem(POSTER_EDITOR_PREFIX + key))
  },
  removeLocal(key) {
    localStorage.removeItem(POSTER_EDITOR_PREFIX + key)
  },
  setSession(key, value) {
    if (!value) sessionStorage.removeItem(POSTER_EDITOR_PREFIX + key)
    sessionStorage.setItem(POSTER_EDITOR_PREFIX + key, JSON.stringify(value))
  },
  getSession(key) {
    return JSON.parse(sessionStorage.getItem(POSTER_EDITOR_PREFIX + key))
  },
  removeSession(key) {
    sessionStorage.removeItem(POSTER_EDITOR_PREFIX + key)
  }
}

// CSS颜色变量
const css = {
  colorTheme: '#1890fe',
  colorThemeD: '#2946a8',
  colorThemeDD: '#263445',
  colorThemeL: '#e2e6f3',
  colorSideBarBg: '#353744',
  colorBg1: '#f5f8fd',
  colorBg2: '#f4f4f4',
  colorSuccess: '#67c23a',
  colorWarn: '#e6a23c',
  colorDanger: '#f56c6c',
  colorError: '#f56c6c',
  colorMoney: '#f60',
  colorText: '#606266',
  colorTextD: '#303133',
  colorTextL: '#909399',
  colorBorder: '#dcdfe6'
}

// 自定义指令
const directives = {
  permission: {
    inserted(el, binding, vnode) {
      try {
        let roles = binding.value || []
        const userRoles = store.getters.user_roles
        
        if (typeof roles === 'string') {
          roles = [roles]
        }
        
        if (!(roles && roles instanceof Array && roles.length > 0)) {
          throw new Error('need roles!')
        }
        
        const permissionRoles = roles
        const hasPermission = userRoles.some(role => permissionRoles.includes(role))
        
        if (!hasPermission) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      } catch (e) {
        console.log(e)
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}

// 全局方法
Vue.prototype.$moment = moment
Vue.prototype.$setLocal = storage.setLocal
Vue.prototype.$getLocal = storage.getLocal
Vue.prototype.$removeLocal = storage.removeLocal
Vue.prototype.$setSession = storage.setSession
Vue.prototype.$getSession = storage.getSession
Vue.prototype.$removeSession = storage.removeSession
Vue.prototype.$css = css
Vue.prototype.$deepCopy = function(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : {}
}
Vue.prototype.$ENV = process.env.NODE_ENV

// 注册全局指令
Object.keys(directives).forEach(key => {
  Vue.directive(key, directives[key])
})

Vue.config.productionTip = false
Vue.use(ElementUI)

// 全局样式
const globalStyle = document.createElement('style');
globalStyle.type = 'text/css';
globalStyle.innerHTML = `
  .el-select-dropdown, .el-dropdown-menu, .el-color-dropdown {
    z-index: 99999 !important; 
  }
  
  .el-select-dropdown .el-scrollbar, 
  .el-select-dropdown .el-select-dropdown__list, 
  .el-select-dropdown .el-select-dropdown__item {
    pointer-events: auto !important;
  }
  
  .el-color-dropdown .el-color-dropdown__main-wrapper, 
  .el-color-dropdown .el-color-dropdown__value, 
  .el-color-dropdown__btn {
    pointer-events: auto !important;
  }
  
  /* 全局增强滑块控件 */
  .el-slider, 
  .el-slider * {
    pointer-events: auto !important;
  }
  
  .el-slider__runway, 
  .el-slider__bar, 
  .el-slider__button,
  .el-slider__button-wrapper {
    pointer-events: auto !important;
    z-index: 999 !important;
  }
  
  .el-slider {
    z-index: 999 !important;
  }
  
  /* 输入数字控件样式 */
  .el-input-number {
    width: 100%;
    z-index: 999 !important;
  }
  
  .el-input-number input,
  .el-input-number .el-input__inner,
  .el-input-number .el-input-number__decrease,
  .el-input-number .el-input-number__increase {
    pointer-events: auto !important;
    z-index: 999 !important;
  }
`;
document.head.appendChild(globalStyle);

// 挂载Vue实例
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app') 