
/*
 配置忽略上报的错误
 此类错误 SDK 捕获到后会直接丢弃，不上报到服务端
 建议这里只配置与业务无关的，特殊设备环境引起的不影响页面正常功能的报错
*/

const config = {
    ignoreErrors: [
        'diableNightMode is not defined',
        'Can\'t find variable: IsClickShowFun',
        'Cannot redefine property: BCMain',
    ],
    sampleRate: 1,
};

export default config;
