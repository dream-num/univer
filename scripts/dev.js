const execa = require('execa');
const childProcess = require('child_process');

const devTarget = '@univerjs/base-sheets';

run();
// esbuild
async function run() {
    await devAll(devTarget);
}
async function devAll(target) {
    await execa('pnpm', ['run', '--filter', target, 'dev'], { stdio: 'inherit' });
}
