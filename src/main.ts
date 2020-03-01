import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vant from 'vant';
import 'vant/lib/index.css';
import '@/assets/theme/index.css'
import ElementUI from 'element-ui'

Vue.use(ElementUI);
Vue.use(Vant);

Vue.config.productionTip = false;

let bus = new Vue();
Vue.prototype.$bus = bus;

let vue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

