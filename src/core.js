
/*
 eslint-disable no-underscore-dangle, no-else-return, no-unused-expressions,
 no-param-reassign, max-len, no-prototype-builtins, prefer-rest-params, no-unused-vars
*/

import TraceKit from './tracekit';
import stringify from './safestr';
import utils from './utils';
import { wrapMethod } from './console';

const isError = utils.isError;
const isErrorEvent = utils.isErrorEvent;
const isUndefined = utils.isUndefined;
const isFunction = utils.isFunction;
const isString = utils.isString;
const each = utils.each;
const objectMerge = utils.objectMerge;
const hasKey = utils.hasKey;
const joinRegExp = utils.joinRegExp;
const htmlTreeAsString = utils.htmlTreeAsString;
const parseUrl = utils.parseUrl;
const fill = utils.fill;
const supportsFetch = utils.supportsFetch;
const isKSongBiz = utils.isKSongBiz;
const isOverseaBiz = utils.isOverseaBiz;
const isMoyiBiz = utils.isMoyiBiz;
const isCrushBiz = utils.isCrushBiz;
const isMirthBiz = utils.isMirthBiz;
const isLookBiz = utils.isLookBiz;
const isIplayBiz = utils.isIplayBiz;


const now = () => +new Date();

const _document = window.document;
const _navigator = window.navigator;

// 上报接口配置
// 测试环境-回归：qa.igame.174.com
// 正式环境：clientlog.music.174.com
const ACTION = 'corona_web';
const URL_KEY = 'api/feedback/weblog/sys';
const properProtocol = ['http:', 'https:'].indexOf(window.location.protocol) > -1 ? window.location.protocol : 'http:';
// const TARGET_URL = `${properProtocol}//clientlog.music.174.com/api/feedback/weblog/sys`;

const getUploadUrl = (hostname, env) => {
    if (env === 'dev' || env === 'test') {
        return `${properProtocol}//qa.igame.174.com/api/feedback/weblog/sys`;
    }

    if (isKSongBiz(hostname)) {
        return `${properProtocol}//clientlog.k.174.com/api/feedback/weblog/sys`;
    }

    if (isOverseaBiz(hostname)) {
        return `${properProtocol}//clientlog.baechat.my/api/feedback/weblog/sys`;
    }

    if (isMoyiBiz(hostname)) {
        return `${properProtocol}//clientlogusf.friend.174.com/api/feedback/weblog/sys`;
    }

    if (isCrushBiz(hostname)) {
        return `${properProtocol}//clientlogusf.crush.174.com/api/feedback/weblog/sys`;
    }

    if (isMirthBiz(hostname)) {
        return `${properProtocol}//clientlogusf.wave.174.com/api/feedback/weblog/sys`;
    }

    if (isLookBiz(hostname)) {
        return `${properProtocol}//clientlogusf.look.174.com/api/feedback/weblog/sys`;
    }

    if (isIplayBiz(hostname)) {
        return `${properProtocol}//clientlogusf.iplay.174.com/api/feedback/weblog/sys`;
    }

    return `${properProtocol}//clientlogusf.music.174.com/api/feedback/weblog/sys`;
};
// First, check for JSON support
// If there is no JSON, we no-op the core features of Corona
// since JSON is required to encode the payload
class Corona {
    constructor() {
        // Corona can run in contexts where there's no document
        this._hasDocument = !isUndefined(_document);
        this._hasNavigator = !isUndefined(_navigator);
        this._lastData = null;
        this._globalServer = null;
        this._globalKey = null;
        this._globalContext = {};
        this._globalTags = '';
        this._globalOptions = {
            from: 'web',
            ignoreErrors: [],

            autoBreadcrumbs: true,
            maxBreadcrumbs: 10,
            instrument: true,
            sampleRate: 1,
        };
        this._requestContentType = 'application/x-www-form-urlencoded';
        this._fetchDefaults = {
            method: 'POST',
            keepalive: true,
            referrerPolicy: 'origin',
            headers: {
                'Content-Type': this._requestContentType
            },
            credentials: 'include',
        };
        this._ignoreOnError = 0;
        this._isCoronaInstalled = false;
        this._debug = false; // 是否上报开发环境错误的开关，默认不上报
        // capture references to window.console *and* all its methods first
        // before the console plugin has a chance to monkey patch
        this._originalConsole = window.console || {};
        this._originalConsoleMethods = {};
        this._startTime = now();
        this._wrappedBuiltIns = [];
        this._breadcrumbs = [];
        this._lastCapturedEvent = null;
        this._location = window.location;
        this._lastHref = this._location && this._location.href;
        this._tag = {
            from: 'web',
            env: '',
            SDKversion: '2.16.0',
            project: 0,
            url: '',
            referer: '',
            ua: '',
            breadcrumbs: [],
        };
        this._baseData = {
            // 记录错误信息
            json: {
                ts: now(),
                event: '',
                content: '',
                level: 'error',
            },
        };

        // eslint-disable-next-line guard-for-in
        for (const method in this._originalConsole) {
            this._originalConsoleMethods[method] = this._originalConsole[method];
        }
    }

    /*
     * Configure Corona with a Pid and extra options
     *
     * @param {string} pid The Corona project id
     * @param {object} options Set of global options [optional]
     * @return {Corona}
     */
    config(pid, env, debug, options) {
        const self = this;

        if (self._globalServer) {
            return self;
        }
        if (!pid) {
            return self;
        }

        const globalOptions = self._globalOptions;

        // merge in options
        if (options) {
            each(options, (key, value) => {
                globalOptions[key] = value;
            });
        }

        self.setCustomInfo(pid, env, debug);

        // "Script error." is hard coded into browsers for errors that it can't read.
        // this is the result of a script being pulled in from an external domain and CORS.
        globalOptions.ignoreErrors.push(/^Script error\.?$/);
        globalOptions.ignoreErrors.push(/^Javascript error: Script error\.? on line 0$/);

        // join regexp rules into one big rule
        globalOptions.ignoreErrors = joinRegExp(globalOptions.ignoreErrors);
        globalOptions.maxBreadcrumbs = Math.max(
            0,
            Math.min(globalOptions.maxBreadcrumbs || 100, 100)
        ); // default and hard limit is 100

        const autoBreadcrumbDefaults = {
            xhr: true,
            console: true,
            dom: true,
            location: true,
            corona: false,
        };

        let autoBreadcrumbs = globalOptions.autoBreadcrumbs;
        if (env === 'dev') {
            autoBreadcrumbs = false;
        } else if ({}.toString.call(autoBreadcrumbs) === '[object Object]') {
            autoBreadcrumbs = objectMerge(autoBreadcrumbDefaults, autoBreadcrumbs);
        } else if (autoBreadcrumbs !== false) {
            autoBreadcrumbs = autoBreadcrumbDefaults;
        }
        globalOptions.autoBreadcrumbs = autoBreadcrumbs;

        const instrumentDefaults = {
            tryCatch: true,
        };

        let instrument = globalOptions.instrument;
        if ({}.toString.call(instrument) === '[object Object]') {
            instrument = objectMerge(instrumentDefaults, instrument);
        } else if (instrument !== false) {
            instrument = instrumentDefaults;
        }
        globalOptions.instrument = instrument;

        // return for chaining
        return self;
    }

    /*
     * Installs a global window.onerror error handler
     * to capture and report uncaught exceptions.
     * At this point, install() is required
     *
     * @return {Corona}
     */
    install() {
        const self = this;
        if (self.isSetup() && !self._isCoronaInstalled) {
            // TraceKit.report.subscribe(() => {
            //     self._handleOnErrorStackInfo.apply(self, arguments);
            // });
            self._patchFunctionToString();

            if (self._globalOptions.instrument && self._globalOptions.instrument.tryCatch) {
                self._instrumentTryCatch();
            }

            if (self._globalOptions.autoBreadcrumbs) {
                self._instrumentBreadcrumbs();
            }

            self._isCoronaInstalled = true;
        }

        return this;
    }

    /*
     * Set the pid (can be called multiple time unlike config)
     *
     * @param {string} pid The Corona project id
     */
    setCustomInfo(pid, env, debug) {
        this._tag.project = pid;
        this._tag.env = env;
        this._debug = debug;
        // corona request url key
        this._globalKey = URL_KEY;
        this._globalServer = getUploadUrl(window.location.hostname, env);
    }

    /*
     * Set/clear a user to be sent along with the payload.
     *
     * @param {string} user An object representing user data [optional]
     * @return {Corona}
     */
    setUserContext(user) {
        this._globalContext.user = user;

        return this;
    }

    /*
     * Set/clear global tags to be sent along with the payload.
     *
     * @param {object} An object representing tags data [optional]
     * @return {Corona}
     */
    setTagsContext(tags) {
        this._globalTags = tags;

        return this;
    }

    /*
     * Set/clear global onError function.
     *
     * @param {function} logs sent error callback function
     * @return {Corona}
     */
    setSentErrorCallback(cb) {
        this._globalOptions.onError = cb;

        return this;
    }

    /*
     * Set/clear global event upload url.
     *
     * @param {string} event(logs) upload url
     * @return {Corona}
     */
    setEventUrl(url) {
        this._globalServer = url;

        return this;
    }

    /*
     * Wrap code within a context and returns back a new function to be executed
     *
     * @param {object} options A specific set of options for this context [optional]
     * @param {function} func The function to be wrapped in a new context
     * @param {function} func A function to call before the try/catch wrapper [optional, private]
     * @return {function} The newly wrapped functions with a context
     */
    wrap(options, func, _before) {
        const self = this;

        // 1 argument has been passed, and it's not a function
        // so just return it
        if (isUndefined(func) && !isFunction(options)) {
            return options;
        }

        // options is optional
        if (isFunction(options)) {
            func = options;
            options = undefined;
        }

        // At this point, we've passed along 2 arguments, and the second one
        // is not a function either, so we'll just return the second argument.
        if (!isFunction(func)) {
            return func;
        }

        // We don't wanna wrap it twice!
        try {
            if (func.__corona__) {
                return func;
            }

            // If this has already been wrapped in the past, return that
            if (func.__corona_wrapper__) {
                return func.__corona_wrapper__;
            }
        } catch (e) {
            // Just accessing custom props in some Selenium environments
            // can cause a "Permission denied" exception
            // Bail on wrapping and return the function as-is (defers to window.onerror).
            return func;
        }

        function wrapped(...params) {
            const args = [];
            let i = params.length;
            const deep = !options || (options && options.deep !== false);

            if (_before && isFunction(_before)) {
                _before.apply(this, params);
            }

            // Recursively wrap all of a function's arguments that are
            // functions themselves.
            while (i--) {
                args[i] = deep ? self.wrap(options, params[i]) : params[i];
            }

            try {
                // Attempt to invoke user-land function
                // NOTE: If you are a Corona user, and you are seeing this stack frame, it
                //       means Corona caught an error invoking your application code. This is
                //       expected behavior and NOT indicative of a bug with Corona.js.
                return func.apply(this, args);
            } catch (e) {
                self._ignoreNextOnError();
                self.captureException(e, options);
                e.type = '__corona_wrapper__';
                throw e;
            }
        }

        // copy over properties of the old function
        for (const property in func) {
            if (hasKey(func, property)) {
                wrapped[property] = func[property];
            }
        }
        wrapped.prototype = func.prototype;

        func.__corona_wrapper__ = wrapped;
        // Signal that this function has been wrapped/filled already
        // for both debugging and to prevent it to being wrapped/filled twice
        wrapped.__corona__ = true;
        wrapped.__orig__ = func;

        return wrapped;
    }

    /*
     * Manually capture an exception and send it over to Corona
     *
     * @param {error} ex An exception to be logged
     * @param {object} options A specific set of options for this error [optional]
     * @param {string} [optional] type A specific message type, ex TypeError
     * @return {Corona}
     */
    captureException(ex, options, type) {
        options = objectMerge({}, options || {});
        // Cases for sending ex as a message, rather than an exception
        const isNotError = !isError(ex);
        const isNotErrorEvent = !isErrorEvent(ex);
        const isErrorEventWithoutError = isErrorEvent(ex) && !ex.error;

        if ((isNotError && isNotErrorEvent) || isErrorEventWithoutError) {
            return this.captureMessage(
                ex,
                objectMerge(options, {
                    // if we fall back to captureMessage, default to attempting a new trace
                    stacktrace: true,
                }),
                type
            );
        }

        // Get actual Error from ErrorEvent
        if (isErrorEvent(ex)) {
            ex = ex.error;
        }

        // Store the raw exception object for potential debugging and introspection
        const stack = TraceKit.computeStackTrace(ex);
        if (options.tags && this._globalTags) {
            stack.data = objectMerge(options.tags, this._globalTags);
        } else if (options.tags) {
            stack.data = options.tags;
        } else if (this._globalTags) {
            stack.data = this._globalTags;
        }

        this._baseData.json.content = stringify(stack);
        this._baseData.json.level = 'error';
        // count the number of dom nodes of the web page
        const pageDoms = document
            && document.querySelectorAll
            && document.querySelectorAll('*');
        this._baseData.json.doms = (pageDoms && pageDoms.length) || null;
        this._tag.active = !!options.active;
        this._handleStackInfo(ex);

        return this;
    }

    /*
     * Manually send a message to Corona
     *
     * @param {string} msg A plain message to be captured in Corona
     * @param {object} options A specific set of options for this message [optional]
     * @param {string} [optional] type A specific message type, ex.TypeError
     * @return {Corona}
     */
    captureMessage(msg, options, type) {
        // config() automagically converts ignoreErrors from a list to a RegExp so we need to test for an
        // early call; we'll error on the side of logging anything called before configuration since it's
        // probably something you should see:
        if (
            !!this._globalOptions.ignoreErrors.test
            && this._globalOptions.ignoreErrors.test(msg)
        ) {
            return null;
        }

        options = options || {};
        const content = {
            message: msg,
        };

        if (options.tags && this._globalTags) {
            content.data = objectMerge(options.tags, this._globalTags);
        } else if (options.tags) {
            content.data = options.tags;
        } else if (this._globalTags) {
            content.data = this._globalTags;
        }

        if (type) {
            content.name = type;
        }

        this._baseData.json.content = stringify(content);
        this._baseData.json.level = options.level || 'error';
        // count the number of dom nodes of the web page
        const pageDoms = document
            && document.querySelectorAll
            && document.querySelectorAll('*');
        this._baseData.json.doms = (pageDoms && pageDoms.length) || null;
        this._tag.active = !!options.active;
        // Fire away!
        this._send();

        return this;
    }

    captureBreadcrumb(obj) {
        const crumb = objectMerge({
            timestamp: now() / 1000,
        }, obj);

        this._breadcrumbs.push(crumb);
        if (this._breadcrumbs.length > this._globalOptions.maxBreadcrumbs) {
            this._breadcrumbs.shift();
        }

        return this;
    }

    /*
     * Determine if Corona is setup and ready to go.
     *
     * @return {boolean}
     */
    isSetup() {
        if (!this._globalServer) {
            if (!this.coronaNotConfiguredError) {
                this.coronaNotConfiguredError = true;
            }
            return false;
        }
        return true;
    }

    /*
    *** Private functions ***
    */
    _ignoreNextOnError() {
        const self = this;
        this._ignoreOnError += 1;
        setTimeout(() => {
            // onerror should trigger before setTimeout
            self._ignoreOnError -= 1;
        });
    }

    /**
     * Wraps addEventListener to capture UI breadcrumbs
     * @param evtName the event name (e.g. "click")
     * @returns {Function}
     * @private
     */
    _breadcrumbEventHandler(evtName) {
        const self = this;
        return function (evt) {
            // It's possible this handler might trigger multiple times for the same
            // event (e.g. event propagation through node ancestors). Ignore if we've
            // already captured the event.
            if (self._lastCapturedEvent === evt) {
                return;
            }

            self._lastCapturedEvent = evt;

            // try/catch both:
            // - accessing evt.target
            // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
            //   can throw an exception in some circumstances.
            let target;
            try {
                target = htmlTreeAsString(evt.target);
            } catch (e) {
                target = '<unknown>';
            }

            self.captureBreadcrumb({
                category: `ui.${evtName}`, // e.g. ui.click, ui.input
                message: target,
            });
        };
    }

    /**
     * Captures a breadcrumb of type "navigation", normalizing input URLs
     * @param to the originating URL
     * @param from the target URL
     * @private
     */
    _captureUrlChange(from, to) {
        const parsedLoc = parseUrl(this._location.href);
        const parsedTo = parseUrl(to);
        const parsedFrom = parseUrl(from);

        // because onpopstate only tells you the "new" (to) value of location.href, and
        // not the previous (from) value, we need to track the value of the current URL
        // state ourselves
        this._lastHref = to;

        // Use only the path component of the URL if the URL matches the current
        // document (almost all the time when using pushState)
        if (parsedLoc.protocol === parsedTo.protocol && parsedLoc.host === parsedTo.host) {
            to = parsedTo.relative;
        }
        if (parsedLoc.protocol === parsedFrom.protocol && parsedLoc.host === parsedFrom.host) {
            from = parsedFrom.relative;
        }

        this.captureBreadcrumb({
            category: 'navigation',
            data: {
                to,
                from,
            },
        });
    }

    _patchFunctionToString() {
        const self = this;
        self._originalFunctionToString = Function.prototype.toString;
        // eslint-disable-next-line no-extend-native
        Function.prototype.toString = function (...args) {
            if (typeof this === 'function' && this.__corona__) {
                return self._originalFunctionToString.apply(this.__orig__, args);
            }
            return self._originalFunctionToString.apply(this, args);
        };
    }

    /**
     * Wrap timer functions and event targets to catch errors and provide
     * better metadata.
     */
    _instrumentTryCatch() {
        const self = this;

        const wrappedBuiltIns = self._wrappedBuiltIns;

        function wrapTimeFn(orig) {
            return function (fn, t) {
                // preserve arity
                // Make a copy of the arguments to prevent deoptimization
                // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
                const args = new Array(arguments.length);
                for (let i = 0; i < args.length; ++i) {
                    args[i] = arguments[i];
                }
                const originalCallback = args[0];
                if (isFunction(originalCallback)) {
                    args[0] = self.wrap(originalCallback);
                }

                return orig.apply(this, args);
            };
        }

        const autoBreadcrumbs = this._globalOptions.autoBreadcrumbs;

        function wrapEventTarget(global) {
            const proto = window[global] && window[global].prototype;
            if (proto && proto.hasOwnProperty && proto.hasOwnProperty('addEventListener')) {
                fill(
                    proto,
                    'addEventListener',
                    orig => function (evtName, fn, capture, secure) {
                        // preserve arity
                        try {
                            if (fn && fn.handleEvent) {
                                fn.handleEvent = self.wrap(fn.handleEvent);
                            }
                        } catch (err) {
                            // can sometimes get 'Permission denied to access property "handle Event'
                        }

                        // More breadcrumb DOM capture ... done here and not in `_instrumentBreadcrumbs`
                        // so that we don't have more than one wrapper function
                        let before;
                        let clickHandler;

                        if (
                            autoBreadcrumbs
                            && autoBreadcrumbs.dom
                            && (global === 'EventTarget' || global === 'Node')
                        ) {
                            // NOTE: generating multiple handlers per addEventListener invocation, should
                            //       revisit and verify we can just use one (almost certainly)
                            clickHandler = self._breadcrumbEventHandler('click');
                            before = function (evt) {
                                // need to intercept every DOM event in `before` argument, in case that
                                // same wrapped method is re-used for different events (e.g. mousemove THEN click)
                                // see #724
                                if (!evt) {
                                    return null;
                                }

                                let eventType;
                                try {
                                    eventType = evt.type;
                                } catch (e) {
                                    // just accessing event properties can throw an
                                    // exception in some rare circumstances
                                    return null;
                                }
                                if (eventType === 'click') {
                                    return clickHandler(evt);
                                }
                                return null;
                            };
                        }
                        return orig.call(
                            this,
                            evtName,
                            self.wrap(fn, undefined, before),
                            capture,
                            secure
                        );
                    },
                    wrappedBuiltIns
                );
                fill(
                    proto,
                    'removeEventListener',
                    orig => function (evt, fn, capture, secure) {
                        try {
                            fn = fn && (fn.__corona_wrapper__ ? fn.__corona_wrapper__ : fn);
                        } catch (e) {
                            // ignore, accessing __corona_wrapper__ will throw in some Selenium environments
                        }
                        return orig.call(this, evt, fn, capture, secure);
                    },
                    wrappedBuiltIns
                );
            }
        }

        fill(window, 'setTimeout', wrapTimeFn, wrappedBuiltIns);
        fill(window, 'setInterval', wrapTimeFn, wrappedBuiltIns);
        if (window.requestAnimationFrame) {
            fill(
                window,
                'requestAnimationFrame',
                orig => cb => orig(self.wrap(cb)),
                wrappedBuiltIns
            );
        }

        // event targets borrowed from bugsnag-js:
        // https://github.com/bugsnag/bugsnag-js/blob/master/src/bugsnag.js#L666
        const eventTargets = [
            'EventTarget',
            'Window',
            'Node',
            'ApplicationCache',
            'AudioTrackList',
            'ChannelMergerNode',
            'CryptoOperation',
            'EventSource',
            'FileReader',
            'HTMLUnknownElement',
            'IDBDatabase',
            'IDBRequest',
            'IDBTransaction',
            'KeyOperation',
            'MediaController',
            'MessagePort',
            'ModalWindow',
            'Notification',
            'SVGElementInstance',
            'Screen',
            'TextTrack',
            'TextTrackCue',
            'TextTrackList',
            'WebSocket',
            'WebSocketWorker',
            'Worker',
            'XMLHttpRequest',
            'XMLHttpRequestEventTarget',
            'XMLHttpRequestUpload',
        ];
        for (let i = 0; i < eventTargets.length; i++) {
            wrapEventTarget(eventTargets[i]);
        }
    }

    /**
     * Instrument browser built-ins w/ breadcrumb capturing
     *  - XMLHttpRequests
     *  - DOM interactions (click/typing)
     *  - window.location changes
     *  - console
     *
     * Can be disabled or individually configured via the `autoBreadcrumbs` config option
     */
    _instrumentBreadcrumbs() {
        const self = this;
        const autoBreadcrumbs = this._globalOptions.autoBreadcrumbs;

        const wrappedBuiltIns = self._wrappedBuiltIns;

        function wrapProp(prop, xhr) {
            if (prop in xhr && isFunction(xhr[prop])) {
                fill(xhr, prop, orig => self.wrap(orig)); // intentionally don't track filled methods on XHR instances
            }
        }

        if (autoBreadcrumbs.xhr && 'XMLHttpRequest' in window) {
            const xhrproto = XMLHttpRequest.prototype;
            fill(
                xhrproto,
                'open',
                origOpen => function (method, url) {
                    // preserve arity
                    // if Corona key appears in URL, don't capture
                    if (isString(url) && url.indexOf(self._globalKey) === -1) {
                        this.__corona_xhr = {
                            method,
                            url,
                            status_code: null,
                        };
                    }

                    return origOpen.apply(this, arguments);
                },
                wrappedBuiltIns
            );

            fill(
                xhrproto,
                'send',
                origSend => function () {
                    // preserve arity
                    const xhr = this;

                    function onreadystatechangeHandler() {
                        if (xhr.__corona_xhr && xhr.readyState === 4) {
                            try {
                                // touching statusCode in some platforms throws
                                // an exception
                                xhr.__corona_xhr.status_code = xhr.status;
                            } catch (e) {
                                /* do nothing */
                            }

                            self.captureBreadcrumb({
                                type: 'http',
                                category: 'xhr',
                                data: xhr.__corona_xhr,
                            });
                        }
                    }

                    const props = ['onload', 'onerror', 'onprogress'];
                    for (let j = 0; j < props.length; j++) {
                        wrapProp(props[j], xhr);
                    }

                    if ('onreadystatechange' in xhr && isFunction(xhr.onreadystatechange)) {
                        fill(
                            xhr,
                            'onreadystatechange',
                            orig => self.wrap(orig, undefined, onreadystatechangeHandler) /* intentionally don't track this instrumentation */
                        );
                    } else {
                        // if onreadystatechange wasn't actually set by the page on this xhr, we
                        // are free to set our own and capture the breadcrumb
                        xhr.onreadystatechange = onreadystatechangeHandler;
                    }

                    return origSend.apply(this, arguments);
                },
                wrappedBuiltIns
            );
        }

        if (autoBreadcrumbs.xhr && supportsFetch()) {
            fill(
                window,
                'fetch',
                origFetch => function () {
                    // preserve arity
                    // Make a copy of the arguments to prevent deoptimization
                    // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
                    const args = new Array(arguments.length);
                    for (let i = 0; i < args.length; ++i) {
                        args[i] = arguments[i];
                    }

                    const fetchInput = args[0];
                    let method = 'GET';
                    let url;

                    if (typeof fetchInput === 'string') {
                        url = fetchInput;
                    } else if ('Request' in window && fetchInput instanceof window.Request) {
                        url = fetchInput.url;
                        if (fetchInput.method) {
                            method = fetchInput.method;
                        }
                    } else {
                        url = `${fetchInput}`;
                    }

                    // if Corona key appears in URL, don't capture, as it's our own request
                    if (url.indexOf(self._globalKey) !== -1) {
                        return origFetch.apply(this, args);
                    }

                    if (args[1] && args[1].method) {
                        method = args[1].method;
                    }

                    const fetchData = {
                        method,
                        url,
                        status_code: null,
                    };

                    return origFetch.apply(this, args).then((response) => {
                        fetchData.status_code = response.status;

                        self.captureBreadcrumb({
                            type: 'http',
                            category: 'fetch',
                            data: fetchData,
                        });

                        return response;
                    });
                },
                wrappedBuiltIns
            );
        }

        // Capture breadcrumbs from any click that is unhandled / bubbled up all the way
        // to the document. Do this before we instrument addEventListener.
        if (autoBreadcrumbs.dom && this._hasDocument) {
            _document.addEventListener('click', self._breadcrumbEventHandler('click'), false);
        }

        // record navigation (URL) changes
        // NOTE: in Chrome App environment, touching history.pushState, *even inside
        //       a try/catch block*, will cause Chrome to output an error to console.error
        // borrowed from: https://github.com/angular/angular.js/pull/13945/files
        const chrome = window.chrome;
        const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
        const hasPushAndReplaceState = !isChromePackagedApp
            && window.history
            && window.history.pushState
            && window.history.replaceState;
        if (autoBreadcrumbs.location && hasPushAndReplaceState) {
            // TO DO: remove onpopstate handler on uninstall()
            const oldOnPopState = window.onpopstate;
            window.onpopstate = function (...args) {
                const currentHref = self._location.href;
                self._captureUrlChange(self._lastHref, currentHref);

                if (oldOnPopState) {
                    return oldOnPopState.apply(this, args);
                }
                return null;
            };

            const historyReplacementFunction = function (origHistFunction) {
                // note history.pushState.length is 0; intentionally not declaring
                // params to preserve 0 arity
                return function (/* state, title, url */) {
                    const url = arguments.length > 2 ? arguments[2] : undefined;

                    // url argument is optional
                    if (url) {
                        // coerce to string (this is what pushState does)
                        self._captureUrlChange(self._lastHref, `${url}`);
                    }

                    return origHistFunction.apply(this, arguments);
                };
            };

            fill(window.history, 'pushState', historyReplacementFunction, wrappedBuiltIns);
            fill(window.history, 'replaceState', historyReplacementFunction, wrappedBuiltIns);
        }

        if (autoBreadcrumbs.console && 'console' in window && console.log) {
            // console
            const consoleMethodCallback = function (msg, data) {
                self.captureBreadcrumb({
                    message: msg,
                    level: data.level,
                    category: 'console',
                });
            };

            each(['info', 'warn', 'error'], (_, level) => {
                wrapMethod(console, level, consoleMethodCallback);
            });
        }
    }

    _handleOnErrorStackInfo(...args) {
        // if we are intentionally ignoring errors via onerror, bail out
        if (!this._ignoreOnError) {
            this._handleStackInfo(args);
        }
    }

    _handleStackInfo(stackInfo) {
        this._processException(
            stackInfo.name,
            stackInfo.message,
        );
    }

    // pricess exception and send to corona
    _processException(type, message) {
        const prefixedMessage = (type ? `${type}: ` : '') + (message || '');
        // judge if the error should be ignored
        if (
            !!this._globalOptions.ignoreErrors.test
            && (this._globalOptions.ignoreErrors.test(message)
                || this._globalOptions.ignoreErrors.test(prefixedMessage))
        ) {
            return;
        }
        // Fire away!
        this._send();
    }

    // get refer, user-agent and url
    _getHttpData() {
        if (!this._hasNavigator && !this._hasDocument) {
            return null;
        }
        let httpData = {};

        if (this._hasNavigator && _navigator.userAgent) {
            httpData = {
                ua: navigator.userAgent,
            };
        }

        // Check in `window` instead of `document`, as we may be in ServiceWorker environment
        if (window.location && window.location.href) {
            httpData.url = window.location.href;
        }

        if (this._hasDocument && _document.referrer) {
            httpData.referer = _document.referrer;
        }

        return httpData;
    }

    /**
     * Returns true if the in-process data payload matches the signature
     * of the previously-sent data
     *
     * NOTE: This has to be done at this level because TraceKit can generate
     *       data from window.onerror WITHOUT an exception object (IE8, IE9,
     *       other old browsers). This can take the form of an "exception"
     *       data object with a single frame (derived from the onerror args).
     */
    _isRepeatData(current) {
        const feature = current.json.content;
        // 选取特征值做 md5 计算

        const last = this._lastData;
        const cur = stringify(feature);

        if (cur === last) { // 如果event的值没变，判断是重复数据，不上报
            return true;
        }
        this._lastData = cur;

        return false;
    }

    _send() {
        let data = {};
        const globalOptions = this._globalOptions;
        // this._tag.carrier = _client.carrier;
        const httpData = this._getHttpData();

        if (httpData) {
            this._tag = objectMerge(this._tag, httpData);
        }

        if (this._breadcrumbs && this._breadcrumbs.length > 0) {
            this._tag.breadcrumbs = [].slice.call(this._breadcrumbs, 0);
        }

        this._baseData.json.event = this._tag;
        this._baseData.json = objectMerge(this._baseData.json, this._globalContext);
        this._baseData.action = ACTION;
        // this._baseData.CommonPackage.ts = now() / 1000;
        // this._baseData.CommonPackage.access = _client.access || 'null';
        // this._baseData.CommonPackage.carrier = _client.carrier || 'null';
        // this._baseData.CommonPackage.device_model = _client.model || 'null';

        data = objectMerge({}, this._baseData);

        // 判断是否需要上报
        // dev 环境根据 debug 开关判断
        if ((this._tag.env === 'dev') && !this._debug && !data.json.event.active) {
            return;
        }
        if (typeof globalOptions.sampleRate === 'number') {
            if (Math.random() < globalOptions.sampleRate) {
                this._sendProcessedPayload(data);
            }
        } else {
            this._sendProcessedPayload(data);
        }
    }

    _sendProcessedPayload(data) {
        const globalOptions = this._globalOptions;

        if (!this.isSetup() || this._isRepeatData(data)) {
            return;
        }

        const url = this._globalServer;

        this._makeRequest({
            url,
            data: [data],
            options: globalOptions,
        });
    }

    _makeRequest(opts) {
        let url = opts.url;

        let evaluatedFetchParameters = {};

        if (opts.options.fetchParameters) {
            evaluatedFetchParameters = this._evaluateHash(opts.options.fetchParameters);
        }
        const bodyData = `logs=${encodeURIComponent(stringify(opts.data))}`;

        if (supportsFetch()) {
            evaluatedFetchParameters.body = bodyData;

            const defaultFetchOptions = objectMerge({}, this._fetchDefaults);
            const fetchOptions = objectMerge(defaultFetchOptions, evaluatedFetchParameters);

            return window
                .fetch(url, fetchOptions)
                .then((response) => {
                    if (response.ok) {
                        opts.onSuccess && opts.onSuccess();
                    } else {
                        const error = new Error(`Corona error code: ${response.status}`);
                        // It's called request only to keep compatibility with XHR interface
                        // and not add more redundant checks in setBackoffState method
                        error.request = response;
                        opts.options.onError && opts.options.onError(error, bodyData);
                    }
                })
                .catch(() => {
                    opts.options.onError
                        && opts.options.onError(new Error('Corona error code: network unavailable'), bodyData);
                });
        }

        let request = window.XMLHttpRequest && new window.XMLHttpRequest();
        if (!request) {
            return null;
        }

        if ('withCredentials' in request) {
            request.onreadystatechange = () => {
                if (request.readyState !== 4) {
                    return null;
                } else if (request.status === 200) {
                    // eslint-disable-next-line no-unused-expressions
                    opts.onSuccess && opts.onSuccess();
                } else if (opts.options.onError) {
                    const err = new Error(`Corona error code: ${request.status}`);
                    err.request = request;
                    opts.options.onError(err, bodyData);
                }
                return null;
            };
            request.withCredentials = true;
        } else {
            // eslint-disable-next-line no-undef
            request = new window.XDomainRequest();
            // xdomainrequest cannot go http -> https (or vice versa),
            // so always use protocol relative
            url = url.replace(/^https?:/, '');

            // onreadystatechange not supported by XDomainRequest
            if (opts.onSuccess) {
                request.onload = opts.onSuccess;
            }
            if (opts.options.onError) {
                request.onerror = () => {
                    const err = new Error('Corona error code: XDomainRequest');
                    err.request = request;
                    opts.options.onError(err, bodyData);
                };
            }
        }

        request.open('POST', url);
        request.setRequestHeader('Content-Type', this._requestContentType);
        request.send(bodyData);
        return null;
    }

    // eslint-disable-next-line class-methods-use-this
    _evaluateHash(hash) {
        const evaluated = {};

        for (const key in hash) {
            // eslint-disable-next-line no-prototype-builtins
            if (hash.hasOwnProperty(key)) {
                const value = hash[key];
                evaluated[key] = typeof value === 'function' ? value() : value;
            }
        }

        return evaluated;
    }
}

export default Corona;
