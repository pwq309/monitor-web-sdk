/*
工具函数集
*/
/* eslint-disable no-param-reassign */
// Yanked from https://git.io/vS8DV re-used under CC0
// with some tiny modifications
const isError = (value) => {
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

const supportsErrorEvent = () => {
    try {
        new ErrorEvent(''); // eslint-disable-line no-new
        return true;
    } catch (e) {
        return false;
    }
};

const isErrorEvent = (value) => {
    const result = supportsErrorEvent() && {}.toString.call(value) === '[object ErrorEvent]';
    return result;
};

const isUndefined = what => what === undefined;

const isNull = what => what === null;

const isFunction = what => typeof what === 'function';

const isPlainObject = what => Object.prototype.toString.call(what) === '[object Object]';

const isString = what => Object.prototype.toString.call(what) === '[object String]';

const isArray = what => Object.prototype.toString.call(what) === '[object Array]';

const isXMLHttpRequest = what => Object.prototype.toString.call(what) === '[object XMLHttpRequest]';

const isBoolean = what => Object.prototype.toString.call(what) === '[object Boolean]';

const isEvent = what => Object.prototype.toString.call(what) === '[object Event]';

const isEmptyObject = (what) => {
    if (!isPlainObject(what)) {
        return false;
    }

    for (const _ in what) {
        // eslint-disable-next-line no-prototype-builtins
        if (what.hasOwnProperty(_)) {
            return false;
        }
    }
    return true;
};

// 判断 url 是否合法
const isUrl = (url) => {
    if (!url) {
        return false;
    }
    // eslint-disable-next-line no-useless-escape
    const urlPattern = /^((http|https):\/\/)?(([A-Za-z0-9]+-[A-Za-z0-9]+|[A-Za-z0-9]+)\.)+([A-Za-z]+)[/\?\:]?.*$/;
    return urlPattern.test(url);
};

// eslint-disable-next-line arrow-body-style
const supportsFetch = () => {
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
const hasKey = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const each = (obj, callback) => {
    let i;
    let j;

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

const objectMerge = (obj1, obj2) => {
    if (!obj2) {
        return obj1;
    }
    each(obj2, (key, value) => {
        obj1[key] = value;
    });
    return obj1;
};

const joinRegExp = (patterns) => {
    // Combine an array of regular expressions and strings into one large regexp
    // Be mad.
    const sources = [];
    let i = 0;
    const len = patterns.length;
    let pattern;

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
const parseUrl = (url) => {
    if (typeof url !== 'string') {
        return {};
    }
    let match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/); // eslint-disable-line

    // coerce to undefined values to empty string so we don't get 'undefined'
    const query = match[6] || '';
    const fragment = match[8] || '';
    return {
        protocol: match[2],
        host: match[4],
        path: match[5],
        relative: match[5] + query + fragment, // everything minus origin
    };
};

/**
 * Returns a simple, query-selector representation of a DOM element
 * e.g. [HTMLElement] => input#foo.btn[name=baz]
 * @param HTMLElement
 * @returns {string}
 */
const htmlElementAsString = (elem) => {
    const out = [];
    let className;
    let classes;
    let key;
    let attr;
    let i;

    if (!elem || !elem.tagName) {
        return '';
    }

    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
        out.push(`#${elem.id}`);
    }

    // eslint-disable-next-line prefer-const
    className = elem.className;
    if (className && isString(className)) {
        classes = className.split(/\s+/);
        for (i = 0; i < classes.length; i++) {
            out.push(`.${classes[i]}`);
        }
    }
    const attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
        key = attrWhitelist[i];
        attr = elem.getAttribute(key);
        if (attr) {
            out.push(`[${key}="${attr}"]`);
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
const htmlTreeAsString = (elem) => {
    const MAX_TRAVERSE_HEIGHT = 5;
    const MAX_OUTPUT_LEN = 80;
    const out = [];
    let height = 0;
    let len = 0;
    const separator = ' > ';
    const sepLength = separator.length;
    let nextStr;

    while (elem && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = htmlElementAsString(elem);
        // bail out if
        // - nextStr is the 'html' element
        // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
        //   (ignore this limit if we are on the first iteration)
        if (
            nextStr === 'html'
            || (height > 1 && len + (out.length * sepLength) + nextStr.length >= MAX_OUTPUT_LEN)
        ) {
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
const fill = (obj, name, replacement, track) => {
    const orig = obj[name];
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
const safeJoin = (input, delimiter) => {
    if (!isArray(input)) {
        return '';
    }

    const output = [];

    for (let i = 0; i < input.length; i++) {
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
const isKSongBiz = (hostname) => {
    const kSongDomain = [
        'k.174.com',
        'm.k.174.com',
        'st.k.174.com',
        'mp.k.174.com',
    ];
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
const isOverseaBiz = (hostname) => {
    const OverseaDomain = /(baechat\.my|kayalive\.tv)/;
    return OverseaDomain.test(hostname);
};

/**
 * 根据域名判断是否心遇业务
 * @param hostname
 * @returns {boolean}
 */
const isMoyiBiz = (hostname) => {
    const MoyiDomainReg = /\.friend\.163\.com/;
    return MoyiDomainReg.test(hostname);
};

/**
 * 根据域名判断是否妙时业务
 * @param hostname
 * @returns {boolean}
 */
const isCrushBiz = (hostname) => {
    const CrushDomainReg = /\.crush\.163\.com/;
    return CrushDomainReg.test(hostname);
};

/**
 * 根据域名判断是否心颜业务
 * @param hostname
 * @returns {boolean}
 */
const isMirthBiz = (hostname) => {
    const MirthDomainReg = /\.wave\.163\.com/;
    return MirthDomainReg.test(hostname);
};

/**
 * 根据域名判断是否look业务
 * @param {string} hostname
 * @returns {boolean}
 */
const isLookBiz = hostname => /(^|\.)look.163\.com/.test(hostname);

/**
 * 根据域名判断是否iplay业务
 * @param {string} hostname
 * @returns {boolean}
 */
const isIplayBiz = hostname => /(^|\.)iplay\.163\.com/.test(hostname);

export default {
    isError,
    isErrorEvent,
    isUndefined,
    isNull,
    isFunction,
    isPlainObject,
    isString,
    isArray,
    isEmptyObject,
    isXMLHttpRequest,
    isBoolean,
    isEvent,
    supportsErrorEvent,
    supportsFetch,
    each,
    objectMerge,
    hasKey,
    joinRegExp,
    htmlTreeAsString,
    htmlElementAsString,
    parseUrl,
    fill,
    safeJoin,
    isKSongBiz,
    isOverseaBiz,
    isUrl,
    isMoyiBiz,
    isCrushBiz,
    isMirthBiz,
    isLookBiz,
    isIplayBiz
};
