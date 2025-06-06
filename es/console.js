/* eslint-disable no-unused-expressions */
/*
 用户行为记录模块
 记录控制台打印信息
*/

import utils from './utils';

export var wrapMethod = function wrapMethod(console, level, callback) {
    var originalConsoleLevel = console[level];
    var originalConsole = console;

    if (!(level in console)) {
        return;
    }

    var coronaLevel = level === 'warn' ? 'warning' : level;

    // eslint-disable-next-line no-param-reassign
    console[level] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var msg = utils.safeJoin(args, ' ');
        var data = {
            level: coronaLevel,
            logger: 'console',
            extra: {
                arguments: args
            }
        };

        if (level === 'assert') {
            if (args[0] === false) {
                // Default browsers message
                msg = 'Assertion failed:  ' + (utils.safeJoin(args.slice(1), ' ') || 'console.assert');
                data.extra.arguments = args.slice(1);
                callback && callback(msg, data);
            }
        } else {
            callback && callback(msg, data);
        }
        // this fails for some browsers. :(
        if (originalConsoleLevel) {
            // IE9 doesn't allow calling apply on console functions directly
            // See: https://stackoverflow.com/questions/5472938/does-ie9-support-console-log-and-is-it-a-real-function#answer-5473193
            Function.prototype.apply.call(originalConsoleLevel, originalConsole, args);
        }
    };
};

export default {
    wrapMethod: wrapMethod
};