'use strict';

exports.__esModule = true;
/*
工具函数集
*/
/* eslint-disable no-param-reassign */
// Yanked from https://git.io/vS8DV re-used under CC0
// with some tiny modifications
var isError = function isError(value) {
    switch ({}.toString.call(value)) {
        case '[object Error]':
            return true;
        case '[object Exception]':
            return true;
        case '[object DOMException]':
            return true;
        default:
            return value instanceof Error;
    }
};

var supportsErrorEvent = function supportsErrorEvent() {
    try {
        new ErrorEvent(''); // eslint-disable-line no-new
        return true;
    } catch (e) {
        return false;
    }
};

var isErrorEvent = function isErrorEvent(value) {
    var result = supportsErrorEvent() && {}.toString.call(value) === '[object ErrorEvent]';
    return result;
};

var isUndefined = function isUndefined(what) {
    return what === undefined;
};

var isNull = function isNull(what) {
    return what === null;
};

var isFunction = function isFunction(what) {
    return typeof what === 'function';
};

var isPlainObject = function isPlainObject(what) {
    return Object.prototype.toString.call(what) === '[object Object]';
};

var isString = function isString(what) {
    return Object.prototype.toString.call(what) === '[object String]';
};

var isArray = function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
};

var isXMLHttpRequest = function isXMLHttpRequest(what) {
    return Object.prototype.toString.call(what) === '[object XMLHttpRequest]';
};

var isBoolean = function isBoolean(what) {
    return Object.prototype.toString.call(what) === '[object Boolean]';
};

var isEvent = function isEvent(what) {
    return Object.prototype.toString.call(what) === '[object Event]';
};

var isEmptyObject = function isEmptyObject(what) {
    if (!isPlainObject(what)) {
        return false;
    }

    for (var _ in what) {
        // eslint-disable-next-line no-prototype-builtins
        if (what.hasOwnProperty(_)) {
            return false;
        }
    }
    return true;
};

// 判断 url 是否合法
var isUrl = function isUrl(url) {
    if (!url) {
        return false;
    }
    // eslint-disable-next-line no-useless-escape
    var urlPattern = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/\?\:]?.*$/;
    return urlPattern.test(url);
};

// eslint-disable-next-line arrow-body-style
var supportsFetch = function supportsFetch() {
    if (!('fetch' in window)) {
        return false;
    }

    try {
        new Headers(); // eslint-disable-line no-new
        new Request(''); // eslint-disable-line no-new
        new Response(); // eslint-disable-line no-new
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * hasKey, a better form of hasOwnProperty
 * Example: hasKey(MainHostObject, property) === true/false
 *
 * @param {Object} host object to check property
 * @param {string} key to check
 */
var hasKey = function hasKey(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
};

var each = function each(obj, callback) {
    var i = void 0;
    var j = void 0;

    if (isUndefined(obj.length)) {
        for (i in obj) {
            if (hasKey(obj, i)) {
                callback(i, obj[i]);
            }
        }
    } else {
        j = obj.length;
        if (j) {
            for (i = 0; i < j; i++) {
                callback(i, obj[i]);
            }
        }
    }
};

var objectMerge = function objectMerge(obj1, obj2) {
    if (!obj2) {
        return obj1;
    }
    each(obj2, function (key, value) {
        obj1[key] = value;
    });
    return obj1;
};

var joinRegExp = function joinRegExp(patterns) {
    // Combine an array of regular expressions and strings into one large regexp
    // Be mad.
    var sources = [];
    var i = 0;
    var len = patterns.length;
    var pattern = void 0;

    for (; i < len; i++) {
        pattern = patterns[i];
        if (isString(pattern)) {
            // If it's a string, we need to escape it
            // Taken from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            sources.push(pattern.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')); // eslint-disable-line
        } else if (pattern && pattern.source) {
            // If it's a regexp already, we want to extract the source
            sources.push(pattern.source);
        }
        // Intentionally skip other cases
    }
    return new RegExp(sources.join('|'), 'i');
};

// borrowed from https://tools.ietf.org/html/rfc3986#appendix-B
// intentionally using regex and not <a/> href parsing trick because React Native and other
// environments where DOM might not be available
var parseUrl = function parseUrl(url) {
    if (typeof url !== 'string') {
        return {};
    }
    var match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/); // eslint-disable-line

    // coerce to undefined values to empty string so we don't get 'undefined'
    var query = match[6] || '';
    var fragment = match[8] || '';
    return {
        protocol: match[2],
        host: match[4],
        path: match[5],
        relative: match[5] + query + fragment // everything minus origin
    };
};

/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @param HTMLElement
 * @returns {string}
 */
var htmlElementAsString = function htmlElementAsString(elem) {
    var out = [];
    var className = void 0;
    var classes = void 0;
    var key = void 0;
    var attr = void 0;
    var i = void 0;

    if (!elem || !elem.tagName) {
        return '';
    }

    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
        out.push('#' + elem.id);
    }

    // eslint-disable-next-line prefer-const
    className = elem.className;
    if (className && isString(className)) {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push('.' + classes[i]);
        }
    }
    var attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
        key = attrWhitelist[i];
        attr = elem.getAttribute(key);
        if (attr) {
            out.push('[' + key + '="' + attr + '"]');
        }
    }
    return out.join('');
};

/**
 * Given a child DOM element, returns a query-selector statement describing that
 * and its ancestors
 * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
 * @param elem
 * @returns {string}
 */
var htmlTreeAsString = function htmlTreeAsString(elem) {
    var MAX_TRAVERSE_HEIGHT = 5;
    var MAX_OUTPUT_LEN = 80;
    var out = [];
    var height = 0;
    var len = 0;
    var separator = ' > ';
    var sepLength = separator.length;
    var nextStr = void 0;

    while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = htmlElementAsString(elem);
        // bail out if
        // - nextStr is the 'html' element
        // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
        //   (ignore this limit if we are on the first iteration)
        if (nextStr === 'html' || height > 1 && len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN) {
            break;
        }

        out.push(nextStr);

        len += nextStr.length;
        elem = elem.parentNode;
    }

    return out.reverse().join(separator);
};

/**
 * Polyfill a method
 * @param obj object e.g. `document`
 * @param name method name present on object e.g. `addEventListener`
 * @param replacement replacement function
 * @param track {optional} record instrumentation to an array
 */
var fill = function fill(obj, name, replacement, track) {
    var orig = obj[name];
    obj[name] = replacement(orig);
    // eslint-disable-next-line no-underscore-dangle
    obj[name].__corona__ = true;
    // eslint-disable-next-line no-underscore-dangle
    obj[name].__orig__ = orig;
    if (track) {
        track.push([obj, name, orig]);
    }
};

/**
 * Join values in array
 * @param input array of values to be joined together
 * @param delimiter string to be placed in-between values
 * @returns {string}
 */
var safeJoin = function safeJoin(input, delimiter) {
    if (!isArray(input)) {
        return '';
    }

    var output = [];

    for (var i = 0; i < input.length; i++) {
        try {
            output.push(String(input[i]));
        } catch (e) {
            output.push('[value cannot be serialized]');
        }
    }

    return output.join(delimiter);
};

/**
 * 根据域名判断是否 k 歌业务
 * @param hostname
 * @returns {boolean}
 */
var isKSongBiz = function isKSongBiz(hostname) {
    var kSongDomain = ['k.174.com', 'm.k.174.com', 'st.k.174.com', 'mp.k.174.com'];
    if (kSongDomain.indexOf(hostname) > -1) {
        return true;
    }
    return false;
};

/**
 * 根据域名判断是否海外业务
 * @param hostname
 * @returns {boolean}
 */
var isOverseaBiz = function isOverseaBiz(hostname) {
    var OverseaDomain = /(baechat\.my|kayalive\.tv)/;
    return OverseaDomain.test(hostname);
};

/**
 * 根据域名判断是否心遇业务
 * @param hostname
 * @returns {boolean}
 */
var isMoyiBiz = function isMoyiBiz(hostname) {
    var MoyiDomainReg = /\.friend\.163\.com/;
    return MoyiDomainReg.test(hostname);
};

/**
 * 根据域名判断是否妙时业务
 * @param hostname
 * @returns {boolean}
 */
var isCrushBiz = function isCrushBiz(hostname) {
    var CrushDomainReg = /\.crush\.163\.com/;
    return CrushDomainReg.test(hostname);
};

/**
 * 根据域名判断是否心颜业务
 * @param hostname
 * @returns {boolean}
 */
var isMirthBiz = function isMirthBiz(hostname) {
    var MirthDomainReg = /\.wave\.163\.com/;
    return MirthDomainReg.test(hostname);
};

/**
 * 根据域名判断是否look业务
 * @param {string} hostname
 * @returns {boolean}
 */
var isLookBiz = function isLookBiz(hostname) {
    return (/(^|\.)look.163\.com/.test(hostname)
    );
};

/**
 * 根据域名判断是否iplay业务
 * @param {string} hostname
 * @returns {boolean}
 */
var isIplayBiz = function isIplayBiz(hostname) {
    return (/(^|\.)iplay\.163\.com/.test(hostname)
    );
};

exports.default = {
    isError: isError,
    isErrorEvent: isErrorEvent,
    isUndefined: isUndefined,
    isNull: isNull,
    isFunction: isFunction,
    isPlainObject: isPlainObject,
    isString: isString,
    isArray: isArray,
    isEmptyObject: isEmptyObject,
    isXMLHttpRequest: isXMLHttpRequest,
    isBoolean: isBoolean,
    isEvent: isEvent,
    supportsErrorEvent: supportsErrorEvent,
    supportsFetch: supportsFetch,
    each: each,
    objectMerge: objectMerge,
    hasKey: hasKey,
    joinRegExp: joinRegExp,
    htmlTreeAsString: htmlTreeAsString,
    htmlElementAsString: htmlElementAsString,
    parseUrl: parseUrl,
    fill: fill,
    safeJoin: safeJoin,
    isKSongBiz: isKSongBiz,
    isOverseaBiz: isOverseaBiz,
    isUrl: isUrl,
    isMoyiBiz: isMoyiBiz,
    isCrushBiz: isCrushBiz,
    isMirthBiz: isMirthBiz,
    isLookBiz: isLookBiz,
    isIplayBiz: isIplayBiz
};
module.exports = exports['default'];