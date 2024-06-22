const { execSync } = require('node:child_process');
const { readdirSync, copyFileSync } = require('node:fs');
const { join } = require('node:path');

const packagesDir = join(__dirname, 'packages');
const packages = readdirSync(packagesDir);

packages.forEach((pkg) => {
    const packageDir = join(packagesDir, pkg);
    if (!readdirSync(packageDir).includes('coverage')) return;
    const coverageDir = join(packagesDir, pkg, 'coverage');
    copyFileSync(join(coverageDir, 'coverage-final.json'), join(__dirname, 'coverage/.nyc_output', `${pkg}-coverage.json`));
});

execSync('nyc report --reporter=html --reporter=text-summary');
