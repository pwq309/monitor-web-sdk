/* eslint-disable */
// 该模块将由cloudverify前端部署平台预埋在业务代码之前
// 完整 SDK 由 puzzle 以异步脚本的方式下发，会在业务代码之后完成初始化，导致没法捕获 SDK 初始化之前业务代码的报错
// 此代码会捕获 SDK 初始化之前业务代码抛错，并缓存在全局对象中，SDK 初始化完成后会读取上报

(function (_window, _onerror, _onunhandledrejection) {
    // Create a namespace and attach function that will store captured exception
    // Because functions are also objects, we can attach the queue itself straight to it and save some bytes
    _window.corona_error_cache = function (exception) {
        _window.corona_error_cache.data.push(exception);
    };
    _window.corona_error_cache.data = [];

    // Store reference to the old `onerror` handler and override it with our own function
    // that will just push exceptions to the queue and call through old handler if we found one
    var _oldOnerror = _window[_onerror];
    _window[_onerror] = function (message, source, lineno, colno, exception) {
        // Use keys as "data type" to save some characters"
        _window.corona_error_cache({
            e: exception || '未知错误，由预置脚本捕获',
            event: 'error'
        });

        if (_oldOnerror) _oldOnerror.apply(_window, arguments);
    };

    // Do the same store/queue/call operations for `onunhandledrejection` event
    var _oldOnunhandledrejection = _window[_onunhandledrejection];
    _window[_onunhandledrejection] = function (exception) {
        _window.corona_error_cache({
            e: exception.reason,
            event: 'unhandledrejection'
        });
        if (_oldOnunhandledrejection) _oldOnunhandledrejection.apply(_window, arguments);
    };
})(window, 'onerror', 'onunhandledrejection');