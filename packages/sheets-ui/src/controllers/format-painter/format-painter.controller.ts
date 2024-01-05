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

import type { ICellData, IRange } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';

import type { IApplyFormatPainterCommandParams } from '../../commands/commands/set-format-painter.command';
import {
    ApplyFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { getSheetObject } from '../utils/component-tools';

@OnLifecycle(LifecycleStages.Rendered, FormatPainterController)
export class FormatPainterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
        this._bindFormatPainterStatus();
    }

    private _bindFormatPainterStatus() {
        this._formatPainterService.status$.subscribe((status) => {
            const { scene } = this._getSheetObject() || {};
            if (!scene) return;
            if (status !== FormatPainterStatus.OFF) {
                scene.setDefaultCursor(CURSOR_TYPE.CELL);
            } else {
                scene.setDefaultCursor(CURSOR_TYPE.DEFAULT);
            }
        });
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoveEnd$.subscribe((selections) => {
                    if (this._formatPainterService.getStatus() !== FormatPainterStatus.OFF) {
                        const { rangeWithCoord } = selections[selections.length - 1];
                        this._applyFormatPainter({
                            startRow: rangeWithCoord.startRow,
                            startColumn: rangeWithCoord.startColumn,
                            endRow: rangeWithCoord.endRow,
                            endColumn: rangeWithCoord.endColumn,
                        });
                        // if once, turn off the format painter
                        if (this._formatPainterService.getStatus() === FormatPainterStatus.ONCE) {
                            this._commandService.executeCommand(SetOnceFormatPainterCommand.id);
                        }
                    }
                })
            )
        );
    }

    private async _applyFormatPainter(range: IRange) {
        const { styles: stylesMatrix, merges } = this._formatPainterService.getSelectionFormat();
        const unitId = this._currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const subUnitId = this._currentUniverService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        if (!stylesMatrix) return;

        const { startRow, startColumn, endRow, endColumn } = stylesMatrix.getDataRange();
        const styleRowsNum = endRow - startRow + 1;
        const styleColsNum = endColumn - startColumn + 1;
        const styleValues: ICellData[][] = Array.from({ length: range.endRow - range.startRow + 1 }, () =>
            Array.from({ length: range.endColumn - range.startColumn + 1 }, () => ({}))
        );
        const mergeRanges: IRange[] = [];

        styleValues.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                const mappedRowIndex = (rowIndex % styleRowsNum) + startRow;
                const mappedColIndex = (colIndex % styleColsNum) + startColumn;
                const style = stylesMatrix.getValue(mappedRowIndex, mappedColIndex);

                if (style) {
                    styleValues[rowIndex][colIndex].s = style;
                }
            });
        });

        merges.forEach((merge) => {
            const relatedRange: IRange = {
                startRow: merge.startRow - startRow,
                startColumn: merge.startColumn - startColumn,
                endRow: merge.endRow - startRow,
                endColumn: merge.endColumn - startColumn,
            };
            // merge will apply at least once
            const rowRepeats = Math.max(1, Math.floor((range.endRow - range.startRow + 1) / styleRowsNum));
            const colRepeats = Math.max(1, Math.floor((range.endColumn - range.startColumn + 1) / styleColsNum));
            for (let i = 0; i < rowRepeats; i++) {
                for (let j = 0; j < colRepeats; j++) {
                    mergeRanges.push({
                        startRow: relatedRange.startRow + i * styleRowsNum + range.startRow,
                        startColumn: relatedRange.startColumn + j * styleColsNum + range.startColumn,
                        endRow: relatedRange.endRow + i * styleRowsNum + range.startRow,
                        endColumn: relatedRange.endColumn + j * styleColsNum + range.startColumn,
                    });
                }
            }
        });

        const ApplyFormatPainterCommandParams: IApplyFormatPainterCommandParams = {
            subUnitId,
            unitId,
            styleRange: range,
            styleValues,
            mergeRanges,
        };

        await this._commandService.executeCommand(ApplyFormatPainterCommand.id, ApplyFormatPainterCommandParams);
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
