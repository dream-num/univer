import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverUniverUiLocales } from '@univerjs-infra/shared/locale';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');

type MockdataPackageJson = Record<string, unknown> & {
    dependencies: Record<string, string>;
};

function readJsonFileSync<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function writeJsonFileSync(filePath: string, value: unknown) {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`);
}

/**
 * Generate locales files
 */
async function generateLocales() {
    const packageNames: string[] = [];

    const pkgJsonFile = readJsonFileSync<MockdataPackageJson>(path.resolve(__dirname, '../package.json'));

    const packagesRoot = path.resolve(__dirname, '../../../packages');
    const packageEntries = fs.existsSync(packagesRoot)
        ? fs.readdirSync(packagesRoot, { withFileTypes: true })
        : [];
    const packages = packageEntries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(packagesRoot, entry.name))
        .filter((pkgPath) => fs.existsSync(pkgPath));

    const allPackages = [...packages];
    for (const pkg of allPackages) {
        const localePath = path.join(pkg, 'src/locale');
        if (fs.existsSync(localePath)) {
            const pkgJsonPath = path.join(pkg, 'package.json');
            if (!fs.existsSync(pkgJsonPath)) {
                continue;
            }
            const pkgJson = readJsonFileSync<{ name: string }>(pkgJsonPath);
            packageNames.push(pkgJson.name);
            pkgJsonFile.dependencies[pkgJson.name] = 'workspace:*';
        }
    }

    writeJsonFileSync(path.resolve(__dirname, '../package.json'), pkgJsonFile);

    discoverUniverUiLocales({ rootDir: root }).forEach((locale) => {
        let statements = '/* eslint-disable */\n';

        packageNames.forEach((pkg) => {
            const pkgName = pkg.replace(/@|univerjs|\/|-/g, '');
            statements += `import ${pkgName}Locale from '${pkg}/locale/${locale}';\n`;
        });

        statements += '\nexport default Object.assign(\n';
        statements += '    {},\n';

        packageNames.forEach((pkg) => {
            const pkgName = pkg.replace(/@|univerjs|\/|-/g, '');
            statements += `    ${pkgName}Locale,\n`;
        });
        statements += ');\n';

        const outputPath = path.resolve(__dirname, `../src/locales/${locale}.ts`);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, statements);
    });
}

generateLocales();
