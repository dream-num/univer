const path = require('node:path');

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow self package imports in packages directory except facade',
        },
        messages: {
            noSelfImport: 'Package cannot import itself: "{{importPath}}" in {{packageName}}',
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

        // get package name
        const packageMatch = normalizedPath.match(/\/packages\/([^/]+)/);
        if (!packageMatch) {
            return {};
        }

        const packageName = packageMatch[1];
        const possiblePackageName = `${packagePrefix}${packageName}`;

        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;

                if (importPath === possiblePackageName) {
                    context.report({
                        node,
                        messageId: 'noSelfImport',
                        data: {
                            importPath,
                            packageName: importPath,
                        },
                    });
                }
            },
        };
    },
};

module.exports = rule;
