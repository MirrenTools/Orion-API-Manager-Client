import Vue from 'vue'
import App from './App'


import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import i18n from './lang'
// import router from './router.js'


Vue.config.productionTip = false

Vue.use(ElementUI, {
	i18n: (key, value) => i18n.t(key, value)
})

new Vue({
	el: '#app',
	// router,
	i18n,
	render: h => h(App),
})