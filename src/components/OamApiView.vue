<template>
	<div>
		<div class="api-body" :class="['api-body-' + api.method]">
			<!-- API基本信息 -->
			<div class="prem05" v-if="api.deprecated">{{ api.deprecated ? $t('apiDeprecated') : '' }}</div>
			<div class="api-header" :class="['api-header-' + api.method]" :style="api.deprecated ? 'text-decoration: line-through;' : ''">
				<div class="api-header-item">{{ api.title }}</div>
				<div class="api-header-item">{{ $t('apiMethod') }}: {{ api.method.toUpperCase() }}</div>
				<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
					<div class="flexCenter">{{ $t('requestURL') }}:&nbsp;</div>
					<div style="width: 90%;" class="flexCenter">
						<a-input v-model="api.path">
							<a-select slot="addonBefore" v-model="requestServer">
								<a-select-option v-for="(s, idx) in servers" :key="idx" :value="s.url">{{ s.url }}</a-select-option>
							</a-select>
							<span slot="addonAfter" style="display: inline-block;padding-right: 10px;cursor: pointer;" @click="copy">Copy</span>
							<span slot="addonAfter" style="display: inline-block;padding-left: 10px;cursor: pointer;" @click="copyPath">CopyPath</span>
						</a-input>
					</div>
				</div>
			</div>
			<!-- 接口的描述 -->
			<div class="prem05 background-color-white">
				<div v-html="api.description"></div>
				<div v-for="(addi, index) in api.additional" :key="index">
					<div style="margin-top: 5px;">
						<b>{{ addi.title }}</b>
					</div>
					<div v-html="addi.description.replace(/\n/g, '<br>')"></div>
				</div>
				<div v-if="api.externalDocs" style="display: flex; flex-wrap: wrap;margin-top: 0.5rem;">
					<div style="padding-right: 0.5rem;">{{ $t('additionalDocument') }}</div>
					<div>
						{{ api.externalDocs.description }}
						<br />
						<a :href="api.externalDocs.url" style="color: #409EFF;" target="_blank">{{ api.externalDocs.url }}</a>
					</div>
				</div>
			</div>
			<!-- 请求参数 -->
			<div class="api-body-params">
				<div class="api-body-param-header">
					<div style="display: flex;">{{ $t('RequestParams') }}</div>
					<div style="display: flex;align-items: first baseline;">
						<span style="margin-right: 10px;">{{ $t('RequestType') }}</span>
						<a-select v-model="api.requestType" style="min-width: 200px;">
								<a-select-option v-for="(type, idx) in api.consumes" :key="idx" :value="type">{{type }}</a-select-option>
						</a-select>
					</div>
				</div>
				<div class="api-body-param-path plrrem05">
					<!-- 默认请求的参数 -->
					<a-table :data-source="api.parameters" childrenColumnName="items" style="background-color: white;">
						<a-table-column key="join" :title="$t('ParamsJoin')">
							<template slot-scope="text, record" >
								{{record.join}}
							</template>
						</a-table-column>
						<a-table-column key="required" :title="$t('ParamsRequired')">
							<template slot-scope="text, record" v-if="record.required != null">
								{{ record.required == true || record.required == 'true' ? $t('TheTrue') : $t('TheFalse') }}
							</template>
						</a-table-column>
						<a-table-column key="type" :title="$t('ParamsType')"></a-table-column>
						<a-table-column key="name" :title="$t('ParamsName')"></a-table-column>
						<a-table-column key="value" :title="$t('ParamsValue')"></a-table-column>
						<a-table-column key="description" :title="$t('ParamsValue')">
							<template  slot-scope="text, record" >
								<div v-html="record.description"></div>
								<div v-if="record.contains != ''" v-html="record.contains"></div>
							</template>
						</a-table-column>
			<!-- 			<a-table-column key="action" title="Action"></a-table-column>
						<a-table-column key="action" title="Action"></a-table-column>
						<a-table-column key="action" title="Action"></a-table-column>
						<a-table-column key="action" title="Action">
							<template slot-scope="text, record">
								<span>
									<a>Action 一 {{ record.firstName }}</a>
									<a-divider type="vertical" />
									<a>Delete</a>
								</span>
							</template>
						</a-table-column> -->
					</a-table>
					
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'OamApiView',
	props: {
		/**API信息*/
		api: Object,
		/**服务集*/
		servers: Array,
		/**系统选择的默认服务器*/
		defaultServer: String
	},
	data() {
		return {
			requestServer: ''
		};
	},
	created() {
		this.requestServer = this.defaultServer;
	},
	methods: {
		/**点击事件*/
		click() {
			this.$emit('updateCurrentId', this.id);
			this.selectHandler(this.id);
		},
		copy() {
			var data = this.requestServer + this.api.path;
			console.log('copy:data=' + data);
			this.toCopy(data);
		},
		copyCustom() {
			var data = this.api.path;
			console.log('copy:data=' + data);
			this.toCopy(data);
		},
		copyPath() {
			var data = this.api.path;
			console.log('copy-path:data=' + data);
			this.toCopy(data);
		},
		toCopy(data) {
			var oInput = document.createElement('input');
			oInput.value = data;
			document.body.appendChild(oInput);
			oInput.select();
			document.execCommand('Copy');
			this.$message.success(this.$t('CopySucceeded'));
			oInput.remove();
		}
	}
};
</script>

<style scoped>
@import url('style/oam-api-view.css');
</style>
