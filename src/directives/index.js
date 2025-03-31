import draggable from './draggable';
import resizable from './resizable';

export default {
  install(Vue) {
    Vue.directive('draggable', draggable);
    Vue.directive('resizable', resizable);
  }
}; 