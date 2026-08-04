import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import globalComponents from '@/components';
import router from './router';
import store from './store/pinia';
import directive from './directive';
import App from './App.vue';
import Vue3Dragscroll from "vue3-dragscroll";
import AddNode from '@/components/flow/AddNode.vue';
import NodeWrap from '@/components/flow/NodeWrap.vue';
import "@/styles/index.less";
import "virtual:svg-icons-register";
// Styles are imported via arco-plugin. See config/plugin/arcoStyleImport.ts in the directory for details
// 样式通过 arco-plugin 插件导入。详见目录文件 config/plugin/arcoStyleImport.ts
// https://arco.design/docs/designlab/use-theme-package
import '@/assets/style/global.less';

const app = createApp(App);

app.use(ArcoVue, {});
app.use(ArcoVueIcon);

app.use(store);
app.use(router);
app.use(globalComponents);
app.use(directive);

app.use(Vue3Dragscroll);
app.component('AddNode', AddNode);
app.component('NodeWrap', NodeWrap);

// 需在 pinia 初始化后再注册 axios 拦截器（token 从 auth store 读取）
import '@/utils/request';

app.mount('#app');
