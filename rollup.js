
const rollup = require('rollup').rollup;
const uglify = require('rollup-plugin-uglify').uglify;
const path = require('path');
const fs = require('fs');
const packageJSON = require('./package.json');

const version = packageJSON.version;

const publicDir = 'public';
const versionDir = path.join(publicDir, version);
// 创建目录
if (fs.existsSync(publicDir)) {
    if (fs.existsSync(versionDir)) {
    // 删除版本目录下所有文件
        const fileList = fs.readdirSync(versionDir);
        fileList.forEach((fileName) => {
            fs.unlinkSync(path.join(versionDir, fileName));
        });
    } else {
        fs.mkdirSync(versionDir);
    }
} else {
    fs.mkdirSync(publicDir);
    fs.mkdirSync(versionDir);
}

const inputConfig = {
    input: 'es/index.js',
    plugins: [uglify()]
};

const outputConfig = {
    file: path.join(versionDir, 'music-corona.min.js'),
    name: '_MusicCorona',
    format: 'iife',
};

(async function () {
    const bundle = await rollup(inputConfig);
    bundle.write(outputConfig);
    console.log(outputConfig.file);
}());
