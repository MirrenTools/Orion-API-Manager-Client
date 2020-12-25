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
					<el-input :placeholder="$t('fileUrl')" v-model="fileUrl" class="input-with-select">
						<el-button slot="append" @click="getProjectFromUrl">{{ $t('load') }}</el-button>
					</el-input>
				</li>
				<li>
					<a @click="$refs.readFile.click()">{{ $t('localFile') }}</a>
					<input type="file" style="display: none" accept=".json,.txt" ref="readFile" @change="getProjectFromFile" />
				</li>
				<li style="text-align: center;">
					<a @click="customRequest">{{ $t('requestTest') }}</a>
				</li>
				<li style="text-align: center;">
					<a @click="drawer = true">{{ $t('projectSwitch') }}</a>
				</li>
			</ul>
		</el-header>
		<el-drawer :title="$t('projectList')" direction="btt" :visible.sync="drawer">
			<div v-for="item in projects" :key="item.key">
				<p>
					<a :href="['./index.html?id=' + item.key]" style="display: block;	border-bottom: 2px solid transparent;">{{ item.name }}</a>
				</p>
			</div>
		</el-drawer>
		<el-container>
			<!-- 侧边栏 -->
			<el-aside id="aside" width="25%" style="max-width: 450px;" v-show="isAsideShow">
				<ul id="menu-body">
					<li style="text-align: center;" v-show="!isMainShow">
						<a @click="drawer = true">{{ $t('projectSwitch') }}</a>
					</li>
					<li v-show="project.isload && project.name" @click="currentActive(-1, -1)" :class="{ current: menuCurrent == -1 && menuSubCurrent == -1 }">
						<span class="line">{{ project.name }}</span>
					</li>
					<div v-if="project.isload == null" style="text-align: center;padding-top: 30px;">{{ $t('projectNotLoaded') }}</div>
					<div v-if="project.isload && !apiGroups" style="text-align: center;padding-top: 30px;">{{ $t('noApi') }}</div>
					<li v-for="(group, gindex) in apiGroups" :key="group.groupId">
						<span :class="{ current: menuCurrent == gindex }" @click="currentActive(gindex, -1)">
							<span class="line">{{ group.name }}</span>
						</span>
						<ul v-if="group.apis" class="menu-sub">
							<li
								v-for="(api, aindex) in group.apis"
								:key="api.apiId"
								:class="{ current: menuCurrent == gindex && menuSubCurrent == aindex }"
								@click="currentActive(gindex, aindex)"
							>
								<span class="line-min">{{ api.title }}</span>
							</li>
						</ul>
					</li>
				</ul>
			</el-aside>
			<!-- 中心栏 -->
			<el-main id="main" v-show="isMainShow">
				<!-- 项目信息 -->
				<div v-show="menuCurrent == -1 && project.isload">
					<el-row :gutter="15" class="mb10px" v-if="project.name">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('project') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" class="body-max-width">
							{{ project.name }}
							<span style="color: #666;font-size: 13px;">{{ project.versions }}</span>
						</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.description">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('description') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" v-html="project.description" class="body-max-width"></el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.servers">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('servers') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" class="body-max-width">
							<div v-for="(item, idx) in project.servers" :key="idx" style="margin-bottom: 5px;">
								<div @click="selectServer = item.url" style="cursor: pointer;" :title="$t('useThisServer')">
									{{ item.url }}
									<i class="el-icon-check" style="color: #409EFF;" v-show="item.url == selectServer"></i>
								</div>
								<div @click="selectServer = item.url" v-show="item.description" style="color: #888;cursor: pointer;">{{ item.description }}</div>
							</div>
							<div style="display: flex;padding-top: 5px;">
								<div style="width: 95%;"><el-input v-model="customServer" :placeholder="$t('addTemporaryServer')" size="medium"></el-input></div>
								<div style="margin-left: 5px;">
									<el-button size="medium" @click="addCustomServer()">{{ $t('add') }}</el-button>
								</div>
							</div>
						</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.externalDocs">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('additionalDocument') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" class="body-max-width">
							<div v-html="project.externalDocs.description"></div>
							<br />
							<a :href="project.externalDocs.url" style="color: #409EFF;" target="_blank">{{ project.externalDocs.url }}</a>
						</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.contactName">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('contacts') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" class="body-max-width">{{ project.contactName }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.contactInfo">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('contactsInfo') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" v-html="project.contactInfo" class="body-max-width"></el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="project.lastTime">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('datetime') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" class="body-max-width">{{ project.lastTime }}</el-col>
					</el-row>
					<!-- 参数变量定义 -->
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth" style="line-height: 35px;">
							<b>{{ $t('parameterVariable') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20" class="body-max-width">
							<el-table :data="parameterVariables" border v-show="parameterVariables != null && parameterVariables.length > 0" style="margin-bottom: 10px;">
								<el-table-column prop="in" :label="$t('paramsPosition')" width="150">
									<template slot-scope="scope">
										<el-select v-model="scope.row.in" :placeholder="$t('choose')">
											<el-option value="query">query</el-option>
											<el-option value="body">body</el-option>
											<el-option value="path">path</el-option>
											<el-option value="header">header</el-option>
										</el-select>
									</template>
								</el-table-column>
								<el-table-column prop="name" :label="$t('paramsName')" width="250">
									<template slot-scope="scope">
										<el-input v-model="scope.row.name" :placeholder="$t('inputParamsName')"></el-input>
									</template>
								</el-table-column>
								<el-table-column prop="value" :label="$t('paramsValue')">
									<template slot-scope="scope">
										<el-input v-model="scope.row.value" :placeholder="$t('inputParamsValue')"></el-input>
									</template>
								</el-table-column>
								<el-table-column :label="$t('operation')" width="100">
									<template slot-scope="scope">
										<el-button size="mini" type="danger" @click="removeParamterVariable(scope.$index)">{{ $t('remove') }}</el-button>
									</template>
								</el-table-column>
							</el-table>
							<div style="display: flex;align-items: center;">
								<div style="color: #666;">{{ $t('parameterVariableTips') }}</div>
								<div style="margin-left: auto;">
									<el-button size="medium" type="primary" @click="saveParamterVariable()" v-show="parameterVariables != null && parameterVariables.length > 0">
										{{ $t('save') }}
									</el-button>
									<el-button size="medium" @click="addParamterVariable()">{{ $t('add') }}</el-button>
								</div>
							</div>
						</el-col>
					</el-row>
				</div>

				<!-- 分组信息 -->
				<div v-show="menuCurrent != -1 && menuSubCurrent == -1">
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('groupName') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ group.name }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('groupSummary') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ group.summary }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth" v-if="group.description">
							<b>{{ $t('groupDescription') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20">{{ group.description }}</el-col>
					</el-row>
					<el-row :gutter="15" class="mb10px" v-if="group.externalDocs">
						<el-col :xs="24" :sm="6" :md="4" class="xs-left-sm-rigth">
							<b>{{ $t('additionalDocument') }}</b>
						</el-col>
						<el-col :xs="24" :sm="18" :md="20">
							{{ group.externalDocs.description }}
							<br />
							<a :href="group.externalDocs.url" style="color: #409EFF;" target="_blank">{{ group.externalDocs.url }}</a>
						</el-col>
					</el-row>
				</div>
				<!-- API的信息 -->
				<div v-show="menuSubCurrent != -1">
					<div class="api-body" :class="['api-body-' + api.method]">
						<div class="prem05" v-if="api.deprecated">{{ api.deprecated ? $t('apiDeprecated') : '' }}</div>
						<div v-if="menuSubCurrent != 999999" class="api-header" :class="['api-header-' + api.method]" :style="api.deprecated ? 'text-decoration: line-through;' : ''">
							<div class="api-header-item">{{ api.title }}</div>
							<div class="api-header-item">{{ $t('apiMethod') }}: {{ api.methodUpperCase }}</div>
							<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
								<div class="flexCenter">{{ $t('requestURL') }}:&nbsp;</div>
								<div style="width: 90%;" class="flexCenter">
									<el-input :placeholder="$t('inputHostAndPath')" size="mini" v-model="requestUrl">
										<el-button slot="append" style="color: #222;" @click="copy">Copy</el-button>
										<el-button slot="append" style="color: #222;" @click="copyPath">CopyPath</el-button>
									</el-input>
								</div>
							</div>
						</div>
						<!-- 自定义请求的URL -->
						<div v-if="menuSubCurrent == 999999" class="api-header" :class="['api-header-' + api.method]" :style="api.deprecated ? 'text-decoration: line-through;' : ''">
							<div class="api-header-item" style="display: flex;flex-wrap: wrap;">
								<div class="flexCenter">{{ $t('requestURL') }}:&nbsp;</div>
								<div style="width: 90%;" class="flexCenter">
									<el-input :placeholder="$t('inputRequestURL')" size="mini" v-model="requestUrl">
										<el-select v-model="api.method" slot="prepend" :placeholder="$t('choose')" style="width: 6rem;color: #222;">
											<el-option value="get">GET</el-option>
											<el-option value="post">POST</el-option>
											<el-option value="options">OPTIONS</el-option>
											<el-option value="head">HEAD</el-option>
											<el-option value="put">PUT</el-option>
											<el-option value="delete">DELETE</el-option>
											<el-option value="trace">TRACE</el-option>
											<el-option value="connect">CONNECT</el-option>
											<el-option value="patch">PATCH</el-option>
											<el-option value="other">OTHER</el-option>
										</el-select>
										<el-button slot="append" style="color: #222;" @click="copyCustom">Copy</el-button>
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
						<div class="api-body-params" v-if="(api.parameters && api.parameters.length > 0) || menuSubCurrent == 999999">
							<div class="api-body-param-header">
								<div style="display: flex;">{{ $t('requestParams') }}</div>
								<div style="display: flex;align-items: first baseline;">
									{{ $t('requestType') }}&nbsp;
									<el-select v-model="api.requestType" size="mini" filterable allow-create placeholder="回车创建">
										<el-option v-for="(type, idx) in api.consumes" :key="idx" :label="type" :value="type"></el-option>
									</el-select>
								</div>
							</div>
							<div class="api-body-param-path plrrem05">
								<!-- 默认请求的参数 -->
								<el-table
									v-if="api.parameters && api.parameters.length > 0"
									ref="requestParamsTable"
									:data="api.parameters"
									row-key="tableRowkey"
									default-expand-all
									:tree-props="{ children: 'items', hasChildren: 'hasChildren' }"
									tooltip-effect="dark"
									style="width: 100%"
									:empty-text="$t('requestParamsEnpty')"
								>
									<el-table-column prop="join" :label="$t('paramsJoin')" width="50" align="center">
										<template slot-scope="scope">
											<el-checkbox
												v-if="scope.row.join != null"
												v-model="scope.row.join"
												:id="'api-parameters-join-' + scope.$index"
												@click.native.prevent="changeCheckBoxSelect('api-parameters-join-' + scope.$index, scope.row)"
											></el-checkbox>
										</template>
									</el-table-column>
									<el-table-column prop="required" :label="$t('paramsRequired')" width="60">
										<template slot-scope="scope" v-if="scope.row.required != null">
											{{ scope.row.required == true || scope.row.required == 'true' ? $t('theTrue') : $t('theFalse') }}
										</template>
									</el-table-column>
									<el-table-column prop="in" :label="$t('paramsPosition')" width="100"></el-table-column>
									<el-table-column prop="type" :label="$t('paramsType')" width="100"></el-table-column>
									<el-table-column prop="name" :label="$t('paramsName')" min-width="100"></el-table-column>
									<el-table-column prop="value" :label="$t('paramsValue')" min-width="200">
										<template slot-scope="scope">
											<el-input v-if="scope.row.join != null" :placeholder="$t('inputParamsValue')" v-model="scope.row.value" @blur="paramsBlurHandler(scope.row)"></el-input>
										</template>
									</el-table-column>
									<el-table-column :label="$t('paramsDescription')" min-width="250">
										<template slot-scope="scope">
											<div v-html="scope.row.description"></div>
											<div v-if="scope.row.contains != ''" v-html="scope.row.contains"></div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<div style="padding:0 0.5rem;">
								<!-- 自定义请求的参数 -->
								<el-table
									v-if="menuSubCurrent == 999999"
									ref="customRequestParamsTable"
									:data="customRequestParams"
									row-key="tableRowkey"
									tooltip-effect="dark"
									style="width: 100%"
									:empty-text="$t('requestParamsEnpty')"
								>
									<el-table-column prop="join" :label="$t('paramsJoin')" width="50" align="center">
										<template slot-scope="scope">
											<el-checkbox
												v-if="scope.row.join != null"
												v-model="scope.row.join"
												:id="'custom-parameters-join-' + scope.$index"
												@click.native.prevent="changeCheckBoxSelect('custom-parameters-join-' + scope.$index, scope.row)"
											></el-checkbox>
										</template>
									</el-table-column>
									<el-table-column prop="in" :label="$t('paramsPosition')" min-width="120">
										<template slot-scope="scope">
											<el-select v-model="scope.row.in" @change="paramsBlurHandler(scope.row)">
												<el-option value="query">query</el-option>
												<el-option value="path">path</el-option>
												<el-option value="header">header</el-option>
												<el-option value="body">body</el-option>
											</el-select>
										</template>
									</el-table-column>
									<el-table-column prop="type" :label="$t('paramsType')" min-width="120">
										<template slot-scope="scope">
											<el-select v-model="scope.row.type">
												<el-option value="string">string</el-option>
												<el-option value="int">int</el-option>
												<el-option value="long">long</el-option>
												<el-option value="float">float</el-option>
												<el-option value="double">double</el-option>
												<el-option value="number">number</el-option>
												<el-option value="boolean">boolean</el-option>
												<el-option value="object">object</el-option>
												<el-option value="array">array</el-option>
											</el-select>
										</template>
									</el-table-column>
									<el-table-column prop="name" :label="$t('paramsName')" min-width="200">
										<template slot-scope="scope">
											<el-input :placeholder="$t('inputParamsName')" v-model="scope.row.name" @blur="paramsBlurHandler(scope.row)"></el-input>
										</template>
									</el-table-column>
									<el-table-column prop="value" :label="$t('paramsValue')" min-width="200">
										<template slot-scope="scope">
											<el-input :placeholder="$t('inputParamsValue')" v-model="scope.row.value" @blur="paramsBlurHandler(scope.row)"></el-input>
										</template>
									</el-table-column>
								</el-table>
								<div v-if="menuSubCurrent == 999999" style="text-align: center;background-color: #FFF;line-height: 50px;padding: 0.5rem;">
									<el-button type="primary" size="small" @click="addCustomRequestParams">{{ $t('addRequestParams') }}</el-button>
								</div>
								<div style="padding-top: 0.5rem;">
									<el-input v-model="api.body" type="textarea" :autosize="{ minRows: 2, maxRows: 10 }" :placeholder="$t('requestBody')"></el-input>
								</div>
							</div>
						</div>
						<!-- 响应数据 -->
						<div class="api-body-result">
							<div v-for="(item, idx) in api.responses" :key="idx">
								<div class="api-body-result-header">
									<div style="display: flex;">{{ $t('responseStatusCode') }}: {{ item.status }}</div>
									<div style="display: flex;align-items: first baseline;">{{ item.msg }}&nbsp;</div>
								</div>
								<div class="plrrem05">
									<div v-if="item.schema" style="border: 1px solid #EBEEF5;"><json-viewer :expand-depth="10" :value="item.schema" /></div>
									<div v-show="item.data && item.data.length > 0">
										<el-table :data="item.data" row-key="tableRowkey" border default-expand-all :tree-props="{ children: 'items', hasChildren: 'hasChildren' }">
											<el-table-column prop="in" :label="$t('paramsPosition')" width="150" align="right"></el-table-column>
											<el-table-column prop="type" :label="$t('paramsType')" width="120" align="right"></el-table-column>
											<el-table-column prop="name" :label="$t('paramsName')" width="200"></el-table-column>
											<el-table-column :label="$t('paramsDescription')">
												<template slot-scope="scope">
													<div v-html="scope.row.description"></div>
												</template>
											</el-table-column>
										</el-table>
									</div>
								</div>
							</div>
						</div>
						<!-- 执行结果的标题 -->
						<div class="api-body-response-header">
							<div style="display: flex;align-items: first baseline;">
								<span v-show="api.isSxecute">{{ $t('responseResult') }}</span>
							</div>
							<div style="display: flex;flex-wrap: wrap;align-items: center;">
								<div style="margin-right: 0.7rem;">
									<el-checkbox v-model="api.proxy">{{ $t('useProxy') }}</el-checkbox>
								</div>
								<div>
									<el-button type="primary" @click="execute" :loading="api.executing">{{ api.executing ? $t('executing') : $t('execute') }}</el-button>
								</div>
							</div>
						</div>
						<!-- 执行结果的内容 -->
						<div class="api-body-response-body" v-show="api.isSxecute">
							<el-tabs style="width: 100%;" v-model="api.responseTags">
								<el-tab-pane :label="$t('beautifyData')" name="format"><json-viewer :expand-depth="10" :value="api.response" /></el-tab-pane>
								<el-tab-pane :label="$t('originalData')" name="original">
									<pre><code>{{api.response}}</code></pre>
								</el-tab-pane>
								<el-tab-pane :label="$t('headerInfo')" name="header" style="color: #409eff;">
									<el-divider content-position="left" v-if="api.requestHenders">{{ $t('requestHeader') }}</el-divider>
									<div v-for="(value, key) in api.requestHenders" :key="key" style="display: flex;">
										<div>{{ key }}</div>
										<div style="margin: 0 0.5rem;">:</div>
										<div style="color: #ff7de9;">{{ value }}</div>
									</div>
									<el-divider content-position="left" v-if="api.responseHeaders">{{ $t('responseHeader') }}</el-divider>
									<div v-for="(value, key) in api.responseHeaders" :key="key" style="display: flex;">
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
import swaggerConvert from './utils/ConvertSwaggerDocs.js';
import JsonViewer from 'vue-json-viewer';
import { findProjectListAPI, getProjectAPI } from '@/api/Project';
import axios from 'axios';
import qs from 'qs';

// 本地存储的会话的token
const LS_KEY_SESSION_TOKEN = 'LS_KEY_SESSION_TOKEN';
// API服务器地址
const SERVER_HOST = process.env.VUE_APP_BASE_API;
// xml与json转换器
const xml2js = require('xml2js');
//xml2js.parseString(xml,function(err, result))将xml转换为json对象
//xmlBuilder.buildObject(obj)将对象转换为xml
const xmlBuilder = new xml2js.Builder();

export default {
	components: {
		JsonViewer
	},
	data() {
		return {
			/**会话的token*/
			sessionToken: '',
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
			fileUrl: '',
			//项目的id
			projectId: null,
			//已选择的主机地址
			selectServer: '',
			//参数变量
			parameterVariables: [],
			//自定义主机地址
			customServer: '',
			//请求后台的URL
			requestUrl: '',
			//自定义请求后台的参数
			customRequestParams: [],
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
				// 附加说明
				// additional:[{title:'附加说明的标题',description:'附加说明的详情'}],
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
	created() {
		//如果id不为空就加载项目加载项目
		var pid = getParams('id', window.location.href);
		var fileUrl = getParams('fileUrl', window.location.href);
		var token = getParams('token', window.location.href);
		if (token != null) {
			this.sessionToken = token;
			localStorage.setItem(LS_KEY_SESSION_TOKEN, token);
			window.location.href=window.location.href.replace('token='+token,'');
		} else {
			this.sessionToken = localStorage.getItem(LS_KEY_SESSION_TOKEN) || '';
		}
		console.log(this.sessionToken);
		if (pid != null && pid != '') {
			this.projectId = pid;
			this.getProject(this.projectId);
		} else if (fileUrl != null && fileUrl != '') {
			this.fileUrl = fileUrl;
			this.getProjectFromUrl();
		}
		//加载项目列表
		this.loadProjectList();
	},
	methods: {
		/**
		 * 添加变量
		 */
		addParamterVariable() {
			this.parameterVariables.push({ in: 'query', name: '', value: '' });
		},
		/**
		 * 删除参数变量
		 * @param {Object} index
		 */
		removeParamterVariable(index) {
			this.$confirm(this.$t('removeTips'), this.$t('tips'), {
				confirmButtonText: this.$t('confirm'),
				cancelButtonText: this.$t('cancel'),
				type: 'warning'
			})
				.then(() => {
					this.parameterVariables.splice(index, 1);
					this.saveParamterVariable();
				})
				.catch(() => {});
		},
		/**
		 * 保存变量
		 */
		saveParamterVariable() {
			if (this.projectId == '') {
				return;
			}
			var pvs = [];
			for (var i = 0; i < this.parameterVariables.length; i++) {
				var pv = this.parameterVariables[i];
				if (pv.name == '' || pv.value == '') {
					continue;
				}
				pvs.push(pv);
			}
			localStorage.setItem(this.projectId, JSON.stringify(pvs));
			this.$message.success(this.$t('completed'));
		},
		/**
		 * 修改请求参数是否选中的显示状态
		 * @param {Integer} id
		 * @param {Integer} row
		 */
		changeCheckBoxSelect(id, row) {
			row.join = !row.join;
			if (row.join) {
				document.getElementById(id).classList.add('is-checked');
				document.getElementById(id).children[0].classList.add('is-checked');
			} else {
				document.getElementById(id).classList.remove('is-checked');
				document.getElementById(id).children[0].classList.remove('is-checked');
			}
		},
		/**
		 * 请求参数离开后的事件
		 * @param {Object} data
		 */
		paramsBlurHandler(data) {
			if (data.name == '' || data.value == '') {
				return;
			}
			if (data.in != 'body') {
				return;
			}
			var body = this.api.body;
			if (body == null || body == '') {
				return;
			}
			this.api.body = body.replace(new RegExp('{' + data.name + '}', 'g'), data.value);
		},
		/**
		 * 显示侧边栏
		 */
		showAside() {
			if (this.isAsideShow === false) {
				this.isAsideShow = true;
				this.isMainShow = false;
			} else {
				this.isAsideShow = false;
				this.isMainShow = true;
			}
		},
		/**
		 * 关闭侧边栏
		 */
		closeAside() {
			if (this.isAsideShow === false) {
				this.isAsideShow = true;
				this.isMainShow = false;
			} else {
				this.isAsideShow = false;
				this.isMainShow = true;
			}
		},
		/**
		 * 激活当前选中
		 * @param {Integer} parent
		 * @param {Integer} sub
		 */
		currentActive(parent, sub) {
			this.menuCurrent = parent;
			this.menuSubCurrent = sub;
			//如果是小屏幕就控制是否显示侧边栏
			if (this.isMainShow === false) {
				this.isMainShow = true;
				this.isAsideShow = false;
			}
			// -1代表选中项目信息
			if (parent == -1 && sub == -1) {
				return;
			}
			this.group = this.apiGroups[parent];
			var data = this.group.apis[sub];
			if (data == null) {
				return;
			}
			//初始化请求参数变量
			var variables = {};
			for (var i = 0; i < this.parameterVariables.length; i++) {
				var pv = this.parameterVariables[i];
				variables[pv.in + '-' + pv.name] = pv.value;
				if (pv.in == 'path') {
					data.path = data.path.replace('{' + pv.name + '}', pv.value);
					data.path = data.path.replace('/:' + pv.name, '/' + pv.value);
				}
			}

			this.requestUrl = '';
			this.customRequestParams = null;
			var api = this.api;
			api.title = data.title;
			api.deprecated = data.deprecated;
			api.method = data.method;
			api.methodUpperCase = data.method.toUpperCase();

			api.description = data.description;
			api.additional = data.additional;
			api.externalDocs = data.externalDocs;
			api.consumes = data.consumes;
			if (api.consumes != null && api.consumes.length > 0) {
				api.requestType = api.consumes[0];
			}
			api.parameters = data.parameters;
			api.version = data.version; //新版API还是旧版api,没有version代表旧版的api
			//国际化字符
			var i18nDef = this.$t('defaults');
			var i18nEnum = this.$t('enums');
			var i18nMin = this.$t('min');
			var i18nMax = this.$t('max');
			var i18nMinLength = this.$t('minLength');
			var i18nMaxLength = this.$t('maxLength');
			var i18nPattern = this.$t('pattern');

			if (api.parameters != null) {
				for (var i = 0; i < api.parameters.length; i++) {
					var param = api.parameters[i];
					this.recursionResponseDataCreateId(param);
					param.join = param.required == true || param.required == 'true';
					var val = variables[param.in + '-' + param.name];
					if (val != null) {
						this.$set(param, 'value', val);
					}

					var contains = '';
					if (param.default != null && param.default != '') {
						contains += i18nDef + param.default + '　';
					}
					if (param.enum != null && param.enum != '') {
						contains += i18nEnum + param.enum + '　';
					}
					if (param.explain != null && param.explain != '') {
						if (param.explain.min != null && param.explain.min != '') {
							contains += i18nMin + param.explain.min + '　';
						}
						if (param.explain.max != null && param.explain.max != '') {
							contains += i18nMax + param.explain.max + '　';
						}
						if (param.explain.items != null && param.explain.items != '') {
							param.items = param.explain.items;
						}
					}
					if (param.pattern != null && param.pattern != '') {
						contains += i18nPattern + param.pattern + '　';
					}
					if (param.def != null && param.def != '') {
						contains += i18nDef + param.def + '　';
					}
					if (param.enums != null && param.enums != '') {
						contains += i18nEnum + param.enums + '　';
					}
					if (param.minLength != null && param.minLength != '') {
						contains += i18nMinLength + param.minLength + '　';
					}
					if (param.maxLength != null && param.maxLength != '') {
						contains += i18nMaxLength + param.maxLength + '　';
					}
					if (param.minimum != null && param.minimum != '') {
						contains += i18nMin + param.minimum + '　';
					}
					if (param.maximum != null && param.maximum != '') {
						contains += i18nMax + param.maximum + '　';
					}
					if (param.minValue != null && param.minValue != '') {
						contains += i18nMin + param.minValue + '　';
					}
					if (param.maxValue != null && param.maxValue != '') {
						contains += i18nMax + param.maxValue + '　';
					}
					if (param.regex != null && param.regex != '') {
						contains += i18nPattern + param.regex + '　';
					}
					if (contains != '') {
						param.contains = contains;
					}
				}
			} else {
				api.parameters = [];
			}
			api.responses = data.responses;
			if (api.responses != null && api.responses.length > 0 && (api.responses[0].status == null || api.responses[0].data == null)) {
				api.responses = [
					{
						status: 200,
						data: data.responses
					}
				];
			}
			if (api.responses == null) {
				api.responses = [];
			}
			for (var i = 0; i < api.responses.length; i++) {
				var ard = api.responses[i].data;
				if (ard == null) {
					ard = [];
				}
				for (var j = 0; j < ard.length; j++) {
					this.recursionResponseDataCreateId(ard[j]);
				}
			}
			this.requestUrl = this.selectServer + data.path;
			api.isSxecute = false;
		},
		/**
		 * 递归响应的数据并给数据创建id
		 * @param {Object} data
		 */
		recursionResponseDataCreateId(data) {
			data.tableRowkey = Math.random();
			if (data.items == null) {
				return data;
			}
			for (var i = 0; i < data.items.length; i++) {
				this.recursionResponseDataCreateId(data.items[i]);
			}
		},
		/**
		 * 自定义请求测试
		 */
		customRequest() {
			this.menuCurrent = 999999;
			this.menuSubCurrent = 999999;
			this.requestUrl = '';
			this.customRequestParams = [];
			this.api = {
				requestType: 'x-www-form-urlencoded',
				consumes: ['x-www-form-urlencoded', 'application/json', 'multipart/form-data', 'application/xml'],
				parameters: null,
				body: null,
				responses: null,
				proxy: false,
				responseTags: 'format',
				requestHenders: {},
				responseHeaders: {},
				response: {},
				isSxecute: false,
				executing: false
			};
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
			this.selectServer = this.customServer;
			this.customServer = '';
		},
		/**
		 * 添加自定义请求参数
		 */
		addCustomRequestParams() {
			var param = {
				join: true,
				in: 'query',
				type: 'string',
				name: '',
				value: '',
				tableRowkey: Math.random()
			};
			this.customRequestParams.push(param);
		},
		/**
		 * 加载所有项目
		 */
		loadProjectList() {
			if (this.sessionToken == null || this.sessionToken.trim() == '') {
				return;
			}
			findProjectListAPI(
				this.sessionToken,
				res => {
					var data = res.data;
					console.log('Loading project list ...');
					console.log(data);
					if (data.code === 200) {
						this.projects = data.data;
						this.api.proxy = true;
					}
				},
				err => {
					console.log('Loading project list failed:');
					console.log(err);
				}
			);
		},
		/**
		 * 通过Orion的项目id加载项目信息
		 * @param {String} id
		 */
		getProject(id) {
			if (id == null || id == '') {
				return;
			}
			var i18nTitle = this.$t('loadFailed');
			var i18nTips = this.$t('loadFailedTips');
			getProjectAPI(
				id,
				this.sessionToken,
				res => {
					var data = res.data;
					if (data.code != null && data.code != 200) {
						return;
					}
					console.log('load project...');
					console.log(data);
					this.loadDocument(data);
				},
				err => {
					this.$notify.error({
						title: i18nTitle,
						message: i18nTips,
						position: 'bottom-right'
					});
					console.log(err);
				}
			);
		},
		/**
		 * 通过URL加载项目信息
		 */
		getProjectFromUrl() {
			if (this.fileUrl.trim() === '') {
				return;
			}
			var urls = this.fileUrl;
			if (urls.charAt(0) == 'P' && urls.charAt(1) == ':') {
				urls = urls.substring(2);
				axios
					.get(SERVER_HOST + '/proxy/project?url=' + urls+"&token="+this.sessionToken)
					.then(res => {
						if (res.data.code == 200) {
							this.loadDocument(JSON.parse(res.data.data));
						} else if (res.data.code == 403) {
							this.$notify.error({
								title: this.$t('requestProxyFailed'),
								message: this.$t('ResultStatus403'),
								position: 'bottom-right'
							});
						} else {
							this.$notify.error({
								title: this.$t('requestProxyFailed'),
								message: this.$t('requestProxyFailedTips'),
								position: 'bottom-right'
							});
							console.log(res);
						}
					})
					.catch(err => {
						this.$notify.error({
							title: this.$t('requestProxyFailed'),
							message: this.$t('requestProxyFailedTips'),
							position: 'bottom-right'
						});
						console.log(err);
					});
			} else {
				axios
					.get(this.fileUrl)
					.then(res => {
						var data = res.data;
						this.loadDocument(data);
					})
					.catch(err => {
						this.$notify.error({
							title: this.$t('loadFailed'),
							message: this.$t('loadFailedTips'),
							position: 'bottom-right'
						});
						console.log(err);
					});
			}
		},
		/**
		 * 通过本地文件加载项目信息
		 */
		getProjectFromFile() {
			var reader = new FileReader();
			var file = this.$refs.readFile.files[0];
			reader.readAsText(file);
			reader.onload = res => {
				try {
					this.loadDocument(JSON.parse(res.target.result));
				} catch (err) {
					this.$notify.error({
						title: this.$t('loadFailed'),
						message: this.$t('loadFailedTips'),
						position: 'bottom-right'
					});
					console.log(err);
				}
			};
		},
		/**
		 * 加载接口文档
		 * @param {Object} data
		 */
		loadDocument(data) {
			if (data == null) {
				return;
			}
			console.log(data);
			//获取数据版本
			var orion = data.orionApi;
			var openapi = data.openapi;
			var swagger = data.swagger;
			try {
				if (openapi != null && openapi.startsWith('3.')) {
					var orionData = swaggerConvert(data);
					if (orionData == null) {
						this.$message.error(this.$t('loadFailedDocumentIsInvalid'));
						return;
					}
					console.log('load Open API:');
					this.loadProject(orionData);
				} else if (swagger != null && swagger.startsWith('2.')) {
					var orionData = swaggerConvert(data);
					if (orionData == null) {
						this.$message.error(this.$t('loadFailedDocumentIsInvalid'));
						return;
					}
					console.log('load Swagger:');
					this.loadProject(orionData);
				} else {
					this.loadProject(data);
				}
			} catch (err) {
				this.projectLoading = false;
				this.$message.error(this.$t('loadFailedTips'));
				console.log(err);
			}
		},
		/**
		 * 加载项目信息
		 *
		 * @param {Object} data
		 */
		loadProject(data) {
			console.log('data');
			console.log(data);
			if (data == null || data == '' || '{}' == JSON.stringify(data)) {
				return;
			}
			this.projectId = data.key;
			if (localStorage.getItem(data.key) != null && localStorage.getItem(data.key) != '') {
				try {
					this.parameterVariables = JSON.parse(localStorage.getItem(data.key));
				} catch (err) {
					console.log('init Parameter variables failed:');
					console.log(err);
				}
			}
			this.project.isload = true;
			this.project.key = data.key;
			this.project.name = data.name;
			this.project.versions = data.versions;
			this.project.description = data.description;
			if ((data.servers == null || data.servers == '') && (data.schemes != null && data.schemes != '')) {
				this.project.schemes = data.schemes;
				var servers = [];
				for (var i = 0; i < data.schemes.length; i++) {
					var scheme = data.schemes[i];
					var bp = data.basePath == null ? '' : data.basePath;
					var server = {
						url: scheme + '://' + data.host + bp,
						description: ''
					};
					servers.push(server);
				}
				this.project.servers = servers;
			} else {
				this.project.servers = data.servers;
			}
			if (this.project.servers == null && data.content == null) {
				this.$notify({
					title: this.$t('tips'),
					message: this.$t('loadFailedDocumentIsInvalid'),
					type: 'error',
					position: 'bottom-left',
					duration: 6000
				});
				return;
			}
			if (this.project.servers != null && this.project.servers.length > 0) {
				this.selectServer = this.project.servers[0].url;
			}
			this.project.contactName = data.contactName;
			this.project.contactInfo = data.contactInfo;
			this.project.externalDocs = data.externalDocs;
			this.project.lastTime = data.lastTime;
			this.apiGroups = data.content;

			this.$notify({
				title: this.$t('tips'),
				message: this.$t('loadSucceeded'),
				type: 'success',
				position: 'bottom-left',
				duration: 3000
			});
		},
		copy() {
			var data = this.requestUrl;
			console.log('copy:data=' + data);
			this.toCopy(data);
		},
		copyCustom() {
			var data = this.requestUrl;
			console.log('copy:data=' + data);
			this.toCopy(data);
		},
		copyPath() {
			var data = this.requestUrl.replace(this.selectServer, '');
			console.log('copy-path:data=' + data);
			this.toCopy(data);
		},
		toCopy(data) {
			var oInput = document.createElement('input');
			oInput.value = data;
			document.body.appendChild(oInput);
			oInput.select();
			document.execCommand('Copy');
			var i18nCopyed = this.$t('copySucceeded');
			this.$notify({
				title: i18nCopyed,
				type: 'success',
				position: 'bottom-right'
			});
			oInput.remove();
		},
		/**
		 * 执行请求
		 */
		execute() {
			//是否为自定义请求
			var isCustomRequest = this.menuSubCurrent == 999999;

			var isProxy = this.api.proxy;
			var type = this.api.requestType;
			var method = this.api.method;

			var url;
			var params;
			if (isCustomRequest) {
				url = this.requestUrl;
				params = this.customRequestParams || {};
			} else {
				url = this.requestUrl;
				params = this.api.parameters || {};
			}
			if (url == '') {
				var i18nRequestFailed = this.$t('requestFailed');
				var i18nUrlCannotBeEmpty = this.$t('urlCannotBeEmpty');
				this.$notify.error({
					title: i18nRequestFailed,
					message: i18nUrlCannotBeEmpty,
					position: 'bottom-right'
				});
				return;
			}
			var header = null;
			var query = null;
			var body = null;
			for (var i = 0; i < params.length; i++) {
				if (params[i].join) {
					if (params[i].value == null && params[i].in != 'path') {
						continue;
					}
					switch (params[i].in.toLowerCase()) {
						case 'path':
							var reg = new RegExp('{' + params[i].name + '}', 'g');
							url = url.replace(reg, params[i].value || '');
							reg = new RegExp('/:' + params[i].name, 'g');
							url = url.replace(reg, '/' + (params[i].value || ''));
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

			this.api.executing = true;
			var requestData = {};
			requestData.method = method;
			if (isProxy) {
				requestData.url = SERVER_HOST + '/proxy/server';
				requestData.headers = {};
				if (header != null) {
					for (var key in header) {
						this.api.requestHenders[key] = header[key];
					}
					requestData.headers['x-header'] = JSON.stringify(header);
				}
				requestData.headers['x-url'] = url;
			} else {
				requestData.url = url;
				if (header != null) {
					requestData.headers = header;
					for (var key in header) {
						this.api.requestHenders[key] = header[key];
					}
				}
			}
			//设置请求参数
			if (query != null) {
				requestData.params = query;
			}
			var useBody = true;
			//请求的主体不为空则覆盖body
			if (this.api.body != null && this.api.body.trim() != '') {
				body = this.api.body.trim();
				useBody = false;
			}
			var contentType = null;
			//设置body参数
			if (body != null) {
				if (type.indexOf('xml') != -1) {
					contentType = 'application/xml';
					if (useBody) {
						requestData.data = xmlBuilder.buildObject(body);
					} else {
						requestData.data = body;
					}
				} else if (type.indexOf('urlencoded') != -1) {
					contentType = 'application/x-www-form-urlencoded';
					if (useBody) {
						requestData.data = qs.stringify(body);
					} else {
						requestData.data = body;
					}
				} else if (type.indexOf('form-data') != -1) {
					contentType = 'multipart/form-data';
					if (useBody) {
						var formData = new FormData();
						Object.keys(body).forEach(key => {
							formData.append(key, body[key]);
						});
						requestData.data = formData;
					} else {
						requestData.data = body;
					}
				} else {
					if (type != null && type != '') {
						contentType = type;
					}
					requestData.data = body;
				}
			}

			if (contentType != null) {
				if (requestData.headers == null) {
					requestData.headers = {};
				}
				if (isProxy) {
					requestData.headers['x-type'] = contentType;
				} else {
					requestData.headers['Content-Type'] = contentType;
				}
			}

			axios(requestData)
				.then(res => {
					this.api.isSxecute = true;
					this.api.executing = false;
					this.api.response = res.data;
					this.api.responseHeaders.status = res.status;
					if (isProxy && header != null) {
						this.api.responseHeaders.tips = this.$t('responseHeaderTips');
					} else {
						delete this.api.responseHeaders.tips;
					}
					for (var key in res.headers) {
						this.api.responseHeaders[key] = res.headers[key];
					}
					console.log('request result:');
					console.log(res);
				})
				.catch(err => {
					this.api.isSxecute = true;
					this.api.executing = false;
					if (err.headers) {
						for (var key in err.headers) {
							this.api.responseHeaders[key] = err.headers[key];
						}
					}
					if (err.response != null && err.response.data != null) {
						this.api.response = err.response.data;
					} else {
						var error = {};
						error.tips = this.$t('moreInfoTips');
						error.error = err;
						this.api.response = error;
					}
					console.log('request error: ');
					console.log(err);
				});
		}
	},
	mounted() {
		this.isAsideShow = document.body.offsetWidth > 768;
		window.onresize = () => {
			this.isAsideShow = document.body.offsetWidth > 768;
			this.isMainShow = true;
		};
	}
};
</script>
<style>
/* 修改框架样式 */
.el-drawer.btt {
	height: 50% !important;
}

.el-drawer__header {
	margin-bottom: 0 !important;
	text-align: center;
}

.el-drawer__body {
	overflow: auto;
	padding: 0 20px;
}

.el-drawer__body a:hover {
	border-bottom: 2px solid #409eff !important;
}

.el-form-item {
	margin-bottom: 0 !important;
}

.el-input__inner::placeholder {
	color: #666 !important;
}

/* 通用样式 */
a {
	text-decoration: none;
	color: #304455;
}

img {
	border: none;
}

.body-max-width {
	max-width: 1240px;
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
	border-bottom: 2px solid #409eff;
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
	border-bottom: 2px solid #409eff !important;
	padding-bottom: 2px;
}

#aside #menu-body .current {
	font-weight: 600;
	color: #409eff;
}

#aside #menu-body .current .line {
	padding-bottom: 2px;
	border-bottom: 2px solid #409eff;
}

#aside #menu-body .current .line-min {
	padding-bottom: 2px;
	border-bottom: 1px solid #409eff;
}

#aside #menu-body .menu-sub li:hover {
	color: #409eff;
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
