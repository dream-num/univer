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

import type { ICommandInfo, IDisposable, IExecutionOptions, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { ICurrentEditCellParam } from '../../services/editor-bridge.service';
import type { ISheetObjectParam } from '../utils/component-tools';
import { DisposableCollection, ICommandService, Inject, IUniverInstanceService, Optional, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    ClearSelectionFormatCommand,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { merge } from 'rxjs';
import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { SetActivateCellEditOperation } from '../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ISheetEmbedRuntimeFocusCoordinator } from '../../services/sheet-embed-integration.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { getSheetObject } from '../utils/component-tools';

// TODO: wzhudev: this should be merged with Edit EditingRenderController.

export class EditorBridgeRenderController extends RxDisposable implements IRenderModule {
    private _d: Nullable<IDisposable>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Optional(ISheetEmbedRuntimeFocusCoordinator) private readonly _embedRuntimeFocusCoordinator?: ISheetEmbedRuntimeFocusCoordinator
    ) {
        super();

        this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (workbook && workbook.getUnitId() === this._context.unitId) {
                if (this._d) {
                    return;
                }
                this._d = this._init();
            } else {
                this._disposeCurrent();
            }
        }));
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._initSelectionChangeListener(d);
        this._commandExecutedListener(d);
        return d;
    }

    private _disposeCurrent(): void {
        this._d?.dispose();
        this._d = null;
    }

    private _initSelectionChangeListener(d: DisposableCollection) {
        const selections = this._selectionManagerService.getWorkbookSelections(this._context.unitId);
        d.add(merge(
            selections.selectionSet$,
            selections.selectionMoveStart$
        ).subscribe((params) => this._updateEditorPosition(params)));
        d.add(selections.selectionMoveEnd$.subscribe((params) => {
            this._updateEditorPosition(params);
        }));
    }

    private _updateEditorPosition(params: Nullable<ISelectionWithStyle[]>) {
        if (this._editorBridgeService.isVisible().visible) return;

        const primary = params?.[params.length - 1]?.primary;
        if (primary) {
            const sheetObject = this._getSheetObject();
            if (!sheetObject) {
                return;
            }
            const { scene, engine } = sheetObject;
            const unitId = this._context.unitId;
            const sheetId = this._context.unit.getActiveSheet()?.getSheetId();
            if (!sheetId) return;
            const mergeInfo = this._sheetSkeletonManagerService.getSkeletonParam(sheetId)?.skeleton.getCellWithCoordByIndex(primary.actualRow, primary.actualColumn);
            const newPrimary: ISelectionCell = mergeInfo
                ? {
                    actualRow: mergeInfo.actualRow,
                    actualColumn: mergeInfo.actualColumn,
                    isMerged: mergeInfo.isMerged,
                    startRow: mergeInfo.mergeInfo.startRow,
                    startColumn: mergeInfo.mergeInfo.startColumn,
                    endRow: mergeInfo.mergeInfo.endRow,
                    endColumn: mergeInfo.mergeInfo.endColumn,
                    isMergedMainCell: mergeInfo.isMergedMainCell,
                }
                : primary;
            if (isSameEditCell(this._editorBridgeService.getEditLocation(), unitId, sheetId, newPrimary)) {
                return;
            }
            this._commandService.executeCommand<ICurrentEditCellParam>(SetActivateCellEditOperation.id, {
                scene,
                engine,
                primary: newPrimary,
                unitId,
                sheetId,
            });
        }
    }

    refreshEditorPosition() {
        const workbookSelections = this._selectionManagerService.getWorkbookSelections(this._context.unitId);
        if (workbookSelections) {
            const selections = workbookSelections.getCurrentSelections();
            if (selections) {
                this._updateEditorPosition([...selections]);
            }
        }
    }

    private _commandExecutedListener(d: DisposableCollection) {
        const refreshCommandSet = new Set([ClearSelectionFormatCommand.id, SetZoomRatioCommand.id]);
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (refreshCommandSet.has(command.id)) {
                if (this._editorBridgeService.isVisible().visible) return;
                this._editorBridgeService.refreshEditCellState();
            }

            // if (command.id === SetRangeValuesMutation.id) {
            //     const params = command.params as ISetRangeValuesMutationParams;
            //     const { cellValue, unitId, subUnitId } = params;
            //     if (!cellValue) return;
            //     const editCell = this._editorBridgeService.getEditLocation();
            //     if (editCell) {
            //         const { unitId: editingUnitId, sheetId: editingSheetId, row, column } = editCell;
            //         if (unitId === editingUnitId && subUnitId === editingSheetId && cellValue && cellValue[row] && Object.prototype.hasOwnProperty.call(cellValue[row], column)) {
            //             this._editorBridgeService.refreshEditCellState();
            //         }
            //     }
            // }
        }));

        d.add(this._commandService.beforeCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            if (options?.fromCollab) return;
            if (command.id === SetWorksheetActiveOperation.id) {
                this._tryHideEditor();
            }
        }));
    }

    private _tryHideEditor() {
        // In the activated state of formula editing,
        // prohibit closing the editor according to the state to facilitate generating selection reference text.
        if (this._editorBridgeService.isForceKeepVisible()) {
            return;
        }
        if (this._isEmbeddedFormulaEditorActive()) {
            return;
        }

        this._hideEditor();
    }

    private _isEmbeddedFormulaEditorActive(): boolean {
        if (this._embedRuntimeFocusCoordinator?.isChildUnitInActiveSession(this._context.unitId) !== true) {
            return false;
        }

        const dataStream = this._editorBridgeService.getEditCellState()?.documentLayoutObject.documentModel?.getSnapshot().body?.dataStream;

        return typeof dataStream === 'string' && dataStream.startsWith('=');
    }

    private _hideEditor() {
        if (this._editorBridgeService.isVisible().visible !== true) return;

        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: this._context.unitId,
        });
    }

    private _getSheetObject(): Nullable<ISheetObjectParam> {
        if (!this._context.unit) {
            return null;
        }

        return getSheetObject(this._context.unit, this._context);
    }
}

function isSameEditCell(
    current: ReturnType<IEditorBridgeService['getEditLocation']>,
    unitId: string,
    sheetId: string,
    primary: ISelectionCell
): boolean {
    return current?.unitId === unitId &&
        current.sheetId === sheetId &&
        current.row === primary.startRow &&
        current.column === primary.startColumn;
}
