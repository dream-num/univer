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

import type { ICommandInfo, IExecutionOptions, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import { ICommandService, IContextService, RxDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { DeviceInputEventType } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { merge, takeUntil } from 'rxjs';
import { IEditorService, ILayoutService, IRangeSelectorService } from '@univerjs/ui';
import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { SetActivateCellEditOperation } from '../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import type { ICurrentEditCellParam } from '../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { getSheetObject } from '../utils/component-tools';

export class EditorBridgeRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IEditorService private readonly _editorService: IEditorService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IRangeSelectorService private readonly _rangeSelectorService: IRangeSelectorService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initSelectionChangeListener();
        this._initEventListener();
        // this._initialChangeEditorListener();
        this._initialRangeSelector();
    }

    private _initSelectionChangeListener() {
        merge(
            this._selectionManagerService.selectionMoveEnd$,
            this._selectionManagerService.selectionMoveStart$
        )
            .pipe(takeUntil(this.dispose$))
            .subscribe((params) => this._handleSelectionChange(params));
    }

    private _updateEditorPosition(cell: ISelectionCell): void {
        const sheetObject = this._getSheetObject();
        const { scene, engine } = sheetObject;
        const unitId = this._context.unitId;
        const sheetId = this._context.unit.getActiveSheet()?.getSheetId();
        if (!sheetId) return;

        this._commandService.executeCommand<ICurrentEditCellParam>(SetActivateCellEditOperation.id, {
            scene,
            engine,
            primary: cell,
            unitId,
            sheetId,
        });
    }

    private _handleSelectionChange(params: Nullable<ISelectionWithStyle[]>) {
        const current = this._selectionManagerService.getCurrent();

        // The editor only responds to regular selections.
        if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) return;
        if (this._editorBridgeService.isVisible().visible) return;

        const primary = params?.[params.length - 1]?.primary;
        if (primary) {
            this._updateEditorPosition(primary);
        }
    }

    private _initEventListener() {
        const sheetObject = this._getSheetObject();
        const { spreadsheet, spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } = sheetObject;

        spreadsheet.onDblclickObserver.add((evt) => {
            // No need to enter edit status when user click the right button.
            if (evt.button === 2) {
                return;
            }

            const current = this._selectionManagerService.getCurrent();
            if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                return;
            }

            // this._editorBridgeService.show(DeviceInputEventType.Dblclick);
            this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
            });
        });

        spreadsheet.pointerDown$.subscribeEvent(this._onCanvasPointerDown.bind(this));
        spreadsheetColumnHeader.pointerDown$.subscribeEvent(this._onCanvasPointerDown.bind(this));
        spreadsheetLeftTopPlaceholder.pointerDown$.subscribeEvent(this._onCanvasPointerDown.bind(this));
        spreadsheetRowHeader.pointerDown$.subscribeEvent(this._onCanvasPointerDown.bind(this));
    }

    // Move to another controller
    // private _initialChangeEditorListener() {
    //     this.disposeWithMe(
    //         this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC).subscribe((documentDataModel) => {
    //             if (documentDataModel == null) {
    //                 return;
    //             }

    //             const editorId = documentDataModel.getUnitId();
    //             if (!this._editorService.isEditor(editorId)) {
    //                 return;
    //             }

    //             if (this._editorService.isSheetEditor(editorId)) {
    //                 this._contextService.setContextValue(FOCUSING_DOC, false);
    //                 this._contextService.setContextValue(FOCUSING_SHEET, true);
    //             } else {
    //                 this._contextService.setContextValue(FOCUSING_SHEET, false);
    //                 this._contextService.setContextValue(FOCUSING_DOC, true);
    //                 this._hideEditor();
    //             }
    //         })
    //     );
    // }

    private _onCanvasPointerDown() {
        // In the activated state of formula editing,
        // prohibit closing the editor according to the state to facilitate generating selection reference text.
        if (this._editorBridgeService.isForceKeepVisible()) {
            return;
        }

        this._hideEditor();
    }

    private _hideEditor() {
        if (this._editorBridgeService.isVisible().visible !== true) {
            return;
        }

        this._selectionManagerService.makeDirty(false);
        this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
            visible: false,
            eventType: DeviceInputEventType.PointerDown,
        });

        /**
         * Hiding the editor triggers a SetRangeValuesMutation which saves the content.
         * This mutation, in turn, triggers a refresh of the skeleton,
         * causing the selection to update. In most scenarios,
         * this update is reasonable. However, when clicking on another cell and exiting the edit,
         * this causes the selection to be reset. Therefore,
         * a makeDirty method has been added here to block the refresh of selection.
         * The reason for using setTimeout is that it needs to wait for the process
         * to finish before allowing the refresh of the selection.
         */
        setTimeout(() => {
            this._selectionManagerService.makeDirty(true);
        }, 0);
    }

    private _initialRangeSelector() {
        this.disposeWithMe(this._selectionManagerService.selectionMoving$.subscribe(this._rangeSelector.bind(this)));
        this.disposeWithMe(this._selectionManagerService.selectionMoveStart$.subscribe(this._rangeSelector.bind(this)));

        /**
         * pro/issues/388
         * When the range selector is opened,
         * the current selection needs to be synchronized to the range selector.
         */
        this.disposeWithMe(
            this._rangeSelectorService.openSelector$.subscribe(() => {
                const selectionWithStyle = this._selectionManagerService.getSelections();
                const { unitId, sheetId, sheetName } = this._getCurrentUnitIdAndSheetId();

                if (!sheetId || !sheetName) return;

                const ranges = selectionWithStyle?.map((value: ISelectionWithStyle) => {
                    return { range: value.range, unitId, sheetId, sheetName };
                });

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

    private _commandExecutedListener() {
        const updateCommandList = COMMAND_LISTENER_SKELETON_CHANGE;

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
                if (options?.fromCollab) {
                    return;
                }

                if (command.id === SetWorksheetActiveOperation.id) {
                    this._onCanvasPointerDown();
                } else if (updateCommandList.includes(command.id)) {
                    this._hideEditor();
                }
            })
        );

        // When the zoom ratio is changed, the editor needs to be refreshed to get the latest cell size and position.
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetZoomRatioCommand.id) {
                    this._editorBridgeService.refreshEditCellState();
                }
            })
        );
    }
}
