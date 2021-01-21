<template>
	<div id="app">
		<!-- 顶部导航栏 -->
		<div id="header">
			<div style="padding-left: 15px;width: 460px;">
				<b style="cursor: pointer;">
					<a-icon type="setting" /> 项目的名称</b>
			</div>
			<div style="margin-left: auto;margin-right: 12px;display: flex;align-items: center;justify-content: end;width: 70%;">
				<div style="width: 50%;">
					<a-input-search placeholder="文档的URL,代理请求可加上P: 示例:P:https://xxx.xxx/xx" size="large" @search="onSearch">
						<a-button slot="enterButton" class="link-color">
							请求加载
						</a-button>
					</a-input-search>
				</div>
				<div>
					<a-button type="link" block class="link-color">
						<a-icon type="folder-open" />本地加载
					</a-button>
				</div>
				<div>
					<a-button type="link" block class="link-color">
						<a-icon type="link" />请求测试
					</a-button>
				</div>
				<div>
					<a-button type="link" block class="link-color">
						<a-icon type="home" />进入控制台
					</a-button>
				</div>
			</div>
		</div>
		<a-layout>
			<!-- 侧边栏 -->
			<a-layout-sider width="450" breakpoint="lg" collapsed-width="0" theme="light">
				<div style="overflow: auto;height: 100vh;">
					<div style="height: 61px;"></div>
					<OamTree :data="groups" :selectHandler="onSelect"></OamTree>
				</div>
			</a-layout-sider>
			<a-layout>
				<!-- Main -->
				<a-layout-content>
					<div style="overflow-y: auto;height: 100vh;background-color: white;width: 100%;word-wrap:break-word;">
						<div style="height: 61px;"></div>
						<div style="padding: 10px;">
							1234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345123451234512345
						</div>
					</div>
				</a-layout-content>
			</a-layout>
		</a-layout>
	</div>
</template>

<script>
	import OamTree from './components/OamTree.vue'
	export default {
		name: 'App',
		components: {
			OamTree
		},
		data() {
			return {
				groups: [{
					id: 'id-1',
					title: 'title-1',
					apis:[{id:'id-3',title:'title-3'},{id:'id-4',title:'title-4'},{id:'id-8',title:'title-8'}]
				}, {
					id: 'id-2',
					title: 'title2',
					apis:[{id:'id-5',title:'title-5'},{id:'id-6',title:'title-6'},{id:'id-7',title:'title-7'}]
				}]
			};
		},
		methods: {
			onSelect(keys, event) {
				console.log('Trigger Select', keys, event);
			},
			onSearch(value) {
				console.log(value);
			},
		}
	}
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
