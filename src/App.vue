<template>
	<el-container id="app">
		<!-- 手机导航栏 -->
		<div id="mobile-bar">
			<i :class="[isAsideShow ? 'el-icon-s-fold' : 'el-icon-s-unfold', 'menu-button']" @click="showAside"></i>
			<div class="logo"><a href="/">Orion-API-Manager</a></div>
		</div>
		<!-- 电脑导航栏 -->
		<el-header id="pc-bar">
			<a id="logo" href="/">
				<img src="./assets/logo.png" alt="" />
				<span>Orion-API-Manager</span>
			</a>
			<ul id="nav">
				<li style="width: 450px;">
					<el-input placeholder="文档的URL,代理请求可加上P: 示例:P:https://xxx.xxx/xx" v-model="fileUrl" class="input-with-select">
						<el-button slot="append" @click="getProjectFromUrl">加载</el-button>
					</el-input>
				</li>
				<li>
					<a @click="$refs.readFile.click()">本地加载</a>
					<input type="file" style="display: none" accept=".json,.txt" ref="readFile" @change="getProjectFromFile" />
				</li>
				<li style="text-align: center;"><a @click="drawer = true">项目切换</a></li>
			</ul>
		</el-header>
		<el-drawer title="项目列表" direction="btt" :visible.sync="drawer">
			<div>
				<p v-for="item in projects" :key="item.key">
					<a :href="['./index.html?id=' + item.key]">{{ item.name }}</a>
				</p>
			</div>
		</el-drawer>
		<el-container>
			<!-- 侧边栏 -->
			<el-aside id="aside" width="25%" v-show="isAsideShow">
				<ul id="menu-body">
					<li style="text-align: center;" v-show="!isMainShow"><a @click="drawer = true">项目切换</a></li>
					<div v-if="projectId == null" style="text-align: center;padding-top: 30px;">尚未加载项目</div>
					<div v-if="projectId != null && !apiGroups" style="text-align: center;padding-top: 30px;">尚无API</div>
					<li v-for="(group, gindex) in apiGroups" :key="group.groupId">
						<span :class="{ current: menuCurrent == gindex }" @click="currentActive(gindex, -1)">{{ group.name }}</span>
						<ul v-if="group.apis" class="menu-sub">
							<li
								v-for="(api, aindex) in group.apis"
								:key="api.apiId"
								:class="{ current: menuCurrent == gindex && menuSubCurrent == aindex }"
								@click="currentActive(gindex, aindex)"
							>
								{{ api.title }}
							</li>
						</ul>
					</li>
				</ul>
			</el-aside>
			<!-- 中心栏 -->
			<el-main id="main" v-show="isMainShow">
				<!-- 项目信息 -->
				<div v-show="menuCurrent == -1">
					<el-row :gutter="15" class="mb10px" v-if="project.name">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>项目</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">
							{{ project.name }}
							<span style="color: #666;font-size: 13px;">{{ project.versions }}</span>
						</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.description">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>描述</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.description }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.schemes">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>请求协议</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.schemes }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.host">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>主机地址</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.host }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.basePath">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>根路径</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.basePath }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.externalDocs">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>附加文档</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">
							{{ project.externalDocs.description }}
							<br />
							<a :href="project.externalDocs.url" style="color: #42b983;" target="_blank">{{ project.externalDocs.url }}</a>
						</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.contactName">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>联系人</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.contactName }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.contactInfo">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>联系信息</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.contactInfo }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.lastTime">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>时间</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ project.lastTime }}</el-col>
					</el-row>
				</div>
				<!-- 分组信息 -->
				<div v-show="menuCurrent != -1 && menuSubCurrent == -1">
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>分组名称</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ group.name }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>分组简介</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ group.summary }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth" v-if="group.description"><b>分组描述</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ group.description }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="group.externalDocs">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth"><b>附加文档</b></el-col>
						<el-col :xs="24" :sm="18" :md="20">
							{{ group.externalDocs.description }}
							<br />
							<a :href="group.externalDocs.url" style="color: #42b983;" target="_blank">{{ group.externalDocs.url }}</a>
						</el-col>
					</el-row>
				</div>
				<!-- API的信息 -->
				<div v-show="menuSubCurrent != -1">
					<div class="api-body" :class="['api-body-' + api.method]">
						<div class="prem05" v-if="api.deprecated">{{ api.deprecated ? '该接口已过时!!!' : '' }}</div>
						<div class="api-header" :class="['api-header-' + api.method]" :style="api.deprecated ? 'text-decoration: line-through;' : ''">
							<div class="api-header-item">{{ api.title }}</div>
							<div class="api-header-item">请求方法: {{ api.methodUpperCase }}</div>
							<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
								<div class="flexCenter">请求URL:&nbsp;</div>
								<div style="width: 90%;" class="flexCenter">
									<el-input placeholder="请输入内容" size="mini" v-model="api.url">
										<el-select v-model="api.scheme" slot="prepend" placeholder="请选择" style="width: 6rem;color: #222;">
											<el-option v-for="(se, index) in project.schemes" :key="index" :label="se" :value="se"></el-option>
										</el-select>
										<el-button slot="append" style="color: #222;" @click="copy">Copy</el-button>
										<el-button slot="append" style="color: #222;" @click="copyPath">CopyPath</el-button>
									</el-input>
								</div>
							</div>
						</div>
						<div class="prem05 background-color-white">
							<div v-html="api.description"></div>
							<div v-if="api.externalDocs" style="display: flex; flex-wrap: wrap;margin-top: 0.5rem;">
								<div style="padding-right: 0.5rem;">附加文档</div>
								<div>
									{{ api.externalDocs.description }}
									<br />
									<a :href="api.externalDocs.url" style="color: #42b983;" target="_blank">{{ api.externalDocs.url }}</a>
								</div>
							</div>
						</div>
						<div class="api-body-params" v-if="api.parameters">
							<div class="api-body-param-header">
								<div style="display: flex;">请求参数</div>
								<div style="display: flex;align-items: first baseline;">
									请求类型&nbsp;
									<el-select v-model="api.requestType" size="mini">
										<el-option label="x-www-form-urlencoded" value="x-www-form-urlencoded"></el-option>
										<el-option label="application/json" value="application/json"></el-option>
									</el-select>
								</div>
							</div>
							<div class="api-body-param-path plrrem05">
								<el-table
									ref="requestParamsTable"
									:data="api.parameters"
									row-key="description"
									default-expand-all
									:tree-props="{ children: 'items', hasChildren: 'hasChildren' }"
									tooltip-effect="dark"
									style="width: 100%"
									empty-text="无需请求参数"
								>
									<el-table-column prop="join" label="加入" width="50" align="center">
										<template slot-scope="scope">
											<el-checkbox
												v-if="scope.row.join != null"
												v-model="scope.row.join"
												:id="'api-parameters-join-' + scope.$index"
												@click.native.prevent="changeCheckBoxSelect('api-parameters-join-' + scope.$index, scope.row)"
											></el-checkbox>
										</template>
									</el-table-column>
									<el-table-column prop="required" label="必填" width="50"></el-table-column>
									<el-table-column prop="in" label="参数位置" width="100"></el-table-column>
									<el-table-column prop="type" label="参数类型" width="100"></el-table-column>
									<el-table-column prop="name" label="参数名称" min-width="100"></el-table-column>
									<el-table-column prop="value" label="参数值" min-width="200">
										<template slot-scope="scope">
											<el-input v-if="scope.row.join != null" placeholder="请输入参数值" v-model="scope.row.value"></el-input>
										</template>
									</el-table-column>
									<el-table-column prop="description" label="参数描述" min-width="150" show-overflow-tooltip></el-table-column>
									<el-table-column prop="contains" label="参数说明" min-width="150" show-overflow-tooltip></el-table-column>
								</el-table>
							</div>
						</div>
						<div class="api-body-result">
							<div v-for="item in api.responses">
								<div class="api-body-result-header">
									<div style="display: flex;">返回结果－状态码: {{ item.status }}</div>
									<div style="display: flex;align-items: first baseline;">{{ item.msg }}&nbsp;</div>
								</div>
								<div class="plrrem05">
									<el-table :data="item.data" row-key="description" border default-expand-all :tree-props="{ children: 'items', hasChildren: 'hasChildren' }">
										<el-table-column prop="type" label="参数类型" width="200"></el-table-column>
										<el-table-column prop="name" label="参数名称" width="200"></el-table-column>
										<el-table-column prop="description" label="参数描述"></el-table-column>
									</el-table>
								</div>
							</div>
						</div>
						<div class="api-body-response-header">
							<div style="display: flex;align-items: first baseline;"><span v-show="api.isSxecute">响应结果</span></div>
							<div style="display: flex;flex-wrap: wrap;align-items: center;">
								<div style="margin-right: 0.7rem;"><el-checkbox v-model="api.proxy">使用代理</el-checkbox></div>
								<div>
									<el-button style="background-color: #42b983; color: white;" @click="execute" :loading="api.executing">{{ api.executing ? '请求中...' : '执行请求' }}</el-button>
								</div>
							</div>
						</div>
						<div class="api-body-response-body" v-show="api.isSxecute">
							<el-tabs style="width: 100%;" v-model="api.responseTags">
								<el-tab-pane label="美化数据" name="format"><json-viewer :expand-depth="10" :value="api.response" /></el-tab-pane>
								<el-tab-pane label="原始数据" name="original">
									<pre><code>{{api.response}}</code></pre>
								</el-tab-pane>
								<el-tab-pane label="header信息" name="header" style="color: #409eff;">
									<el-divider content-position="left" v-if="api.requestHenders">请求头信息</el-divider>
									<div v-for="(value, key) in api.requestHenders" style="display: flex;">
										<div>{{ key }}</div>
										<div style="margin: 0 0.5rem;">:</div>
										<div style="color: #ff7de9;">{{ value }}</div>
									</div>
									<el-divider content-position="left" v-if="api.responseHeaders">响应头信息</el-divider>
									<div v-for="(value, key) in api.responseHeaders" style="display: flex;">
										<div>{{ key }}</div>
										<div style="margin: 0 0.5rem;">:</div>
										<div style="color: #ff7de9;">{{ value }}</div>
									</div>
								</el-tab-pane>
							</el-tabs>
						</div>
					</div>
				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
import { getParams } from './utils/URLParams.js';
import JsonViewer from 'vue-json-viewer';
import axios from 'axios';
// API服务器地址
const SERVER_HOST = 'http://localhost:8686';
export default {
	components: { JsonViewer },
	data() {
		return {
			//是否显示侧边栏
			isAsideShow: true,
			//是否显示内容
			isMainShow: true,
			//是否显示项目列表弹窗
			drawer: false,
			//当前选择的分组
			menuCurrent: -1,
			// 当前选择的API
			menuSubCurrent: -1,
			//文档的URL路径
			fileUrl: null,
			//项目的id
			projectId: null,
			// 项目列表
			projects: [],
			//项目的API分组
			apiGroups: [],
			//API分组中的API集合
			apis: [],
			//当前使用的项目
			project: {},
			//当前使用的API分组
			group: {},
			//当前使用的API
			api: {
				// method: '接口的请求方法',
				// methodUpperCase: '接口的请求方法,大写',
				// scheme: '当前选中的协议类型',
				// url: '接口路径host+basePath+path',
				// title: '接口的名称',
				// description: '接口的描述',
				// 附加文档
				// externalDocs: { url: '连接', description: '描述' },
				//请求的content-type类型
				requestType: 'x-www-form-urlencoded',
				//请求的参数
				//--join: 是否选择,
				//--required: 是否必填,
				//--in: 在哪个位置,
				//--type: 数据类型,
				//--name: 参数名称,
				//--contains: 参数约束,
				//--description: 参数描述,
				//--value: 参数值
				parameters: null,
				//响应结果显示
				//--status: 状态码
				//--msg: 描述信息
				//--data: 接口数据
				//----name 名称
				//----description 描述
				//----type 类型
				//----children... 子参数
				responses: null,
				//是否使用代理
				proxy: false,
				//请求结果的切换标签
				responseTags: 'format',
				//请求头信息
				requestHenders: {},
				//响应头信息
				responseHeaders: {},
				//执行请求返回的原始结果
				response: {},
				//是否已经执行了请求
				isSxecute: false,
				//是否正在请求中
				executing: false
			}
		};
	},
	methods: {
		changeCheckBoxSelect(id, row) {
			//修改请求参数是否选中的显示状态
			row.join = !row.join;
			if (row.join) {
				document.getElementById(id).classList.add('is-checked');
				document.getElementById(id).children[0].classList.add('is-checked');
			} else {
				document.getElementById(id).classList.remove('is-checked');
				document.getElementById(id).children[0].classList.remove('is-checked');
			}
		},
		showAside() {
			// 显示侧边栏
			if (this.isAsideShow === false) {
				this.isAsideShow = true;
				this.isMainShow = false;
			} else {
				this.isAsideShow = false;
				this.isMainShow = true;
			}
		},
		closeAside() {
			// 关闭侧边栏
			if (this.isAsideShow === false) {
				this.isAsideShow = true;
				this.isMainShow = false;
			} else {
				this.isAsideShow = false;
				this.isMainShow = true;
			}
		},
		currentActive(parent, sub) {
			// 激活当前选中
			this.menuCurrent = parent;
			this.menuSubCurrent = sub;
			if (this.isMainShow === false) {
				this.isMainShow = true;
				this.isAsideShow = false;
			}
			this.group = this.apiGroups[parent];
			var data = this.group.apis[sub];
			if (data == null) {
				return;
			}
			var api = this.api;
			api.title = data.title;
			api.deprecated = data.deprecated;
			api.method = data.method;
			api.methodUpperCase = data.method.toUpperCase();
			api.scheme = this.project.schemes[0];
			api.url = (this.project.host || '') + (this.project.basePath || '') + data.path;
			api.description = data.description;
			api.externalDocs = data.externalDocs;
			api.parameters = data.parameters;
			api.version = data.version; //新版API还是旧版api,没有version代表旧版的api
			if (api.parameters != null) {
				for (var i = 0; i < api.parameters.length; i++) {
					api.parameters[i].join = api.parameters[i].required == 'true';
					var contains = '';
					if (api.version == null) {
						if (api.parameters[i].default != null && api.parameters[i].default != '') {
							contains += '默认值: ' + api.parameters[i].default + '　';
						}
						if (api.parameters[i].enum != null && api.parameters[i].enum != '') {
							contains += '枚举值: ' + api.parameters[i].enum + '　';
						}
						if (api.parameters[i].explain != null && api.parameters[i].explain != '') {
							if (api.parameters[i].explain.min != null && api.parameters[i].explain.min != '') {
								contains += '最小: ' + api.parameters[i].explain.min + '　';
							}
							if (api.parameters[i].explain.max != null && api.parameters[i].explain.max != '') {
								contains += '最大: ' + api.parameters[i].explain.max + '　';
							}
							if (api.parameters[i].explain.items != null && api.parameters[i].explain.items != '') {
								api.parameters[i].items = api.parameters[i].explain.items;
							}
						}
						if (api.parameters[i].pattern != null && api.parameters[i].pattern != '') {
							contains += '正则表达式: ' + api.parameters[i].pattern + '　';
						}
					} else {
						if (api.parameters[i].def != null && api.parameters[i].def != '') {
							contains += '默认值: ' + api.parameters[i].def + '　';
						}
						if (api.parameters[i].enums != null && api.parameters[i].enums != '') {
							contains += '枚举值: ' + api.parameters[i].enums + '　';
						}
						if (api.parameters[i].minLength != null && api.parameters[i].minLength != '') {
							contains += '最小长度: ' + api.parameters[i].minLength + '　';
						}
						if (api.parameters[i].maxLength != null && api.parameters[i].maxLength != '') {
							contains += '最大长度: ' + api.parameters[i].maxLength + '　';
						}
						if (api.parameters[i].minValue != null && api.parameters[i].minValue != '') {
							contains += '最小值: ' + api.parameters[i].minValue + '　';
						}
						if (api.parameters[i].maxValue != null && api.parameters[i].maxValue != '') {
							contains += '最大值: ' + api.parameters[i].maxValue + '　';
						}
						if (api.parameters[i].regex != null && api.parameters[i].regex != '') {
							contains += '正则表达式: ' + api.parameters[i].regex + '　';
						}
					}
					if (contains != '') {
						api.parameters[i].contains = contains;
					}
				}
			}
			api.responses = data.responses;
			if (api.version == null && api.responses != null) {
				api.responses = [{ status: 200, data: data.responses }];
			}
			api.isSxecute = false;
		},
		loadProjectList() {
			//加载所有项目
			var tis = this;
			axios
				.get(SERVER_HOST + '/project/')
				.then(res => {
					var data = res.data;
					if (data.code === 200) {
						console.log('加载项目列表成功!');
						tis.projects = data.data;
						tis.api.proxy = true;
					} else {
						console.log('加载项目列表失败:');
						console.log(res);
					}
				})
				.catch(err => {
					console.log('请求项目列表失败:');
					console.log(err);
				});
		},
		getProject(id) {
			// 通过id加载项目信息
			if (id == null || id == '') {
				return;
			}
			var tis = this;
			axios
				.get(SERVER_HOST + '/project/getJson/' + id)
				.then(res => {
					var data = res.data;
					tis.loadProject(data);
				})
				.catch(err => {
					tis.$notify.error({
						title: '加载失败',
						message: '加载项目信息失败,更多信息请查看控制台',
						position: 'bottom-right'
					});
					console.log(err);
				});
		},
		getProjectFromUrl() {
			//通过URL加载项目信息
			if (this.fileUrl.trim() === '') {
				return;
			}
			var tis = this;
			var urls = tis.fileUrl;
			if (urls.charAt(0) == 'P' && urls.charAt(1) == ':') {
				urls = urls.substring(2);
				axios
					.get(SERVER_HOST + '/proxy/project?url=' + urls)
					.then(res => {
						if (res.data.code == 200) {
							tis.loadProject(JSON.parse(res.data.data));
						} else {
							tis.$notify.error({
								title: '请求失败',
								message: '代理请求项目信息失败,更多信息请查看控制台',
								position: 'bottom-right'
							});
							console.log(res);
						}
					})
					.catch(err => {
						tis.$notify.error({
							title: '请求失败',
							message: '代理请求项目信息失败,更多信息请查看控制台',
							position: 'bottom-right'
						});
						console.log(err);
					});
			} else {
				axios
					.get(tis.fileUrl)
					.then(res => {
						var data = res.data;
						tis.loadProject(data);
					})
					.catch(err => {
						tis.$notify.error({
							title: '加载失败',
							message: '加载项目信息失败,更多信息请查看控制台',
							position: 'bottom-right'
						});
						console.log(err);
					});
			}
		},
		getProjectFromFile() {
			//通过本地文件加载项目信息
			var reader = new FileReader();
			var file = this.$refs.readFile.files[0];
			reader.readAsText(file);
			var tis = this;
			reader.onload = function(res) {
				try {
					tis.loadProject(JSON.parse(res.target.result));
				} catch (err) {
					tis.$notify.error({
						title: '加载失败',
						message: '加载项目信息失败,更多信息请查看控制台',
						position: 'bottom-right'
					});
					console.log(err);
				}
			};
		},
		loadProject(data) {
			if (data == null || '{}' == JSON.stringify(data)) {
				return;
			}
			//加载项目信息
			this.project.key = data.key;
			this.project.name = data.name;
			this.project.versions = data.versions;
			this.project.description = data.description;
			this.project.host = data.host;
			this.project.basePath = data.basePath;
			this.project.schemes = data.schemes;
			if (data.schemes != null && data.schemes.length > 0) {
				this.project.scheme = data.schemes[0];
			}
			this.project.contactName = data.contactName;
			this.project.contactInfo = data.contactInfo;
			this.project.externalDocs = data.externalDocs;
			this.project.lastTime = data.lastTime;
			this.apiGroups = data.content;
			this.$notify({
				title: '提示',
				message: '项目加载成功!',
				type: 'success',
				position: 'bottom-left',
				duration: 1000
			});
		},
		copy() {
			var data = this.api.scheme + '://' + this.api.url;
			console.log('copy:data=' + data);
			this.toCopy(data);
		},
		copyPath() {
			var data = this.api.url.replace(this.project.host + (this.project.basePath || ''), '');
			console.log('copy-path:data=' + data);
			this.toCopy(data);
		},
		toCopy(data) {
			var oInput = document.createElement('input');
			oInput.value = data;
			document.body.appendChild(oInput);
			oInput.select();
			document.execCommand('Copy');
			this.$notify({
				title: '复制成功!',
				type: 'success',
				position: 'bottom-right'
			});
			oInput.remove();
		},
		execute() {
			var type = this.api.requestType;
			var method = this.api.method;
			var url = this.api.scheme + '://' + this.api.url;
			var isProxy = this.api.proxy;
			var header = null;
			var query = null;
			var body = null;
			var params = this.api.parameters || {};
			for (var i = 0; i < params.length; i++) {
				if (params[i].join) {
					if (params[i].value == null && params[i].in != 'path') {
						continue;
					}
					switch (params[i].in.toLowerCase()) {
						case 'path':
							var reg = new RegExp(':' + params[i].name, 'g');
							url = url.replace(reg, params[i].value || '');
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

			var tis = this;
			tis.api.executing = true;
			var requestData = {};
			requestData.method = method;
			if (isProxy) {
				requestData.url = SERVER_HOST + '/proxy/server';
				requestData.headers = {};
				if (header != null) {
					for (var key in header) {
						tis.api.requestHenders[key] = header[key];
					}
					requestData.headers['x-header'] = JSON.stringify(header);
				}
				requestData.headers['x-url'] = url;
			} else {
				requestData.url = url;
				if (header != null) {
					requestData.headers = header;
					for (var key in header) {
						tis.api.requestHenders[key] = header[key];
					}
				}
			}
			if (query != null) {
				requestData.params = query;
			}

			if (body != null) {
				if (type == 'x-www-form-urlencoded') {
					if (isProxy) {
						if (header == null) {
							header = {};
						}
						requestData.headers['x-type'] = 'x-www-form-urlencoded';
						requestData.data = 'x-wfubody=' + JSON.stringify(body);
					} else {
						var data = '';
						var flag = true;
						for (var key in body) {
							if (flag) {
								flag = false;
							} else {
								data += '&';
							}
							data += key + '=' + body[key];
						}
						requestData.data = data;
					}
				} else {
					requestData.data = body;
				}
			}

			axios(requestData)
				.then(res => {
					tis.api.isSxecute = true;
					tis.api.executing = false;
					tis.api.response = res.data;
					tis.api.responseHeaders.status = res.status;
					if (isProxy && header != null) {
						tis.api.responseHeaders.tips = '使用代理自定义的header可能不显示,你可以打开控制台查看服务器返回的header';
					} else {
						delete tis.api.responseHeaders.tips;
					}
					for (var key in res.headers) {
						tis.api.responseHeaders[key] = res.headers[key];
					}

					console.log('request result:');
					console.log(res);
				})
				.catch(err => {
					tis.api.isSxecute = true;
					tis.api.executing = false;
					if (err.response != null && err.response.status == 502) {
						tis.api.response = err.response.data;
					} else {
						var error = {};
						error.tips = '更多信息请查看控制台!';
						error.error = err;
						tis.api.response = error;
					}
					console.log('request error: ');
					console.log(err);
				});
		}
	},
	mounted() {
		var tis = this;
		tis.isAsideShow = document.body.offsetWidth > 768;
		window.onresize = function() {
			tis.isAsideShow = document.body.offsetWidth > 768;
			tis.isMainShow = true;
		};
		//加载项目列表
		this.loadProjectList();
		//如果id不为空就加载项目加载项目
		this.projectId = getParams('id', window.location.href);
		if (this.project != null && this.projectId !== '') {
			this.getProject(this.projectId);
		}
	}
};
</script>
<style>
/* 修改框架样式 */
.el-drawer__header {
	margin-bottom: 0 !important;
	text-align: center;
}
.el-drawer__body {
	overflow: auto;
	padding: 0 20px;
}
.el-drawer__body a:hover {
	padding-bottom: 2px;
	border-bottom: 2px solid #42b983;
}
.el-form-item {
	margin-bottom: 0 !important;
}
.el-input__inner::placeholder {
	color: #666 !important;
}
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
	background-color: #42b983 !important;
	border-color: #42b983 !important;
}
.el-checkbox__input.is-focus .el-checkbox__inner {
	border-color: #42b983 !important;
}
.el-checkbox__inner:hover {
	border-color: #42b983 !important;
}
.el-checkbox__label {
	color: #42b983 !important;
}
/* 通用样式 */
a {
	text-decoration: none;
	color: #304455;
}
img {
	border: none;
}
.xs-left-sm-rigth {
	text-align: right;
}
.mb10px {
	margin-bottom: 10px;
}
.prem05 {
	padding: 0.5rem;
}
.plrrem05 {
	padding: 0 0.5rem;
}

.background-color-white {
	background-color: white;
}
.flexCenter {
	display: flex;
	align-items: center;
}

@media screen and (max-width: 768px) {
	#mobile-bar {
		display: block !important;
	}
	#pc-bar {
		display: none !important;
	}
	#aside {
		padding-top: 40px !important;
		width: 100% !important;
	}
	#main {
		padding-top: 60px !important;
	}
	.xs-left-sm-rigth {
		text-align: left;
	}
}

/* 手机导航栏 */
#mobile-bar {
	position: fixed;
	display: none;
	top: 0;
	left: 0;
	width: 100%;
	height: 40px;
	background-color: #fff;
	z-index: 20;
	box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
}
#mobile-bar .menu-button {
	position: absolute;
	top: 8px;
	left: 12px;
	font-size: 24px;
	color: #444 !important;
	z-index: 2;
}

#mobile-bar .logo {
	position: absolute;
	top: 10px;
	text-align: center;
	width: 100%;
}

/* 电脑导航栏 */
#pc-bar {
	position: fixed;
	width: 100%;
	top: 0;
	width: 100%;
	box-shadow: 0 0 1px rgba(0, 0, 0, 0.25);
	transition: background-color 0.3s ease-in-out;
	background-color: #fff;
	height: 40px;
	padding: 10px 60px;
	z-index: 10;
}
#logo {
	display: inline-block;
	font-size: 1.5em;
	line-height: 40px;
	color: #273849;
	font-family: 'Dosis', 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
	font-weight: 500;
}
#logo img {
	vertical-align: middle;
	margin-right: 6px;
	width: 40px;
	height: 40px;
}
#nav {
	position: fixed;
}
#nav {
	list-style-type: none;
	margin: 0;
	padding: 0;
	position: absolute;
	right: 30px;
	top: 10px;
	height: 40px;
	line-height: 40px;
}
#nav li {
	display: inline-block;
	position: relative;
	margin: 0 0.6em;
	cursor: pointer;
}
#nav li a:hover {
	padding-bottom: 2px;
	border-bottom: 2px solid #42b983;
}

/* 侧边栏 */
#aside {
	color: #333;
	padding-top: 80px;
	min-width: 300px;
	height: 100vh;
	cursor: pointer;
}
#aside #menu-body {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	list-style-type: none;
}
#aside #menu-body li {
	margin-left: 16px;
	line-height: 2rem;
}
#aside #menu-body span:hover {
	border-bottom: 2px solid #42b983;
	padding-bottom: 2px;
}

#aside #menu-body .current {
	font-weight: 600;
	color: #42b983;
}

#aside #menu-body .menu-sub li:hover {
	color: #42b983;
	border-bottom: 0;
}
#aside #menu-body .menu-sub {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	list-style-type: none;
}

/* 中心 */
#main {
	color: #333;
	padding-top: 80px;
	height: 100vh;
}
.api-body {
	border: 1px solid #3b4151;
	background-color: #f5f7fa;
	margin-bottom: 50px;
}
.api-body .api-header {
	background-color: #3b4151;
	font-size: 1.25rem;
	color: white;
	padding: 0.3125rem 0.625rem;
}
.api-body-get {
	background-color: #ebf3fb;
	border: 1px solid #61affe;
}
.api-body .api-header-get {
	background-color: #61affe;
}
.api-body-post {
	background-color: #e8f6f0;
	border: 1px solid #49cc90;
}
.api-body .api-header-post {
	background-color: #49cc90;
}
.api-body-put {
	background-color: #fbf1e6;
	border: 1px solid #fca130;
}
.api-body .api-header-put {
	background-color: #fca130;
}
.api-body-delete {
	background-color: #fae7e7;
	border: 1px solid #f93e3e;
}
.api-body .api-header-delete {
	background-color: #f93e3e;
}
.api-body-head {
	background-color: #f4e7ff;
	border: 1px solid #9012fe;
}
.api-body .api-header-head {
	background-color: #9012fe;
}

.api-body-options {
	background-color: #e6eef6;
	border: 1px solid #0d5aa7;
}
.api-body .api-header-options {
	background-color: #0d5aa7;
}
.api-body-patch {
	background-color: #edfcf9;
	border: 1px solid #50e3c2;
}
.api-body .api-header-patch {
	background-color: #50e3c2;
}
.api-body-trace {
	background-color: #ffe9e6;
	border: 1px solid #ffa8be;
}
.api-body .api-header-trace {
	background-color: #ffa8be;
}

.api-body-connect {
	background-color: #e6f6f1;
	border: 1px solid #83bb83;
}
.api-body .api-header-connect {
	background-color: #83bb83;
}

.api-body .api-header .api-header-item {
	line-height: 2.5rem;
}

.api-body .api-body-param-header {
	padding: 0.5rem;
	display: flex;
	flex-wrap: wrap;
	align-items: first baseline;
	justify-content: space-between;
}
.api-body .api-body-result-header {
	padding: 0.5rem;
	display: flex;
	flex-wrap: wrap;
	align-items: first baseline;
	justify-content: space-between;
}

.api-body .api-body-response-header {
	padding: 0.5rem;
	display: flex;
	flex-wrap: wrap;
	align-items: first baseline;
	justify-content: space-between;
}
.api-body .api-body-response-body {
	color: white;
	background-color: #18181a;
	padding: 0 0.5rem 0.5rem 0.5rem;
	display: flex;
}
.api-body .api-body-response-body .el-tabs__item {
	color: white;
}
.api-body .api-body-response-body .el-tabs__item.is-active {
	color: #409eff;
}
.api-body .api-body-response-body .el-divider__text {
	background-color: #18181a;
	color: #409eff;
}
.api-body .api-body-response-body .jv-container {
	background-color: #18181a;
}
.api-body .api-body-response-body .jv-container.jv-light {
	color: white;
}
.api-body .api-body-response-body .jv-container.jv-light .jv-item.jv-object {
	color: white;
}
.api-body .api-body-response-body .jv-container.jv-light .jv-item.jv-array {
	color: white;
}
.api-body .api-body-response-body .jv-container.jv-light .jv-item.jv-string {
	color: #ff7de9;
}
.api-body .api-body-response-body .jv-container.jv-light .jv-item.jv-boolean {
	color: gold;
}
.api-body .api-body-response-body .jv-container.jv-light .jv-key {
	color: #409eff;
}
</style>
