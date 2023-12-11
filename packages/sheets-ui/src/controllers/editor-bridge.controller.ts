/**
 * Copyright 2023 DreamNum Inc.
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

import type { ICommandInfo, Nullable } from '@univerjs/core';
import {
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    makeCellToSelection,
    OnLifecycle,
    ThemeService,
} from '@univerjs/core';
import { DeviceInputEventType, getCanvasOffsetByEngine, IRenderManagerService } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { SetActivateCellEditOperation } from '../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../commands/operations/cell-edit.operation';
import { IEditorBridgeService } from '../services/editor-bridge.service';
import { ISelectionRenderService } from '../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { getSheetObject } from './utils/component-tools';

@OnLifecycle(LifecycleStages.Rendered, EditorBridgeController)
export class EditorBridgeController extends Disposable {
    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {}

    private _initialize() {
        this._initialSelectionListener();

        this._initialEventListener();
    }

    private _initialSelectionListener() {
        this._selectionManagerService.selectionMoveEnd$.subscribe((params) => {
            this._selectionListener(params);
        });
        this._selectionManagerService.selectionMoveStart$.subscribe((params) => {
            this._selectionListener(params);
        });
    }

    private _selectionListener(params: Nullable<ISelectionWithStyle[]>) {
        const current = this._selectionManagerService.getCurrent();

        /**
         * The editor only responds to regular selections.
         */
        if (current?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
            return;
        }

        const currentSkeleton = this._sheetSkeletonManagerService.getCurrent();

        const sheetObject = this._getSheetObject();

        if (currentSkeleton == null || sheetObject == null) {
            return;
        }

        const { skeleton, unitId, sheetId } = currentSkeleton;

        const { scene, engine } = sheetObject;

        if (params == null || params.length === 0 || skeleton == null || params[params.length - 1] == null) {
            return;
        }

        const { primary } = params[params.length - 1];

        if (primary == null) {
            return;
        }

        const { startRow, startColumn } = primary;

        const primaryWithCoord = this._selectionRenderService.convertCellRangeToInfo(primary);

        if (primaryWithCoord == null) {
            return;
        }

        const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);

        if (actualRangeWithCoord == null) {
            return;
        }

        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = scene.getScrollXY(this._selectionRenderService.getViewPort());

        startX = skeleton.convertTransformToOffsetX(startX, scaleX, scrollXY);

        startY = skeleton.convertTransformToOffsetY(startY, scaleY, scrollXY);

        endX = skeleton.convertTransformToOffsetX(endX, scaleX, scrollXY);

        endY = skeleton.convertTransformToOffsetY(endY, scaleY, scrollXY);

        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();

        const worksheet = workbook.getActiveSheet();

        const location = {
            workbook,
            worksheet,
            workbookId: workbook.getUnitId(),
            worksheetId: worksheet.getSheetId(),
            row: startRow,
            col: startColumn,
        };
        const cell = this._editorBridgeService.interceptor.fetchThroughInterceptors(
            this._editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT
        )(worksheet.getCell(startRow, startColumn), location);

        let documentLayoutObject = cell && skeleton.getCellDocumentModelWithFormula(cell);

        if (!documentLayoutObject || documentLayoutObject.documentModel == null) {
            documentLayoutObject = skeleton.getBlankCellDocumentModel(cell);
        }

        documentLayoutObject.documentModel?.setZoomRatio(Math.max(scaleX, scaleY));

        if (cell?.isInArrayFormulaRange === true) {
            const body = documentLayoutObject.documentModel?.getBody();
            if (body) {
                body.textRuns = [
                    {
                        st: 0,
                        ed: body.dataStream.length - 2,
                        ts: {
                            cl: {
                                rgb: this._themeService.getCurrentTheme().textColorSecondary,
                            },
                        },
                    },
                ];
            }
        }

        this._commandService.executeCommand(SetActivateCellEditOperation.id, {
            position: {
                startX,
                startY,
                endX,
                endY,
            },
            scaleX,
            scaleY,
            canvasOffset,
            row: startRow,
            column: startColumn,
            unitId,
            sheetId,
            documentLayoutObject,
            editorUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            isInArrayFormulaRange: cell?.isInArrayFormulaRange,
        });
    }

    private _initialEventListener() {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }

        const { spreadsheet, spreadsheetColumnHeader, spreadsheetLeftTopPlaceholder, spreadsheetRowHeader } =
            sheetObject;

        spreadsheet.onDblclickObserver.add(() => {
            // this._editorBridgeService.show(DeviceInputEventType.Dblclick);
            this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.Dblclick,
            });
        });

        spreadsheet.onPointerDownObserver.add(this._keepVisibleHideEditor.bind(this));
        spreadsheetColumnHeader.onPointerDownObserver.add(this._keepVisibleHideEditor.bind(this));
        spreadsheetLeftTopPlaceholder.onPointerDownObserver.add(this._keepVisibleHideEditor.bind(this));
        spreadsheetRowHeader.onPointerDownObserver.add(this._keepVisibleHideEditor.bind(this));
    }

    /**
     * In the activated state of formula editing,
     * prohibit closing the editor according to the state to facilitate generating selection reference text.
     */
    private _keepVisibleHideEditor() {
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

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {
        const updateCommandList = COMMAND_LISTENER_SKELETON_CHANGE;

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    this._keepVisibleHideEditor();
                } else if (updateCommandList.includes(command.id)) {
                    this._hideEditor();
                }
            })
        );
    }
}
