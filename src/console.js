/* eslint-disable no-unused-expressions */
/*
 用户行为记录模块
 记录控制台打印信息
*/

import utils from './utils';

export const wrapMethod = (console, level, callback) => {
    const originalConsoleLevel = console[level];
    const originalConsole = console;

    if (!(level in console)) {
        return;
    }

    const coronaLevel = level === 'warn' ? 'warning' : level;

    // eslint-disable-next-line no-param-reassign
    console[level] = (...args) => {
        let msg = utils.safeJoin(args, ' ');
        const data = {
            level: coronaLevel,
            logger: 'console',
            extra: {
                arguments: args,
            },
        };

        if (level === 'assert') {
            if (args[0] === false) {
                // Default browsers message
                msg = `Assertion failed:  ${(utils.safeJoin(args.slice(1), ' ') || 'console.assert')}`;
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
    wrapMethod,
};
