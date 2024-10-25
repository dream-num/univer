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

import type { IDisposable, IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { Disposable, DisposableCollection, Inject, IUniverInstanceService, moveRangeByOffset, UniverInstanceType } from '@univerjs/core';
import { deserializeRangeWithSheet, ErrorType, generateStringWithSequence, LexerTreeBuilder, sequenceNodeType, serializeRange, serializeRangeWithSheet, serializeRangeWithSpreadsheet } from '@univerjs/engine-formula';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';

export type FormulaChangeMap = Record<string, Record<string, Record<string, string>>>;

export type FormulaChangeCallback = (formulaString: string) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

export type RangeFormulaChangeCallback = (formulas: { formulaString: string; ranges: IRange[] }[]) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};

export class FormulaRefRangeService extends Disposable {
    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
    }

    transformFormulaByEffectCommand(unitId: string, subUnitId: string, formula: string, params: EffectRefRangeParams) {
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const currentUnit = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const currentSheet = currentUnit.getActiveSheet();
        const currentUnitId = currentUnit.getUnitId();
        const currentSheetId = currentSheet.getSheetId();

        const transformSequenceNodes = sequenceNodes?.map((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheet(node.token);
                const { range, unitId: rangeUnitId, sheetName: rangeSheetName } = gridRangeName;
                const workbook = this._univerInstanceService.getUnit<Workbook>(rangeUnitId || unitId);
                const worksheet = rangeSheetName ? workbook?.getSheetBySheetName(rangeSheetName) : workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    throw new Error('Sheet not found');
                }

                const realUnitId = workbook!.getUnitId();
                const realSheetId = worksheet.getSheetId();
                if ((realUnitId !== currentUnitId) || (realSheetId !== currentSheetId)) {
                    return node;
                }
                const newRange = handleDefaultRangeChangeWithEffectRefCommands(range, params);
                let newToken = '';

                if (newRange) {
                    const offsetX = newRange.startColumn - range.startColumn;
                    const offsetY = newRange.startRow - range.startRow;
                    const finalRange = moveRangeByOffset(range, offsetX, offsetY);
                    if (rangeUnitId && rangeSheetName) {
                        newToken = serializeRangeWithSpreadsheet(rangeUnitId, rangeSheetName, finalRange);
                    } else if (rangeSheetName) {
                        newToken = serializeRangeWithSheet(rangeSheetName, finalRange);
                    } else {
                        newToken = serializeRange(finalRange);
                    }
                } else {
                    newToken = ErrorType.ERROR;
                }

                return {
                    ...node,
                    token: newToken,
                };
            } else {
                return node;
            };
        });

        return transformSequenceNodes ? `=${generateStringWithSequence(transformSequenceNodes)}` : '';
    }

    registerFormula(unitId: string, subUnitId: string, formula: string, callback: FormulaChangeCallback): IDisposable {
        const rangeMap = new Map<string, { unitId: string; subUnitId: string; range: IRange; sheetName: string }>();
        const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formula);
        const disposableCollection = new DisposableCollection();

        const handleChange = (params: EffectRefRangeParams) => {
            const currentUnit = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const currentSheet = currentUnit.getActiveSheet();
            const currentUnitId = currentUnit.getUnitId();
            const currentSheetId = currentSheet.getSheetId();

            const transformSequenceNodes = sequenceNodes?.map((node) => {
                if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                    const rangeInfo = rangeMap.get(node.token)!;
                    if ((rangeInfo.unitId !== currentUnitId) || (rangeInfo.subUnitId !== currentSheetId)) {
                        return node;
                    }

                    const newRange = handleDefaultRangeChangeWithEffectRefCommands(rangeInfo.range, params);
                    let newToken = '';

                    if (newRange) {
                        const offsetX = newRange.startColumn - rangeInfo.range.startColumn;
                        const offsetY = newRange.startRow - rangeInfo.range.startRow;
                        const finalRange = moveRangeByOffset(rangeInfo.range, offsetX, offsetY);
                        if (rangeInfo.unitId && rangeInfo.sheetName) {
                            newToken = serializeRangeWithSpreadsheet(rangeInfo.unitId, rangeInfo.sheetName, finalRange);
                        } else if (rangeInfo.sheetName) {
                            newToken = serializeRangeWithSheet(rangeInfo.sheetName, finalRange);
                        } else {
                            newToken = serializeRange(finalRange);
                        }
                    } else {
                        newToken = ErrorType.ERROR;
                    }

                    return {
                        ...node,
                        token: newToken,
                    };
                } else {
                    return node;
                };
            });
            const newFormulaString = transformSequenceNodes && generateStringWithSequence(transformSequenceNodes);
            return callback(`=${newFormulaString}`);
        };

        sequenceNodes?.forEach((node) => {
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const gridRangeName = deserializeRangeWithSheet(node.token);
                const { range, unitId: rangeUnitId, sheetName: rangeSheetName } = gridRangeName;
                const workbook = this._univerInstanceService.getUnit<Workbook>(rangeUnitId || unitId);
                const worksheet = rangeSheetName ? workbook?.getSheetBySheetName(rangeSheetName) : workbook?.getSheetBySheetId(subUnitId);
                if (!worksheet) {
                    return;
                }
                const realUnitId = workbook!.getUnitId();
                const realSheetId = worksheet.getSheetId();
                const item = {
                    unitId: realUnitId,
                    subUnitId: realSheetId,
                    range,
                    sheetName: rangeSheetName,
                };
                rangeMap.set(node.token, item);
                disposableCollection.add(this._refRangeService.registerRefRange(range, handleChange, realUnitId, realSheetId));
            }
        });

        return disposableCollection;
    }
}
