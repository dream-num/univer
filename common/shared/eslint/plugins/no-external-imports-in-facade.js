// no-external-imports-in-facade.js
const path = require('node:path');

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow imports from outside facade directory in facade files',
        },
        messages: {
            noExternalImports: 'Imports from outside facade directory are not allowed in facade files: "{{importPath}}"',
        },
    },

    create(context) {
        const filename = context.getFilename();
        const normalizedPath = filename.split(path.sep).join('/');
        const isFacadeFile = normalizedPath.includes('/facade/');

        if (!isFacadeFile) {
            return {};
        }

        const currentDir = path.dirname(filename);

        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;

                if (importPath[0] !== '.') {
                    return;
                }

                const resolvedPath = path.resolve(currentDir, importPath).split(path.sep).join('/');

                if (!resolvedPath.includes('/facade/')) {
                    context.report({
                        node,
                        messageId: 'noExternalImports',
                        data: { importPath },
                    });
                }
            },
        };
    },
};

module.exports = rule;
