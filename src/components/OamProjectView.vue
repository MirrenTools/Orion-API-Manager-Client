<template>
	<div>
		<table style="width: 100%;max-width: 1280px" cellpadding="5" border="0">
			<tr>
				<td style="width: 10rem;" align="right" valign="top"><b>{{ $t('Project') }}</b></td>
				<td>{{ project.name }}<span style="color: #666;font-size: 13px;">{{ project.versions }}</span></td>
			</tr>
			<tr v-if="project.lastTime">
				<td align="right" valign="top"><b>{{ $t('Datetime') }}</b></td>
				<td>{{ project.lastTime }}</td>
			</tr>
			<tr v-if="project.description">
				<td align="right" valign="top"><b>{{ $t('Description') }}</b></td>
				<td>
					<div v-html="project.description"></div>
				</td>
			</tr>
			<tr v-if="project.externalDocs">
				<td align="right" valign="top"><b>{{ $t('AdditionalDocument') }}</b></td>
				<td>
					<div v-html="project.externalDocs.description"></div>
					<div style="margin-top: 10px;"><a :href="project.externalDocs.url" style="color: #409EFF;" target="_blank">{{ project.externalDocs.url }}</a></div>
				</td>
			</tr>
			<tr v-if="project.contactName">
				<td align="right" valign="top"><b>{{ $t('Contacts') }}</b></td>
				<td>{{ project.contactName }}</td>
			</tr>
			<tr v-if="project.contactInfo">
				<td align="right" valign="top"><b>{{ $t('ContactsInfo') }}</b></td>
				<td>
					<div v-html="project.contactInfo"></div>
				</td>
			</tr>
			<tr>
				<td align="right" valign="top"><b>{{ $t('Servers') }}</b></td>
				<td>
					<div>
						<div v-for="(item, idx) in project.servers" :key="idx" style="margin-bottom: 5px;">
							<div @click="project.selectServer = item.url" style="cursor: pointer;" :title="$t('UseThisServer')">
								{{ item.url }}
								<i class="el-icon-check" style="color: #409EFF;" v-show="item.url == project.selectServer"></i>
							</div>
							<div @click="project.selectServer = item.url" v-show="item.description" style="color: #888;cursor: pointer;">{{ item.description }}</div>
						</div>
						<div style="display: flex;padding-top: 5px;">
							<div style="width: 95%;">
								<el-input v-model="customServer" :placeholder="$t('AddTemporaryServer')" size="medium"></el-input>
							</div>
							<div style="margin-left: 5px;">
								<el-button size="medium" @click="addCustomServer()">{{ $t('Add') }}</el-button>
							</div>
						</div>
					</div>
				</td>
			</tr>
			<tr>
				<td align="right" valign="top"><b>{{ $t('ParameterVariable') }}</b></td>
				<td>
					<div>
						<el-table :data="project.parameterVariables" style="margin-bottom: 10px;" border>
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
								<el-button size="medium" type="primary" @click="saveParamterVariable()" v-show="project.parameterVariables != null && project.parameterVariables.length > 0">
									{{ $t('Save') }}
								</el-button>
								<el-button size="medium" @click="addParamterVariable()">{{ $t('Add') }}</el-button>
							</div>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'OamProjectView',
		props: {
			project: Object
		},
		data() {
			return {
				//自定义主机地址
				customServer: '',
			};
		},
		created() {
			if (localStorage.getItem(this.project.projectId) != null && localStorage.getItem(this.project.projectId) != '') {
				try {
					this.project.parameterVariables = JSON.parse(localStorage.getItem(this.project.projectId));
				} catch (err) {
					console.log('init Parameter variables failed:');
					console.log(err);
				}
			}
		},
		methods: {
			/**
			 * 添加变量
			 */
			addParamterVariable() {
				this.project.parameterVariables.push({ in: 'query',
					name: '',
					value: ''
				});
			},
			/**
			 * 删除参数变量
			 * @param {Object} index
			 */
			removeParamterVariable(index) {
				this.$confirm(this.$t('RemoveTips'), this.$t('Tips'), {
						confirmButtonText: this.$t('Confirm'),
						cancelButtonText: this.$t('Cancel'),
						type: 'warning'
					})
					.then(() => {
						this.project.parameterVariables.splice(index, 1);
						this.saveParamterVariable();
					})
					.catch(() => {});
			},
			/**
			 * 保存变量
			 */
			saveParamterVariable() {
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
			},
			/**
			 * 添加自定义主机服务
			 */
			addCustomServer() {
				if (this.customServer == '') {
					return;
				}
				this.project.servers.push({
					url: this.customServer,
					description: ''
				});
				this.project.selectServer = this.customServer;
				this.customServer = '';
			},
		}
	}
</script>

<style>

</style>
