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
import { Disposable, IUniverInstanceService, Range } from '@univerjs/core';
import type { ISheetAutoFillHook } from '@univerjs/sheets-ui';
import { APPLY_TYPE, getAutoFillRepeatRange, IAutoFillService } from '@univerjs/sheets-ui';

import { PLUGIN_NAME } from '../common/const';

export class DataValidationAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
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
                undos: [],
                redos: [],
            };
        };
        const hook: ISheetAutoFillHook = {
            id: PLUGIN_NAME,
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
