<template>
	<div>
		<div class="api-body" :class="['api-body-' + api.method]">
			<!-- API基本信息 -->
			<div class="prem05" v-if="api.deprecated">{{ api.deprecated ? $t('ApiDeprecated') : '' }}</div>
			<div class="api-header" :class="['api-header-' + api.method]" :style="api.deprecated ? 'text-decoration: line-through;' : ''">
				<div class="api-header-item">{{ api.title }}</div>
				<div class="api-header-item">{{ $t('ApiMethod') }}: {{ api.method.toUpperCase() }}</div>
				<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
					<div class="flexCenter" style="margin-right: 10px;">{{ $t('RequestURL') }}:</div>
					<div class="flexCenter" style="width: 86%;">
						<el-input :placeholder="$t('InputHostAndPath')" size="mini" v-model="api.path">
							<el-select v-model="api.selectServer" slot="prepend" :placeholder="$t('SelectOrAdd')" style="width: 170px;" filterable allow-create>
								<el-option v-for="(s, idx) in api.servers" :key="idx" :label="s.url" :value="s.url"></el-option>
							</el-select>
							<el-button slot="append" style="color: #222;" @click="copy">Copy</el-button>
							<el-button slot="append" style="color: #222;" @click="copyPath">CopyPath</el-button>
						</el-input>
					</div>
				</div>
			</div>
			<!-- 接口的描述 -->
			<div class="prem05 background-color-white">
				<div v-html="(api.description||'').replace(/\n/g, '<br>')"></div>
				<div v-for="(addi, index) in api.additional" :key="index">
					<div style="margin-top: 5px;">
						<b>{{ addi.title }}</b>
					</div>
					<div v-html="(addi.description||'').replace(/\n/g, '<br>')"></div>
				</div>
				<div v-if="api.externalDocs" style="margin-top: 0.5rem;">
					<div style="padding-right: 0.5rem;">
						<b>{{ $t('AdditionalDocument') }}:</b>
					</div>
					<div>
						<div v-html="(api.externalDocs.description||'').replace(/\n/g, '<br>')"></div>
						<br />
						<a :href="api.externalDocs.url" style="color: #409EFF;" target="_blank">{{ api.externalDocs.url }}</a>
					</div>
				</div>
			</div>
			<!-- 请求参数 -->
			<div class="api-body-params">
				<div class="api-body-param-header">
					<div style="display: flex; align-items: center;">
						<span>{{ $t('RequestParams') }}</span>
						<span v-if="api.parameters == null || api.parameters.length == 0" style="margin-left: 10px;font-size: 80%;color: #909399;">{{ $t('NotNeed') }}</span>
					</div>
					<div style="display: flex;align-items: first baseline;">
						<span style="margin-right: 10px;">{{ $t('RequestType') }}</span>
						<el-select v-model="api.requestType" size="mini" style="width: 200px;" :placeholder="$t('SelectOrAdd')" filterable allow-create>
							<el-option v-for="(type, idx) in api.consumes" :key="idx" :label="type" :value="type"></el-option>
						</el-select>
					</div>
				</div>
				<!-- 请求的参数 -->
				<div class="api-body-param-path plrrem05">
					<el-table
						v-if="api.parameters && api.parameters.length > 0"
						ref="requestParamsTable"
						:data="api.parameters"
						row-key="tableRowkey"
						default-expand-all
						:tree-props="{ children: 'items', hasChildren: 'hasChildren' }"
						tooltip-effect="dark"
						style="width: 100%"
						:empty-text="$t('RequestParamsEmpty')"
					>
						<el-table-column prop="tags" label="" width="30"></el-table-column>
						<el-table-column prop="level" :label="$t('Level')" width="50"></el-table-column>
						<el-table-column prop="join" :label="$t('ParamsJoin')" width="50" align="center">
							<template slot-scope="scope">
								<el-checkbox
									v-if="scope.row.join != null"
									v-model="scope.row.join"
									:id="'api-parameters-join-' + scope.$index"
									@click.native.prevent="changeCheckBoxSelect('api-parameters-join-' + scope.$index, scope.row)"
								></el-checkbox>
							</template>
						</el-table-column>
						<el-table-column prop="required" :label="$t('ParamsRequired')" width="50">
							<template slot-scope="scope" v-if="scope.row.required != null">
								{{ scope.row.required == true || scope.row.required == 'true' ? $t('TheTrue') : $t('TheFalse') }}
							</template>
						</el-table-column>
						<el-table-column prop="in" :label="$t('ParamsPosition')" width="100"></el-table-column>
						<el-table-column prop="type" :label="$t('ParamsType')" width="100"></el-table-column>
						<el-table-column prop="name" :label="$t('ParamsName')" min-width="100"></el-table-column>
						<el-table-column prop="value" :label="$t('ParamsValue')" min-width="200">
							<template slot-scope="scope">
								<el-input
									v-if="scope.row.level == 1"
									type="textarea"
									:autosize="{ minRows: 1, maxRows: 3 }"
									:placeholder="$t('InputParamsValue')"
									v-model="scope.row.value"
									@blur="paramsBlurHandler(scope.row)"
								></el-input>
							</template>
						</el-table-column>
						<el-table-column :label="$t('ParamsDescription')" min-width="250">
							<template slot-scope="scope">
								<div v-html="(scope.row.description||'').replace(/\n/g, '<br>')"></div>
								<div v-if="scope.row.contains != ''" v-html="scope.row.contains"></div>
							</template>
						</el-table-column>
					</el-table>
					<div style="padding-top: 0.5rem;"><el-input v-model="api.body" v-show="api.body!=null" type="textarea" :autosize="{ minRows: 2, maxRows: 10 }" :placeholder="$t('RequestBody')"></el-input></div>
				</div>
				<!-- 响应数据 -->
				<div class="api-body-result">
					<div v-for="(item, idx) in api.responses" :key="idx">
						<div class="api-body-result-header">
							<div style="display: flex;">{{ $t('ResponseStatusCode') }}: {{ item.status }} - {{ item.msg }}</div>
						</div>
						<div class="plrrem05">
							<div v-if="item.schema" style="border: 1px solid #EBEEF5;"><json-viewer :expand-depth="10" :value="item.schema" /></div>
							<div v-show="item.data && item.data.length > 0">
								<el-table :data="item.data" row-key="tableRowkey" border default-expand-all :tree-props="{ children: 'items', hasChildren: 'hasChildren' }">
									<el-table-column prop="in" :label="$t('ParamsPosition')" width="150" align="right"></el-table-column>
									<el-table-column prop="type" :label="$t('ParamsType')" width="120" align="right"></el-table-column>
									<el-table-column prop="name" :label="$t('ParamsName')" width="200"></el-table-column>
									<el-table-column :label="$t('ParamsDescription')">
										<template slot-scope="scope">
											<div v-html="(scope.row.description||'').replace(/\n/g, '<br>')"></div>
										</template>
									</el-table-column>
								</el-table>
							</div>
						</div>
					</div>
				</div>
				<!-- 执行结果的标题 -->
				<div class="api-body-response-header">
					<div style="display: flex;align-items: first baseline;">
						<span v-show="api.isSxecute">{{ $t('ResponseResult') }}</span>
					</div>
					<div style="display: flex;flex-wrap: wrap;align-items: center;">
						<div style="margin-right: 0.7rem;" v-if="isNotShareMode">
							<el-checkbox v-model="api.proxy">{{ $t('UseProxy') }}</el-checkbox>
						</div>
						<div style="margin-right: 0.7rem;">
							<el-input v-model.number="api.executeTimeout" :placeholder="$t('Timeout')" size="mini" style="width: 80px;"></el-input>
						</div>
						<div>
							<el-button type="primary" @click="execute" :loading="api.executing">{{ api.executing ? $t('Executing') : $t('Execute') }}</el-button>
						</div>
					</div>
				</div>
				<!-- 执行结果的内容 -->
				<div class="api-body-response-body" v-show="api.isSxecute">
					<el-tabs style="width: 100%;" v-model="api.responseTags">
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
import JsonViewer from 'vue-json-viewer';
import axios from 'axios';
import qs from 'qs';
// API服务器地址
const SERVER_HOST = process.env.VUE_APP_BASE_API;
// xml与json转换器
const xml2js = require('xml2js');
//xml2js.parseString(xml,function(err, result))将xml转换为json对象
//xmlBuilder.buildObject(obj)将对象转换为xml
const xmlBuilder = new xml2js.Builder();
export default {
	name: 'OamApiView',
	components: {
		JsonViewer
	},
	props: {
		/**API信息*/
		api: Object,
		/**非使用分享模式浏览*/
		isNotShareMode: Boolean,
		/**回话的token*/
		sessionToken: String
	},
	data() {
		return {};
	},
	created() {},
	methods: {
		/**
		 * 复制主机跟path
		 */
		copy() {
			let data = this.api.selectServer + this.api.path;
			console.log('copy:data=' + data);
			this.toCopy(data);
		},
		/**
		 * 复制path
		 */
		copyPath() {
			let data = this.api.path;
			console.log('copy-path:data=' + data);
			this.toCopy(data);
		},
		/**
		 * 进行复制
		 * @param {Object} data
		 */
		toCopy(data) {
			let oInput = document.createElement('input');
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
			let body = this.api.body;
			if (body == null || body == '') {
				return;
			}
			this.api.body = body.replace(new RegExp('{' + data.name + '}', 'g'), data.value);
		},
		execute() {
			let isProxy = this.api.proxy;
			let type = this.api.requestType;
			let method = this.api.method;
			let url = this.api.selectServer + this.api.path;
			let params = this.api.parameters || {};
			if (url == '') {
				this.$notify.error({
					title: this.$t('RequestFailed'),
					message: this.$t('UrlCannotBeEmpty'),
					position: 'bottom-right'
				});
				return;
			}
			this.api.executing=true;
			let header = null;
			let query = null;
			let body = null;
			for (let i = 0; i < params.length; i++) {
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

			let requestData = {};
			let timeout= parseInt(this.api.executeTimeout);
			if(isNaN(timeout)){
				timeout=10000;
			}
			requestData.timeout=timeout;
			requestData.method = method;
			if (isProxy) {
				requestData.url = SERVER_HOST + '/proxy/server';
				requestData.headers = {};
				if (header != null) {
					for (let key in header) {
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
					for (let key in header) {
						this.api.requestHenders[key] = header[key];
					}
				}
			}
			//设置请求参数
			if (query != null) {
				requestData.params = query;
			}
			let useBody = true;
			//请求的主体不为空则覆盖body
			if (this.api.body != null && this.api.body.trim() != '') {
				body = this.api.body.trim();
				useBody = false;
			}
			let contentType = null;
			//设置body参数
			if (body != null) {
				if (type.indexOf('xml') != -1) {
					contentType = 'application/xml';
					if (useBody) {
						try {
							requestData.data = xmlBuilder.buildObject(body);
						} catch (e) {
							this.$notify.error({
								title: this.$t('tips'),
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
						let formData = new FormData();
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

			this.api.executing = true;
			axios(requestData)
				.then(res => {
					this.api.isSxecute = true;
					this.api.executing = false;
					this.api.response = res.data;
					this.api.responseHeaders.status = res.status;
					if (isProxy && header != null) {
						this.api.responseHeaders.tips = this.$t('ResponseHeaderTips');
					} else {
						delete this.api.responseHeaders.tips;
					}
					for (let key in res.headers) {
						this.api.responseHeaders[key] = res.headers[key];
					}
					console.log('request result:');
					console.log(res);
				})
				.catch(err => {
					console.log('request error: ',err);
					this.api.isSxecute = true;
					this.api.executing = false;
					if (err.headers) {
						for (let key in err.headers) {
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
				});
		}
	}
};
</script>

<style scoped>
@import url('style/oam-api-view.css');
</style>
