// 提取的 Zepto 的 ajax 模块
/* eslint-disable */
var toString = Object.prototype.toString;

var getType = function(val){
    switch (toString.call(val)) {
        case '[object Function]': return 'function'
        case '[object Date]': return 'date'
        case '[object RegExp]': return 'regexp'
        case '[object Arguments]': return 'arguments'
        case '[object Array]': return 'array'
        case '[object String]': return 'string'
    }
  
    if (typeof val == 'object' && val && typeof val.length == 'number') {
        try {
                if (typeof val.callee == 'function') return 'arguments';
        } catch (ex) {
            if (ex instanceof TypeError) {
                return 'arguments';
            }
        }
    }
  
    if (val === null) return 'null'
    if (val === undefined) return 'undefined'
    if (val && val.nodeType === 1) return 'element'
    if (val === Object(val)) return 'object'
  
    return typeof val
};

function isFunction(value) { return getType(value) == "function" }

function isWindow(obj)     { return obj != null && obj == obj.window }

function isObject(obj)     { return getType(obj) == "object" }

function isPlainObject(obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
}

var jsonpID = +new Date(),
    document = window.document,
    key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/,
    originAnchor = document.createElement('a')

originAnchor.href = window.location.href

// trigger a custom event and return false if it was cancelled
function triggerAndReturn(context, eventName, data) {
    return true; // !event.defaultPrevented
}

// trigger an Ajax "global" event
function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
}

// Number of active Ajax requests
var active = 0

function ajaxStart(settings) {
    if (settings.global && active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
}

function ajaxStop(settings) {
    if (settings.global && !(--active)) triggerGlobal(settings, null, 'ajaxStop')
}

// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
        return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
}

function ajaxSuccess(data, xhr, settings) {
    var context = settings.context,
        status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
}

// type: "timeout", "error", "abort", "parsererror"
function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
}

// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
}

function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
}

// Empty function, used as default callback
function empty() {}

function ajaxJSONP(options) {
    if (!('type' in options)) return ajax(options)

    var _callbackName = options.jsonpCallback,
    callbackName = (getType(_callbackName) === 'function' ?
      _callbackName() : _callbackName) || ('jsonp' + (jsonpID++));
    var script = document.createElement('script'),
        abort = function () {
            document.head.removeChild(script);
            if (callbackName in window) window[callbackName] = empty
            ajaxComplete('abort', xhr, options)
        },
        xhr = {
            abort: abort
        },
        abortTimeout,
        head = document.getElementsByTagName("head")[0] ||
        document.documentElement
    if (options.error) script.onerror = function () {
        xhr.abort()
        options.error()
    }
    window[callbackName] = function (data) {
        clearTimeout(abortTimeout)
        //todo: remove script
        //$(script).remove()
        document.head.removeChild(script);
        delete window[callbackName]
        ajaxSuccess(data, xhr, options)
    }
    serializeData(options)
    script.src = options.url.replace(/=\?/, '=' + callbackName)
    // Use insertBefore instead of appendChild to circumvent an IE6 bug.
    // This arises when a base node is used (see jQuery bugs #2709 and #4378).
    head.insertBefore(script, head.firstChild);
    if (options.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.abort()
        ajaxComplete('timeout', xhr, options)
    }, options.timeout)
    return xhr
}

var ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
        return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
        script: 'text/javascript, application/javascript, application/x-javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
}

function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && (mime == htmlType ? 'html' :
        mime == jsonType ? 'json' :
        scriptTypeRE.test(mime) ? 'script' :
        xmlTypeRE.test(mime) && 'xml') || 'text'
}

function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
}

// serialize payload and append it to the URL for GET requests
function serializeData(options) {
    if (options.processData && options.data && getType(options.data) != "string")
        options.data = param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
        options.url = appendQuery(options.url, options.data), options.data = undefined
}

function ajax(options) {
    var settings = extend({}, options || {}),
        urlAnchor, hashIndex
    for (key in ajaxSettings)
        if (settings[key] === undefined) settings[key] = ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
        urlAnchor = document.createElement('a')
        urlAnchor.href = settings.url
        // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
        urlAnchor.href = urlAnchor.href
        settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType,
        hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
            (!options || options.cache !== true) &&
            ('script' == dataType || 'jsonp' == dataType)
        ))
        settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
        if (!hasPlaceholder)
            settings.url = appendQuery(settings.url,
                settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
        return ajaxJSONP(settings)
    }

    var mime = settings.accepts[dataType],
        headers = {},
        setHeader = function (name, value) {
            headers[name.toLowerCase()] = [name, value]
        },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
        xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
        setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers)
        for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            xhr.onreadystatechange = empty
            clearTimeout(abortTimeout)
            var result, error = false
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

                if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
                    result = xhr.response
                else {
                    result = xhr.responseText

                    try {
                        // http://perfectionkills.com/global-eval-what-are-the-options/
                        // sanitize response accordingly if data filter callback provided
                        result = ajaxDataFilter(result, dataType, settings)
                        if (dataType == 'script')(1, eval)(result)
                        else if (dataType == 'xml') result = xhr.responseXML
                        else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
                    } catch (e) {
                        error = e
                    }

                    if (error) return ajaxError(error, 'parsererror', xhr, settings)
                }

                ajaxSuccess(result, xhr, settings)
            } else {
                ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings)
            }
        }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort()
        ajaxError(null, 'abort', xhr, settings)
        return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields)
        for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
    }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
}

var escape = encodeURIComponent

function serialize(params, obj, traditional, scope) {
    var type, array = getType(obj) === 'array',
        hash = isPlainObject(obj)

    for (var key in obj) {
        var value = obj[key];
        type = getType(value)
        if (scope) key = traditional ? scope :
            scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
        // handle data in serializeArray() format
        if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
        else if (type == "array" || (!traditional && type == "object"))
            serialize(params, value, traditional, key)
        else params.add(key, value)
    }
}

function param(obj, traditional) {
    var params = []
    params.add = function (key, value) {
        if (isFunction(value)) value = value()
        if (value == null) value = ""
        this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
}

function extend(target) {
    var slice = Array.prototype.slice;
    slice.call(arguments, 1).forEach(function (source) {
        for (key in source)
            if (source[key] !== undefined)
                target[key] = source[key]
    })
    return target
}

export default ajax;
