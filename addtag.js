/* eslint-disable*/
const exec = require('child_process').exec;
const version = require('./package.json').version;

const ADDTAG = `git tag v${version}`;
const PUSHTAG = `git push origin v${version}`;
// 执行 git 的命令
exec(ADDTAG, (error, stdout) => {
    if (error) {
        console.error(`add tag error: ${error}`);
        return;
    }
    exec(PUSHTAG, (error, stdout) => {
        if (error) {
            console.error(`push tag error: ${error}`);
            return;
        }
        console.log('\x1b[31m', `提交 tag 成功，版本号${version}`);
    });
});

