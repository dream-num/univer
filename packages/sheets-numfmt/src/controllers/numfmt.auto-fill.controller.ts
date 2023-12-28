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

import type { IMutationInfo, IRange } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, Range, Rectangle } from '@univerjs/core';
import type { ISetCellsNumfmt, ISetNumfmtMutationParams } from '@univerjs/sheets';
import {
    factorySetNumfmtUndoMutation,
    INumfmtService,
    SetNumfmtMutation,
    transformCellsToRange,
} from '@univerjs/sheets';
import type { ISheetAutoFillHook } from '@univerjs/sheets-ui';
import { APPLY_TYPE, getAutoFillRepeatRange, IAutoFillService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from '../base/const/PLUGIN_NAME';
import { mergeNumfmtMutations } from '../utils/mutation';

@OnLifecycle(LifecycleStages.Rendered, NumfmtAutoFillController)
export class NumfmtAutoFillController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(IAutoFillService) private _autoFillService: IAutoFillService
    ) {
        super();

        this._initAutoFill();
    }

    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });
        const loopFunc = (
            sourceStartCell: { row: number; col: number },
            targetStartCell: { row: number; col: number },
            relativeRange: IRange
        ) => {
            const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
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

            const values: ISetCellsNumfmt = [];

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
                const oldNumfmtValue = this._numfmtService.getValue(
                    unitId,
                    subUnitId,
                    sourcePositionRange.startRow,
                    sourcePositionRange.startColumn
                );
                if (oldNumfmtValue) {
                    const targetPositionRange = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            startColumn: col,
                            endColumn: col,
                            endRow: row,
                        },
                        targetRange
                    );
                    values.push({
                        pattern: oldNumfmtValue.pattern,
                        type: oldNumfmtValue.type,
                        row: targetPositionRange.startRow,
                        col: targetPositionRange.startColumn,
                    });
                }
            });
            if (values.length) {
                const redo: IMutationInfo<ISetNumfmtMutationParams> = {
                    id: SetNumfmtMutation.id,
                    params: transformCellsToRange(unitId, subUnitId, values),
                };
                const undos = factorySetNumfmtUndoMutation(this._injector, redo.params);
                return {
                    redos: [redo],
                    undos,
                };
            }
            return { redos: [], undos: [] };
        };
        const generalApplyFunc = (sourceRange: IRange, targetRange: IRange) => {
            const totalUndos: IMutationInfo[] = [];
            const totalRedos: IMutationInfo[] = [];
            const sourceStartCell = {
                row: sourceRange.startRow,
                col: sourceRange.startColumn,
            };
            const repeats = getAutoFillRepeatRange(sourceRange, targetRange);
            repeats.forEach((repeat) => {
                const { undos, redos } = loopFunc(sourceStartCell, repeat.repeatStartCell, repeat.relativeRange);
                totalUndos.push(...undos);
                totalRedos.push(...redos);
            });
            return {
                undos: mergeNumfmtMutations(totalUndos),
                redos: mergeNumfmtMutations(totalRedos),
            };
        };
        const hook: ISheetAutoFillHook = {
            id: SHEET_NUMFMT_PLUGIN,
            onFillData: (location, direction, applyType) => {
                if (
                    applyType === APPLY_TYPE.COPY ||
                    applyType === APPLY_TYPE.ONLY_FORMAT ||
                    applyType === APPLY_TYPE.SERIES
                ) {
                    const { source, target } = location;
                    return generalApplyFunc(source, target);
                }
                return noopReturnFunc();
            },
        };
        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
