// +----------------------------------------------------------------------
// | corona
// +----------------------------------------------------------------------
// | HomePage : https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk
// +----------------------------------------------------------------------
// | Author: panwanqiang <panwanqiang@corp.verify.com>
// +----------------------------------------------------------------------
/*
 eslint-disable no-param-reassign
*/

import CoronaConstructor from './core.js';
import coronaOptions from './config';
import utils from './utils';
import polymorphic from './polymorphic';

var objectMerge = utils.objectMerge;
var Coronacore = new CoronaConstructor();

/**
 * 处理xhr对象，提取关键属性并返回
 * @param {Object} xhrObj
 */
var extractXhrAttr = function extractXhrAttr(xhrObj) {
    if (!utils.isXMLHttpRequest(xhrObj)) {
        return xhrObj;
    }
    var result = {};
    objectMerge(result, xhrObj);
    result.readyState = xhrObj.readyState;
    result.responseText = xhrObj.responseText;
    result.responseType = xhrObj.responseType;
    result.responseURL = xhrObj.responseURL;
    result.status = xhrObj.status;
    result.statusText = xhrObj.statusText;
    result.timeout = xhrObj.timeout;
    return result;
};

/**
 * 处理event对象，提取关键属性并返回
 * @param {Object} eventObj
 */
var extractEventAttr = function extractEventAttr(eventObj) {
    if (!utils.isEvent(eventObj)) {
        return eventObj;
    }
    var result = {};
    // eslint-disable-next-line guard-for-in
    for (var i in eventObj) {
        result[i] = eventObj[i];
    }
    return result;
};

/**
 * 处理特殊对象，提取关键属性并返回
 * @param {Object} obj
 */
var extractAttr = function extractAttr(obj) {
    if (utils.isXMLHttpRequest(obj)) {
        return extractXhrAttr(obj);
    }
    if (utils.isEvent(obj)) {
        return extractEventAttr(obj);
    }
    return obj;
};

/**
 * 设置用户
 * @param {string} user
 */
var setUser = function setUser(user) {
    if (!utils.isString(user)) {
        // eslint-disable-next-line no-console
        console.warn('Corona setUser failed, the argument must be a string');
    } else {
        Coronacore.setUserContext(user);
    }
};

/**
 * 设置全局tag
 * @param {object} tag
 */
var setGlobalTags = function setGlobalTags(tag) {
    if (!utils.isPlainObject(tag)) {
        // eslint-disable-next-line no-console
        console.warn('Corona setGlobalTags failed, the argument must be a plain object');
    } else {
        Coronacore.setTagsContext(tag);
    }
};

/**
 * 设置日志发送失败的错误处理回调
 * @param {function | null} cb
 */
var setGlobalOnError = function setGlobalOnError(cb) {
    if (!utils.isFunction(cb) && !utils.isNull(cb)) {
        // eslint-disable-next-line no-console
        console.warn('Corona setGlobalOnError failed, the argument must be a function or null');
    } else {
        Coronacore.setSentErrorCallback(cb);
    }
};

/**
 * 设置事件上报接口，适配业务的域名，携带 cookie 解析登录态
 * @param {string} url
 */
var setEventUrl = function setEventUrl(url) {
    if (!utils.isUrl(url)) {
        // eslint-disable-next-line no-console
        console.warn('Corona setEventUrl failed, the argument must be an url');
    } else {
        Coronacore.setEventUrl(url);
    }
};

/**
 * 发送信息
 * @param {string | Object} msg
 */
var info = function info(msg, tags) {
    var message = void 0;
    var payloads = {
        level: 'info',
        tags: '',
        active: true
    };

    if (typeof msg === 'string') {
        message = msg;
    } else if (msg instanceof Error) {
        message = msg.message;
    } else {
        message = 'Corona入参Error：信息只可以传字符串';
        msg = extractAttr(msg);
        if (utils.isPlainObject(msg)) {
            tags = utils.isPlainObject(tags) ? objectMerge(tags, msg) : msg;
        }
    }
    payloads.tags = tags || '';

    Coronacore.captureMessage(message, payloads);
};

/**
 * 发送警告
 * @param {string | Object} msg
 */
var warn = function warn(msg, tags) {
    var message = void 0;
    var payloads = {
        level: 'warn',
        tags: '',
        active: true
    };

    if (typeof msg === 'string') {
        message = msg;
    } else if (msg instanceof Error) {
        message = msg.message;
    } else {
        message = 'Corona入参Error：警告只可以传字符串';
        msg = extractAttr(msg);
        if (utils.isPlainObject(msg)) {
            tags = utils.isPlainObject(tags) ? objectMerge(tags, msg) : msg;
        }
    }
    payloads.tags = tags || '';

    Coronacore.captureMessage(message, payloads);
};

/**
 * 发送错误
 * @param {string | object} msg
 * @param {undefined | boolean} active 如果是 undefined 则根据 msg 类型定义上报行为，是错误对象则为 false
 */
var error = function error(msg, tags, active, type) {
    var message = void 0;
    var preProcessActive = void 0;
    var msgIsError = msg instanceof Error;

    if (utils.isBoolean(active)) {
        preProcessActive = active;
    } else if (msgIsError) {
        preProcessActive = false;
    } else {
        preProcessActive = true;
    }
    var payloads = {
        level: 'error',
        tags: '',
        active: preProcessActive
    };
    var errPayloads = {};

    if (typeof msg === 'string') {
        message = msg;
    } else if (msgIsError) {
        // 提取传入的 Error 对象的自定义属性，作为 tags 上报
        for (var i in msg) {
            // eslint-disable-next-line no-prototype-builtins
            if (msg.hasOwnProperty(i)) {
                errPayloads[i] = msg[i];
            }
        }
        message = msg;
    } else {
        message = 'Corona入参Error：错误只可以传字符串或者错误对象';
        msg = extractAttr(msg);
        if (utils.isPlainObject(msg)) {
            tags = utils.isPlainObject(tags) ? objectMerge(tags, msg) : msg;
        }
    }

    // 错误对象上有自定义数据
    if (JSON.stringify(errPayloads) !== '{}') {
        if (utils.isPlainObject(tags)) {
            tags = Object.assign({}, errPayloads, tags);
        } else {
            tags = errPayloads;
        }
    }
    payloads.tags = tags || '';

    Coronacore.captureException(message, payloads, type);
};

/**
 * 全局捕获 unhandledrejection 事件的处理函数
 * @param {object} reason
 */
var onunhandledrejectionCallback = function onunhandledrejectionCallback(reason) {
    // 如果 reject 出来的是个普通对象，为了友好上报放到 tag 信息里
    if (utils.isPlainObject(reason)) {
        var errorMessage = polymorphic.formatPlainObjectMessage(reason);
        error(errorMessage, reason, false, 'unhandledrejection');
        // 如果 reject 出来的是个数组，为了友好上报放到 tag 信息里
    } else if (utils.isArray(reason)) {
        error('未处理的 unhandledrejection 事件', {
            type: 'array',
            data: JSON.stringify(reason)
        }, false, 'unhandledrejection');
        // 如果 reject 出来的是个函数，为了友好上报放到 tag 信息里
    } else if (utils.isFunction(reason)) {
        error('未处理的 unhandledrejection 事件', {
            type: 'function',
            data: reason.toString()
        }, false, 'unhandledrejection');
        // 如果 reject 出来的是个boolean，为了友好上报放到 tag 信息里
    } else if (utils.isBoolean(reason)) {
        error('未处理的 unhandledrejection 事件', {
            type: 'boolean',
            data: reason
        }, false, 'unhandledrejection');
        // 如果 reject 出来的是个 XMLHttpRequest 对象，提取接口信息聚合
    } else if (utils.isXMLHttpRequest(reason)) {
        var errMsg = reason.responseURL && reason.responseURL.split('?')[0] + ' \u8BF7\u6C42\u5931\u8D25' || '接口请求失败';
        var tags = extractXhrAttr(reason);
        error(errMsg, tags, false, 'unhandledrejection');
    } else {
        error(reason, {
            type: Object.prototype.toString.call(reason)
        }, false, 'unhandledrejection');
    }
};

/**
 * 全局捕获 error 事件的处理函数
 * @param {object} 错误对象
 */
var onerrorCallback = function onerrorCallback(e) {
    // __corona_wrapper__ 是已被 try-catch 劫持的标识，不再重复上报
    if (e && e.type === '__corona_wrapper__') {
        return;
    }
    if (e) {
        error(e, '', false);
    }
};

/**
 * 上报缓存错误（为cloudverify异步下发 SDK 做的 hack 处理）
 * @param {object} 错误对象
 */
var uploadCacheError = function uploadCacheError() {
    // eslint-disable-next-line no-underscore-dangle
    if (!window.corona_error_cache || !window.corona_error_cache.data || !window.corona_error_cache.data.length) {
        return;
    }

    window.corona_error_cache.data.forEach(function (element) {
        if (element.event === 'error') {
            onerrorCallback(element.e);
        }
        if (element.event === 'unhandledrejection') {
            onunhandledrejectionCallback(element.e);
        }
    });
    // 释放
    delete window.corona_error_cache;
    // xxx
};

/**
 * 启动监控
 * @param {object}
 * @param {number} id 应用在 corona 中的接入 id
 * @param {string} env 当前环境变量，默认 'prod'
 * @param {boolean} debug 是否开启 debug 模式，开启后会上报 dev 环境的错误日志，默认 false
 */
var corona = function corona(params) {
    if (!params.id) {
        // eslint-disable-next-line no-console
        console.warn('Corona 初始化失败：请传入应用 id');
        return null;
    }
    var env = params.env || 'prod';
    var debug = params.debug || false;
    Coronacore.config(params.id, env, debug, coronaOptions).install();

    // 启动时增加全局捕获 Promise 的未处理异常 unhandledrejection 事件
    window.onunhandledrejection = function (e) {
        onunhandledrejectionCallback(e.reason);
    };
    // 启动时增加全局捕获错误事件，用于处理通过 Corona 劫持回调函数无法覆盖的场景
    window.onerror = function (msg, url, lineNo, columnNo, e) {
        onerrorCallback(e);
    };
    uploadCacheError();

    setTimeout(function () {
        // 抛出 Corona 初始化成功的全局事件
        var coronaInited = new Event('CoronaInited');
        window.document.dispatchEvent(coronaInited);
    }, 0);

    return {
        info: info,
        warn: warn,
        error: error,
        setUser: setUser,
        setGlobalTags: setGlobalTags,
        setGlobalOnError: setGlobalOnError,
        setEventUrl: setEventUrl
    };
};

// 将corona函数挂载在全局对象上
window.MusicCorona = corona;

export default corona;