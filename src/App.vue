<template>
	<div id="app">
		<!-- 顶部导航栏 -->
		<div id="header">
			<!-- 项目的名称 -->
			<div style="padding-left: 15px;width: 420px;">
				<b style="cursor: pointer;">
					<a-icon type="setting" />
					项目的名称
				</b>
			</div>
			<!-- 请求加载等按钮 -->
			<div style="margin-left: auto;margin-right: 12px;display: flex;align-items: center;justify-content: end;width: 70%;">
				<div style="width: 50%;">
					<a-input-search placeholder="文档的URL,代理请求可加上P: 示例:P:https://xxx.xxx/xx" size="large" @search="onSearch">
						<a-button slot="enterButton" class="link-color">请求加载</a-button>
					</a-input-search>
				</div>
				<div>
					<a-button type="link" block class="link-color">
						<a-icon type="folder-open" />
						本地加载
					</a-button>
				</div>
				<div>
					<a-button type="link" block class="link-color">
						<a-icon type="link" />
						请求测试
					</a-button>
				</div>
				<div>
					<a-button type="link" block class="link-color">
						<a-icon type="home" />
						进入控制台
					</a-button>
				</div>
			</div>
		</div>
		<a-layout>
			<!-- 侧边栏 -->
			<a-layout-sider width="400" breakpoint="lg" collapsed-width="0" theme="light">
				<div style="overflow: auto;height: 100vh;">
					<div style="height: 65px;"></div>
					<OamTree :data="groups" :selectHandler="apiSelectHandler" :selectId="selectApiId"></OamTree>
				</div>
			</a-layout-sider>
			<a-layout>
				<!-- Main -->
				<a-layout-content>
					<div style="overflow-y: auto;height: 100vh;background-color: white;width: 100%;word-wrap:break-word;">
						<div style="height: 61px;"></div>
						<div style="padding: 10px;">
							<!-- API信息 -->
							<OamApiView :api="selectAPI" :defaultServer="selectServer" :servers="project.servers"></OamApiView>
						</div>
					</div>
				</a-layout-content>
			</a-layout>
		</a-layout>
	</div>
</template>

<script>
import OamTree from './components/OamTree.vue';
import OamApiView from './components/OamApiView';
export default {
	name: 'App',
	components: {
		OamTree,
		OamApiView
	},
	data() {
		return {
			/**当前加载的项目*/
			project:{
				servers:[{url:'http://127.0.0.1:8080'},{url:'https://127.0.0.1:8080'},{url:'http://127.0.0.1:8081/8081/8081/8081'}],
			},
			/**默认选中要使用的服务器*/
			selectServer:'http://127.0.0.1:8080',
			/**当前选择API的id*/
			selectApiId: 'id-4',
			/**当前选择的API*/
			selectAPI: {
				path: '/opendata/region/find/country',
				method: 'get',
				groupId: '818fc57f-379d-48df-b307-a942560620e1',
				deprecated: false,
				description: 'appid为填写应用的包名',
				responses: [
					{
						msg: 'ok',
						data: [
							{
								in: 'body',
								name: 'code',
								description: '状态码:200=成功,401=没有权限,412=缺少参数,500=失败',
								type: 'int'
							},
							{
								in: 'body',
								name: 'msg',
								description: '状态信息',
								type: 'string'
							},
							{
								in: 'body',
								name: 'data',
								description: '数据列表',
								type: 'array',
								items: [
									{
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
					}
				],
				title: '获取国家列表',
				parameters: [
					{
						in: 'query',
						key: 'query',
						name: 'appid',
						description: '应用的id',
						type: 'string',
						required: true
					}
				],
				apiId: '38798ff2-d67b-4376-a53f-41bcbfd00907',
				consumes: ['x-www-form-urlencoded', 'application/json', 'form-data', 'application/xml']
			},
			/**接口分组列表*/
			groups: [
				{
					id: 'id-1',
					title: 'title-1',
					apis: [{ id: 'id-3', title: 'title-3' }, { id: 'id-4', title: 'title-4' }, { id: 'id-8', title: 'title-8' }]
				},
				{
					id: 'id-2',
					title: 'title2',
					apis: [{ id: 'id-5', title: 'title-5' }, { id: 'id-6', title: 'title-6' }, { id: 'id-7', title: 'title-7' }]
				},
				{
					id: 'idd-2',
					title: '中文的文字',
					apis: [{ id: 'idd-5', title: '中文的文字-5' }, { id: 'idd-6', title: '中文的文字-6' }, { id: 'idd-7', title: '中文的文字-7' }]
				}
			]
		};
	},
	created() {},
	methods: {
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
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}

.ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
	background-color: #e6f7ff !important;
	border-radius: 0 !important;
	border-left: 3px solid #1890ff !important;
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

#header .link-color {
	color: #2c3e50;
}
</style>
