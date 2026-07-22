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

import type { ICommandInfo, IExecutionOptions, IMutationCommonParams, IRange, Nullable, UnitModel, Workbook, Worksheet } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { IAutoFillLocation, IRemoveSheetMutationParams } from '@univerjs/sheets';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    Inject,
    IUniverInstanceService,
} from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    AUTO_FILL_HOOK_TYPE,
    AutoClearContentCommand,
    AutoFillCommand,
    AutoFillController,
    IAutoFillService,
    InsertColMutation,
    InsertRowMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RefillCommand,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetMutation,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SetCellEditVisibleOperation } from '../commands/operations/cell-edit.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { IEditorBridgeService } from '../services/editor-bridge.service';
import { ISheetSelectionRenderService } from '../services/selection/base-selection-render.service';
import { SheetsRenderService } from '../services/sheets-render.service';

export class AutoFillUIController extends Disposable {
    private _currentLocation: Nullable<IAutoFillLocation> = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @Inject(AutoFillController) private _autoFillController: AutoFillController,
        @Inject(SheetsRenderService) private _sheetsRenderService: SheetsRenderService
    ) {
        super();

        this._init();
    }

    private _init() {
        this._initDefaultHook();
        this._initQuitListener();
        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        this.disposeWithMe(this._sheetsRenderService.registerSkeletonChangingMutations(AutoFillCommand.id));
    }

    private _initDefaultHook() {
        this.disposeWithMe(this._autoFillService.addHook({
            id: 'default-ui',
            type: AUTO_FILL_HOOK_TYPE.DEFAULT,
            priority: 0,
            onBeforeFillData: (location: IAutoFillLocation) => {
                this._currentLocation = location;
            },
        }));
    }

    private _initQuitListener() {
        const quitCommands = [
            SetCellEditVisibleOperation.id,
            AutoClearContentCommand.id,
            SetRangeValuesCommand.id,
            SetZoomRatioOperation.id,
            SetWorksheetActiveOperation.id,
            MoveRangeMutation.id,
            RemoveRowMutation.id,
            RemoveColMutation.id,
            InsertRowMutation.id,
            InsertColMutation.id,
            MoveRowsMutation.id,
            MoveColsMutation.id,
            SetWorksheetColWidthMutation.id,
            SetWorksheetRowHeightMutation.id,
            SetRangeValuesMutation.id,
        ];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            const fromCollab = options?.fromCollab;
            const fromSync = options?.fromSync;
            const fromFormula = options?.fromFormula;
            if (
                quitCommands.includes(command.id)
                && !fromCollab
                && !fromSync
                && !fromFormula
                && (command.params as IMutationCommonParams).trigger !== AutoFillCommand.id
                && (command.params as IMutationCommonParams).trigger !== RefillCommand.id
            ) {
                this._quit();
            }
            if (command.id === RemoveSheetMutation.id) {
                if ((command.params as IRemoveSheetMutationParams).unitId === this._currentLocation?.unitId &&
                    (command.params as IRemoveSheetMutationParams).subUnitId === this._currentLocation?.subUnitId) {
                    this._quit();
                }
            }
        }));
        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((unit: UnitModel) => {
            if (unit.getUnitId() === this._currentLocation?.unitId) {
                this._quit();
            }
        }));
    }

    private _quit() {
        this._currentLocation = null;
        this._autoFillController.quit();
        this._autoFillService.setShowMenu(false);
    }
}

export class AutoFillRenderController extends Disposable implements IRenderModule {
    private readonly _selectionControlDisposables = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(ISheetSelectionRenderService) private readonly _selectionRenderService: ISheetSelectionRenderService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this._initSelectionControlFillChanged();
    }

    override dispose(): void {
        this._selectionControlDisposables.dispose();
        super.dispose();
    }

    private _initSelectionControlFillChanged(): void {
        this._updateSelectionControlListeners();
        this.disposeWithMe(this._selectionManagerService.selectionChanged$.subscribe(() => {
            this._updateSelectionControlListeners();
        }));
    }

    private _updateSelectionControlListeners(): void {
        // Selection controls are recreated when the selected ranges change.
        this._selectionControlDisposables.dispose();

        this._selectionRenderService.getSelectionControls().forEach((controlSelection) => {
            this._selectionControlDisposables.add(controlSelection.selectionFilled$.subscribe((filled) => {
                if (
                    filled == null ||
                    filled.startColumn === -1 ||
                    filled.startRow === -1 ||
                    filled.endColumn === -1 ||
                    filled.endRow === -1
                ) {
                    return;
                }

                const sourceRange: IRange = {
                    startColumn: controlSelection.model.startColumn,
                    endColumn: controlSelection.model.endColumn,
                    startRow: controlSelection.model.startRow,
                    endRow: controlSelection.model.endRow,
                };
                const targetRange: IRange = {
                    startColumn: filled.startColumn,
                    endColumn: filled.endColumn,
                    startRow: filled.startRow,
                    endRow: filled.endRow,
                };

                this._executeAutoFill(sourceRange, targetRange);
            }));

            // Double click has the same effect as dragging the fill control, but its target range is detected automatically.
            this._selectionControlDisposables.add(controlSelection.fillControl.onDblclick$.subscribeEvent(() => {
                const sourceRange: IRange = {
                    startColumn: controlSelection.model.startColumn,
                    endColumn: controlSelection.model.endColumn,
                    startRow: controlSelection.model.startRow,
                    endRow: controlSelection.model.endRow,
                };
                this._handleDbClickFill(sourceRange);
            }));

            this._selectionControlDisposables.add(controlSelection.fillControl.onPointerDown$.subscribeEvent(() => {
                const visibleState = this._editorBridgeService.isVisible();
                if (visibleState.visible) {
                    this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                        visible: false,
                        eventType: DeviceInputEventType.PointerDown,
                        unitId: this._context.unitId,
                    });
                }
            }));
        });
    }

    private _executeAutoFill(sourceRange: IRange, targetRange: IRange): void {
        const subUnitId = this._context.unit.getActiveSheet().getSheetId();
        this._commandService.executeCommand(AutoFillCommand.id, {
            sourceRange,
            targetRange,
            unitId: this._context.unitId,
            subUnitId,
        });
    }

    private _handleDbClickFill(source: IRange) {
        const worksheet = this._context.unit.getActiveSheet();
        const selection = detectAutoFillRange(source, worksheet);
        // double click only works when dest range is longer than source range
        if (selection.endRow <= source.endRow) {
            return;
        }

        // Double click uses the same fill command as dragging, with a target range calculated from adjacent data.
        this._executeAutoFill(source, selection);
    }
}

export function detectAutoFillRange(source: IRange, worksheet: Worksheet): IRange {
    const { startRow, endRow, startColumn, endColumn } = source;
    const matrix = worksheet.getCellMatrix();
    const maxRow = worksheet.getMaxRows();
    const maxColumn = worksheet.getMaxColumns();
    let detectEndRow = endRow + 1;
    // left column first, or consider right column.
    if (startColumn > 0 && matrix.getValue(detectEndRow, startColumn - 1)?.v != null) {
        while (matrix.getValue(detectEndRow + 1, startColumn - 1)?.v != null && detectEndRow < maxRow) {
            detectEndRow += 1;
        }
    } else if (endColumn < maxColumn - 1 && matrix.getValue(detectEndRow, endColumn + 1)?.v != null) {
        while (matrix.getValue(detectEndRow + 1, endColumn + 1)?.v != null && detectEndRow < maxRow) {
            detectEndRow += 1;
        }
    } else {
        detectEndRow = endRow;
    }

    // If the fill range contains data, stop filling at the first row of data.
    for (let i = endRow + 1; i <= detectEndRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
            if (matrix.getValue(i, j)?.v != null) {
                detectEndRow = i - 1;
                break;
            }
        }
    }

    return {
        startColumn,
        endColumn,
        startRow,
        endRow: detectEndRow,
    };
}
