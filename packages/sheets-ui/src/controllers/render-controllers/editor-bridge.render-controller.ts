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

import type { ICommandInfo, IDisposable, IExecutionOptions, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import type { IEditorInputConfig } from '@univerjs/docs-ui';
import type { IRender, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { ICurrentEditCellParam, IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { DisposableCollection, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, FOCUSING_FX_BAR_EDITOR, FOCUSING_SHEET, ICommandService, IContextService, Inject, IUniverInstanceService, RxDisposable, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DocSelectionRenderService, IEditorService, IRangeSelectorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import {
    ClearSelectionFormatCommand,
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { filter, merge } from 'rxjs';
import { SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { SetActivateCellEditOperation } from '../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
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
        // FIXME: should use WorkbookSelections
        // FIXME: should check if it is the current sheet, if it becomes the current sheet,
        // it should update cell params, otherwise it should do nothing.
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @IRangeSelectorService private readonly _rangeSelectorService: IRangeSelectorService,
        @IContextService private readonly _contextService: IContextService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
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
        this._initialKeyboardListener(d);
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
            const mergeInfo = this._sheetSkeletonManagerService.getWorksheetSkeleton(sheetId)?.skeleton.getCellWithCoordByIndex(primary.actualRow, primary.actualColumn);
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
            this._commandService.executeCommand<ICurrentEditCellParam>(SetActivateCellEditOperation.id, {
                scene,
                engine,
                primary: newPrimary,
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

        d.add(spreadsheet.onPointerDown$.subscribeEvent({
            next: this._tryHideEditor.bind(this),
            priority: -1,
        }));
        d.add(spreadsheetColumnHeader.onPointerDown$.subscribeEvent({
            next: this._tryHideEditor.bind(this),
            priority: -1,
        }));
        d.add(spreadsheetLeftTopPlaceholder.onPointerDown$.subscribeEvent({
            next: this._tryHideEditor.bind(this),
            priority: -1,
        }));
        d.add(spreadsheetRowHeader.onPointerDown$.subscribeEvent({
            next: this._tryHideEditor.bind(this),
            priority: -1,
        }));
    }

    /**
     * Should activate the editor when the user inputs text.
     * @param d DisposableCollection
     */
    private _initialKeyboardListener(d: DisposableCollection) {
        let disposable: Nullable<IDisposable> = null;
        const addEvent = (render: IRender) => {
            const docSelectionRenderService = render.with(DocSelectionRenderService);
            if (docSelectionRenderService) {
                disposable = toDisposable(docSelectionRenderService.onInputBefore$.subscribe((config) => {
                    if (!this._isCurrentSheetFocused()) {
                        return;
                    }

                    const isFocusFormulaEditor = this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);
                    const isFocusSheets = this._contextService.getContextValue(FOCUSING_SHEET);
                    const unitId = render.unitId;
                    if (this._editorBridgeService.isVisible().visible) return;

                    if (unitId && isFocusSheets && !isFocusFormulaEditor && this._editorService.isSheetEditor(unitId)) {
                        this._showEditorByKeyboard(config);
                    }
                }));

                d.add(disposable);
            }
        };

        const render = this._renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        if (render) {
            addEvent(render);
        } else {
            this.disposeWithMe(this._renderManagerService.created$.pipe(filter((render) => render.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY)).subscribe((render) => {
                disposable?.dispose();
                addEvent(render);
            }));
        }
    }

    private _commandExecutedListener(d: DisposableCollection) {
        const refreshCommandSet = new Set([ClearSelectionFormatCommand.id, SetRangeValuesMutation.id, SetZoomRatioCommand.id]);
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (refreshCommandSet.has(command.id)) {
                if (this._editorBridgeService.isVisible().visible) return;
                this._editorBridgeService.refreshEditCellState();
            }
        }));

        d.add(this._commandService.beforeCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
            if (options?.fromCollab) return;
            if (command.id === SetWorksheetActiveOperation.id) {
                this._tryHideEditor();
            }
        }));
    }

    private _showEditorByKeyboard(config: Nullable<IEditorInputConfig>) {
        if (config == null) {
            return;
        }

        const event = config.event as KeyboardEvent;

        this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: event.which,
            unitId: this._context.unitId,
        });
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

        this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
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

    private _isCurrentSheetFocused(): boolean {
        return this._instanceSrv.getFocusedUnit()?.getUnitId() === this._context.unitId;
    }
}
