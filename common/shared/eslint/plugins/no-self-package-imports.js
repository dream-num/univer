const path = require('node:path');

const PACKAGE_PREFIXES = ['@univerjs/', '@univerjs-pro/'];

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

        // get package name
        const packageMatch = normalizedPath.match(/\/packages\/([^/]+)/);
        if (!packageMatch) {
            return {};
        }

        const packageName = packageMatch[1];
        const possiblePackageNames = PACKAGE_PREFIXES.map((prefix) => `${prefix}${packageName}`);

        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;

                if (possiblePackageNames.includes(importPath)) {
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
