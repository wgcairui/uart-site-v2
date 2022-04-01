"use strict";
// config
Object.defineProperty(exports, "__esModule", { value: true });
exports.xconfig = void 0;
exports.xconfig = {
    // I. 必须的配置（一定要写）
    server: `wss://uart.ladishb.com/monitor`,
    appId: 2,
    appSecret: 'a63ea9f7cf5f343af85a269153dbeccb',
    // II. 比较重要的可选配置（不知道怎么配置的别传任何值，key 也别传，整个配置留空！！）
    disks: [],
    errors: [],
    packages: [`${process.cwd()}/package.json`],
    // III. 不是很重要的可选的配置（不知道怎么配置的别传任何值，key 也别传，整个配置留空！！）
    logDir: `${process.cwd()}/xprofiler_output`,
    docker: process.env.NODE_Docker === 'docker',
    ipMode: false,
    libMode: false,
    errexp: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/i,
    logger: null,
    logLevel: 2,
    titles: [],
    cleanAfterUpload: false, // 默认 false，如果设置为 true 则会在转储本地性能文件成功后删除本地的性能文件
};
