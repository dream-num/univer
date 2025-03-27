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

import type { IMutationInfo, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IAddConditionalRuleMutationParams, IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import type { IFormatPainterHook } from '@univerjs/sheets-ui';
import { Disposable, Inject, Injector, IUniverInstanceService, ObjectMatrix, Range, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import { createTopMatrixFromMatrix, findAllRectangle, SheetsSelectionsService } from '@univerjs/sheets';
import { AddConditionalRuleMutation, AddConditionalRuleMutationUndoFactory, ConditionalFormattingRuleModel, ConditionalFormattingViewModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '@univerjs/sheets-conditional-formatting';
import { FormatPainterStatus, IFormatPainterService } from '@univerjs/sheets-ui';

const repeatByRange = (sourceRange: IRange, targetRange: IRange) => {
    const getRowLength = (range: IRange) => range.endRow - range.startRow + 1;
    const getColLength = (range: IRange) => range.endColumn - range.startColumn + 1;
    const rowMod = getRowLength(targetRange) % getRowLength(sourceRange);
    const colMod = getColLength(targetRange) % getColLength(sourceRange);
    const repeatRow = Math.floor(getRowLength(targetRange) / getRowLength(sourceRange));
    const repeatCol = Math.floor(getColLength(targetRange) / getColLength(sourceRange));
    const repeatList: Array<{ startRange: IRange; repeatRelativeRange: IRange }> = [];
    const repeatRelativeRange: IRange = {
        startRow: 0,
        endRow: getRowLength(sourceRange) - 1,
        startColumn: 0,
        endColumn: getColLength(sourceRange) - 1,
    };
    // If the target area is a single cell, copy the entire source area.
    if (getRowLength(targetRange) === 1 && getColLength(targetRange) === 1) {
        const startRange: IRange = {
            startRow: targetRange.startRow,
            endRow: targetRange.startRow,
            startColumn: targetRange.startColumn,
            endColumn: targetRange.startColumn,
        };
        repeatList.push({ repeatRelativeRange, startRange });
        return repeatList;
    }

    for (let countRow = 0; countRow < (repeatRow + (rowMod ? 0.1 : 0)); countRow++) {
        for (let countCol = 0; countCol < (repeatCol + (colMod ? 0.1 : 0)); countCol++) {
            const row = getRowLength(sourceRange) * (countRow);
            const col = getColLength(sourceRange) * (countCol);
            const startRange: IRange = {
                startRow: row + targetRange.startRow,
                endRow: row + targetRange.startRow,
                startColumn: col + targetRange.startColumn,
                endColumn: col + targetRange.startColumn,
            };
            let _repeatRelativeRange = repeatRelativeRange;
            if (countRow === repeatRow && rowMod) {
                _repeatRelativeRange = { ..._repeatRelativeRange };
                _repeatRelativeRange.endRow = _repeatRelativeRange.endRow - (getRowLength(sourceRange) - rowMod);
            }
            if (countCol === repeatCol && colMod) {
                _repeatRelativeRange = { ..._repeatRelativeRange };
                _repeatRelativeRange.endColumn = _repeatRelativeRange.endColumn - (getColLength(sourceRange) - colMod);
            }
            repeatList.push({ repeatRelativeRange: _repeatRelativeRange, startRange });
        }
    }
    return repeatList;
};

export class ConditionalFormattingPainterController extends Disposable {
    private _painterConfig: Nullable<{ unitId: string; subUnitId: string; range: IRange }> = null;
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IFormatPainterService) private _formatPainterService: IFormatPainterService,
        @Inject(SheetsSelectionsService) private _sheetsSelectionsService: SheetsSelectionsService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,

        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel

    ) {
        super();

        this._initFormattingPainter();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initFormattingPainter() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });
        // eslint-disable-next-line max-lines-per-function
        const loopFunc = (
            sourceStartCell: { row: number; col: number },
            targetStartCell: { row: number; col: number },
            relativeRange: IRange,
            matrixMap: Map<string, ObjectMatrix<1>>,
            config: {
                targetUnitId: string;
                targetSubUnitId: string;
            }
        ) => {
            const { unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._painterConfig!;
            const { targetUnitId, targetSubUnitId } = config;

            const sourceRange = {
                startRow: sourceStartCell.row,
                startColumn: sourceStartCell.col,
                endColumn: sourceStartCell.col,
                endRow: sourceStartCell.row,
            };
            const targetRange = {
                startRow: targetStartCell.row,
                startColumn: targetStartCell.col,
                endColumn: targetStartCell.col,
                endRow: targetStartCell.row,
            };

            Range.foreach(relativeRange, (row, col) => {
                const sourcePositionRange = Rectangle.getPositionRange(
                    {
                        startRow: row,
                        startColumn: col,
                        endColumn: col,
                        endRow: row,
                    },
                    sourceRange
                );
                const targetPositionRange = Rectangle.getPositionRange(
                    {
                        startRow: row,
                        startColumn: col,
                        endColumn: col,
                        endRow: row,
                    },
                    targetRange
                );

                const sourceCellCf = this._conditionalFormattingViewModel.getCellCfs(
                    sourceUnitId,
                    sourceSubUnitId,
                    sourcePositionRange.startRow,
                    sourcePositionRange.startColumn
                );

                const targetCellCf = this._conditionalFormattingViewModel.getCellCfs(
                    targetUnitId,
                    targetSubUnitId,
                    targetPositionRange.startRow,
                    targetPositionRange.startColumn
                );

                if (targetCellCf) {
                    targetCellCf.forEach((cf) => {
                        let matrix = matrixMap.get(cf.cfId);
                        if (!matrixMap.get(cf.cfId)) {
                            const rule = this._conditionalFormattingRuleModel.getRule(targetUnitId, targetSubUnitId, cf.cfId);
                            if (!rule) {
                                return;
                            }
                            matrix = new ObjectMatrix();
                            rule.ranges.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    matrix!.setValue(row, col, 1);
                                });
                            });
                            matrixMap.set(cf.cfId, matrix);
                        }
                        matrix!.realDeleteValue(targetPositionRange.startRow, targetPositionRange.startColumn);
                    });
                }

                if (sourceCellCf) {
                    sourceCellCf.forEach((cf) => {
                        const matrix = matrixMap.get(cf.cfId);
                        matrix && matrix.setValue(targetPositionRange.startRow, targetPositionRange.startColumn, 1);
                    });
                }
            });
        };
        // eslint-disable-next-line max-lines-per-function
        const generalApplyFunc = (targetUnitId: string, targetSubUnitId: string, targetRange: IRange) => {
            const { range: sourceRange, unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._painterConfig!;
            const isSkipSheet = targetUnitId !== sourceUnitId || sourceSubUnitId !== targetSubUnitId;
            const matrixMap: Map<string, ObjectMatrix<1>> = new Map();

            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];
            if (!targetUnitId || !targetSubUnitId || !sourceUnitId || !sourceSubUnitId) {
                return noopReturnFunc();
            }
            const ruleList = this._conditionalFormattingRuleModel.getSubunitRules(sourceUnitId, sourceSubUnitId) ?? [];
            ruleList?.forEach((rule) => {
                const { ranges, cfId } = rule;
                if (ranges.some((range) => Rectangle.intersects(sourceRange, range))) {
                    const matrix = new ObjectMatrix<1>();
                    if (!isSkipSheet) {
                        ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                matrix.setValue(row, col, 1);
                            });
                        });
                    }
                    matrixMap.set(cfId, matrix);
                }
            });

            const sourceStartCell = {
                row: sourceRange.startRow,
                col: sourceRange.startColumn,
            };

            const repeats = repeatByRange(sourceRange, targetRange);

            repeats.forEach((repeat) => {
                loopFunc(sourceStartCell, { row: repeat.startRange.startRow, col: repeat.startRange.startColumn }, repeat.repeatRelativeRange, matrixMap, { targetUnitId, targetSubUnitId });
            });

            matrixMap.forEach((item, cfId) => {
                if (!isSkipSheet) {
                    const rule = this._conditionalFormattingRuleModel.getRule(sourceUnitId, sourceSubUnitId, cfId);
                    if (!rule) {
                        return;
                    }
                    const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
                    if (ranges.length) {
                        const params: ISetConditionalRuleMutationParams = {
                            unitId: sourceUnitId,
                            subUnitId: sourceSubUnitId,
                            rule: { ...rule, ranges },
                        };
                        redos.push({ id: SetConditionalRuleMutation.id, params });
                        undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
                    } else {
                        const params: IDeleteConditionalRuleMutationParams = {
                            unitId: sourceUnitId,
                            subUnitId: sourceSubUnitId,
                            cfId: rule.cfId,
                        };
                        redos.push({ id: DeleteConditionalRuleMutation.id, params });
                        undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                    }
                } else {
                    const rule = this._conditionalFormattingRuleModel.getRule(targetUnitId, targetSubUnitId, cfId);
                    const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
                    if (!rule) {
                        if (ranges.length) {
                            const sourceRule = this._conditionalFormattingRuleModel.getRule(sourceUnitId, sourceSubUnitId, cfId);
                            if (sourceRule) {
                                const params: IAddConditionalRuleMutationParams = {
                                    unitId: targetUnitId,
                                    subUnitId: targetSubUnitId,
                                    rule: {
                                        ...Tools.deepClone(sourceRule),
                                        cfId: this._conditionalFormattingRuleModel.createCfId(targetUnitId, targetSubUnitId),
                                        ranges,
                                    },
                                };
                                redos.push({ id: AddConditionalRuleMutation.id, params });
                                undos.push(AddConditionalRuleMutationUndoFactory(this._injector, params));
                            }
                        }
                    } else {
                        if (ranges.length) {
                            const params: ISetConditionalRuleMutationParams = {
                                unitId: targetUnitId,
                                subUnitId: targetSubUnitId,
                                rule: { ...rule, ranges },
                            };
                            redos.push({ id: SetConditionalRuleMutation.id, params });
                            undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
                        } else {
                            const params: IDeleteConditionalRuleMutationParams = {
                                unitId: targetUnitId,
                                subUnitId: targetSubUnitId,
                                cfId: rule.cfId,
                            };
                            redos.push({ id: DeleteConditionalRuleMutation.id, params });
                            undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                        }
                    }
                }
            });
            return {
                undos,
                redos,
            };
        };

        const hook: IFormatPainterHook = {
            id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
            onStatusChange: (status) => {
                switch (status) {
                    case FormatPainterStatus.INFINITE:
                    case FormatPainterStatus.ONCE: {
                        const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
                        const subUnitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet()?.getSheetId();
                        const selection = this._sheetsSelectionsService.getCurrentLastSelection();
                        const range = selection?.range;
                        if (unitId && subUnitId && range) {
                            this._painterConfig = { unitId, subUnitId, range };
                        }
                        break;
                    }
                    case FormatPainterStatus.OFF: {
                        this._painterConfig = null;
                        break;
                    }
                }
            },
            onApply: (unitId, subUnitId, targetRange) => {
                if (this._painterConfig) {
                    return generalApplyFunc(unitId, subUnitId, targetRange);
                }
                return {
                    redos: [],
                    undos: [],
                };
            },
        };

        this._formatPainterService.addHook(hook);
    }
}
