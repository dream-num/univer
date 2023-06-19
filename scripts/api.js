const execa = require('execa');
const childProcess = require('child_process');

const exec = childProcess.exec;

const devTarget = '@univerjs/core';

run();

async function run() {
    await apiAll(devTarget);
}
async function apiAll(target) {
    await execa('pnpm', ['run', '--filter', target, 'api'], { stdio: 'inherit' });
}
