/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

function isClsxIdentifier(node: ts.Expression) {
    return ts.isIdentifier(node) && node.text === 'clsx';
}

function isClsxTemplate(node: ts.NoSubstitutionTemplateLiteral) {
    return ts.isCallExpression(node.parent)
        && node.parent.arguments.includes(node)
        && isClsxIdentifier(node.parent.expression);
}

function isClassNameTemplate(node: ts.NoSubstitutionTemplateLiteral) {
    return ts.isJsxExpression(node.parent)
        && ts.isJsxAttribute(node.parent.parent)
        && ts.isIdentifier(node.parent.parent.name)
        && node.parent.parent.name.text === 'className';
}

function applyTextEdits(sourceCode: string, edits: ITextEdit[]) {
    return edits
        .sort((left, right) => right.start - left.start)
        .reduce((code, edit) => `${code.slice(0, edit.start)}${edit.text}${code.slice(edit.end)}`, sourceCode);
}

export function cleanupClassNameTemplateWhitespace(sourceCode: string, filePath: string) {
    if (!shouldProcessFile(filePath)) {
        return sourceCode;
    }

    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true, getScriptKind(filePath));
    const edits: ITextEdit[] = [];

    function visit(node: ts.Node) {
        if (ts.isNoSubstitutionTemplateLiteral(node) && (isClsxTemplate(node) || isClassNameTemplate(node))) {
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
