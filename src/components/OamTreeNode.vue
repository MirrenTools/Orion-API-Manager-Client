<template>
	<div class="oam_tree_node_default" @click="click">
		{{title}}
	</div>
</template>

<script>
	export default {
		name: 'OamTreeNode',
		props: {
			/**节点的id*/
			id: String,
			/**节点的标题*/
			title: String,
			/**点击节点的事件,得到参数id*/
			selectHandler: Function,
		},
		methods: {
			/**点击事件*/
			click() {
				this.selectHandler(this.id);
			}
		}
	}
</script>

<style scoped>
	.oam_tree_node_default {
		word-wrap: break-word;
		padding: 5px;
		margin-left: 42px;
		border-left: 3px solid transparent;
	}

	.oam_tree_node_default:hover {
		color: #1890ff;
	}
</style>
