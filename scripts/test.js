const execa = require('execa');
const child_process = require('child_process');
const { osType } = require('./utils');

const isCI = process.env.CI === 'true';

const devTarget = '@univerjs/core';

run();

async function run() {
    await testAll(devTarget);
}

async function testAll(target) {
    if (isCI) {
        // https://jestjs.io/docs/troubleshooting#tests-are-extremely-slow-on-docker-andor-continuous-integration-ci-server
        await execa('pnpm', ['run', '--filter', target, 'test', '--runInBand'], { stdio: 'inherit' });
        return;
    }

    if (osType() === 'windows') {
        child_process.exec('start /B node scripts/server.js');
    } else if (osType() === 'mac') {
        child_process.exec('node scripts/server.js');
    }

    await execa('pnpm', ['run', '--filter', target, 'test'], { stdio: 'inherit' });
}
