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

import type { ICommandInfo, IDisposable, IExecutionOptions, Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { ICurrentEditCellParam, IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { DisposableCollection, ICommandService, Inject, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IRangeSelectorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { merge } from 'rxjs';
import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { SetActivateCellEditOperation } from '../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { getSheetObject } from '../utils/component-tools';

// TODO: wzhudev: this should be merged with Edit EditingRenderController.

export class EditorBridgeRenderController extends RxDisposable implements IRenderModule {
    private _d: Nullable<IDisposable>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        // FIXME: should use WorkbookSelections
        // FIXME: should check if it is the current sheet, if it becomes the current sheet,
        // it should update cell params, otherwise it should do nothing.
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IRangeSelectorService private readonly _rangeSelectorService: IRangeSelectorService
    ) {
        super();

        this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (workbook && workbook.getUnitId() === this._context.unitId) {
                this._d = this._init();
            } else {
                this._disposeCurrent();
            }
        }));

        this._initialRangeSelector();
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._initSelectionChangeListener(d);
        this._initEventListener(d);
        this._commandExecutedListener(d);
        return d;
    }

    private _disposeCurrent(): void {
        this._d?.dispose();
        this._d = null;
    }

    private _initSelectionChangeListener(d: DisposableCollection) {
        d.add(merge(
            this._selectionManagerService.selectionMoveEnd$,
            this._selectionManagerService.selectionMoveStart$
        ).subscribe((params) => this._updateEditorPosition(params)));
    }

    private _updateEditorPosition(params: Nullable<ISelectionWithStyle[]>) {
        if (this._editorBridgeService.isVisible().visible) return;
        if (this._rangeSelectorService.selectorModalVisible) return;

        const primary = params?.[params.length - 1]?.primary;
        if (primary) {
            const sheetObject = this._getSheetObject();
            const { scene, engine } = sheetObject;
            const unitId = this._context.unitId;
            const sheetId = this._context.unit.getActiveSheet()?.getSheetId();
            if (!sheetId) return;

            this._commandService.executeCommand<ICurrentEditCellParam>(SetActivateCellEditOperation.id, {
                scene,
                engine,
                primary,
                unitId,
                sheetId,
            });
        }
    }

    private _initEventListener(d: DisposableCollection) {
        const sheetObject = this._getSheetObject();
        const { spreadsheet, spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } = sheetObject;

        d.add(spreadsheet.onDblclick$.subscribeEvent((evt) => {
            if (evt.button === 2) {
                return;
            }

            this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
                unitId: this._context.unitId,
            } as IEditorBridgeServiceVisibleParam);
        }));

        d.add(spreadsheet.onPointerDown$.subscribeEvent(this._tryHideEditor.bind(this)));
        d.add(spreadsheetColumnHeader.onPointerDown$.subscribeEvent(this._tryHideEditor.bind(this)));
        d.add(spreadsheetLeftTopPlaceholder.onPointerDown$.subscribeEvent(this._tryHideEditor.bind(this)));
        d.add(spreadsheetRowHeader.onPointerDown$.subscribeEvent(this._tryHideEditor.bind(this)));
    }

    private _tryHideEditor() {
        // In the activated state of formula editing,
        // prohibit closing the editor according to the state to facilitate generating selection reference text.
        if (this._editorBridgeService.isForceKeepVisible()) {
            return;
        }

        this._hideEditor();
    }

    private _hideEditor() {
        if (this._editorBridgeService.isVisible().visible !== true) return;

        this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
            unitId: this._context.unitId,
        });
    }

    private _initialRangeSelector() {
        this.disposeWithMe(this._selectionManagerService.selectionMoving$.subscribe(this._rangeSelector.bind(this)));
        this.disposeWithMe(this._selectionManagerService.selectionMoveStart$.subscribe(this._rangeSelector.bind(this)));

        // TODO: this method shouldn't be here. Fix in when refactor the range selector.

        /**
         * pro/issues/388
         * When the range selector is opened,
         * the current selection needs to be synchronized to the range selector.
         */
        this.disposeWithMe(
            this._rangeSelectorService.openSelector$.subscribe(() => {
                const { unitId, sheetId, sheetName } = this._getCurrentUnitIdAndSheetId();
                if (!sheetId || !sheetName) return;

                const selectionWithStyle = this._selectionManagerService.getCurrentSelections();
                const ranges = selectionWithStyle?.map((value) => ({ range: value.range, unitId, sheetId, sheetName }));
                if (ranges) {
                    this._rangeSelectorService.selectionChange(ranges);
                }
            })
        );
    }

    private _rangeSelector(selectionWithStyle: Nullable<ISelectionWithStyle[]>) {
        if (!selectionWithStyle) {
            return;
        }

        const { unitId, sheetId, sheetName } = this._getCurrentUnitIdAndSheetId();
        if (!sheetId || !sheetName) return;

        const ranges = selectionWithStyle.map((value: ISelectionWithStyle) => {
            return { range: value.range, unitId, sheetId, sheetName };
        });

        this._rangeSelectorService.selectionChange(ranges);
    }

    private _getCurrentUnitIdAndSheetId() {
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        return {
            unitId: workbook.getUnitId(),
            sheetId: worksheet?.getSheetId(),
            sheetName: worksheet?.getName(),
        };
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }

    private _commandExecutedListener(d: DisposableCollection) {
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            // When the zoom ratio is changed, the editor needs to be refreshed to get the latest cell size and position.
            if (command.id === SetZoomRatioCommand.id) {
                this._editorBridgeService.refreshEditCellState();
            }

            // if (options?.fromCollab) return;
            // if (command.id !== SetWorksheetActiveOperation.id && COMMAND_LISTENER_SKELETON_CHANGE.includes(command.id)) {
            //     this._hideEditor();
            // }
        }));

        d.add(this._commandService.beforeCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            if (options?.fromCollab) return;
            if (command.id === SetWorksheetActiveOperation.id) {
                this._tryHideEditor();
            }
        }));
    }
}
