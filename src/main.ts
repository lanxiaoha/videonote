import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import '@/assets/theme/index.css'
import ElementUI from 'element-ui'

import 'vant/lib/index.css';

//@ts-ignore
import Button from 'vant/lib/button'
//@ts-ignore
import Field from 'vant/lib/field';
//@ts-ignore
import Overlay from 'vant/lib/overlay';
//@ts-ignore
import Icon from 'vant/lib/icon';
//@ts-ignore
import Loading from 'vant/lib/loading';
//@ts-ignore
import Toast from 'vant/lib/toast';

Vue.component('van-button', Button);
Vue.component('van-field', Field);
Vue.component('van-overlay', Overlay);
Vue.component('van-icon', Icon);
Vue.component('van-loading', Loading);

Vue.use(ElementUI);

Vue.prototype.$toast = Toast;


// Vue.use(Vant);

Vue.config.productionTip = false;

let bus = new Vue();
Vue.prototype.$bus = bus;

let vue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

