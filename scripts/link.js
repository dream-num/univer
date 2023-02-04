const execa = require('execa');
// const { targets: allTargets } = require('./util');

const linkTargets = [
    '@univerjs/core', // success
    '@univerjs/base-render', // success
    '@univerjs/base-ui', // success
    '@univerjs/base-sheets', // success

    '@univerjs/common-plugin-data',
    // '@univerjs/sheets-plugin-format',
    // '@univerjs/sheets-plugin-formula',

    // '@univerjs/sheets-plugin-alternating-colors', // success
    // '@univerjs/sheets-plugin-conditional-format', // success
    // '@univerjs/sheets-plugin-data-validation', // success
    // '@univerjs/sheets-plugin-filter', // success
    // '@univerjs/sheets-plugin-find', // success
    // '@univerjs/sheets-plugin-freeze', // success
    // '@univerjs/sheets-plugin-image', // success
    // '@univerjs/sheets-plugin-insert-link', // success
    // '@univerjs/sheets-plugin-pivot-table', // success
    // '@univerjs/sheets-plugin-print', // success
    // '@univerjs/sheets-plugin-protection', // success
    // '@univerjs/sheets-plugin-screenshot', // success
    // '@univerjs/sheets-plugin-sort', // success
    // '@univerjs/sheets-plugin-split-column', // success

    // '@univerjs/style-google',
    '@univerjs/style-univer', // success
    // '@univerjs/style-office365',
    // '@univerjs/style-mobile',
];

// TODO: run => build d.ts => build esm/umd

run();

async function run() {
    await linkAll(linkTargets);
}
// Reference https://github.com/vuejs/vue-next/blob/master/scripts/build.js
async function linkAll(targets) {
    await runParallel(require('os').cpus().length, targets, link);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
    const ret = [];
    const executing = [];
    for (const item of source) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (maxConcurrency <= source.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

async function link(target) {
    await execa('pnpm', ['run', '--filter', target, 'watch'], { stdio: 'inherit' });
}
