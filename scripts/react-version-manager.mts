import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function main() {
    const version = process.argv[2].replace('--react=', '');
    const __pkg = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(__pkg, 'utf8'));

    pkg.resolutions = {
        '@types/react': version,
        '@types/react-dom': version,
        react: version,
        'react-dom': version,
    };

    fs.writeFileSync(__pkg, `${JSON.stringify(pkg, null, 4)}\n`);

    execSync('pnpm i --no-lockfile');
}

main();
