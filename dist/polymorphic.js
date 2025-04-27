'use strict';

exports.__esModule = true;
// 处理业务多态的函数
// 为业务中的特殊场景对捕获的日志做特殊处理

/**
 * 捕获到的 unhandledrejection 事件如果是个普通对象，与业务团队约定提取 message && method 作为 error message，实现优雅聚合
 */
var formatPlainObjectMessage = function formatPlainObjectMessage(obj) {
    if (obj.method || obj.message) {
        var errMsg = {
            method: obj.method,
            message: obj.message
        };
        return JSON.stringify(errMsg);
    }

    return '未处理的 unhandledrejection 事件';
};

exports.default = {
    formatPlainObjectMessage: formatPlainObjectMessage
};
module.exports = exports['default'];