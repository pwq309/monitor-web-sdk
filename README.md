# @verify/corona-web-sdk

> 错误监控平台 corona 的 web 端 SDK

[![pipeline status](https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk/badges/master/pipeline.svg)](https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk/commits/master)
[![coverage report](https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk/badges/master/coverage.svg)](https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk/commits/master)
[![nenpm](http://npm.hz.verify.com/badge/v/@music/corona-web-sdk.svg)](http://npm.hz.verify.com/package/@music/corona-web-sdk)
[![nenpm](http://npm.hz.verify.com/badge/d/@music/corona-web-sdk.svg)](http://npm.hz.verify.com/package/@music/corona-web-sdk)

<!-- 目录 START -->

+ [安装](#安装)
+ [用法](#用法)
+ [文档](#文档)
    + [环境变量](#env)
    + [API](#api)
        + [corona](#corona)
        + [info](#info)
        + [warn](#warn)
        + [error](#error)
        + [setUser](#setuser)
        + [setGlobalTags](#setglobaltags)
        + [setGlobalOnError](#setglobalonerror)
        + [setEventUrl](#seteventurl)
    + [全局事件](#globalevents)
        + [CoronaInited](#coronainited)
    + [本地开发](#develop)
    + [提交版本](#commit)
+ [联系我们](#联系我们)

<!-- 目录 END -->

_ _ _

<!-- 安装 START -->

## 安装

### 使用 npm 安装
```bash
$ nenpm install @music/corona-web-sdk
```

### 使用外链 js 安装
```html
<script src="http://s6.music.126.net/static_public/5e7dd9894cb30d2fd378f94f/2.2.3/music-corona.min.js"></script>
```

<!-- 安装 END -->

<!-- 用法 START -->

## 用法

### 使用 npm 安装并引入代码
```javascript
// 引用具体使用的方法
import corona from '@music/corona-web-sdk';

// 请一定要在业务代码之前完成 sdk 的初始化
let monitor = corona({
    id: 5, // 必传，配置应用 id
    env: 'dev', // 必传，配置当前环境，支持的环境类型见下文文档部分
    debug: false // 可选，是否上传本地开发环境错误的开关，默认 false，即不上传（主动上报的日志依然会上传）
}); 

// 启动监控后，corona 已经能自动捕获并上报 js 执行报错
```

### 外链 js 安装使用

```javascript
// 如果是使用外链 js 安装的，sdk 会把函数挂载在 window 对象上
// 按如下方式完成初始化
let monitor = window.MusicCorona({
    id: 5, // 必传，配置应用 id
    env: 'dev', // 必传，配置当前环境，支持的环境类型见下文文档部分
    debug: false // 可选，是否上传本地开发环境的开关，默认 false，即不上传
})
```

<!-- 用法 END -->

_ _ _

<!-- 文档START -->
## 文档

### 环境变量
<a id="env"></a>

在初始化 SDK 的时候需要传入**应用 id** 和**环境变量**，Corona 支持 5 种环境变量，在 puzzle 的基础上增加了 dev。
1. `dev`: 开发环境
2. `test`: 测试环境
3. `reg`: 回归环境
4. `pre`: 预发环境
5. `prod`: 正式环境


### API

#### corona(projectId)
<a id="corona"></a>
配置并启动corona监控

参数：
- projectId：`Number` ，必需   


返回值：`Object`


``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona，传入应用 id 和环境变量
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 手动发送信息
monitor.info(msg); 
// 手动发送警告
monitor.warn(msg); 
// 手动发送错误
monitor.error(msg);

// 如果是通过外链 js 安装使用，可直接调用挂载在 window 上的 corona api
window.corona.info(msg);
```

#### info(msg, tags)
<a id="info"></a>

手动上报 info 级别日志

参数：
- msg：`String` 日志信息，必需   
- tags：`Object` 定制特征标签，可选 

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.info 方法

// 手动发送信息
monitor.info('this is a corona info'); 

// 手动发送信息，并带特征标签
monitor.info('this is a corona info', {
    usage: 'used for debug',
}); 
```

#### warn(msg, tags)
<a id="warn"></a>

手动上报 warning 级别日志

参数：
- msg：`String` 日志信息，必需   
- tags：`Object` 定制特征标签，可选 

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.warn 方法

// 手动发送警告
monitor.warn('this is a corona warning'); 

// 手动发送警告，并带特征标签
monitor.warn('this is a corona warning', {
    usage: 'used for debug',
}); 
```

#### error(msg, tags)
<a id="error"></a>

手动上报 error 级别日志

参数：
- msg：`String / Error` 日志信息，必需   
- tags：`Object` 定制特征标签，可选 

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.error 方法

// 手动发送错误
monitor.error('this is a corona error'); 

// 手动发送错误，并带特征标签
monitor.error('this is a corona error', {
    usage: 'used for debug',
}); 

// 手动发送错误对象
monitor.error(new Error('this is a corona error')); 
```

#### setUser(user)
<a id="setuser"></a>

手动设置用户信息（uid 或其他用户识别信息）

参数：
- user `String` 用户识别信息，必需，设置后所有上报日志均会携带此用户信息

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

monitor.setUser('cloudverify');
// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.setUser 方法

```

#### setGlobalTags(tags)
<a id="setglobaltags"></a>

设置全局 tag（业务类型或其他标签信息）

参数：
- tags `Object` 全局 tag，必需，设置后所有上报日志均会携带此 tag 信息

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 设置全局 tag
monitor.setGlobalTags({
    // 所属业务：活动
    biz: 'activity'
});
// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.setglobaltags 方法

```

#### setGlobalOnError(cb)
<a id="setglobalonerror"></a>

设置日志发送失败时的全局回调函数

参数：
- cb `Function | Null` 失败回调函数，必需，传 null 则清除回调函数。回调函数入参见示例：

**注意：避免在回调函数中直接尝试重新上报，会出现再次上报也失败导致重复执行失败回调函数**

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 设置日志发送失败时的全局回调函数
monitor.setGlobalOnError((error, bodyData) => {
    /*
     * @param {Error} error, 错误对象，描述日志发送失败的原因
     * @param {String} bodyData, 发送的日志。post 请求的 payload
     */
    console.warn(error);
    console.warn(bodyData);
});
// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.setGlobalOnError 方法

```

#### setEventUrl(url)
<a id="seteventurl"></a>

自定义日志上报的接口，可使用匹配业务域名的接口，方便携带 cookie 上报

参数：
- url `String` 日志上报的接口，必需

``` javascript
import corona from '@music/corona-web-sdk';

// 初始化corona
let monitor = corona({
    id: 5,
    env: 'prod',
});

// 设置日志发送失败时的全局回调函数
monitor.setEventUrl('http://clientlog.kayalive.tv/api/feedback/weblog/sys');
// 通过 puzzle 等其他方式加载的 sdk，直接调用 window.corona.setGlobalOnError 方法

```

### 全局事件
<a id="globalevents"></a>

#### CoronaInited

Corona SDK 初始化完成事件

``` javascript
// 示例：等 SDK 初始化完成后，调用实例的 setEventUrl 方法修改日志上报接口
document.addEventListener('CoronaInited',() => {
    window.corona.setEventUrl('http://clientlog.kayalive.tv/api/feedback/weblog/sys');
});
```

### 本地测试
<a id="develop"></a>

1. 启动 webpack-dev-server
``` bash
npm run dev
```
2. 修改 host，绑定 127.0.0.1 到 dev.music.174.com

3. 打开 http://dev.music.174.com demo页进行测试

### 提交版本
<a id="commit"></a>

- 开发并测试完之后，先完成使用文档修改
  - 如果使用方式有改动，请修改 README.md
  - 在 CHANGELOG.md 记录本次改动点

- 版本号修改
  - package.json 中版本号修改
  - core.js 中 `SDKversion` 版本修改

- 执行 `npm run build` 进行打包

- 提交代码并发布到 CDN
<!-- 文档END -->
_ _ _

<!-- 联系我们 START -->

## 联系我们

|作者|Email|
|---|---|
|xxx|xxxx@verify.com|

Issue反馈：[https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk/issues](https://g.hz.verify.com/cloudverify-frontend/common-tech-frontend/corona-web-sdk/issues)