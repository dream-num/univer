import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kebabize = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());

const getAllFiles = function (dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (
            file.includes('node_modules') ||
            file.includes('dist') ||
            file.includes('lib') ||
            file.includes('.turbo') ||
            file.includes('coverage') ||
            file.includes('local') ||
            file.includes('design') ||
            file.includes('base-ui') ||
            file.includes('git')
        ) {
            return;
        }

        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('index.module.less'));
};

function normalizePath(s) {
    // TODO@wzhudev: if the last part is React.TSX, keep it
    const parts = s.split('/');
    return parts
        .map((s, index) => {
            if (index === parts.length - 1 && s.endsWith('.tsx')) {
                return s;
            }

            return kebabize(s)
                .replace(/^controller$/i, 'controllers')
                .replace(/^component$/i, 'components')
                .replace(/^service$/i, 'services')
                .replace(/^view$/i, 'views');
        })
        .join('/');
}

function makeFilePathToKebabCase(file) {
    const prePath = file.split('/packages/')[0];
    const relativePath = file.split('/packages/')[1];
    const kebabCaseFileName = normalizePath(relativePath);

    return `${prePath}/packages/${kebabCaseFileName}`;
}

function move(from, to) {
    fs.moveSync(from, to);
}

function updateImports(to) {
    const file = fs.readFileSync(to, 'utf8');

    const newFile = file
        .replace(/from '(.*?)';/g, (s) => {
            if (!s.includes('./')) {
                return s;
            }

            const newRelativePath = normalizePath(s);
            console.log(s, newRelativePath);
            return `${newRelativePath}`;
        })

    fs.writeFileSync(to, newFile);
}

const folderPath = path.join(__dirname, '../packages');
const allFiles = getAllFiles(folderPath).slice(1);
const allFilePairs = allFiles.map((f) => [f, makeFilePathToKebabCase(f)]);
allFilePairs
    .filter(([from, to]) => from !== to)
    .forEach(([from, to]) => {
        move(from, to);
    });
allFilePairs.forEach(([_, to]) => {
    updateImports(to);
});
