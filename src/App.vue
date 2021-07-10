<template>
	<div id="app">
		<!-- 顶部导航栏 -->
		<div id="header">
			<!-- 侧边栏控制器 -->
			<div id="collapse">
				<i class="el-icon-s-fold" v-show="asideCollapse" @click="asideCollapse = !asideCollapse"></i>
				<i class="el-icon-s-unfold" v-show="!asideCollapse" @click="asideCollapse = !asideCollapse"></i>
			</div>
			<!-- 项目的名称 -->
			<div id="project-title" @click="switchToProjectView" v-show="project.isload">
				<div><i class="el-icon-s-tools"></i></div>
				<div>
					<b>{{ project.name }}</b>
				</div>
			</div>
			<!-- 请求加载等按钮 -->
			<div v-if="isNotShareMode"
				style="margin-left: auto;margin-right: 12px;display: flex;align-items: center;justify-content: end;width: 70%;">
				<div style="width: 50%;" class="mini-screen-mide">
					<el-input :placeholder="$t('FileUrl')" v-model="fileUrl" class="input-with-select">
						<el-button slot="append" :loading="fileUrlLoading" @click="getProjectFromUrl">
							{{ $t('RequestLoad') }}
						</el-button>
					</el-input>
				</div>
				<div class="nav-item mini-screen-mide">
					<el-button @click="$refs.readFile.click()" type="text" icon="el-icon-folder-opened"
						class="nav-item-color">{{ $t('LocalFile') }}</el-button>
					<input type="file" style="display: none" accept=".json,.txt" ref="readFile"
						@change="getProjectFromFile" />
				</div>
				<div class="nav-item" @click="switchToRequestView">
					<el-button type="text" icon="el-icon-link" class="nav-item-color">{{$t('RequestTest')}}</el-button>
				</div>
				<div class="nav-item">
					<a href="/">
						<el-button type="text" icon="el-icon-box" class="nav-item-color">{{$t('GoToConsole')}}
						</el-button>
					</a>
				</div>
			</div>
		</div>
		<el-container>
			<div style="position: fixed;width: 100%;height: 100%;background-color: white;z-index: 8;"
				v-show="dataLoading" v-loading="dataLoading" :element-loading-text="$t('DataLoading')"></div>

			<el-aside width="400px" style="overflow: auto;height: 100vh;" v-show="asideCollapse">
				<div style="height: 65px;"></div>
				<!-- 小屏幕显示加载项目 -->
				<div class="mini-screen-show">
					<div>
						<el-input :placeholder="$t('FileUrl')" v-model="fileUrl" class="input-with-select">
							<el-button slot="append" :loading="fileUrlLoading" @click="getProjectFromUrl">
								{{ $t('RequestLoad') }}
							</el-button>
						</el-input>
					</div>
					<div style="margin-left: 5px;">
						<el-button @click="$refs.readFile.click()" icon="el-icon-folder-opened">{{ $t('LocalFile') }}
						</el-button>
						<input type="file" style="display: none" accept=".json,.txt" ref="readFile"
							@change="getProjectFromFile" />
					</div>
				</div>
				<!-- 接口与分组 -->
				<OamTree :data="groups" :selectHandler="apiSelectHandler" :selectId="selectApiId"
					:emptyText="$t('NoApi')" v-loading="groupsIsLoading" :element-loading-text="$t('LoadingApiGroups')">
				</OamTree>
			</el-aside>
			<el-main style="height: 100vh;overflow-y: auto;">
				<div style="height: 61px;"></div>
				<div>
					<!-- 项目视图 -->
					<div v-show="mainShowMode == 'PROJECT'">
						<OamProjectView ref="projectView" @selectServer="projectSelectServer"
							@addCustomServer="projectAddCustomServer" @addParamterVariable="projectAddParamterVariable"
							@removeParamterVariable="projectRemoveParamterVariable"
							@saveParamterVariable="projectSaveParamterVariable"></OamProjectView>
					</div>
					<!-- 分组视图 -->
					<div v-show="mainShowMode == 'GROUP'">
						<OamGroupView :group="selectGroup"></OamGroupView>
					</div>
					<!-- 请求测试视图 -->
					<div v-show="mainShowMode == 'REQUEST_TEST'">
						<OamRequestTestView :isNotShareMode="isNotShareMode" :sessionToken="sessionToken">
						</OamRequestTestView>
					</div>
					<!-- API视图 -->
					<div v-show="mainShowMode == 'API'">
						<OamApiView :api="selectApi" :isNotShareMode="isNotShareMode" :sessionToken="sessionToken">
						</OamApiView>
					</div>
				</div>
			</el-main>
		</el-container>
	</div>
</template>

<script>
	import OamTree from './components/OamTree.vue';
	import OamProjectView from './components/OamProjectView';
	import OamGroupView from './components/OamGroupView';
	import OamRequestTestView from './components/OamRequestTestView';
	import OamApiView from './components/OamApiView';
	import {
		getParams
	} from './utils/URLParams.js';
	import swaggerConvert from './utils/ConvertSwaggerDocs.js';
	import {
		getProjectAPI,
		getProjectShareAPI
	} from '@/api/Project';
	import axios from 'axios';
	// import qs from 'qs';

	// API服务器地址
	const SERVER_HOST = process.env.VUE_APP_BASE_API;
	// 本地存储的会话的token
	const LS_KEY_SESSION_TOKEN = 'LS_KEY_SESSION_TOKEN';
	// 本地存储的分享账号密码前缀
	const LS_KEY_SHARE_PREFIX = 'LS_SHARE_KEY';
	// 会话存储的选择的分组或API前缀
	const SS_KEY_SHARE_PREFIX = 'SS_SELECT_GA_KEY';
	// 主页显示的类型-项目
	const MAIN_SHOW_MODE_PROJECT = 'PROJECT';

	export default {
		name: 'App',
		components: {
			OamTree,
			OamProjectView,
			OamGroupView,
			OamRequestTestView,
			OamApiView
		},
		data() {
			return {
				/**会话的token*/
				sessionToken: '',
				/**是否折叠侧边栏*/
				asideCollapse: true,
				/**非使用分享模式浏览*/
				isNotShareMode: true,
				/**网络请求的文档URL*/
				fileUrl: '',
				/**网络请求的文档是否正在加载中*/
				fileUrlLoading: false,
				/**资源正在加载中*/
				dataLoading: false,
				/**Main中要显示的内容:PROJECT=项目,GROUP=分组,REQUEST_TEST=请求测试,API=API*/
				mainShowMode: MAIN_SHOW_MODE_PROJECT,
				/**当前加载的项目*/
				project: {
					/**项目是否已经加载*/
					isload: false,
					/**项目的id*/
					projectId: '',
					/**项目名称*/
					name: '',
					/**项目的版本号*/
					versions: '',
					/**项目的简介*/
					description: '',
					/**最后更新时间*/
					lastTime: '',
					/**联系人名称*/
					contactName: '',
					/**联系人信息*/
					contactInfo: '',
					/**拓展文档*/
					externalDocs: {
						description: '',
						url: ''
					},
					/**当前项目选中的服务*/
					selectServer: '',
					/**服务集合*/
					servers: [],
					/**参数变量*/
					parameterVariables: []
				},
				/**存储已经转换好的分组或API数据,格式为:key:{type:0=分组,1=API,loaded:0=数据未初始化,1=数据已经初始化,data={请求数据}}*/
				groupApiDataStore: {
					// key:{
					// 	type:0=分组,1=API,
					// 	data:{分组或API数据}
					// }
				},
				/**接口分组树列表是否正在加载中*/
				groupsIsLoading: false,
				/**接口分组树列表,格式为:{id=分组数据的id,title=分组的名称,show=true=展开,false=收起,apis:[id=API数据的id,title=API的名称]}*/
				groups: [
					// {
					// 	id: 'id-1',
					// 	title: 'title-1',
					// 	show: true=展开,false=收起,
					// 	apis: [
					// 		{
					// 			id: 'id-3',
					// 			title: 'title-3'
					// 		}
					// 	]
					// }
				],
				/**当前选择分组与API的id*/
				selectApiId: '',
				/**当前选中的分组*/
				selectGroup: {
					/*分组的名称*/
					name: null,
					/**分组的简介*/
					summary: null,
					/**分组的描述*/
					description: null,
					/**拓展文档*/
					externalDocs: {
						// url:'拓展文档的URL',
						// description:'拓展文档的描述'
					}
				},
				/**当前选择的API*/
				selectApi: {
					/**选中的服务*/
					selectServer: null,
					/**使用的服务集*/
					servers: [],
					/**接口的名称*/
					title: null,
					/**请求的方法*/
					method: 'get',
					/**请求的path*/
					path: null,
					/**接口的描述*/
					description: null,
					/**接口是否已经过时*/
					deprecated: false,
					/**请求的类型合集*/
					consumes: [],
					/**请求的类型*/
					requestType: '',
					/**请求的参数*/
					parameters: [],
					/**请求的body*/
					body: null,
					/**响应的类型合集*/
					produces: [],
					/**响应的参数*/
					responses: [],
					/**接口描述附加说明*/
					additional: [],
					/**拓展文档*/
					externalDocs: {},
					/**拓展参数*/
					extensions: {},
					/**是否使用代理*/
					proxy: false,
					/**请求结果的切换标签*/
					responseTags: 'format',
					/**请求头信息*/
					requestHenders: {},
					/**响应头信息*/
					responseHeaders: {},
					/**执行请求返回的原始结果*/
					response: {},
					/**是否已经执行了请求*/
					isSxecute: false,
					/**是否正在请求中*/
					executing: false
				}
			};
		},
		created() {
			var pid = getParams('id', window.location.search);
			var sid = getParams('sid', window.location.search);
			var fileUrl = getParams('fileUrl', window.location.search);
			var token = getParams('token', window.location.search);
			if (token != null) {
				this.sessionToken = token;
				localStorage.setItem(LS_KEY_SESSION_TOKEN, token);
				var url = window.location.href.replace('token=' + token, '');
				window.history.pushState({}, 0, url);
			} else {
				this.sessionToken = localStorage.getItem(LS_KEY_SESSION_TOKEN) || '';
			}
			if (pid != null && pid != '') {
				this.project.projectId = pid;
				this.getProject(pid);
			} else if (sid != null && sid != '') {
				this.initProjectShare(sid);
				this.isNotShareMode = false;
			} else if (fileUrl != null && fileUrl != '') {
				this.fileUrl = fileUrl;
				this.getProjectFromUrl();
			}
			this.asideCollapse = document.body.offsetWidth > 768;
			window.onresize = () => {
				this.asideCollapse = document.body.offsetWidth > 768;
			};
		},
		methods: {
			/**
			 * 显示或隐藏数据正在加载中
			 * @param {Boolean} tag
			 */
			showOrHideDataLoading(tag) {
				this.dataLoading = (tag === true);
			},
			/**
			 * 切换到显示项目信息
			 */
			switchToProjectView() {
				this.mainShowMode = MAIN_SHOW_MODE_PROJECT;
				this.selectApiId = '';
				sessionStorage.removeItem(SS_KEY_SHARE_PREFIX + this.project.projectId);
			},
			/**
			 * 切换到请求测试
			 */
			switchToRequestView() {
				this.mainShowMode = 'REQUEST_TEST';
				this.selectApiId = '';
				sessionStorage.removeItem(SS_KEY_SHARE_PREFIX + this.project.projectId);
			},
			/**
			 * 初始化分享项目
			 * @param {String} sid 分享的id
			 * @param {Integer} type 0=第一次输入,1=密码错误提示
			 */
			initProjectShare(sid, type) {
				var pwd = localStorage.getItem(LS_KEY_SHARE_PREFIX + sid);
				if (pwd != null && pwd != '') {
					this.getProjectShare(sid, pwd);
				} else {
					var title;
					if (type == 1) {
						title = this.$t('ViewPasswordIncorrect');
					} else {
						title = this.$t('EnterViewPassword');
					}
					this.$prompt(title, this.$t('Tips'), {
							confirmButtonText: this.$t('Confirm'),
							cancelButtonText: this.$t('Cancel'),
							inputPattern: /^.{4,}$/,
							inputErrorMessage: this.$t('ViewPasswordPattern')
						})
						.then(({
							value
						}) => {
							this.getProjectShare(sid, value);
						})
						.catch(() => {});
				}
			},
			/**
			 * 分享项目加载
			 * @param {String} sid 分享的id
			 * @param {Integer} pwd 分享的密码
			 */
			getProjectShare(sid, pwd) {
				this.showOrHideDataLoading(true);
				getProjectShareAPI(
					sid,
					pwd,
					res => {
						var data = res.data;
						console.log('Loading project share ...');
						console.log(data);
						if (data.code === 200) {
							localStorage.setItem(LS_KEY_SHARE_PREFIX + sid, pwd);
							this.loadDocument(JSON.parse(data.data));
						} else if (data.code === 405) {
							localStorage.removeItem(LS_KEY_SHARE_PREFIX + sid);
							this.$message.error(this.$t('ViewPasswordIncorrect'));
							this.initProjectShare(sid, 1);
						}
						this.showOrHideDataLoading(false);
					},
					err => {
						this.showOrHideDataLoading(false);
						console.log('Loading project list failed:');
						console.log(err);
					}
				);
			},
			/**
			 * 通过Orion的项目id加载项目信息
			 * @param {String} id
			 */
			getProject(id) {
				if (id == null || id == '') {
					return;
				}
				this.showOrHideDataLoading(true);
				getProjectAPI(
					id,
					this.sessionToken,
					res => {
						var data = res.data;
						if (data.code != null && data.code != 200) {
							return;
						}
						this.loadDocument(data);
					},
					err => {
						this.$notify.error({
							title: this.$t('LoadFailed'),
							message: this.$t('LoadFailedTips'),
							position: 'bottom-right'
						});
						console.log(err);
						this.showOrHideDataLoading(false);
					}
				);
			},
			/**
			 * 通过URL加载项目信息
			 */
			getProjectFromUrl() {
				if (this.fileUrl.trim() === '') {
					return;
				}
				this.fileUrlLoading = true;
				this.showOrHideDataLoading(true);
				var urls = this.fileUrl;
				if (urls.charAt(0) == 'P' && urls.charAt(1) == ':') {
					urls = urls.substring(2);
					axios
						.get(SERVER_HOST + '/proxy/project?url=' + urls + '&token=' + this.sessionToken)
						.then(res => {
							this.fileUrlLoading = false;
							this.showOrHideDataLoading(false);
							if (res.data.code == 200) {
								this.loadDocument(JSON.parse(res.data.data));
							} else if (res.data.code == 403) {
								this.$notify.error({
									title: this.$t('RequestProxyFailed'),
									message: this.$t('ResultStatus403'),
									position: 'bottom-right'
								});
							} else {
								this.$notify.error({
									title: this.$t('RequestProxyFailed'),
									message: this.$t('RequestProxyFailedTips'),
									position: 'bottom-right'
								});
								console.log(res);
							}
						})
						.catch(err => {
							this.fileUrlLoading = false;
							this.showOrHideDataLoading(false);
							this.$notify.error({
								title: this.$t('RequestProxyFailed'),
								message: this.$t('RequestProxyFailedTips'),
								position: 'bottom-right'
							});
							console.log(err);
						});
				} else {
					axios
						.get(this.fileUrl)
						.then(res => {
							this.fileUrlLoading = false;
							this.showOrHideDataLoading(false);
							var data = res.data;
							this.loadDocument(data);
						})
						.catch(err => {
							this.fileUrlLoading = false;
							this.showOrHideDataLoading(false);
							this.$notify.error({
								title: this.$t('LoadFailed'),
								message: this.$t('LoadFailedTips'),
								position: 'bottom-right'
							});
							console.log(err);
						});
				}
			},
			/**
			 * 通过本地文件加载项目信息
			 */
			getProjectFromFile() {
				var reader = new FileReader();
				var file = this.$refs.readFile.files[0];
				reader.readAsText(file);
				reader.onload = res => {
					try {
						this.loadDocument(JSON.parse(res.target.result));
					} catch (err) {
						this.$notify.error({
							title: this.$t('LoadFailed'),
							message: this.$t('LoadFailedTips'),
							position: 'bottom-right'
						});
						console.log(err);
					}
				};
			},
			/**
			 * 加载接口文档
			 * @param {Object} data
			 */
			loadDocument(data) {
				if (data == null) {
					this.showOrHideDataLoading(false);
					return;
				}
				//获取数据版本
				var openapi = data.openapi;
				var swagger = data.swagger;
				try {
					if (openapi != null && openapi.startsWith('3.')) {
						var o2oData = swaggerConvert(data);
						if (o2oData == null) {
							this.$message.error(this.$t('loadFailedDocumentIsInvalid'));
							return;
						}
						console.log('load Open API Project:');
						this.loadProject(o2oData);
					} else if (swagger != null && swagger.startsWith('2.')) {
						var s2oData = swaggerConvert(data);
						if (s2oData == null) {
							this.$message.error(this.$t('loadFailedDocumentIsInvalid'));
							return;
						}
						console.log('load Swagger Project:');
						this.loadProject(s2oData);
					} else {
						console.log('load Orion Project:');
						this.loadProject(data);
					}
				} catch (err) {
					this.projectLoading = false;
					this.$message.error(this.$t('LoadFailedTips'));
					console.log(err);
				}
				this.showOrHideDataLoading(false);
			},
			/**
			 * 加载项目信息
			 *
			 * @param {Object} data
			 */
			loadProject(data) {
				console.log(data);
				if (data == null || data == '' || '{}' == JSON.stringify(data)) {
					this.showOrHideDataLoading(false);
					return;
				}
				this.showOrHideDataLoading(true);
				//清除历史数据
				this.project = {};
				if (localStorage.getItem(data.key) != null && localStorage.getItem(data.key) != '') {
					try {
						this.project.parameterVariables = JSON.parse(localStorage.getItem(data.key));
					} catch (err) {
						console.log('init Parameter variables failed:');
						console.log(err);
					}
				} else {
					this.project.parameterVariables = [];
				}
				document.title = data.name;
				this.project.isload = true;
				this.project.key = data.key;
				this.project.projectId = data.key;
				this.project.name = data.name;
				this.project.versions = data.versions;
				this.project.description = data.description;
				if ((data.servers == null || data.servers == '') && (data.schemes != null && data.schemes != '')) {
					this.project.schemes = data.schemes;
					var servers = [];
					for (var i = 0; i < data.schemes.length; i++) {
						var scheme = data.schemes[i];
						var bp = data.basePath == null ? '' : data.basePath;
						var server = {
							url: scheme + '://' + data.host + bp,
							description: ''
						};
						servers.push(server);
					}
					this.project.servers = servers;
				} else {
					this.project.servers = data.servers;
				}
				if (this.project.servers == null && data.content == null) {
					this.$notify({
						title: this.$t('Tips'),
						message: this.$t('ToadFailedDocumentIsInvalid'),
						type: 'error',
						position: 'bottom-right',
						duration: 6000
					});
					return;
				}
				if (this.project.servers != null && this.project.servers.length > 0) {
					this.project.selectServer = this.project.servers[0].url;
				}
				this.project.contactName = data.contactName;
				this.project.contactInfo = data.contactInfo;
				this.project.externalDocs = data.externalDocs;
				this.project.lastTime = data.lastTime;
				this.$notify({
					title: this.$t('Tips'),
					message: this.$t('LoadSucceeded'),
					type: 'success',
					position: 'bottom-right',
					duration: 3000
				});
				this.showOrHideDataLoading(false);
				this.mainShowMode = MAIN_SHOW_MODE_PROJECT;
				this.loadGroupsAndApi(data.content);
				this.updateProjectViewData();
			},
			/**
			 * 更新ProjectView子组件的一些信息
			 */
			updateProjectViewData() {
				this.$refs.projectView.updateData(this.project);
			},
			/**
			 * 选择指定项目的服务
			 * @param {Object} server
			 */
			projectSelectServer(server) {
				this.project.selectServer = server;
				this.updateProjectViewData();
			},
			/**
			 * 添加自定义主机服务
			 */
			projectAddCustomServer(server) {
				if (server == '') {
					return;
				}
				this.project.servers.push({
					url: server,
					description: ''
				});
				this.project.selectServer = server;
				this.updateProjectViewData();
			},
			/**
			 * 项目参数变量,被OamProjectView通过$emit调用
			 */
			projectAddParamterVariable() {
				this.project.parameterVariables.push({
					in: 'query',
					name: '',
					value: ''
				});
				this.updateProjectViewData();
			},
			/**
			 * 项目删除参数变量,被OamProjectView通过$emit调用
			 * @param {Object} index
			 */
			projectRemoveParamterVariable(index) {
				if (index == null) {
					return;
				}
				this.$confirm(this.$t('RemoveTips'), this.$t('Tips'), {
						confirmButtonText: this.$t('Confirm'),
						cancelButtonText: this.$t('Cancel'),
						type: 'warning'
					})
					.then(() => {
						this.project.parameterVariables.splice(index, 1);
						this.projectSaveParamterVariable();
					})
					.catch(() => {});
			},
			/**
			 * 项目保存变量,被OamProjectView通过$emit调用
			 */
			projectSaveParamterVariable() {
				if (this.project.projectId == null || this.project.projectId == '') {
					return;
				}
				var pvs = [];
				for (var i = 0; i < this.project.parameterVariables.length; i++) {
					var pv = this.project.parameterVariables[i];
					if (pv.name == '' || pv.value == '') {
						continue;
					}
					pvs.push(pv);
				}
				localStorage.setItem(this.project.projectId, JSON.stringify(pvs));
				this.$message.success(this.$t('Completed'));
				this.updateProjectViewData();
			},
			/**
			 * 分组列表
			 * @param {Object} data
			 */
			loadGroupsAndApi(data) {
				//清除历史数据
				this.groups = [];
				this.groupApiDataStore = {};
				this.groupsIsLoading = true;
				if (data == null || data.length == 0) {
					console.log('group is empty!');
					this.groupsIsLoading = false;
					return;
				}
				for (let i = 0; i < data.length; i++) {
					let gid = data[i].groupId || 'group_key_' + i;
					let apis = [];
					let items = data[i].apis;
					if (items != null) {
						for (let a = 0; a < items.length; a++) {
							let api = items[a];
							let apiId = api.apiId || 'api_key_' + i + '_' + a;
							apis.push({
								id: apiId,
								title: api.title
							});
							this.groupApiDataStore[apiId] = {
								type: 1,
								loaded: 0,
								data: api
							};
						}
					}
					this.groupApiDataStore[gid] = {
						type: 0,
						loaded: 1,
						data: data[i]
					};
					this.groups.push({
						id: gid,
						title: data[i].name,
						show: true,
						apis: apis
					});
				}
				this.groupsIsLoading = false;
				let sid = sessionStorage.getItem(SS_KEY_SHARE_PREFIX + this.project.projectId);
				if (sid != null && sid != '') {
					this.apiSelectHandler(sid);
				}
			},
			/**
			 * API分组与API选中事件
			 * @param {Object} id
			 */
			apiSelectHandler(id) {
				this.selectApiId = id;
				if (this.selectApiId == '') {
					return;
				}
				var data = this.groupApiDataStore[id];
				console.log('select data:', data);
				if (data.type == 0) {
					this.mainShowMode = 'GROUP';
					this.selectGroup = {};
					this.selectGroup = data.data;
				} else {
					this.mainShowMode = 'API';
					let api = data.data;
					if (data.loaded == 1) {
						this.selectApi = api;
					} else {
						//初始化请求参数变量
						let variables = {};
						if (this.project.parameterVariables != null) {
							for (let i = 0; i < this.project.parameterVariables.length; i++) {
								let pv = this.project.parameterVariables[i];
								variables[pv.in + '-' + pv.name] = pv.value;
								if (pv.in == 'path') {
									data.path = data.path.replace('{' + pv.name + '}', pv.value);
									data.path = data.path.replace('/:' + pv.name, '/' + pv.value);
								}
							}
						}
						//初始化请求类型
						if (api.consumes != null && api.consumes.length > 0) {
							api.requestType = api.consumes[0];
						}
						//初始化请求参数
						let i18nDef = this.$t('Defaults');
						let i18nEnum = this.$t('Enums');
						let i18nMin = this.$t('Min');
						let i18nMax = this.$t('Max');
						let i18nMinLength = this.$t('MinLength');
						let i18nMaxLength = this.$t('MaxLength');
						let i18nPattern = this.$t('Pattern');
						if (api.parameters != null) {
							for (let i = 0; i < api.parameters.length; i++) {
								let param = api.parameters[i];
								param.join = param.required == true || param.required == 'true';
								//默认值
								let defValue = variables[param.in + '-' + param.name];
								let contains = '';
								if (param.default != null && param.default != '') {
									defValue = param.default;
									contains += i18nDef + param.default+'　';
								}
								if (param.def != null && param.def != '') {
									defValue = param.def;
									contains += i18nDef + param.def + '　';
								}
								if (param.value == null || param.value == '') {
									this.$set(param, 'value', defValue);
								}
								if (param.enum != null && param.enum != '') {
									contains += i18nEnum + param.enum + '　';
								}
								if (param.explain != null && param.explain != '') {
									if (param.explain.min != null && param.explain.min != '') {
										contains += i18nMin + param.explain.min + '　';
									}
									if (param.explain.max != null && param.explain.max != '') {
										contains += i18nMax + param.explain.max + '　';
									}
									if (param.explain.items != null && param.explain.items != '') {
										param.items = param.explain.items;
									}
								}
								if (param.pattern != null && param.pattern != '') {
									contains += i18nPattern + param.pattern + '　';
								}
								if (param.enums != null && param.enums != '') {
									contains += i18nEnum + param.enums + '　';
								}
								if (param.minLength != null && param.minLength != '') {
									contains += i18nMinLength + param.minLength + '　';
								}
								if (param.maxLength != null && param.maxLength != '') {
									contains += i18nMaxLength + param.maxLength + '　';
								}
								if (param.minimum != null && param.minimum != '') {
									contains += i18nMin + param.minimum + '　';
								}
								if (param.maximum != null && param.maximum != '') {
									contains += i18nMax + param.maximum + '　';
								}
								if (param.minValue != null && param.minValue != '') {
									contains += i18nMin + param.minValue + '　';
								}
								if (param.maxValue != null && param.maxValue != '') {
									contains += i18nMax + param.maxValue + '　';
								}
								if (param.regex != null && param.regex != '') {
									contains += i18nPattern + param.regex + '　';
								}
								if (contains != '') {
									param.contains = contains;
								}
								this.recursionApiParamDataCreateId(param);
							}
						} else {
							api.parameters = [];
						}
						if (api.responses != null && api.responses.length > 0 && (api.responses[0].status == null || api
								.responses[0].data == null)) {
							api.responses = [{
								status: 200,
								data: api.responses
							}];
						}
						if (api.responses == null) {
							api.responses = [];
						}
						for (var i = 0; i < api.responses.length; i++) {
							var ard = api.responses[i].data;
							if (ard == null) {
								ard = [];
							}
							for (var j = 0; j < ard.length; j++) {
								this.recursionApiParamDataCreateId(ard[j]);
							}
						}
						api.executing = false;
						if (api.selectServer == null) {
							api.selectServer = this.project.selectServer;
						}
						if (api.proxy == null) {
							api.proxy = false;
						}
						if (api.responseTags == null) {
							api.responseTags = 'format';
						}
						if (api.requestHenders == null) {
							api.requestHenders = {};
						}
						if (api.responseHeaders == null) {
							api.responseHeaders = {};
						}
						if (api.response == null) {
							api.response = {};
						}
						api.executeTimeout = null;
						api.servers = this.project.servers;
						data.loaded = 1;
						this.selectApi = api;
					}
					sessionStorage.setItem(SS_KEY_SHARE_PREFIX + this.project.projectId, this.selectApiId);
				}
			},
			/**
			 * 递归给请求与响应的数据创建id
			 * @param {Object} data
			 */
			recursionApiParamDataCreateId(data, level) {
				level = parseInt(level);
				if (isNaN(level) || level < 0) {
					level = 1;
				}
				data.tableRowkey = Math.random();
				data.level = level;
				if (data.items == null) {
					return data;
				}
				for (var i = 0; i < data.items.length; i++) {
					this.recursionApiParamDataCreateId(data.items[i], level + 1);
				}
			}
		}
	};
</script>

<style>
	.el-main {
		padding: 14px !important;
	}

	.el-table__indent {
		padding-left: 0 !important;
	}

	@media screen and (max-width: 768px) {
		#header #collapse {
			display: block !important;
		}

		#header #project-title {
			white-space: normal !important;
		}

		.mini-screen-mide {
			display: none;
		}

		.mini-screen-show {
			display: flex !important;
		}
	}

	.mini-screen-show {
		display: none;
		align-items: center;
		margin-left: 0.3125rem;
	}

	#app {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
	}

	#header {
		position: fixed;
		width: 100%;
		top: 0;
		width: 100%;
		box-shadow: 0 0 1px rgba(0, 0, 0, 0.25);
		transition: background-color 0.3s ease-in-out;
		background-color: #fff;
		height: 60px;
		z-index: 10;
		display: flex;
		align-items: center;
	}

	#header .nav-item {
		padding-left: 20px;
	}

	#header .nav-item-color {
		color: #2c3e50;
	}

	#header #collapse {
		display: none;
		padding-left: 10px;
		font-size: 30px;
	}

	#header #project-title {
		width: 380px;
		padding-left: 8px;
		display: flex;
		cursor: pointer;
		align-items: center;
		white-space: nowrap;
	}
</style>
