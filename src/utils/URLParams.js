/**
 * @param {Object} name 参数的名称
 * @param {Object} url window.location.search
 */
export function getParams(name, url) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var result = url.substr(1).match(reg);
	return result ? decodeURIComponent(result[2]) : null;
}
