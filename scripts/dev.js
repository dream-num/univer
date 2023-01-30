const execa = require('execa');
const childProcess = require('child_process');
const exec = childProcess.exec;
const devTarget = '@univerjs/base-sheets';
const { execFile } = require('child_process');
run();

async function run() {
    await devAll(devTarget);
}
async function devAll(target) {
    await execa('pnpm', ['run', '--filter', target, 'dev'], { stdio: 'inherit' });
}
