import axios from 'axios'
import i18n from '../../lang/index.js'
import {
	MessageBox,
	Message
} from 'element-ui'
// 本地存储的会话的token键
const LS_KEY_SESSION_TOKEN = 'LS_KEY_SESSION_TOKEN';

const request = axios.create({
	baseURL: process.env.VUE_APP_BASE_API,
	timeout: 30000,
});

//响应拦截器
request.interceptors.response.use(res => {
		var code = res.data.code;
		if (code == null) {
			return res;
		}
		if (code == 200) {
			return res;
		} else if (code == 202) {
			Message.success(i18n.t('ResultStatus202'));
			return res;
		} else if (code == 401) {
			MessageBox.confirm(i18n.t('ResultStatus401'), i18n.t('LoginTimeout'), {
				confirmButtonText: i18n.t('Login'),
				type: 'warning'
			}).then(() => {
				location.href = '/console/index.html#/login';
			}).catch(err => {
				window.console.log(err)
				localStorage.removeItem(LS_KEY_SESSION_TOKEN);
			});
			return res;
		} else if (code == 403) {
			MessageBox.confirm(i18n.t('ResultStatus403'), i18n.t('Tips'), {
				confirmButtonText: i18n.t('Login'),
				type: 'warning'
			}).then(() => {
				location.href = '/console/index.html#/login';
			});
			return res;
		} else if (code == 404) {
			Message.error(i18n.t('ResultStatus404'));
			return res;
		} else if (code == 405) {
			return res;
		} else if (code == 412) {
			Message.warning(i18n.t('ResultStatus412'));
			return res;
		} else if (code == 555) {
			Message.error(i18n.t('ResultStatus555'));
			return res;
		} else {
			Message.error(i18n.t('ResultStatus0'));
			return res;
		}
	},
	error => {
		console.log(error)
		return Promise.reject(error);
	});

export default request
