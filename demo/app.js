/* eslint-disable */
import corona from '../src/index';

import ajax from './ajax';

const monitor = corona({
    id: 39,
    env: 'prod',
    // debug: true,
});

// 更改日志上报接口
monitor.setEventUrl('http://clientlog.kayalive.tv/api/feedback/weblog/sys');

// 设置日志发送失败时的全局回调
monitor.setGlobalOnError((error, bodyData) => {
    console.warn('Corona send error:');
    console.warn(error);
    console.warn('bodyData:', bodyData);
});

// monitor.setUser('panwanqiang');
// monitor.setGlobalTags({
//     biz: 'activity',
// });

function testAjax(url, data) {
    return new Promise(((resolve, reject) => {
        ajax({
            url,
            data,
            type: 'GET',
            success: resolve,
            error: reject,
        });
    }));
}

function testFetch(url) {
    return fetch(url).then((ret) => {
        return ret.json().then((json = {}) => {
            if (json.code === undefined || json.code === 200) {
                return json;
            }

            throw json;
        });
    }).catch((err) => {
        throw err;
    });
}

// const name = 'Tom';
// const age = 20;
const str = ['<p>'];
// str.push(`say(${name}) => ${Test.say(name)}`);
// str.push(`output(${age}) => ${JSON.stringify(Test.output(age))}`);
str.push('Corona SDK test');
str.push('</p>');
// monitor.info('测试', {
//     usage: 'for test'
// });
console.log(1122);
const Jwrap = document.getElementById('J_wrap');
Jwrap.innerHTML = str.join('</p></p>');

Jwrap.addEventListener('click', (e) => {
    console.log('测试点击事件');
    // try {
    // let e = c;
    // } catch (error) {
    //     console.log(error);
    //     monitor.error(error);
    // }
    // 测试发请求失败
    // http://sentry.music.174.com/wapm/api/sdk/collect
    // http://clientlog.music.174.com/api/feedback/weblog/sys
    // testAjax('http://sentry.music.174.com/wapm/api/sdk/collect', {id: 111}).then((data) => {
    //     console.log('测试发请求失败:', data);
    // });
    // .catch((err) => {
    //     console.log('err:', err);
    // });

    testFetch('http://sentry.music.174.com/wapm/api/sdk/collect?id=111').then((data) => {
            console.log('测试发请求失败:', data);
        })
        .catch((err) => {
            console.log('err:', err);
            // throw err;
            // throw {
            //     "code": 404,
            //     // "message": "找不到该方法",
            //     "message": {
            //         message: '测试 message 为对'
            //     },
            //     "method": "xxx.get",
            //     "result": [
            //         {
            //             "stack": "instance.appKey is required"
            //         }
            //     ]
            // };
            let aa = new Event('测试 event 事件');
            console.log(Object.prototype.toString.call(aa));
            throw aa;
        });
});

document.getElementById('J_wrap2').addEventListener('click', () => {
    // Promise.reject(new Error('test promise'));
    let errorobj = new Error('test promise');
    errorobj.taginfo = {
        usage: 'test',
    };
    throw new Error(errorobj);
    // Promise.reject([1,2,3]);
    // Promise.reject(() => {});
    // monitor.error('测试主动上报错误1', {
    //     developer: 'panwanqiang'
    // });
});

document.getElementById('J_wrap3').addEventListener('click', () => {
    monitor.error('测试主动上报错误2', {
        usage: 'for test'
    });
});

document.getElementById('J_wrap4').addEventListener('click', () => {
    monitor.info('测试主动上报 info 日志', {
        usage: 'for test'
    });
});


try {
    let a = b;
} catch (error) {
    throw error;
}
// let a = b;
// Promise.reject('test promise reject2');
// console.log('123123');


