import marked from 'marked';

/**
 * 转换Swagger的文档为Orion可以识别的数据,如果转换失败则返回null
 * @param {Object} docs
 */
export default function(docs) {
	/**
	 * 加载转换OpenAPI
	 * @param {Object} data
	 */
	function ofOpenAPI(data) {
		let orionData = commonConvert(data);
		let servers = [];
		if (data.servers != null) {
			for (let i = 0; i < data.servers.length; i++) {
				let s = data.servers[i];
				let urls = [{
					url: s.url,
					description: s.description
				}];
				if (s.letiables != null) {
					for (let key in s.letiables) {
						let val = s.letiables[key];
						let def = val.default;
						if (def == null) {
							continue;
						}
						let vals = [{
							key: key,
							value: def
						}];
						if (val.enum != null) {
							for (let j = 0; j < val.enum.length; j++) {
								let va = val.enum[j];
								if (va === def) {
									continue;
								}
								vals.push({
									key: key,
									value: va
								});
							}
						}
						let ulen = urls.length;
						for (let u = 0; u < ulen; u++) {
							let url = urls[u].url;
							urls[u].url = url.replace('{' + vals[0].key + '}', vals[0].value);
							let description = urls[u].description;
							for (let e = 1; e < vals.length; e++) {
								urls.push({
									url: url.replace('{' + vals[e].key + '}', vals[e].value),
									description: description
								});
							}
						}
					}
				}
				for (let us = 0; us < urls.length; us++) {
					servers.push(urls[us]);
				}
			}
		}
		orionData.servers = servers;
		return orionData;
	}

	/**
	 * 加载转换Swagger
	 * @param {Object} data
	 */
	function ofSwagger(data) {
		let orionData = commonConvert(data);
		let servers = [];
		let nsurl = (data.host || '') + (data.basePath || '');
		if (data.schemes != null) {
			for (let i = 0; i < data.schemes.length; i++) {
				servers.push({
					url: data.schemes[i] + '://' + nsurl
				});
			}
		} else {
			if (nsurl != '') {
				servers.push({
					url: nsurl
				});
			}
		}
		orionData.servers = servers;
		return orionData;
	}
	/**
	 * 通用信息转换
	 * @param {Object} data
	 */
	function commonConvert(data) {
		let orionData = {};
		//项目信息转换开始
		if (data.info != null) {
			let info = data.info;
			if (info.title != null) {
				orionData.name = info.title;
			}
			if (info.version != null) {
				orionData.versions = info.version;
			}
			orionData.description = '';
			if (info.description != null) {
				orionData.description = marked(info.description).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
			}
			if (info.termsOfService != null) {
				if (orionData.description != '') {
					orionData.description += '\n';
				}
				if (info.license != null) {
					orionData.description += '<p>';
				} else {
					orionData.description += '<div>';
				}
				orionData.description += '<a href="' + info.termsOfService + '" target="_blank">Terms of service</a>';
				if (info.license != null) {
					orionData.description += '</p>';
				} else {
					orionData.description += '</div>';
				}
			}
			if (info.license != null) {
				if (orionData.description != '') {
					orionData.description += '\n';
				}
				orionData.description += '<div><a href="' + (info.license.url || '#') + '" target="_blank">License ' + (info.license
					.name || '') + '</a></div>';
			}
			if (info.contact != null) {
				if (info.contact.name != null) {
					orionData.contactName = info.contact.name;
				}
				if (info.contact.email != null) {
					orionData.contactInfo = 'Email: <a href="mailto:' + info.contact.email + '">' + info.contact.email + '</a>';
				}
				if (info.contact.url != null) {
					if (orionData.contactInfo == null) {
						orionData.contactInfo = '';
					} else {
						orionData.contactInfo += '　';
					}
					orionData.contactInfo += 'URL: <a href="' + info.contact.url + '" target="_blank">' + info.contact.url + '</a>';
				}
			}
		}
		//项目信息转换结束
		//分组信息转换开始
		orionData.content = [];
		let groups = {};
		if (data.tags != null) {
			for (let i = 0; i < data.tags.length; i++) {
				let tag = data.tags[i];
				tag.apis = [];
				tag.summary = tag.name;
				if (tag.description != null) {
					tag.description = marked(tag.description).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
				}
				if (groups[tag.name] != null) {
					if (tag.description) {
						if (groups[tag.name].description == null) {
							groups[tag.name].description = '';
						}
						groups[tag.name].description += marked(tag.description).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
					}
				} else {
					groups[tag.name] = tag;
				}
			}
		}
		//分组信息转换结束
		//可引用数据加载
		//加载Reference
		let refs = {};
		if (data.definitions != null) {
			for (let refkey in data.definitions) {
				refs['#/definitions/' + refkey] = data.definitions[refkey];
			}
		}
		if (data.parameters != null) {
			for (let refkey in data.parameters) {
				refs['#/parameters/' + refkey] = data.parameters[refkey];
			}
		}
		if (data.responses != null) {
			for (let refkey in data.responses) {
				refs['#/responses/' + refkey] = data.responses[refkey];
			}
		}
		if (data.components != null && data.components.schemas != null) {
			for (let refkey in data.components.schemas) {
				refs['#/components/schemas/' + refkey] = data.components.schemas[refkey];
			}
		}
		if (data.components != null && data.components.parameters != null) {
			for (let refkey in data.components.parameters) {
				refs['#/components/parameters/' + refkey] = data.components.parameters[refkey];
			}
		}
		if (data.components != null && data.components.responses != null) {
			for (let refkey in data.components.responses) {
				refs['#/components/responses/' + refkey] = data.components.responses[refkey];
			}
		}
		if (data.components != null && data.components.requestBodies != null) {
			for (let refkey in data.components.requestBodies) {
				refs['#/components/requestBodies/' + refkey] = data.components.requestBodies[refkey];
			}
		}
		if (data.components != null && data.components.headers != null) {
			for (let refkey in data.components.headers) {
				refs['#/components/headers/' + refkey] = data.components.headers[refkey];
			}
		}
		for (let refkey in refs) {
			let nref = fillSchemaRef(refs[refkey], refs);
			refs[refkey] = nref;
		}
		//可引用数据加载结束


		// API信息转换开始
		for (let path in data.paths) {
			let ad = data.paths[path];
			for (let method in ad) {
				let api = {};
				api.path = path;
				let adata = ad[method];
				api.method = method;
				api.title = adata.summary || path;
				if (adata.description != null) {
					api.description = marked(adata.description).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
				}
				api.externalDocs = adata.externalDocs;
				api.consumes = adata.consumes;
				api.produces = adata.produces;
				api.deprecated = adata.deprecated;

				// Request转换
				api.parameters = [];
				if (adata.parameters != null) {
					for (let i = 0; i < adata.parameters.length; i++) {
						loadParametersSchema(api, api.parameters, adata.parameters[i], refs);
					}
				}

				if (adata.requestBody != null && adata.requestBody.content != null) {
					if (adata.requestBody.content['application/json'] != null && adata.requestBody.content['application/json'].schema != null) {
						let schema = adata.requestBody.content['application/json'];
						loadRequestBody(api, api.parameters, schema, refs);
					} else if (adata.requestBody.content['*/*'] != null && adata.requestBody.content['*/*'].schema != null) {
						let schema = adata.requestBody.content['*/*'];
						loadRequestBody(api, api.parameters, schema, refs);
					} else {
						api.body = JSON.stringify(fillSchemaRef(adata.requestBody, refs));
					}
				}

				// Response转换
				api.responses = [];
				for (let pkey in adata.responses) {
					let pdata = adata.responses[pkey];
					let resp = {
						status: pkey,
						msg: pdata.description || '',
						data: []
					};
					if (pdata.headers != null) {
						for (let hkey in pdata.headers) {
							let hdata = pdata.headers[hkey];
							if (hdata.schema != null) {
								for (let skey in hdata.schema) {
									if (hdata[skey] != null) {
										hdata[skey] = hdata.schema[skey];
									}
								}
							}
							let rdata = {};
							rdata.in = 'header';
							rdata.type = hdata.type || 'string';
							rdata.name = hkey;
							rdata.description = hdata.description || '';
							if (hdata.items != null) {
								rdata.items = hdata.items;
							}
							resp.data.push(rdata);
						}
					}


					if (pdata.content != null) {
						if (pdata.content['application/json'] != null && pdata.content['application/json'].schema != null) {
							let schema = pdata.content['application/json'].schema;
							loadResponseSchema(resp.data, schema, refs);
						} else {
							resp.schema = fillSchemaRef(pdata.content, refs);
						}
					}
					if (pdata.schema != null) {
						loadResponseSchema(resp.data, pdata.schema, refs);
					}

					api.responses.push(resp);
				}

				let tempGroup;
				if (adata.tags != null && adata.tags.length >= 1) {
					tempGroup = groups[adata.tags[0]];
				}
				if (tempGroup == null) {
					if (groups['Unnamed'] == null) {
						groups['Unnamed'] = {
							name: 'Unnamed',
							summary: 'This group has not been named',
							apis: []
						};
					}
					tempGroup = groups['Unnamed'];
				}
				tempGroup.apis.push(api);
				// console.log('api');
				// console.log(api);
			}
		}

		// API信息转换结束
		for (let key in groups) {
			orionData.content.push(groups[key]);
		}
		orionData.externalDocs = data.externalDocs;
		return orionData;
	}
	/**
	 * 填充Schema
	 * @param {Object} ref
	 * @param {Object} refs 可引用的对象集
	 */
	function fillSchemaRef(ref, refs) {
		let refStr = JSON.stringify(ref);
		let refkeys = refStr.match(/"\$ref":".*?(?=")/g);
		if (refkeys == null) {
			return JSON.parse(refStr);
		}
		for (let i = 0; i < refkeys.length; i++) {
			let key = refkeys[i].replace('"$ref":"', '');
			let obj = refs[key];
			refStr = refStr.replace('"' + key + '"', JSON.stringify(obj));
			while (refStr.indexOf(key) != -1) {
				refStr = refStr.replace('"' + key + '"', JSON.stringify(obj));
			}
		}
		return JSON.parse(refStr);
	}

	/**
	 * 将parameters的Schema加载到OrionRequest中data中,如果是body数据则将body返回
	 * @param {Object} api API的基本信息
	 * @param {Object} requestData OrionRequest 的数据
	 * @param {Object} fromSchema 要需要转换加载的数据
	 * @param {Object} refs 可引用的对象集
	 */
	function loadParametersSchema(api, parameter, fromSchema, refs) {
		let schema;
		if (fromSchema['$ref'] != null) {
			schema = JSON.parse(JSON.stringify(refs[fromSchema['$ref']]));
		} else {
			schema = JSON.parse(JSON.stringify(fromSchema))
		}
		if (schema['in'] == 'body') {
			loadRequestBody(api, parameter, schema, refs);
			return;
		}

		if (schema.schema != null) {
			if (schema.schema['$ref'] != null) {
				schema.schema = refs[schema.schema['$ref']];
			}
			if (schema.schema != null) {
				if (schema.schema.type != null && schema.type == null) {
					schema.type = schema.schema.type;
				}
				if (schema.schema.format != null && schema.format == null) {
					schema.format = schema.schema.format;
				}
				if (schema.schema.description != null && schema.description == null) {
					schema.description = schema.schema.description;
				}
				if (schema.schema['default'] != null && schema['default'] == null) {
					schema['default'] = schema.schema['default'];
				}
				if (schema.schema.maximum != null && schema.maximum == null) {
					schema.maximum = schema.schema.maximum;
				}
				if (schema.schema.minimum != null && schema.minimum == null) {
					schema.minimum = schema.schema.minimum;
				}
				if (schema.schema.maxLength != null && schema.maxLength == null) {
					schema.maxLength = schema.schema.maxLength;
				}
				if (schema.schema.pattern != null && schema.pattern == null) {
					schema.pattern = schema.schema.pattern;
				}
				if (schema.schema['enum'] != null && schema['enum'] == null) {
					schema['enum'] = schema.schema['enum'];
				}
				if (schema.schema.required != null && schema.required == null) {
					schema.required = schema.schema.required;
				}
			}
		}
		if (schema['default'] != null) {
			schema.def = schema['default'];
		}
		if (schema['enum'] != null) {
			schema.enums = schema['enum'];
		}

		schema.type = getSchemaDataType(schema) || '';
		if (schema.description != null) {
			schema.description = marked(schema.description).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
		}
		if (schema.type == 'array' && schema.items != null) {
			let arraySchema = fillSchemaRef(schema.items, refs);
			if (schema.description == null) {
				schema.description = '';
			} else {
				schema.description += '<br>';
			}
			schema.description += 'schema: ' + JSON.stringify(arraySchema);
		}

		if (schema.properties != null) {
			schema.items = [];
			loadParameterProperties(schema.items, schema.properties, schema.required, refs);
		}
		if (schema.schema != null && schema.schema.properties != null) {
			schema.items = [];
			loadParameterProperties(schema.items, schema.schema.properties, schema.schema.required, refs);
		}
		if (schema['in'] == 'formData') {
			schema['in'] = 'body';
		}
		parameter.push(schema);
	}
	/**
	 * 将body参数加载到Orion的请求参数
	 * @param {Object} api API的基本信息
	 * @param {Object} parameter API的请求参数
	 * @param {Object} fromSchema
	 * @param {Object} refs
	 */
	function loadRequestBody(api, parameter, fromSchema, refs) {
		let schema;
		let schemaType;
		if (fromSchema.schema != null) {
			schemaType = fromSchema.schema.type;
			let ref;
			if (fromSchema.schema['$ref'] != null) {
				ref = refs[fromSchema.schema['$ref']];
			} else if (fromSchema.schema['items'] != null) {
				if (fromSchema.schema.items['$ref'] != null) {
					ref = refs[fromSchema.schema.items['$ref']];
				}
			} else {
				ref = fromSchema.schema;
			}
			if (ref == null) {
				fromSchema['in'] = 'body';
				if (fromSchema['default'] != null) {
					fromSchema.def = fromSchema['default'];
				}
				if (fromSchema['enum'] != null) {
					fromSchema.enums = fromSchema['enum'];
				}
				fromSchema.type = getSchemaDataType(fromSchema) || '';
				parameter.push(fromSchema);
				return;
			}
			schema = JSON.parse(JSON.stringify(ref));
		} else {
			schema = JSON.parse(JSON.stringify(fromSchema));
		}

		let items = [];
		if (schema.properties != null) {
			loadParameterProperties(items, schema.properties, schema.required, refs);
		}
		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			item['in'] = 'body';
			if (item['default'] != null) {
				item.def = item['default'];
			}
			if (item['enum'] != null) {
				item.enums = item['enum'];
			}
			item.type = getSchemaDataType(item) || '';
			parameter.push(item);
		}
		if ('array' == schemaType) {
			let body = '[{';
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				if (i > 0) {
					body += ',';
				}
				body += '"' + item['name'] + '":';
				if ('string' == item['type']) {
					body += '"' + (item['default'] == null ? ('{' + item['name'] + '}') : item['default']) + '"';
				} else {
					body += (item['default'] == null ? ('{' + item['name'] + '}') : item['default']);
				}
			}
			body += '}]';
			api.body = body;
		}
	}


	/**
	 * 添加对象属性里面的子属性
	 * @param {Object} items Orion的属性中的items
	 * @param {Object} properties 需要加载的属性
	 * @param {Object} required 需要加载的属性那些是必填
	 * @param {Object} refs 属性引用
	 */
	function loadParameterProperties(items, properties, required, refs) {
		if (refs) console.log();
		for (let pkey in properties) {
			let pdata = null;
			pdata = properties[pkey];
			if (pdata['$ref'] != null) {
				pdata = pdata['$ref'];
				if (pdata.properties != null) {
					pdata.items = [];
					for (let pdkey in pdata.properties) {
						let pddata = pdata.properties[pdkey];
						let item = {
							name: pdkey
						};
						item.type = getSchemaDataType(pddata) || '';
						item.description = pddata.description;
						pdata.items.push(item);
					}
				}
			}
			pdata.name = pkey;
			if (required != null && required.includes(pkey)) {
				pdata.required = true;
			} else {
				pdata.required = false;
			}
			pdata.type = getSchemaDataType(pdata);
			if (pdata.description != null) {
				pdata.description = marked(pdata.description).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
			}
			if (pdata.type == 'array' && pdata.items != null) {
				let desc = 'schema: ' + JSON.stringify(pdata.items);
				if (pdata.description == null) {
					pdata.description = desc;
				} else if (pdata.description != desc) {
					pdata.description = pdata.description + '<br>' + desc;
				}
			}
			items.push(pdata);
		}
	}

	/**
	 * 将Response的Schema加载到OrionResponse中data中
	 * @param {Object} responseData OrionResponse 的数据
	 * @param {Object} schema 要需要转换加载的数据
	 * @param {Object} refs 可引用的对象集
	 */
	function loadResponseSchema(responseData, schema, refs) {
		let flag = 0;
		if (schema['$ref'] != null) {
			schema = refs[schema['$ref']];
		}
		if (schema.type == 'array' && schema.items != null) {
			if (schema.items['$ref'] != null) {
				schema = schema.items['$ref'];
				if (schema.properties != null || schema.additionalProperties != null) {
					flag++;
				}
			} else {
				schema = schema.items;
			}
		}
		if (schema['$ref'] != null) {
			schema = refs[schema['$ref']];
		}
		if (schema.type == 'array' && schema.items != null) {
			if (schema.items['$ref'] != null) {
				schema = schema.items['$ref'];
				if (schema.properties != null || schema.additionalProperties != null) {
					flag++;
				}
			} else {
				schema = schema.items;
			}
		}
		if (schema.properties != null) {
			for (let skey in schema.properties) {
				let rdata = {};
				rdata.in = 'body';
				rdata.type = getSchemaDataType(schema.properties[skey]) || 'string';
				rdata.name = skey;
				let desc = schema.properties[skey].description || '';
				if (desc != null) {
					rdata.description = marked(desc).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
				}
				responseData.push(rdata);
			}
			flag++;
		}
		if (schema.additionalProperties != null) {
			for (let skey in schema.additionalProperties) {
				let rdata = {};
				rdata.in = 'body';
				rdata.type = getSchemaDataType(schema.additionalProperties[skey]) || 'string';
				rdata.name = skey;
				let desc = schema.additionalProperties[skey].description || '';
				if (desc != null) {
					rdata.description = marked(desc).replace(/^(\s|<p>)+|(\s|<\/p>)+$/g, '');
				}
				responseData.push(rdata);
			}
			flag++;
		}
		if (flag == 0) {
			responseData.schema = schema;
		}
	}

	/**
	 * 获取Swagger(OpenAPI)的数据类型
	 * @param {Object} ref
	 */
	function getSchemaDataType(ref) {
		if (ref.type != null) {
			if (ref.type == 'integer' && ref.format == 'int64') {
				return 'long';
			} else if (ref.type == 'integer') {
				return 'int';
			} else if (ref.type == 'number' && ref.format == 'float') {
				return 'float';
			} else if (ref.type == 'number' && ref.format == 'double') {
				return 'double';
			}
		}
		return ref.type;
	}

	let openapi = docs.openapi;
	let swagger = docs.swagger;
	if (openapi != null && openapi.startsWith('3.')) {
		return ofOpenAPI(docs);
	} else if (swagger != null && swagger.startsWith('2.')) {
		return ofSwagger(docs);
	} else {
		return null
	}
}
