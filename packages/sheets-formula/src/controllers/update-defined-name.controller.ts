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

import type { IMutationInfo, Nullable, Workbook } from '@univerjs/core';
import type { IDefinedNamesServiceParam, ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { IUnitRangeWithOffset } from './utils/ref-range-move';
import {
    Disposable,
    Inject,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { deserializeRangeWithSheetWithCache, ErrorType, generateStringWithSequence, IDefinedNamesService, LexerTreeBuilder, sequenceNodeType, serializeRangeToRefString, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { RemoveDefinedNameCommand, SetDefinedNameCommand, SheetInterceptorService } from '@univerjs/sheets';
import { FormulaReferenceMoveType, type IFormulaReferenceMoveParam, updateRefOffset } from './utils/ref-range-formula';
import { getNewRangeByMoveParam } from './utils/ref-range-move';
import { getReferenceMoveParams } from './utils/ref-range-param';

export class UpdateDefinedNameController extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder

    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        // remove defined name when sheet is removed
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (command) => {
                    // Exclude processing in getReferenceMoveParams, SetDefinedNameCommand is only handled in UpdateFormulaController
                    if (command.id === SetDefinedNameCommand.id || command.id === RemoveDefinedNameCommand.id) {
                        return {
                            redos: [],
                            undos: [],
                        };
                    }

                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);

                    if (workbook == null) {
                        return {
                            redos: [],
                            undos: [],
                        };
                    }

                    const result = getReferenceMoveParams(workbook, command);

                    if (!result) {
                        return {
                            redos: [],
                            undos: [],
                        };
                    }

                    return this._getUpdateDefinedNameMutations(workbook, result);
                },
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _getUpdateDefinedNameMutations(workbook: Workbook, moveParams: IFormulaReferenceMoveParam) {
        const { type, unitId, sheetId } = moveParams;
        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);

        if (!definedNames) {
            return {
                redos: [],
                undos: [],
            };
        }

        const redoMutations: IMutationInfo<ISetDefinedNameMutationParam>[] = [];
        const undoMutations: IMutationInfo<ISetDefinedNameMutationParam>[] = [];

        // eslint-disable-next-line max-lines-per-function
        Object.values(definedNames).forEach((item) => {
            const { formulaOrRefString } = item;
            const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaOrRefString);
            if (sequenceNodes == null) {
                return true;
            }

            let shouldModify = false;
            const refChangeIds: number[] = [];
            for (let i = 0, len = sequenceNodes.length; i < len; i++) {
                const node = sequenceNodes[i];
                if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                    continue;
                }
                const { token } = node;

                const sequenceGrid = deserializeRangeWithSheetWithCache(token);

                const { range, sheetName, unitId: sequenceUnitId } = sequenceGrid;
                const sequenceSheetId = workbook.getSheetBySheetName(sheetName)?.getSheetId() || '';

                const sequenceUnitRangeWidthOffset: IUnitRangeWithOffset = {
                    range,
                    sheetId: sequenceSheetId,
                    unitId: sequenceUnitId,
                    sheetName,
                    refOffsetX: 0,
                    refOffsetY: 0,
                };

                let newRefString: Nullable<string> = null;

                if (type === FormulaReferenceMoveType.RemoveSheet) {
                    newRefString = this._removeSheet(item, unitId, sheetId);
                } else if (type === FormulaReferenceMoveType.SetName) {
                    const {
                        sheetId: userSheetId,
                        sheetName: newSheetName,
                    } = moveParams;
                    if (newSheetName == null) {
                        continue;
                    }

                    if (sequenceSheetId == null || sequenceSheetId.length === 0) {
                        continue;
                    }

                    if (userSheetId !== sequenceSheetId) {
                        continue;
                    }

                    newRefString = serializeRangeToRefString({
                        range,
                        sheetName: newSheetName,
                        unitId: sequenceUnitId,
                    });
                } else {
                    newRefString = getNewRangeByMoveParam(
                        sequenceUnitRangeWidthOffset,
                        moveParams,
                        unitId,
                        sheetId
                    );
                }

                if (newRefString != null) {
                    sequenceNodes[i] = {
                        ...node,
                        token: newRefString,
                    };
                    shouldModify = true;
                    refChangeIds.push(i);
                }
            }

            if (!shouldModify) {
                return true;
            }

            const newSequenceString = generateStringWithSequence(updateRefOffset(sequenceNodes, refChangeIds));

            const redoMutation = {
                id: SetDefinedNameMutation.id,
                params: {
                    unitId,
                    ...item,
                    formulaOrRefString: newSequenceString,
                },
            };
            redoMutations.push(redoMutation);

            const undoMutation = {
                id: SetDefinedNameMutation.id,
                params: {
                    unitId,
                    ...item,
                },
            };
            undoMutations.push(undoMutation);
        });

        return {
            redos: redoMutations,
            undos: undoMutations,
        };
    }

    private _removeSheet(item: IDefinedNamesServiceParam, unitId: string, subUnitId: string) {
        const { formulaOrRefString } = item;
        const sheetId = this._definedNamesService.getWorksheetByRef(unitId, formulaOrRefString)?.getSheetId();

        if (sheetId === subUnitId) {
            return ErrorType.REF;
        }

        return null;
    }
}
