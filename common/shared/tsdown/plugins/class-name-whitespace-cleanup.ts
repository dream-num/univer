import path from 'node:path';
import * as ts from 'typescript';

interface ITextEdit {
    end: number;
    start: number;
    text: string;
}

const SUPPORTED_SCRIPT_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function stripQueryAndHash(filePath: string) {
    return filePath.replace(/[?#].*$/, '');
}

function shouldProcessFile(filePath: string) {
    const normalizedPath = stripQueryAndHash(filePath);

    if (normalizedPath.includes('/node_modules/')) {
        return false;
    }

    return SUPPORTED_SCRIPT_EXTENSIONS.has(path.extname(normalizedPath));
}

function getScriptKind(filePath: string) {
    switch (path.extname(stripQueryAndHash(filePath))) {
        case '.jsx':
            return ts.ScriptKind.JSX;
        case '.tsx':
            return ts.ScriptKind.TSX;
        case '.js':
            return ts.ScriptKind.JS;
        default:
            return ts.ScriptKind.TS;
    }
}

function normalizeClassNameWhitespace(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

function mayContainCleanupTarget(sourceCode: string) {
    return /(?:className|clsx\s*\(|cva\s*\()/.test(sourceCode)
        && /(?:\s{2,}|\\[nr])/.test(sourceCode);
}

function isClsxIdentifier(node: ts.Expression) {
    return ts.isIdentifier(node) && node.text === 'clsx';
}

function isCvaIdentifier(node: ts.Expression) {
    return ts.isIdentifier(node) && node.text === 'cva';
}

function isStaticStringLiteral(node: ts.Node): node is ts.NoSubstitutionTemplateLiteral | ts.StringLiteral {
    return ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node);
}

function isClassNameIdentifier(name: ts.PropertyName | ts.JsxAttributeName) {
    return ts.isIdentifier(name) && name.text === 'className';
}

function isClsxArgument(node: ts.Expression) {
    let current: ts.Node = node;

    while (current.parent) {
        if (ts.isCallExpression(current.parent)) {
            return current.parent.arguments.includes(current as ts.Expression)
                && isClsxIdentifier(current.parent.expression);
        }

        current = current.parent;
    }

    return false;
}

function isClassNameJsxAttributeValue(node: ts.Expression) {
    if (ts.isJsxAttribute(node.parent)) {
        return node.parent.initializer === node && isClassNameIdentifier(node.parent.name);
    }

    return ts.isJsxExpression(node.parent)
        && node.parent.expression === node
        && ts.isJsxAttribute(node.parent.parent)
        && isClassNameIdentifier(node.parent.parent.name);
}

function isClassNamePropertyValue(node: ts.Expression) {
    return ts.isPropertyAssignment(node.parent)
        && node.parent.initializer === node
        && (
            isClassNameIdentifier(node.parent.name)
            || (ts.isStringLiteral(node.parent.name) && node.parent.name.text === 'className')
        );
}

function isInsideCvaCall(node: ts.Node) {
    let current: ts.Node | undefined = node.parent;

    while (current) {
        if (ts.isCallExpression(current) && isCvaIdentifier(current.expression)) {
            return true;
        }

        current = current.parent;
    }

    return false;
}

function isClassNameWhitespaceTarget(node: ts.NoSubstitutionTemplateLiteral | ts.StringLiteral) {
    return isClsxArgument(node)
        || isClassNameJsxAttributeValue(node)
        || isClassNamePropertyValue(node)
        || isInsideCvaCall(node);
}

function applyTextEdits(sourceCode: string, edits: ITextEdit[]) {
    return edits
        .sort((left, right) => right.start - left.start)
        .reduce((code, edit) => `${code.slice(0, edit.start)}${edit.text}${code.slice(edit.end)}`, sourceCode);
}

export function cleanupClassNameTemplateWhitespace(sourceCode: string, filePath: string) {
    if (!shouldProcessFile(filePath) || !mayContainCleanupTarget(sourceCode)) {
        return sourceCode;
    }

    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true, getScriptKind(filePath));
    const edits: ITextEdit[] = [];

    function visit(node: ts.Node) {
        if (isStaticStringLiteral(node) && isClassNameWhitespaceTarget(node)) {
            const normalized = normalizeClassNameWhitespace(node.text);

            if (normalized !== node.text) {
                edits.push({
                    end: node.end,
                    start: node.getStart(sourceFile),
                    text: JSON.stringify(normalized),
                });
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (edits.length === 0) {
        return sourceCode;
    }

    return applyTextEdits(sourceCode, edits);
}

export function createClassNameWhitespaceCleanupPlugin() {
    return {
        name: 'class-name-whitespace-cleanup',
        transform(sourceCode: string, id: string) {
            const cleanedCode = cleanupClassNameTemplateWhitespace(sourceCode, id);

            if (cleanedCode === sourceCode) {
                return null;
            }

            return {
                code: cleanedCode,
                map: null,
            };
        },
    };
}
