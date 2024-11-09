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

import { AbsoluteRefType, type IRange, isValidRange } from '@univerjs/core';
import { deserializeRangeWithSheetWithCache, ErrorType, generateStringWithSequence, type ISequenceNode, type LexerTreeBuilder, sequenceNodeType, serializeRangeToRefString } from '@univerjs/engine-formula';

export function makeFormulaAbsolute(lexerTreeBuilder: LexerTreeBuilder, formulaString: string) {
    const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(formulaString);

    if (sequenceNodes == null) {
        return formulaString;
    }

    const newSequenceNodes: Array<string | ISequenceNode> = [];

    for (let i = 0, len = sequenceNodes.length; i < len; i++) {
        const node = sequenceNodes[i];
        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            newSequenceNodes.push(node);
            continue;
        }

        const { token } = node;

        const sequenceGrid = deserializeRangeWithSheetWithCache(token);

        const { sheetName, unitId: sequenceUnitId } = sequenceGrid;

        let newRange: IRange = sequenceGrid.range;

        if (newRange.startAbsoluteRefType === AbsoluteRefType.ALL && newRange.endAbsoluteRefType === AbsoluteRefType.ALL) {
            newSequenceNodes.push(node);
            continue;
        } else {
            newRange = {
                ...newRange,
                startAbsoluteRefType: AbsoluteRefType.ALL,
                endAbsoluteRefType: AbsoluteRefType.ALL,
            };
        }

        let newToken = '';
        if (isValidRange(newRange)) {
            newToken = serializeRangeToRefString({
                range: newRange,
                unitId: sequenceUnitId,
                sheetName,
            });
        } else {
            newToken = ErrorType.REF;
        }

        newSequenceNodes.push({
            ...node,
            token: newToken,
        });
    }

    return `=${generateStringWithSequence(newSequenceNodes)}`;
}
