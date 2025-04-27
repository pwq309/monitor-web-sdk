const uglify = require('rollup-plugin-uglify').uglify;

export default {
    input: 'async/preload.js',
    output: {
        file: 'dist/preload.js',
        format: 'iife'
    },
    plugins: [uglify()]
};
