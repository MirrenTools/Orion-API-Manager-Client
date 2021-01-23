<template>
	<div>
		<div class="api-body" :class="['api-body-' + api.method]">
			<!-- API基本信息 -->
			<div class="prem05" v-if="api.deprecated">{{ api.deprecated ? $t('ApiDeprecated') : '' }}</div>
			<div class="api-header" :class="['api-header-' + api.method]" :style="api.deprecated ? 'text-decoration: line-through;' : ''">
				<div class="api-header-item">{{ api.title }}</div>
				<div class="api-header-item">{{ $t('ApiMethod') }}: {{ api.method.toUpperCase() }}</div>
				<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
					<div class="flexCenter">{{ $t('RequestURL') }}:</div>
					<div style="width: 90%;margin-left: 10px;" class="flexCenter">
						<el-input :placeholder="$t('InputHostAndPath')" size="mini" v-model="api.path">
							<el-select v-model="requestServer" slot="prepend" :placeholder="$t('SelectOrAdd')" style="width: 200px;" filterable allow-create>
								<el-option v-for="(s, idx) in servers" :key="idx" :label="s.url" :value="s.url"></el-option>
							</el-select>
							<el-button slot="append" style="color: #222;" @click="copy">Copy</el-button>
							<el-button slot="append" style="color: #222;" @click="copyPath">CopyPath</el-button>
						</el-input>
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
						<el-select v-model="api.requestType" size="mini" style="width: 200px;" :placeholder="$t('SelectOrAdd')" filterable allow-create>
							<el-option v-for="(type, idx) in api.consumes" :key="idx" :label="type" :value="type"></el-option>
						</el-select>
					</div>
				</div>
				<!-- 默认请求的参数 -->
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
						:empty-text="$t('RequestParamsEnpty')"
					>
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
						<el-table-column prop="required" :label="$t('ParamsRequired')" width="60">
							<template slot-scope="scope" v-if="scope.row.required != null">
								{{ scope.row.required == true || scope.row.required == 'true' ? $t('TheTrue') : $t('TheFalse') }}
							</template>
						</el-table-column>
						<el-table-column prop="in" :label="$t('ParamsPosition')" width="100"></el-table-column>
						<el-table-column prop="type" :label="$t('ParamsType')" width="100"></el-table-column>
						<el-table-column prop="name" :label="$t('ParamsName')" min-width="100"></el-table-column>
						<el-table-column prop="value" :label="$t('ParamsValue')" min-width="200">
							<template slot-scope="scope">
								<el-input v-if="scope.row.join != null" :placeholder="$t('inputParamsValue')" v-model="scope.row.value" @blur="paramsBlurHandler(scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column :label="$t('ParamsDescription')" min-width="250">
							<template slot-scope="scope">
								<div v-html="scope.row.description"></div>
								<div v-if="scope.row.contains != ''" v-html="scope.row.contains"></div>
							</template>
						</el-table-column>
					</el-table>
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
