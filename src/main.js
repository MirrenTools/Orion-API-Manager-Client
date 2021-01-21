import Vue from 'vue'

import App from './App'

import i18n from './lang'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

Vue.use(Antd);
Vue.config.productionTip = false

new Vue({
	el: '#app',
	i18n,
	render: h => h(App),
})