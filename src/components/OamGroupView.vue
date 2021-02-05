<template>
	<div>
		<table style="width: 100%;max-width: 1280px" cellpadding="5" border="0">
			<tr>
				<td style="width: 10rem;" align="right" valign="top"><b>{{ $t('GroupName') }}</b></td>
				<td>{{ group.name }}</td>
			</tr>
			<tr>
				<td align="right" valign="top"><b>{{ $t('GroupSummary') }}</b></td>
				<td>{{ group.summary  }}</td>
			</tr>
			<tr v-if="group.description">
				<td align="right" valign="top"><b>{{ $t('GroupDescription') }}</b></td>
				<td>
					<div v-html="(group.description||'').replace(/\n/g, '<br>')"></div>
				</td>
			</tr>
			<tr v-if="group.externalDocs">
				<td align="right" valign="top"><b>{{ $t('AdditionalDocument') }}</b></td>
				<td>
					<div v-html="(group.externalDocs.description||'').replace(/\n/g, '<br>')"></div>
					<div style="margin-top: 10px;"><a :href="group.externalDocs.url" style="color: #409EFF;" target="_blank">{{ group.externalDocs.url }}</a></div>
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
	export default {
		name: 'OamGroupView',
		props: {
			group: Object
		},
		data() {
			return {};
		},
		created() {},
		methods: {}
	}
</script>

<style>
</style>
