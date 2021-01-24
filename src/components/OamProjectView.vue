<template>
	<div>
		<div v-show="!project.isload">{{ $t('ProjectNotLoaded') }}</div>
		<table v-show="project.isload" style="width: 100%;max-width: 1280px" cellpadding="5" border="0">
			<tr>
				<td style="width: 10rem;min-width: 6rem;" align="right" valign="top">
					<b>{{ $t('Project') }}</b>
				</td>
				<td>
					{{ project.name }}
					<span style="color: #666;font-size: 13px;">{{ project.versions }}</span>
				</td>
			</tr>
			<tr v-if="project.lastTime">
				<td align="right" valign="top">
					<b>{{ $t('Datetime') }}</b>
				</td>
				<td>{{ project.lastTime }}</td>
			</tr>
			<tr v-if="project.description">
				<td align="right" valign="top">
					<b>{{ $t('Description') }}</b>
				</td>
				<td><div v-html="project.description"></div></td>
			</tr>
			<tr v-if="project.externalDocs">
				<td align="right" valign="top">
					<b>{{ $t('AdditionalDocument') }}</b>
				</td>
				<td>
					<div v-html="project.externalDocs.description"></div>
					<div style="margin-top: 10px;">
						<a :href="project.externalDocs.url" style="color: #409EFF;" target="_blank">{{ project.externalDocs.url }}</a>
					</div>
				</td>
			</tr>
			<tr v-if="project.contactName">
				<td align="right" valign="top">
					<b>{{ $t('Contacts') }}</b>
				</td>
				<td>{{ project.contactName }}</td>
			</tr>
			<tr v-if="project.contactInfo">
				<td align="right" valign="top">
					<b>{{ $t('ContactsInfo') }}</b>
				</td>
				<td><div v-html="project.contactInfo"></div></td>
			</tr>
			<tr>
				<td align="right" valign="top">
					<b>{{ $t('Servers') }}</b>
				</td>
				<td>
					<div>
						<div v-for="(item, idx) in project.servers" :key="idx">
							<div style="margin-bottom: 10px;" @click="selectProjectServer(item.url)">
								<div style="cursor: pointer;" :title="$t('UseThisServer')">
									{{ item.url }}
									<i class="el-icon-check" style="color: #409EFF;" v-show="item.url == selectServer"></i>
								</div>
								<div v-show="item.description" style="color: #888;cursor: pointer;">{{ item.description }}</div>
							</div>
						</div>
						<div style="display: flex;">
							<div style="width: 95%;"><el-input v-model="customServer" :placeholder="$t('AddTemporaryServer')" size="medium"></el-input></div>
							<div style="margin-left: 5px;">
								<el-button size="medium" @click="addCustomServer()">{{ $t('Add') }}</el-button>
							</div>
						</div>
					</div>
				</td>
			</tr>
		</table>

		<div v-show="project.isload" style="display: flex;max-width: 1288px;">
			<div style="width: 10rem;min-width: 6rem;text-align: right;margin-left: 8px;">
				<b>{{ $t('ParameterVariable') }}</b>
			</div>
			<div style="margin-left: 10px;width: 85%;">
				<el-table :data="project.parameterVariables" style="margin-bottom: 10px;width: 100%;" border>
					<el-table-column prop="in" :label="$t('ParamsPosition')" width="150">
						<template slot-scope="scope">
							<el-select v-model="scope.row.in" :placeholder="$t('Choose')">
								<el-option value="query">query</el-option>
								<el-option value="body">body</el-option>
								<el-option value="path">path</el-option>
								<el-option value="header">header</el-option>
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="name" :label="$t('ParamsName')" width="250">
						<template slot-scope="scope">
							<el-input v-model="scope.row.name" :placeholder="$t('InputParamsName')"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="value" :label="$t('ParamsValue')">
						<template slot-scope="scope">
							<el-input v-model="scope.row.value" :placeholder="$t('InputParamsValue')"></el-input>
						</template>
					</el-table-column>
					<el-table-column :label="$t('Operation')" width="100">
						<template slot-scope="scope">
							<el-button size="mini" type="danger" @click="removeParamterVariable(scope.$index)">{{ $t('Remove') }}</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div style="display: flex;align-items: center;">
					<div style="color: #666;">{{ $t('ParameterVariableTips') }}</div>
					<div style="margin-left: auto;">
						<el-button size="medium" type="primary" @click="saveParamterVariable()" v-show="paramterVariableLength > 0">{{ $t('Save') }}</el-button>
						<el-button size="medium" @click="addParamterVariable()">{{ $t('Add') }}</el-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'OamProjectView',
	data() {
		return {
			/**项目信息*/
			project: {},
			/**用户选择的服务地址*/
			selectServer: '',
			/**自定义请求地址*/
			customServer: '',
			/**参数变量默认的长度*/
			paramterVariableLength: 0
		};
	},
	created() {
		if (this.project.parameterVariables != null) {
			this.paramterVariableLength = this.project.parameterVariables.length;
		}
	},
	methods: {
		/**
		 * 更新页面Project数据
		 * @param {Object} data
		 */
		updateData(data) {
			this.project = data;
			if (this.project.parameterVariables != null) {
				this.paramterVariableLength = this.project.parameterVariables.length;
			} else {
				this.paramterVariableLength = 0;
			}
			this.selectServer=data.selectServer;
		},
		/**
		 * 选择服务
		 * @param {Object} server
		 */
		selectProjectServer(server){
			this.$emit('selectServer', server);
		},
		/**
		 * 添加自定义主机服务
		 */
		addCustomServer() {
			this.$emit('addCustomServer', this.customServer);
			this.customServer = '';
		},
		/**
		 * 添加变量
		 */
		addParamterVariable() {
			this.$emit('addParamterVariable');
		},
		/**
		 * 删除参数变量
		 * @param {Object} index
		 */
		removeParamterVariable(index) {
			this.$emit('removeParamterVariable', index);
		},
		/**
		 * 保存变量
		 */
		saveParamterVariable() {
			this.$emit('saveParamterVariable');
		}
	}
};
</script>

<style></style>
