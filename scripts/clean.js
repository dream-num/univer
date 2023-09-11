const fs = require('fs');
const { join, resolve } = require('path');

function deleteNodeModules(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (['node_modules', 'lib', 'dist'].includes(file)) {
                console.log('Deleting:', filePath);
                fs.rmSync(filePath, { recursive: true });
            } else {
                deleteNodeModules(filePath);
            }
        }
    });
}

deleteNodeModules(resolve(__dirname, '../'));
