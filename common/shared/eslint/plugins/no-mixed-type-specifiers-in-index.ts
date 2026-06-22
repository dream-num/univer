import type { Rule, SourceCode } from 'eslint';
import path from 'node:path';

type ImportOrExportSpecifier = Rule.Node & {
    importKind?: 'type' | 'value';
    exportKind?: 'type' | 'value';
};

function normalizePath(filePath: string): string {
    return filePath.split(path.sep).join('/');
}

function getRuleFilename(context: Rule.RuleContext): string {
    const filenameFromProperty = (context as { filename?: unknown }).filename;

    if (typeof filenameFromProperty === 'string' && filenameFromProperty) {
        return filenameFromProperty;
    }

    const getFilename = (context as { getFilename?: () => string }).getFilename;
    return typeof getFilename === 'function' ? getFilename.call(context) : '';
}

function isSrcIndexFile(context: Rule.RuleContext): boolean {
    return normalizePath(getRuleFilename(context)).endsWith('/src/index.ts');
}

function isInlineTypeSpecifier(specifier: ImportOrExportSpecifier, kind: 'import' | 'export'): boolean {
    return kind === 'import' ? specifier.importKind === 'type' : specifier.exportKind === 'type';
}

function trimInlineTypeKeyword(specifierText: string): string {
    return specifierText.replace(/^type\s+/, '');
}

function buildReplacement(
    sourceCode: SourceCode,
    node: Rule.Node,
    kind: 'import' | 'export'
): string | null {
    const specifiers = (node as { specifiers?: ImportOrExportSpecifier[] }).specifiers;
    if (!specifiers?.length) {
        return null;
    }

    const typeSpecifiers = specifiers.filter((specifier) => isInlineTypeSpecifier(specifier, kind));
    const valueSpecifiers = specifiers.filter((specifier) => !isInlineTypeSpecifier(specifier, kind));
    if (typeSpecifiers.length === 0 || valueSpecifiers.length === 0) {
        return null;
    }

    const nodeText = sourceCode.getText(node);
    const openingBraceIndex = nodeText.indexOf('{');
    const closingBraceIndex = nodeText.lastIndexOf('}');
    if (openingBraceIndex === -1 || closingBraceIndex === -1 || closingBraceIndex < openingBraceIndex) {
        return null;
    }

    const suffixWithSemicolon = nodeText.slice(closingBraceIndex + 1);
    const hasSemicolon = suffixWithSemicolon.trimEnd().endsWith(';');
    const suffix = hasSemicolon ? suffixWithSemicolon.replace(/;\s*$/, '') : suffixWithSemicolon;
    const semicolon = hasSemicolon ? ';' : '';
    const valueSpecifierText = valueSpecifiers.map((specifier) => sourceCode.getText(specifier)).join(', ');
    const typeSpecifierText = typeSpecifiers
        .map((specifier) => trimInlineTypeKeyword(sourceCode.getText(specifier)))
        .join(', ');

    return `${kind} { ${valueSpecifierText} }${suffix}${semicolon}\n${kind} type { ${typeSpecifierText} }${suffix}${semicolon}`;
}

const rule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow mixing inline type specifiers with value specifiers in src/index.ts',
        },
        fixable: 'code',
        messages: {
            noMixedExportSpecifiers: 'Do not mix type and value export specifiers in src/index.ts.',
            noMixedImportSpecifiers: 'Do not mix type and value import specifiers in src/index.ts.',
        },
    },

    create(context) {
        if (!isSrcIndexFile(context)) {
            return {};
        }

        return {
            ImportDeclaration(node: Rule.Node) {
                const replacement = buildReplacement(context.sourceCode, node, 'import');
                if (!replacement) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'noMixedImportSpecifiers',
                    fix(fixer) {
                        return fixer.replaceText(node, replacement);
                    },
                });
            },
            ExportNamedDeclaration(node: Rule.Node) {
                const replacement = buildReplacement(context.sourceCode, node, 'export');
                if (!replacement) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'noMixedExportSpecifiers',
                    fix(fixer) {
                        return fixer.replaceText(node, replacement);
                    },
                });
            },
        };
    },
};

export default rule;
