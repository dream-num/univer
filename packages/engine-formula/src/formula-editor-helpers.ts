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

import type { ITextRun } from '@univerjs/core';
import type { ISequenceNode } from './engine/utils/sequence';
import type { IDescriptionService, ISearchItemWithType } from './services/formula/description.service';
import { FunctionType } from './basics/function';
import { isFormulaLexerToken, matchRefDrawToken } from './basics/match-token';
import { matchToken } from './basics/token';
import { sequenceNodeType } from './engine/utils/sequence';

export type FormulaSequenceNode = string | ISequenceNode;

export interface IFormulaHighlightColors {
    formulaRefColors: string[];
    numberColor: string;
    stringColor: string;
    plainTextColor: string;
}

export interface IFormulaRefSelection {
    refIndex: number;
    themeColor: string;
    token: string;
    nodeType: sequenceNodeType;
    startIndex: number;
    endIndex: number;
    index: number;
}

export interface IFormulaStructuredReferenceRange {
    token: string;
    startIndex: number;
    endIndex: number;
}

export type FormulaReferenceEditingMode = 'add' | 'replace' | 'none';

export interface IFormulaReferenceEditingContext {
    mode: FormulaReferenceEditingMode;
    nodeIndex: number;
    referenceIndex: number;
    offset: number;
}

function shouldAppendOpenBracket(functionType: FunctionType): boolean {
    return functionType !== FunctionType.DefinedName && functionType !== FunctionType.Table;
}

export function getFormulaReplaceResult(
    nodes: FormulaSequenceNode[],
    index: number,
    formulaName: string,
    functionType: FunctionType
): { text: string; offset: number } | undefined {
    if (index === -1) {
        return undefined;
    }
    const cloneNodes = [...nodes];
    const lastNodes = cloneNodes.splice(index + 1);
    const oldNode = cloneNodes.pop() ?? '';
    let offset = (typeof oldNode === 'string' ? oldNode.length : oldNode.token.length) - formulaName.length;
    cloneNodes.push(formulaName);
    if (lastNodes[0] !== matchToken.OPEN_BRACKET && shouldAppendOpenBracket(functionType)) {
        cloneNodes.push(matchToken.OPEN_BRACKET);
        offset -= 1;
    }
    return {
        text: [...cloneNodes, ...lastNodes].map((node) => typeof node === 'string' ? node : node.token).join(''),
        offset,
    };
}

export function searchFormulaFunctions(
    descriptionService: IDescriptionService,
    token: string,
    limit = 10
): ISearchItemWithType[] {
    return descriptionService.getSearchListByNameFirstLetter(token).slice(0, limit);
}

export function findFormulaStructuredReferences(formulaText: string): IFormulaStructuredReferenceRange[] {
    const referencePattern = /\[[^\]\r\n]+\]!(?:'(?:[^']|'')+'|[^\s()[\],:+\-*/&=<>!]+)(?:\[\[[^\r\n]*?\]\]|\[[^\]\r\n]+\])/g;
    return Array.from(formulaText.matchAll(referencePattern), (match) => ({
        token: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length - 1,
    }));
}

export function getFormulaSequenceNodeIndex(
    sequenceNodes: FormulaSequenceNode[],
    offset: number,
    isEqual = false
): number {
    let currentOffset = 0;
    for (let index = 0; index < sequenceNodes.length; index++) {
        const node = sequenceNodes[index];
        const nextOffset = currentOffset + (typeof node === 'string' ? node.length : node.token.length);
        if (isEqual ? nextOffset === offset : offset > currentOffset && offset <= nextOffset) {
            return index;
        }
        currentOffset = nextOffset;
    }

    return -1;
}

export function getFormulaReferenceIndex(sequenceNodes: FormulaSequenceNode[], nodeIndex: number): number {
    if (nodeIndex < 0 || nodeIndex >= sequenceNodes.length) {
        return -1;
    }

    const node = sequenceNodes[nodeIndex];
    if (typeof node === 'string' || !isFormulaReferenceNode(node)) {
        return -1;
    }

    let referenceIndex = -1;
    for (let index = 0; index <= nodeIndex; index++) {
        const currentNode = sequenceNodes[index];
        if (typeof currentNode !== 'string' && isFormulaReferenceNode(currentNode)) {
            referenceIndex += 1;
        }
    }

    return referenceIndex;
}

export function getFormulaSequenceCharacterAtOffset(
    sequenceNodes: Array<string | { token: string }>,
    offset: number
): string | undefined {
    let currentOffset = 0;
    for (const node of sequenceNodes) {
        const text = typeof node === 'string' ? node : node.token;
        const nextOffset = currentOffset + text.length;
        if (offset > currentOffset && offset <= nextOffset) {
            return text[offset - currentOffset - 1];
        }
        currentOffset = nextOffset;
    }

    return undefined;
}

export function isFormulaReferenceAddingContext(
    sequenceNodes: Array<string | { token: string }>,
    offset: number
): boolean {
    const character = getFormulaSequenceCharacterAtOffset(sequenceNodes, offset);
    return Boolean(character && matchRefDrawToken(character));
}

export function isFormulaReferenceAddingTextContext(formulaText: string, offset: number): boolean {
    const character = formulaText[offset - 1];
    const nextCharacter = formulaText[offset];
    return Boolean(
        character &&
        matchRefDrawToken(character) &&
        (!nextCharacter || (isFormulaLexerToken(nextCharacter) && nextCharacter !== matchToken.OPEN_BRACKET))
    );
}

export function resolveFormulaReferenceEditingContext(options: {
    formulaText: string;
    sequenceNodes: FormulaSequenceNode[];
    offset: number;
    selectionStart?: number;
    selectionEnd?: number;
}): IFormulaReferenceEditingContext {
    const { formulaText, sequenceNodes } = options;
    const offset = Math.max(0, Math.min(options.offset, formulaText.length));
    let nodeIndex = getFormulaSequenceNodeIndex(sequenceNodes, offset);

    const selectionStart = options.selectionStart ?? offset;
    const selectionEnd = options.selectionEnd ?? selectionStart;
    if (selectionEnd > selectionStart) {
        nodeIndex = sequenceNodes.findIndex((node) =>
            typeof node !== 'string' &&
            isFormulaReferenceNode(node) &&
            node.startIndex < selectionEnd &&
            node.endIndex + 1 > selectionStart
        );
    }

    const referenceIndex = getFormulaReferenceIndex(sequenceNodes, nodeIndex);
    if (referenceIndex !== -1) {
        return { mode: 'replace', nodeIndex, referenceIndex, offset };
    }

    const canAdd = offset === 0 ||
        isFormulaReferenceAddingContext(sequenceNodes, offset) ||
        isFormulaReferenceAddingTextContext(formulaText, offset);
    return {
        mode: canAdd ? 'add' : 'none',
        nodeIndex,
        referenceIndex: -1,
        offset,
    };
}

export function getFormulaHighlightDataStream(
    leadingCharacter: string,
    sequenceNodes: FormulaSequenceNode[],
    sourceText?: string
): string {
    const text = sourceText ?? sequenceNodes.map((node) => typeof node === 'string' ? node : node.token).join('');
    return `${leadingCharacter}${text}\r\n`;
}

export function buildFormulaTextRuns(
    descriptionService: IDescriptionService,
    colors: IFormulaHighlightColors,
    sequenceNodes: FormulaSequenceNode[],
    options?: { includeTableReferences?: boolean }
): { textRuns: ITextRun[]; refSelections: IFormulaRefSelection[] } {
    const textRuns: ITextRun[] = [];
    const refSelections: IFormulaRefSelection[] = [];
    const referenceColors = new Map<string, string>();
    let refColorIndex = 0;

    for (let index = 0; index < sequenceNodes.length; index++) {
        const node = sequenceNodes[index];
        if (typeof node === 'string') {
            const start = textRuns[textRuns.length - 1]?.ed ?? 0;
            textRuns.push(createTextRun(start, start + node.length, colors.plainTextColor));
            continue;
        }

        let color = colors.plainTextColor;
        if (!descriptionService.hasDefinedNameDescription(node.token.trim())) {
            if (isFormulaReferenceNode(node)) {
                color = referenceColors.get(node.token) ?? colors.formulaRefColors[refColorIndex % colors.formulaRefColors.length];
                if (!referenceColors.has(node.token)) {
                    referenceColors.set(node.token, color);
                    refColorIndex += 1;
                }
                if (node.nodeType === sequenceNodeType.REFERENCE || options?.includeTableReferences) {
                    refSelections.push({
                        refIndex: index,
                        themeColor: color,
                        token: node.token,
                        nodeType: node.nodeType,
                        startIndex: node.startIndex,
                        endIndex: node.endIndex,
                        index: refSelections.length,
                    });
                }
            } else if (node.nodeType === sequenceNodeType.NUMBER) {
                color = colors.numberColor;
            } else if (node.nodeType === sequenceNodeType.STRING || node.nodeType === sequenceNodeType.ARRAY) {
                color = colors.stringColor;
            }
        }
        textRuns.push(createTextRun(node.startIndex, node.endIndex + 1, color));
    }

    if (options?.includeTableReferences) {
        const formulaText = sequenceNodes.map((node) => typeof node === 'string' ? node : node.token).join('');
        const structuredReferences = findFormulaStructuredReferences(formulaText);
        for (const reference of structuredReferences) {
            if (refSelections.some((selection) => selection.startIndex === reference.startIndex && selection.endIndex === reference.endIndex)) {
                continue;
            }
            const color = colors.formulaRefColors[refColorIndex % colors.formulaRefColors.length];
            refColorIndex += 1;
            applyTextRunColor(textRuns, reference.startIndex, reference.endIndex + 1, color);
            refSelections.push({
                ...reference,
                refIndex: sequenceNodes.length + refSelections.length,
                themeColor: color,
                nodeType: sequenceNodeType.TABLE,
                index: refSelections.length,
            });
        }
        refSelections.sort((first, second) => first.startIndex - second.startIndex);
        refSelections.forEach((selection, index) => {
            selection.index = index;
        });
    }

    return { textRuns, refSelections };
}

function applyTextRunColor(textRuns: ITextRun[], start: number, end: number, color: string): void {
    const nextRuns: ITextRun[] = [];
    for (const run of textRuns) {
        if (run.ed <= start || run.st >= end) {
            nextRuns.push(run);
            continue;
        }
        if (run.st < start) {
            nextRuns.push(createTextRun(run.st, start, run.ts?.cl?.rgb ?? color));
        }
        nextRuns.push(createTextRun(Math.max(run.st, start), Math.min(run.ed, end), color));
        if (run.ed > end) {
            nextRuns.push(createTextRun(end, run.ed, run.ts?.cl?.rgb ?? color));
        }
    }
    textRuns.splice(0, textRuns.length, ...nextRuns);
}

function isFormulaReferenceNode(node: ISequenceNode): boolean {
    return node.nodeType === sequenceNodeType.REFERENCE || node.nodeType === sequenceNodeType.TABLE;
}

function createTextRun(start: number, end: number, color: string): ITextRun {
    return {
        st: start,
        ed: end,
        ts: { cl: { rgb: color }, fs: 11 },
    };
}
