/* eslint-disable header/header */
import type { Rule } from 'eslint';
import path from 'node:path';

function getImportSourceValue(node: Rule.Node): string | null {
    if (!('source' in node)) {
        return null;
    }

    const source = (node as { source?: { value?: unknown } }).source;
    if (!source || typeof source.value !== 'string') {
        return null;
    }

    return source.value;
}

const rule: Rule.RuleModule = {
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
            ImportDeclaration(node: Rule.Node) {
                const importPath = getImportSourceValue(node);

                if (!importPath || !importPath.startsWith('.')) {
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

export default rule;
