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

import type { IRange } from '@univerjs/core';
import { AbsoluteRefType, Disposable, isValidRange, IUniverInstanceService, moveRangeByOffset } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IDefinedNamesService } from '../../services/defined-names.service';
import type { ISequenceArray, ISequenceNode } from '../utils/sequence';
import { generateStringWithSequence, sequenceNodeType } from '../utils/sequence';
import { operatorToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { ErrorType } from '../../basics/error-type';
import { deserializeRangeWithSheet, serializeRangeToRefString } from '../utils/reference';
import { LexerTreeBuilder } from './lexer-tree-builder';

export class Lexer extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IFormulaCurrentConfigService private readonly _formulaCurrentConfigService: IFormulaCurrentConfigService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    treeBuilder(formulaString: string, transformSuffix = true) {
        return this._lexerTreeBuilder.treeBuilder(formulaString, transformSuffix, this._injectDefinedName.bind(this), this._simpleCheckDefinedName.bind(this));
    }

    sequenceNodesBuilder(formulaString: string) {
        return this._lexerTreeBuilder.sequenceNodesBuilder(formulaString, this._injectDefinedNameCheck.bind(this));
    }

    convertRefersToAbsolute(formulaString: string, startAbsoluteRefType: AbsoluteRefType, endAbsoluteRefType: AbsoluteRefType) {
        const nodes = this.sequenceNodesBuilder(formulaString);
        if (nodes == null) {
            return formulaString;
        }

        let prefixToken = '';
        if (formulaString.substring(0, 1) === operatorToken.EQUALS) {
            prefixToken = operatorToken.EQUALS;
        }

        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            if (typeof node === 'string') {
                continue;
            }

            if (node.nodeType === sequenceNodeType.REFERENCE) {
                const { token, endIndex } = node;
                const sequenceGrid = deserializeRangeWithSheet(token);
                if (sequenceGrid == null) {
                    continue;
                }

                const { range, sheetName, unitId } = sequenceGrid;

                const newRange = {
                    ...range,
                    startAbsoluteRefType,
                    endAbsoluteRefType,
                };

                const newToken = serializeRangeToRefString({
                    range: newRange,
                    unitId,
                    sheetName,
                });

                const minusCount = newToken.length - token.length;

                nodes[i] = {
                    ...node,
                    token: newToken,
                    endIndex: endIndex + minusCount,
                };

                /**
                 * Adjust the start and end indexes of the subsequent nodes.
                 */
                for (let j = i + 1; j < len; j++) {
                    const nextNode = nodes[j];
                    if (typeof nextNode === 'string') {
                        continue;
                    }

                    nextNode.startIndex += minusCount;
                    nextNode.endIndex += minusCount;
                }
            }
        }

        return `${prefixToken}${generateStringWithSequence(nodes)}`;
    }

    moveFormulaRefOffset(formulaString: string, refOffsetX: number, refOffsetY: number, ignoreAbsolute = false) {
        const sequenceNodes = this.sequenceNodesBuilder(formulaString);

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

            const sequenceGrid = deserializeRangeWithSheet(token);

            const { sheetName, unitId: sequenceUnitId } = sequenceGrid;

            let newRange: IRange = sequenceGrid.range;

            if (newRange.startAbsoluteRefType === AbsoluteRefType.ALL && newRange.endAbsoluteRefType === AbsoluteRefType.ALL) {
                newSequenceNodes.push(node);
                continue;
            } else {
                newRange = moveRangeByOffset(newRange, refOffsetX, refOffsetY, ignoreAbsolute);
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


    private _injectDefinedNameCheck(nodeToken: string) {
        let executeUnitId = this._formulaCurrentConfigService.getExecuteUnitId();

        if (!executeUnitId || executeUnitId === '') {
            executeUnitId = this._univerInstanceService.getCurrentUniverSheetInstance()?.getUnitId();
        }

        if (!executeUnitId || executeUnitId === '') {
            return false;
        }

        if (this._definedNamesService.getValueByName(executeUnitId, nodeToken)) {
            return true;
        }

        return false;
    }

    private _simpleCheckDefinedName(formulaString: string) {
        const definedNameMap = this._formulaCurrentConfigService.getDirtyDefinedNameMap();
        const executeUnitId = this._formulaCurrentConfigService.getExecuteUnitId();
        if (executeUnitId != null && definedNameMap[executeUnitId] != null) {
            const names = Object.keys(definedNameMap[executeUnitId]!);
            for (let i = 0, len = names.length; i < len; i++) {
                const name = names[i];
                if (formulaString.indexOf(name) > -1) {
                    return true;
                }
            }
        }

        return false;
    }

    private _checkDefinedNameDirty(token: string) {
        const definedNameMap = this._formulaCurrentConfigService.getDirtyDefinedNameMap();
        const executeUnitId = this._formulaCurrentConfigService.getExecuteUnitId();
        if (executeUnitId != null && definedNameMap[executeUnitId] != null) {
            const names = Object.keys(definedNameMap[executeUnitId]!);
            for (let i = 0, len = names.length; i < len; i++) {
                const name = names[i];
                if (name === token) {
                    return true;
                }
            }
        }

        return false;
    }

    private _injectDefinedName(sequenceArray: ISequenceArray[]) {
        const unitId = this._formulaCurrentConfigService.getExecuteUnitId();

        if (unitId == null) {
            return {
                sequenceString: '',
                hasDefinedName: false,
                definedNames: [],
            };
        }

        const sequenceNodes = this._lexerTreeBuilder.getSequenceNode(sequenceArray, () => false);
        let sequenceString = '';
        let hasDefinedName = false;
        const definedNames: string[] = [];

        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                sequenceString += node;
                continue;
            }

            const { nodeType, token } = node;

            if (nodeType === sequenceNodeType.REFERENCE || nodeType === sequenceNodeType.FUNCTION) {
                const definedContent = this._definedNamesService.getValueByName(unitId, token);
                if (definedContent) {
                    let refString = definedContent.formulaOrRefString;
                    if (refString.substring(0, 1) === operatorToken.EQUALS) {
                        refString = refString.substring(1);
                    }
                    sequenceString += refString;
                    definedNames.push(definedContent.name);
                    hasDefinedName = true;
                } else if (this._checkDefinedNameDirty(token)) {
                    sequenceString += ErrorType.NAME;
                    hasDefinedName = true;
                    definedNames.push(token);
                } else {
                    sequenceString += token;
                }
            } else {
                sequenceString += token;
            }
        }

        return {
            sequenceString,
            hasDefinedName,
            definedNames,
        };
    }
}
