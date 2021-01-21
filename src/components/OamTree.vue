<template>
	<div class="oam_tree">
		<div class="oam_tree_group" v-for="item in data" :key="item.id">
			<div style="display: flex;">
				<div>
					<div @click="expand(item.id)" :class="['oam_tree_group_icon',(expands[item.id]==true?'oam_tree_group_icon_expand':'')]">
						<svg viewBox="0 0 1024 1024" data-icon="caret-right" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
							<path d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"></path>
						</svg>
					</div>
				</div>
				<div class="oam_tree_group_title" @click="click(item.id)" :class="{'oam_tree_select':(currentId==item.id)}"><b>{{item.title}}</b></div>
			</div>
			<transition name="slide-fade">
				<div v-show="expands[item.id]">
					<OamTreeNode v-for="li in item.apis" :key="li.id" :id="li.id" :title="li.title" @updateCurrentId="updateCurrentId" :selectHandler="selectHandler" :class="{'oam_tree_select':(currentId==li.id)}" ></OamTreeNode>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	import OamTreeNode from './OamTreeNode.vue'
	export default {
		name: 'OamTree',
		components: {
			OamTreeNode
		},
		props: {
			/**要显示的数据*/
			data: {
				type: Array,
				default () {
					return [];
				}
			},
			/**已选中的节点*/
			selectId: String,
			/**点击节点的事件,参数:id*/
			selectHandler: Function,
			/**展开与关闭事件,参数:id,type:(true=展开,false=收起)*/
			expandHandler: Function
		},
		data() {
			return {
				/**当前选中的id*/
				currentId:null,
				/**节点张开与关闭的情况*/
				expands: {},
			};
		},
		created() {
			var exp = this.data || []
			for (var i = 0; i < exp.length; i++) {
				var show= exp[i].show || true;
				this.$set(this.expands, exp[i].id, show);
			}
			this.currentId=this.selectId;
		},
		methods: {
			/**点击事件*/
			click(id) {
				this.currentId=id;
				this.selectHandler(id);
			},
			/**展开或关闭事件*/
			expand(id) {
				console.log('expand: ' + id)
				var type = !this.expands[id];
				this.$set(this.expands, id, type);
				if (this.expandHandler != null) {
					this.expandHandler(id, type);
				}
			},
			/**
			 * OamTreeNode组件中要调用这个方法更新当前选中的id
			 * @param {Object} id
			 */
			updateCurrentId(id){
				this.currentId=id;
			}
		}
	}
</script>

<style scoped>
	.slide-fade-enter-active {
		transition: all .2s ease;
	}

	.slide-fade-leave-active {
		transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
	}

	.slide-fade-enter,
	.slide-fade-leave-to {
		opacity: 0;
	}

	.oam_tree {
		mzx-width: 100%;
		cursor: pointer;
	}

	.oam_tree_group_icon {
		width: 30px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(0deg);
		transition: transform .3s ease-in-out;
	}

	.oam_tree_group_icon_expand {
		transform: rotate(90deg);
	}

	.oam_tree_group_title {
		padding: 5px;
		padding-left: 3px;
		cursor: pointer;
		width: 100%
	}

	.oam_tree_group_title:hover {
		color: #1890ff;
	}

	.oam_tree_select {
		background-color: #e6f7ff;
		border-left: 3px solid #1890ff;
	}
</style>
