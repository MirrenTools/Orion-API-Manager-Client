<template>
	<div>
		<div class="api-body" :class="['api-body-' + api.method]">
			<!-- 自定义请求的URL -->
			<div class="api-header" :class="['api-header-' + api.method]">
				<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
					<div class="flexCenter" style="margin-right: 10px;">{{ $t('RequestURL') }}:</div>
					<div style="width: 86%;" class="flexCenter">
						<el-input :placeholder="$t('InputRequestURL')" size="mini" v-model="api.requestUrl">
							<el-select v-model="api.method" slot="prepend" :placeholder="$t('Choose')" style="width: 6rem;color: #222;" filterable allow-create>
								<el-option value="get">GET</el-option>
								<el-option value="post">POST</el-option>
								<el-option value="options">OPTIONS</el-option>
								<el-option value="head">HEAD</el-option>
								<el-option value="put">PUT</el-option>
								<el-option value="delete">DELETE</el-option>
								<el-option value="trace">TRACE</el-option>
								<el-option value="connect">CONNECT</el-option>
								<el-option value="patch">PATCH</el-option>
								<el-option value="other">OTHER</el-option>
							</el-select>
							<el-button slot="append" style="color: #222;" @click="toCopy(api.requestUrl)">Copy</el-button>
						</el-input>
					</div>
				</div>
			</div>
			<!-- 请求参数 -->
			<div class="api-body-params">
				<div class="api-body-param-header">
					<div style="display: flex;">
						<span>{{ $t('RequestParams') }}</span>
					</div>
					<div style="display: flex;align-items: first baseline;">
						<span style="margin-right: 10px;">{{ $t('RequestType') }}</span>
						<el-select v-model="api.requestType" size="mini" style="width: 200px;" :placeholder="$t('SelectOrAdd')" filterable allow-create>
							<el-option v-for="(type, idx) in api.consumes" :key="idx" :label="type" :value="type"></el-option>
						</el-select>
					</div>
				</div>
				<!-- 自定义请求的参数 -->
				<div style="padding:0 0.5rem;">
					<el-table
						ref="customRequestParamsTable"
						:data="api.customRequestParams"
						row-key="tableRowkey"
						tooltip-effect="dark"
						style="width: 100%"
						:empty-text="$t('RequestParamsEmpty')"
					>
						<el-table-column prop="join" :label="$t('ParamsJoin')" width="50" align="center">
							<template slot-scope="scope">
								<el-checkbox
									v-if="scope.row.join != null"
									v-model="scope.row.join"
									:id="'custom-parameters-join-' + scope.$index"
									@click.native.prevent="changeCheckBoxSelect('custom-parameters-join-' + scope.$index, scope.row)"
								></el-checkbox>
							</template>
						</el-table-column>
						<el-table-column prop="in" :label="$t('ParamsPosition')" min-width="120">
							<template slot-scope="scope">
								<el-select v-model="scope.row.in" @change="paramsBlurHandler(scope.row)">
									<el-option value="query">query</el-option>
									<el-option value="path">path</el-option>
									<el-option value="header">header</el-option>
									<el-option value="body">body</el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column prop="type" :label="$t('ParamsType')" min-width="120">
							<template slot-scope="scope">
								<el-select v-model="scope.row.type">
									<el-option value="string">string</el-option>
									<el-option value="int">int</el-option>
									<el-option value="long">long</el-option>
									<el-option value="float">float</el-option>
									<el-option value="double">double</el-option>
									<el-option value="number">number</el-option>
									<el-option value="boolean">boolean</el-option>
									<el-option value="object">object</el-option>
									<el-option value="array">array</el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column prop="name" :label="$t('ParamsName')" min-width="200">
							<template slot-scope="scope">
								<el-input :placeholder="$t('InputParamsName')" v-model="scope.row.name" @blur="paramsBlurHandler(scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="value" :label="$t('ParamsValue')" min-width="200">
							<template slot-scope="scope">
								<el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" :placeholder="$t('InputParamsValue')" v-model="scope.row.value" @blur="paramsBlurHandler(scope.row)"></el-input>
							</template>
						</el-table-column>
					</el-table>
					<div style="text-align: right;background-color: #FFF;line-height: 50px;padding: 0.5rem;">
						<span class="clearBtn" @click="api.customRequestParams = []">{{ $t('Clear') }}</span>
						<el-button type="primary" size="small" @click="addCustomRequestParams">{{ $t('AddRequestParams') }}</el-button>
						<el-input v-model="parameterItems" style="width: 50px;margin: 0 5px;" size="small"></el-input>
						<span>{{ $t('Item') }}</span>
					</div>
					<div style="padding-top: 0.5rem;"><el-input v-model="api.body" type="textarea" :autosize="{ minRows: 2, maxRows: 10 }" :placeholder="$t('RequestBody')"></el-input></div>
				</div>
				<!-- 执行结果的标题 -->
				<div class="api-body-response-header">
					<div style="display: flex;align-items: first baseline;">
						<span v-show="isSxecute">{{ $t('ResponseResult') }}</span>
					</div>
					<div style="display: flex;flex-wrap: wrap;align-items: center;">
						<div style="margin-right: 0.7rem;" v-if="isNotShareMode">
							<el-checkbox v-model="isProxy">{{ $t('UseProxy') }}</el-checkbox>
						</div>
						<div style="margin-right: 0.7rem;">
							<el-input v-model.number="executeTimeout" :placeholder="$t('Timeout')" size="mini" style="width: 80px;"></el-input>
						</div>
						<div>
							<el-button type="primary" @click="execute" :loading="executing">{{ executing ? $t('Executing') : $t('Execute') }}</el-button>
						</div>
					</div>
				</div>
				<!-- 执行结果的内容 -->
				<div class="api-body-response-body" v-show="isSxecute">
					<el-tabs style="width: 100%;" v-model="responseTags">
						<el-tab-pane :label="$t('BeautifyData')" name="format"><json-viewer :expand-depth="10" :value="api.response" /></el-tab-pane>
						<el-tab-pane :label="$t('OriginalData')" name="original">
							<pre><code>{{api.response}}</code></pre>
						</el-tab-pane>
						<el-tab-pane :label="$t('HeaderInfo')" name="header" style="color: #409eff;">
							<el-divider content-position="left" v-if="api.requestHenders">{{ $t('RequestHeader') }}</el-divider>
							<div v-for="(value, key) in api.requestHenders" :key="key" style="display: flex;">
								<div>{{ key }}</div>
								<div style="margin: 0 0.5rem;">:</div>
								<div style="color: #ff7de9;">{{ value }}</div>
							</div>
							<el-divider content-position="left" v-if="api.responseHeaders">{{ $t('ResponseHeader') }}</el-divider>
							<div v-for="(value, key) in api.responseHeaders" :key="key" style="display: flex;">
								<div>{{ key }}</div>
								<div style="margin: 0 0.5rem;">:</div>
								<div style="color: #ff7de9;">{{ value }}</div>
							</div>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios';
import qs from 'qs';
import JsonViewer from 'vue-json-viewer';
// API服务器地址
const SERVER_HOST = process.env.VUE_APP_BASE_API;
// xml与json转换器
const xml2js = require('xml2js');
//xml2js.parseString(xml,function(err, result))将xml转换为json对象
//xmlBuilder.buildObject(obj)将对象转换为xml
const xmlBuilder = new xml2js.Builder();
export default {
	name: 'OamRequestTestView',
	components: {
		JsonViewer
	},
	props: {
		/**非使用分享模式浏览*/
		isNotShareMode: Boolean,
		/**回话的token*/
		sessionToken: String
	},
	data() {
		return {
			/**请求的基本信息*/
			api: {
				/**默认的请求方法*/
				method: 'get',
				/**请求的URL*/
				requestUrl: '',
				/**请求的类型*/
				requestType: 'x-www-form-urlencoded',
				/**请求类型合集*/
				consumes: ['x-www-form-urlencoded', 'application/json', 'multipart/form-data', 'application/xml'],
				/**自定义请求后台的参数*/
				customRequestParams: [],
				/**自定义请求的body*/
				body: '',
				/**响应参数*/
				response: [],
				/**响应Header*/
				responseHeaders: {}
			},
			/**添加多少项参数*/
			parameterItems: 1,
			/**是否使用代理请求*/
			isProxy: false,
			//是否已经执行了请求
			isSxecute: false,
			//是否正在请求中
			executing: false,
			/**默认请求超时时间*/
			executeTimeout:null,
			//请求结果的切换标签
			responseTags: 'format'
		};
	},
	methods: {
		/**
		 * 复制请求链接
		 */
		toCopy(data) {
			var oInput = document.createElement('input');
			oInput.value = data;
			document.body.appendChild(oInput);
			oInput.select();
			document.execCommand('Copy');
			this.$message.success(this.$t('CopySucceeded'));
			oInput.remove();
		},
		/**
		 * 修改请求参数是否选中的显示状态
		 * @param {Integer} id
		 * @param {Integer} row
		 */
		changeCheckBoxSelect(id, row) {
			row.join = !row.join;
			if (row.join) {
				document.getElementById(id).classList.add('is-checked');
				document.getElementById(id).children[0].classList.add('is-checked');
			} else {
				document.getElementById(id).classList.remove('is-checked');
				document.getElementById(id).children[0].classList.remove('is-checked');
			}
		},
		/**
		 * 请求参数离开后的事件
		 * @param {Object} data
		 */
		paramsBlurHandler(data) {
			if (data.name == '' || data.value == '') {
				return;
			}
			if (data.in != 'body') {
				return;
			}
			var body = this.body;
			if (body == null || body == '') {
				return;
			}
			this.body = body.replace(new RegExp('{' + data.name + '}', 'g'), data.value);
		},
		/**
		 * 添加自定义请求参数
		 */
		addCustomRequestParams() {
			var sums = parseInt(this.parameterItems);
			if (isNaN(sums) || sums < 0) {
				sums = 1;
			}
			for (var i = 0; i < sums; i++) {
				var param = {
					join: true,
					in: 'query',
					type: 'string',
					name: '',
					value: '',
					tableRowkey: Math.random()
				};
				this.api.customRequestParams.push(param);
			}
		},
		/**
		 * 执行请求
		 */
		execute() {
			/**清理响应参数*/
			this.api.response = [];
			this.api.responseHeaders = {};

			var isProxy = this.isProxy;
			var type = this.api.requestType;
			var method = this.api.method;
			var url = this.api.requestUrl;
			var params = this.api.customRequestParams || {};
			if (url == '') {
				this.$notify.error({
					title: this.$t('RequestFailed'),
					message: this.$t('UrlCannotBeEmpty'),
					position: 'bottom-right'
				});
				return;
			}
			var header = null;
			var query = null;
			var body = null;
			for (var i = 0; i < params.length; i++) {
				if (params[i].join) {
					if (params[i].value == null && params[i].in != 'path') {
						continue;
					}
					switch (params[i].in.toLowerCase()) {
						case 'path':
							var reg = new RegExp('{' + params[i].name + '}', 'g');
							url = url.replace(reg, params[i].value || '');
							reg = new RegExp('/:' + params[i].name, 'g');
							url = url.replace(reg, '/' + (params[i].value || ''));
							break;
						case 'header':
							if (header == null) {
								header = {};
							}
							header[params[i].name] = params[i].value;
							break;
						case 'formdata':
							if (body == null) {
								body = {};
							}
							body[params[i].name] = params[i].value;
							break;
						case 'body':
							if (body == null) {
								body = {};
							}
							body[params[i].name] = params[i].value;
							break;
						default:
							if (query == null) {
								query = {};
							}
							query[params[i].name] = params[i].value;
					}
				}
			}

			var requestData = {};
			requestData.timeout=this.executeTimeout||10000;
			requestData.method = method;
			if (isProxy) {
				requestData.url = SERVER_HOST + '/proxy/server';
				requestData.headers = {};
				if (header != null) {
					for (var key in header) {
						this.api.requestHenders[key] = header[key];
					}
					requestData.headers['x-header'] = JSON.stringify(header);
				}
				requestData.headers['x-url'] = url;
				requestData.headers['x-session'] = this.sessionToken;
			} else {
				requestData.url = url;
				if (header != null) {
					requestData.headers = header;
					for (var hkey in header) {
						this.api.requestHenders[hkey] = header[hkey];
					}
				}
			}
			//设置请求参数
			if (query != null) {
				requestData.params = query;
			}
			var useBody = true;
			//请求的主体不为空则覆盖body
			if (this.api.body != null && this.api.body.trim() != '') {
				body = this.api.body.trim();
				useBody = false;
			}
			var contentType = null;
			//设置body参数
			if (body != null) {
				if (type.indexOf('xml') != -1) {
					contentType = 'application/xml';
					if (useBody) {
						try {
							requestData.data = xmlBuilder.buildObject(body);
						} catch (e) {
							this.$notify.error({
								title: this.$t('Tips'),
								message: e,
								position: 'bottom-right'
							});
							return;
						}
					} else {
						requestData.data = body;
					}
				} else if (type.indexOf('urlencoded') != -1) {
					contentType = 'application/x-www-form-urlencoded';
					if (useBody) {
						requestData.data = qs.stringify(body);
					} else {
						requestData.data = body;
					}
				} else if (type.indexOf('form-data') != -1) {
					contentType = 'multipart/form-data';
					if (useBody) {
						var formData = new FormData();
						Object.keys(body).forEach(key => {
							formData.append(key, body[key]);
						});
						requestData.data = formData;
					} else {
						requestData.data = body;
					}
				} else {
					if (type != null && type != '') {
						contentType = type;
					}
					requestData.data = body;
				}
			}
			if (contentType != null) {
				if (requestData.headers == null) {
					requestData.headers = {};
				}
				if (isProxy) {
					requestData.headers['x-type'] = contentType;
				} else {
					requestData.headers['Content-Type'] = contentType;
				}
			}

			this.executing = true;
			axios(requestData)
				.then(res => {
					this.isSxecute = true;
					this.executing = false;
					this.api.response = res.data;
					this.api.responseHeaders.status = res.status;
					if (isProxy && header != null) {
						this.api.responseHeaders.tips = this.$t('ResponseHeaderTips');
					} else {
						delete this.api.responseHeaders.tips;
					}
					for (var key in res.headers) {
						this.api.responseHeaders[key] = res.headers[key];
					}
					console.log('request result:');
					console.log(res);
				})
				.catch(err => {
					this.isSxecute = true;
					this.executing = false;
					if (err.headers) {
						for (var key in err.headers) {
							this.api.responseHeaders[key] = err.headers[key];
						}
					}
					if (err.response != null && err.response.data != null) {
						this.api.response = err.response.data;
					} else {
						let error = {};
						error.tips = this.$t('MoreInfoTips');
						error.error = {
							message:err.message,
							config:err.config
						};
						this.api.response = error;
					}
					console.log('request error: ');
					console.log(err);
				});
		}
	}
};
</script>

<style scoped>
@import url('style/oam-api-view.css');
.clearBtn {
	color: #909399;
	margin-right: 10px;
	font-size: 80%;
	cursor: pointer;
}
.clearBtn:hover {
	color: red;
}
</style>
