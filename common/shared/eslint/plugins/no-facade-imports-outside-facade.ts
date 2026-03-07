/* eslint-disable header/header */
import type { Rule } from 'eslint';
import path from 'node:path';

interface IRuleOptions { ignore?: unknown[] }

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

function normalizePath(filePath: string): string {
    return filePath.split(path.sep).join('/');
}

function shouldIgnoreFile(normalizedFilePath: string, ignorePaths: readonly unknown[]): boolean {
    return ignorePaths.some((ignorePath: unknown) => {
        if (typeof ignorePath !== 'string') {
            return false;
        }

        const normalizedIgnorePath = normalizePath(ignorePath).replace(/^\.\//, '');

        if (!normalizedIgnorePath) {
            return false;
        }

        return normalizedFilePath === normalizedIgnorePath
            || normalizedFilePath.endsWith(`/${normalizedIgnorePath}`)
            || normalizedFilePath.includes(normalizedIgnorePath);
    });
}

const rule: Rule.RuleModule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow imports containing facade in non-facade files',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ignore: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            noFacadeImports: 'Imports containing "facade" are not allowed in non-facade files: "{{importPath}}"',
        },
    },

    create(context) {
        const filename = context.getFilename();
        const normalizedPath = normalizePath(filename);
        const [ruleOptions = {} as IRuleOptions] = context.options as [IRuleOptions?];
        const ignorePaths = Array.isArray(ruleOptions.ignore) ? ruleOptions.ignore : [];

        if (shouldIgnoreFile(normalizedPath, ignorePaths)) {
            return {};
        }

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

        return {
            ImportDeclaration(node: Rule.Node) {
                const importPath = getImportSourceValue(node);

                // Check if the import path contains 'facade'
                if (importPath?.includes('facade')) {
                    context.report({
                        node,
                        messageId: 'noFacadeImports',
                        data: { importPath },
                    });
                }
            },
            ExportNamedDeclaration(node: Rule.Node) {
                const exportPath = getImportSourceValue(node);
                if (exportPath?.includes('facade')) {
                    context.report({
                        node,
                        messageId: 'noFacadeImports',
                        data: { importPath: exportPath },
                    });
                }
            },
            ExportAllDeclaration(node: Rule.Node) {
                const exportPath = getImportSourceValue(node);
                if (exportPath?.includes('facade')) {
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

export default rule;
