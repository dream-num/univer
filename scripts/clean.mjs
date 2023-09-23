import fs from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(import.meta.url);

function deleteNodeModules(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (['node_modules', 'lib', 'dist', '.turbo', 'coverage', 'local'].includes(file)) {
                console.log('Deleting:', filePath);
                fs.rmSync(filePath, { recursive: true });
            } else {
                deleteNodeModules(filePath);
            }
        }
    });
}

deleteNodeModules(resolve(__dirname, '../'));
