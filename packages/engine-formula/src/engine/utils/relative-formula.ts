/**
 * Copyright 2023-present DreamNum Inc.
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

import { Rectangle, Tools } from '@univerjs/core';

import type { LexerTreeBuilder } from '../analysis/lexer-tree-builder';
import { generateStringWithSequence, sequenceNodeType } from './sequence';
import { deserializeRangeWithSheet, serializeRange } from './reference';

export function isFormulaTransformable(lexerTreeBuilder: LexerTreeBuilder, formula: string) {
    const originSequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formula);
    if (!originSequenceNodes) {
        return false;
    }
    // no reference node, return origin formula
    if (originSequenceNodes.every((node) => typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE)) {
        return false;
    }

    return true;
}

export function transformFormula(lexerTreeBuilder: LexerTreeBuilder, formula: string, originRow: number, originCol: number, targetRow: number, targetCol: number) {
    if (!isFormulaTransformable(lexerTreeBuilder, formula)) {
        return formula;
    }

    const originSequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formula);
    const getRangeFromCell = (row: number, col: number) => ({ startRow: row, endRow: row, startColumn: col, endColumn: col });
    const originRange = getRangeFromCell(originRow, originCol);

    const relativeRange = Rectangle.getRelativeRange(getRangeFromCell(targetRow, targetCol), originRange);
    const sequenceNodes = Tools.deepClone(originSequenceNodes);
    const transformSequenceNodes = Array.isArray(sequenceNodes)
        ? sequenceNodes.map((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheet(node.token);
                const newRange = Rectangle.getPositionRange(relativeRange, gridRangeName.range);
                const newToken = serializeRange(newRange);
                return {
                    ...node, token: newToken,
                };
            }
            return node;
        })
        : sequenceNodes;
    const formulaString = transformSequenceNodes && generateStringWithSequence(transformSequenceNodes);

    return `=${formulaString}`;
}
