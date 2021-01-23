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
			<div id="project-title" @click="switchToProjectView">
				<div><i class="el-icon-s-tools"></i></div>
				<div><b>项目的名称项目的名称项目的名称项目的名称项目的名</b></div>
			</div>
			<!-- 请求加载等按钮 -->
			<div v-if="isNotShareMode" style="margin-left: auto;margin-right: 12px;display: flex;align-items: center;justify-content: end;width: 70%;">
				<div style="width: 50%;" class="mini-screen-mide">
					<el-input :placeholder="$t('FileUrl')" v-model="fileUrl" class="input-with-select">
						<el-button slot="append" :loading="fileUrlLoading">{{ $t('RequestLoad') }}</el-button>
					</el-input>
				</div>
				<div class="nav-item mini-screen-mide">
					<el-button type="text" icon="el-icon-folder-opened" class="nav-item-color">本地加载</el-button>
				</div>
				<div class="nav-item" @click="switchToRequestView">
					<el-button type="text" icon="el-icon-link" class="nav-item-color">请求测试</el-button>
				</div>
				<div class="nav-item">
					<a href="/"><el-button type="text" icon="el-icon-box" class="nav-item-color">进入控制台</el-button></a>
				</div>
			</div>
		</div>
		<el-container>
			<el-aside width="400px" style="overflow: auto;height: 100vh;" v-show="asideCollapse">
				<div style="height: 65px;"></div>
				<OamTree :data="groups" :selectHandler="apiSelectHandler" :selectId="selectApiId"></OamTree>
			</el-aside>
			<el-main style="height: 100vh;overflow-y: auto;">
				<div style="height: 61px;"></div>
				<div>
					<!-- 项目信息 -->
					<div v-show="mainShowMode=='PROJECT'">
						<OamProjectView :project="project"></OamProjectView>
					</div>
					<!-- 项目信息 -->
					<div v-show="mainShowMode=='GROUP'">
						<OamGroupView :group="selectGroup"></OamGroupView>
					</div>
					<!-- 项目信息 -->
					<div v-show="mainShowMode=='REQUEST_TEST'">
						<OamRequestTestView :isNotShareMode="isNotShareMode" :sessionToken="sessionToken"></OamRequestTestView>
					</div>
					<!-- API信息 -->
					<div v-show="mainShowMode=='API'">
						<OamApiView :api="selectAPI" :defaultServer="project.selectServer" :servers="project.servers"></OamApiView>
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
				/**Main中要显示的内容:PROJECT=项目,GROUP=分组,REQUEST_TEST=请求测试,API=API*/
				mainShowMode: 'REQUEST_TEST',
				/**当前加载的项目*/
				project: {
					/**项目的id*/
					projectId: 'projectid',
					/**项目名称*/
					'name': 'test',
					/**项目的版本号*/
					'versions': '1.0.0',
					/**项目的简介*/
					'description': 'test',
					/**最后更新时间*/
					'lastTime': '2021-01-23 03:21:32',
					/**联系人名称*/
					'contactName': 'test',
					/**联系人信息*/
					'contactInfo': 'test<b style="color:red">test</b>',
					/**拓展文档*/
					'externalDocs': {
						'description': 'test<b style="color:red">test</b>',
						'url': 'test'
					},
					/**当前项目选中的服务*/
					selectServer: 'http://127.0.0.1:8080',
					/**服务集合*/
					servers: [{
						url: 'http://127.0.0.1:8080',
						description: 'description'
					}, {
						url: 'https://127.0.0.1:8080',
						description: 'description1'
					}, {
						url: 'http://127.0.0.1:8081/8081/8081/8081',
						description: 'description2'
					}],
					/**参数变量*/
					parameterVariables: []
				},
				/**当前选择分组与API的id*/
				selectApiId: 'id-4',
				/**当前选中的分组*/
				selectGroup: {
					groupId: '818fc57f-379d-48df-b307-a942560620e1',
					name: 'API列表',
					summary: 'API列表描述呀',
					description: 'test<b style="color:red">test</b>',
					externalDocs: {
						description: 'test<b style="color:red">test</b>',
						url: 'http://oam.zny.vip/console/index.html#/index/get/groups/15856c27-5409-424f-ad2e-61bf342e8753'
					},
				},
				/**当前选择的API*/
				selectAPI: {
					path: '/opendata/region/find/country',
					method: 'get',
					groupId: '818fc57f-379d-48df-b307-a942560620e1',
					deprecated: false,
					description: '项目的描述',
					responses: [{
						msg: 'ok',
						data: [{ in: 'body',
								name: 'code',
								description: '状态码:200=成功,401=没有权限,412=缺少参数,500=失败',
								type: 'int'
							},
							{ in: 'body',
								name: 'msg',
								description: '状态信息',
								type: 'string'
							},
							{ in: 'body',
								name: 'data',
								description: '数据列表',
								type: 'array',
								items: [{
										name: 'id',
										description: '国家的id',
										type: 'int'
									},
									{
										name: 'title',
										description: '国家的名称',
										type: 'string'
									},
									{
										name: 'sorts',
										description: '显示的排序',
										type: 'int'
									},
									{
										name: 'child',
										description: '是否有下一级,0=有,1=没有',
										type: 'int'
									},
									{
										name: 'translates',
										description: '语言的翻译,比如{CN:中文的名称,EN:英文的名字}',
										type: 'object'
									}
								]
							}
						],
						status: 200
					}],
					title: '获取国家列表',
					parameters: [{ in: 'query',
						key: 'query',
						name: 'appid',
						description: '应用的id',
						type: 'string',
						required: true
					}],
					apiId: '38798ff2-d67b-4376-a53f-41bcbfd00907',
					consumes: ['x-www-form-urlencoded', 'application/json', 'form-data', 'application/xml']
				},
				/**接口分组列表*/
				groups: [{
						id: 'id-1',
						title: 'title-1',
						apis: [{
							id: 'id-3',
							title: 'title-3'
						}, {
							id: 'id-4',
							title: 'title-4'
						}, {
							id: 'id-8',
							title: 'title-8'
						}]
					},
					{
						id: 'id-2',
						title: 'title2',
						apis: [{
							id: 'id-5',
							title: 'title-5'
						}, {
							id: 'id-6',
							title: 'title-6'
						}, {
							id: 'id-7',
							title: 'title-7'
						}]
					},
					{
						id: 'idd-2',
						title: '中文的文字',
						apis: [{
							id: 'idd-5',
							title: '中文的文字-5'
						}, {
							id: 'idd-6',
							title: '中文的文字-6'
						}, {
							id: 'idd-7',
							title: '中文的文字-7'
						}]
					}
				]
			};
		},
		created() {
			this.asideCollapse = document.body.offsetWidth > 768;
			window.onresize = () => {
				this.asideCollapse = document.body.offsetWidth > 768;
			};
		},
		methods: {
			/**
			 * 切换到显示项目信息
			 */
			switchToProjectView(){
				this.mainShowMode='PROJECT';
				this.selectApiId='';
			},
			/**
			 * 切换到请求测试
			 */
			switchToRequestView(){
				this.mainShowMode='REQUEST_TEST';
				this.selectApiId='';
			},
			apiSelectHandler(id) {
				this.selectApiId = id;
				console.log('apiSelectHandler: ', id);
			},
			
			onSearch(value) {
				console.log(value);
			}
		}
	};
</script>

<style>
	.el-main {
		padding: 14px !important;
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
	}

	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
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
