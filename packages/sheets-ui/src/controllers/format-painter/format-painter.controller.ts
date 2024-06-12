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

import type { ICellData, IStyleData, Workbook } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';

import { Inject } from '@wendellhu/redi';
import { SelectionManagerService } from '@univerjs/sheets';
import { getCellInfoInMergeData } from '@univerjs/engine-render';
import {
    ApplyFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import type { IFormatPainterHook } from '../../services/format-painter/format-painter.service';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';

@OnLifecycle(LifecycleStages.Rendered, FormatPainterController)
export class FormatPainterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
        this._addDefaultHook();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoveEnd$.subscribe((selections) => {
                    if (this._formatPainterService.getStatus() !== FormatPainterStatus.OFF) {
                        const { rangeWithCoord } = selections[selections.length - 1];
                        this._commandService.executeCommand(ApplyFormatPainterCommand.id, {
                            unitId: this._univerInstanceService.getFocusedUnit()?.getUnitId() || '',
                            subUnitId: (this._univerInstanceService.getFocusedUnit() as Workbook).getActiveSheet().getSheetId(),
                            range: {
                                startRow: rangeWithCoord.startRow,
                                startColumn: rangeWithCoord.startColumn,
                                endRow: rangeWithCoord.endRow,
                                endColumn: rangeWithCoord.endColumn,
                            },
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

    private _addDefaultHook() {
        const defaultHook: IFormatPainterHook = {
            id: 'default-format-painter',
            priority: 0,
            isDefaultHook: true,
            onStatusChange: (status: FormatPainterStatus) => {
                if (status !== FormatPainterStatus.OFF) {
                    const format = this._collectSelectionRangeFormat();
                    if (format) {
                        this._formatPainterService.setSelectionFormat(format);
                    }
                }
            },
            onApply() {

            },
        };
    }

    private _collectSelectionRangeFormat() {
        const selection = this._selectionManagerService.getLast();
        const range = selection?.range;
        if (!range) return null;
        const { startRow, endRow, startColumn, endColumn } = range;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        const cellData = worksheet.getCellMatrix();
        const mergeData = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet().getMergeData();

        const styles = workbook.getStyles();
        const stylesMatrix = new ObjectMatrix<IStyleData>();
        const merges = [];
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellData.getValue(r, c) as ICellData;
                stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
                const { isMergedMainCell, ...mergeInfo } = getCellInfoInMergeData(r, c, mergeData);
                if (isMergedMainCell) {
                    merges.push({
                        startRow: mergeInfo.startRow,
                        startColumn: mergeInfo.startColumn,
                        endRow: mergeInfo.endRow,
                        endColumn: mergeInfo.endColumn,
                    });
                }
            }
        }
        return {
            styles: stylesMatrix,
            merges,
        };
    }
}
