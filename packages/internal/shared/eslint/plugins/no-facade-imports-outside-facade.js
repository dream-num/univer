// no-facade-imports-outside-facade.js
const path = require('node:path');

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow imports containing facade in non-facade files',
        },
        messages: {
            noFacadeImports: 'Imports containing "facade" are not allowed in non-facade files: "{{importPath}}"',
        },
    },

    create(context) {
        const filename = context.getFilename();
        const normalizedPath = filename.split(path.sep).join('/');

        const isInPackages = normalizedPath.includes('/packages/');
        const isInFacade = normalizedPath.includes('/facade/');

        if (!isInPackages || isInFacade) {
            return {};
        }

        // get parent dir
        const parentDirMatch = normalizedPath.match(/\/([^/]+)\/packages\//);
        if (!parentDirMatch) {
            return {};
        }

        const parentDir = parentDirMatch[1];
        const packagePrefix = parentDir === 'univer'
            ? '@univerjs/' :
            parentDir === 'univer-pro'
                ? '@univerjs-pro/' :
                null;

        if (!packagePrefix) {
            return {};
        }

        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;

                // Check if the import path contains 'facade'
                if (importPath.includes('facade')) {
                    context.report({
                        node,
                        messageId: 'noFacadeImports',
                        data: { importPath },
                    });
                }
            },
            ExportNamedDeclaration(node) {
                if (node.source) {
                    const exportPath = node.source.value;
                    if (exportPath.includes('facade')) {
                        context.report({
                            node,
                            messageId: 'noFacadeImports',
                            data: { importPath: exportPath },
                        });
                    }
                }
            },
            ExportAllDeclaration(node) {
                const exportPath = node.source.value;
                if (exportPath.includes('facade')) {
                    context.report({
                        node,
                        messageId: 'noFacadeImports',
                        data: { importPath: exportPath },
                    });
                }
            },
        };
    },
};

module.exports = rule;
