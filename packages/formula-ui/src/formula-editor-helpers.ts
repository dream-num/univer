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
import type { ISequenceNode } from '@univerjs/engine-formula';
import type { IDescriptionService, ISearchItemWithType } from '@univerjs/formula';
import { FunctionType, matchToken, sequenceNodeType } from '@univerjs/engine-formula';

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
    startIndex: number;
    endIndex: number;
    index: number;
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
    sequenceNodes: FormulaSequenceNode[]
): { textRuns: ITextRun[]; refSelections: IFormulaRefSelection[] } {
    const textRuns: ITextRun[] = [];
    const refSelections: IFormulaRefSelection[] = [];
    const referenceColors = new Map<string, string>();
    let refColorIndex = 0;

    for (let index = 0; index < sequenceNodes.length; index++) {
        const node = sequenceNodes[index];
        if (typeof node === 'string') {
            const start = textRuns.at(-1)?.ed ?? 0;
            textRuns.push(createTextRun(start, start + node.length, colors.plainTextColor));
            continue;
        }

        let color = colors.plainTextColor;
        if (!descriptionService.hasDefinedNameDescription(node.token.trim())) {
            if (node.nodeType === sequenceNodeType.REFERENCE) {
                color = referenceColors.get(node.token) ?? colors.formulaRefColors[refColorIndex % colors.formulaRefColors.length];
                if (!referenceColors.has(node.token)) {
                    referenceColors.set(node.token, color);
                    refColorIndex += 1;
                }
                refSelections.push({
                    refIndex: index,
                    themeColor: color,
                    token: node.token,
                    startIndex: node.startIndex,
                    endIndex: node.endIndex,
                    index: refSelections.length,
                });
            } else if (node.nodeType === sequenceNodeType.NUMBER) {
                color = colors.numberColor;
            } else if (node.nodeType === sequenceNodeType.STRING || node.nodeType === sequenceNodeType.ARRAY) {
                color = colors.stringColor;
            }
        }
        textRuns.push(createTextRun(node.startIndex, node.endIndex + 1, color));
    }

    return { textRuns, refSelections };
}

function createTextRun(start: number, end: number, color: string): ITextRun {
    return {
        st: start,
        ed: end,
        ts: { cl: { rgb: color }, fs: 11 },
    };
}
