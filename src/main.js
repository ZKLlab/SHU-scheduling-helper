import Vue from 'vue'
import App from './App'
import {
  Avatar,
  Badge,
  Button,
  Collapse,
  Divider,
  Drawer,
  Icon,
  Input,
  Layout,
  List,
  Menu,
  Modal,
  Popover,
  Popconfirm,
  Select,
  message,
} from 'ant-design-vue'
import store from './store'

Vue.use(Avatar);
Vue.use(Badge);
Vue.use(Button);
Vue.use(Collapse);
Vue.use(Divider);
Vue.use(Drawer);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Layout);
Vue.use(List);
Vue.use(Menu);
Vue.use(Modal);
Vue.use(Popover);
Vue.use(Popconfirm);
Vue.use(Select);

Vue.prototype.$message = message;

// noinspection JSUnusedGlobalSymbols
new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
