const execa = require('execa');
const child_process = require('child_process');
const { osType } = require('./utils');

const devTarget = '@univerjs/core';
// node scripts/server && pnpm run --filter @univerjs/core test
run();

async function run() {
    await testAll(devTarget);
}
async function testAll(target) {
    // start http server,/B will starts application without creating a new window.
    // kill in IOHttp test script
    if (osType() === 'windows') {
        child_process.exec('start /B node scripts/server.js');
    } else if (osType() === 'mac') {
        child_process.exec('node scripts/server.js');
    }

    await execa('pnpm', ['run', '--filter', target, 'test'], { stdio: 'inherit' });
}
