const execa = require('execa');
const childProcess = require('child_process');
const exec = childProcess.exec;
const devTarget = '@univer/core';
const { execFile } = require('child_process');
run();

async function run() {
    await apiAll(devTarget);
}
async function apiAll(target) {
    await execa('pnpm', ['run', '--filter', target, 'api'], { stdio: 'inherit' });
}
