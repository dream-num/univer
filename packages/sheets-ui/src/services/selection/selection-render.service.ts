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

import type { IDisposable, IRangeWithCoord, Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, Viewport } from '@univerjs/engine-render';
import type { ISelectionWithCoord, ISelectionWithStyle, ISetSelectionsOperationParams, WorkbookSelectionDataModel } from '@univerjs/sheets';
import type { ISheetObjectParam } from '../../controllers/utils/component-tools';
import type { SelectionControl } from './selection-control';
import { ICommandService, IContextService, ILogService, Inject, Injector, RANGE_TYPE, ThemeService, toDisposable } from '@univerjs/core';
import { ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { convertSelectionDataToRange, DISABLE_NORMAL_SELECTIONS, SelectionMoveType, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { distinctUntilChanged, merge, startWith } from 'rxjs';
import { getCoordByOffset, getSheetObject } from '../../controllers/utils/component-tools';
import { isThisColSelected, isThisRowSelected } from '../../controllers/utils/selections-tools';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

import { BaseSelectionRenderService, getAllSelection, getTopLeftSelectionOfCurrSheet } from './base-selection-render.service';
import { attachSelectionWithCoord } from './util';

/**
 * This services controls rendering of normal selections in a render unit.
 * The normal selections would also be used by Auto Fill and Copy features.
 */
export class SheetSelectionRenderService extends BaseSelectionRenderService implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelectionDataModel;

    private _renderDisposable: Nullable<IDisposable> = null;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) injector: Injector,
        @Inject(ThemeService) themeService: ThemeService,
        @IShortcutService shortcutService: IShortcutService,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonManagerService) sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super(
            injector,
            themeService,
            shortcutService,
            sheetSkeletonManagerService
        );

        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);
        this._init();
    }

    private _init(): void {
        const sheetObject = this._getSheetObject();

        this._initEventListeners(sheetObject);
        this._initSelectionChangeListener();
        this._initThemeChangeListener();
        this._initSkeletonChangeListener();
        this._initUserActionSyncListener();
    }

    private _initEventListeners(sheetObject: ISheetObjectParam): void {
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;
        const { scene } = this._context;

        this.disposeWithMe(spreadsheet?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (this._normalSelectionDisabled()) return;
            this._onPointerDown(evt, spreadsheet.zIndex + 1, RANGE_TYPE.NORMAL, this._getActiveViewport(evt));
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        this.disposeWithMe(
            spreadsheetRowHeader?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                if (this._normalSelectionDisabled()) return;

                const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
                const { row } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
                const matchSelectionData = isThisRowSelected(this._workbookSelections.getCurrentSelections(), row);
                if (matchSelectionData) return;

                this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.ROW, this._getActiveViewport(evt), ScrollTimerType.Y);
                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );

        this.disposeWithMe(spreadsheetColumnHeader?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (this._normalSelectionDisabled()) return;

            const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
            const { column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
            const matchSelectionData = isThisColSelected(this._workbookSelections.getCurrentSelections(), column);
            if (matchSelectionData) return;

            this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.COLUMN, this._getActiveViewport(evt), ScrollTimerType.X);

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        this.disposeWithMe(spreadsheetLeftTopPlaceholder?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (this._normalSelectionDisabled()) return;

            this._reset(); // remove all other selections

            const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
            const selectionWithStyle = getAllSelection(skeleton);
            this._addSelectionControlByModelData(selectionWithStyle);
            this.refreshSelectionMoveEnd();

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));
    }

    private _initThemeChangeListener(): void {
        this.disposeWithMe(this._themeService.currentTheme$.subscribe(() => {
            this._resetSelectionStyle();
            const selections = this._workbookSelections.getCurrentSelections();
            if (!selections) return;
            this.resetSelectionsByModelData(selections);
        }));
    }

    private _normalSelectionDisabled(): boolean {
        return this._contextService.getContextValue(DISABLE_NORMAL_SELECTIONS);
    }

    private _initSelectionChangeListener(): void {
        // When selection completes, we need to update the selections' rendering and clear event handlers.
        this.disposeWithMe(merge(this._workbookSelections.selectionMoveEnd$, this._workbookSelections.selectionSet$).subscribe((selectionWithStyleList) => {
            this._reset();
            for (const selectionWithStyle of selectionWithStyleList) {
                this._addSelectionControlByModelData(selectionWithStyle);
            }
        }));
    }

    private _initUserActionSyncListener(): void {
        this.disposeWithMe(this.selectionMoveStart$.subscribe((params) => this._updateSelections(params, SelectionMoveType.MOVE_START)));
        this.disposeWithMe(this.selectionMoving$.subscribe((params) => this._updateSelections(params, SelectionMoveType.MOVING)));

        this.disposeWithMe(this._contextService.subscribeContextValue$(DISABLE_NORMAL_SELECTIONS)
            .pipe(startWith(false), distinctUntilChanged())
            .subscribe((disabled) => {
                if (disabled) {
                    this._renderDisposable?.dispose();
                    this._renderDisposable = null;
                    this._reset();
                } else {
                    this._renderDisposable = toDisposable(
                        this.selectionMoveEnd$.subscribe((params) => this._updateSelections(params, SelectionMoveType.MOVE_END))
                    );
                }
            }));
    }

    /**
     * Update selectionData to selectionDataModel (WorkBookSelections) by SetSelectionsOperation.
     * @param selectionDataWithStyleList
     * @param type
     */
    private _updateSelections(selectionDataWithStyleList: ISelectionWithCoord[], type: SelectionMoveType) {
        const workbook = this._context.unit;
        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet().getSheetId();

        if (selectionDataWithStyleList.length === 0) {
            return;
        }

        this._commandService.executeCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: sheetId,
            type,
            selections: selectionDataWithStyleList.map((selectionDataWithStyle) =>
                convertSelectionDataToRange(selectionDataWithStyle)
            ),
        });
    }

    private _initSkeletonChangeListener(): void {
        // changing sheet is not the only way cause currentSkeleton$ emit, a lot of cmds will emit currentSkeleton$
        // COMMAND_LISTENER_SKELETON_CHANGE ---> currentSkeleton$.next
        // 'sheet.mutation.set-worksheet-row-auto-height' is one of COMMAND_LISTENER_SKELETON_CHANGE
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                this._logService.error('[SelectionRenderService]: should not receive null!');
                return;
            }

            const unitId = this._context.unitId;
            const { sheetId, skeleton } = param;
            const { scene } = this._context;
            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            const prevSheetId = this._skeleton?.worksheet?.getSheetId();
            this._changeRuntime(skeleton, scene, viewportMain);

            if (this._normalSelectionDisabled()) return;

            if (prevSheetId !== skeleton.worksheet.getSheetId()) {
                // If there is no initial selection, add one by default in the top left corner.
                const selections = this._workbookSelections.getCurrentSelections();
                // WARNING: SetSelectionsOperation with type=null would clear all exists selections
                // SetSelectionsOperation ---> selectionManager@setSelections ---> moveEnd$ ---> selectionRenderService@_reset
                // TODO @lumixraku why use such weird a way to clear existing selection? subscribe to currentSkeleton$ is much better?
                this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                    unitId,
                    subUnitId: sheetId,
                    selections: selections.length !== 0 ? selections : [getTopLeftSelectionOfCurrSheet(skeleton)],
                } as ISetSelectionsOperationParams);
            }

            const currentSelections = this._workbookSelections.getCurrentSelections();
            // for col width & row height resize
            if (currentSelections != null) {
                this.resetSelectionsByModelData(currentSelections);
            }
        }));
    }

    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const sheetObject = this._getSheetObject();
        return sheetObject?.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }

    /**
     * Handle pointer down event, bind pointermove & pointerup handler.
     * then trigger selectionMoveStart$.
     *
     * @param evt
     * @param _zIndex
     * @param rangeType
     * @param viewport
     * @param scrollTimerType
     */
    // eslint-disable-next-line max-lines-per-function, complexity
    protected _onPointerDown(
        evt: IPointerEvent | IMouseEvent,
        _zIndex = 0,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport: Nullable<Viewport>,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL
    ): void {
        this._rangeType = rangeType;

        const skeleton = this._skeleton;
        const scene = this._scene;
        if (!scene || !skeleton) {
            return;
        }

        if (viewport) {
            this._activeViewport = viewport;
        }

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;
        const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: offsetX, y: offsetY } = relativeCoords;
        this._startViewportPosX = offsetX;
        this._startViewportPosY = offsetY;

        const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords);
        const { scaleX, scaleY } = scene.getAncestorScale();

        const selectCell = this._skeleton.getCellByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        if (!selectCell) return;
        switch (rangeType) {
            case RANGE_TYPE.NORMAL:
                break;
            case RANGE_TYPE.ROW:
                selectCell.startColumn = 0;
                selectCell.endColumn = this._skeleton.getColumnCount() - 1;
                break;
            case RANGE_TYPE.COLUMN:
                selectCell.startRow = 0;
                selectCell.endRow = this._skeleton.getRowCount() - 1;
                break;
            case RANGE_TYPE.ALL:
                selectCell.startRow = 0;
                selectCell.startColumn = 0;
                selectCell.endRow = this._skeleton.getRowCount() - 1;
                selectCell.endColumn = this._skeleton.getColumnCount() - 1;
        }
        const selectionWithStyle: ISelectionWithStyle = { range: selectCell, primary: selectCell, style: null };
        const selectionCellWithCoord = attachSelectionWithCoord(selectionWithStyle, this._skeleton);
        selectionCellWithCoord.rangeWithCoord.rangeType = rangeType;
        this._startRangeWhenPointerDown = { ...selectionCellWithCoord.rangeWithCoord, rangeType };
        // const selectionCellWithCoord: Nullable<ISelectionWithCoord> = this._getSelectionWithCoordByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        // if (!selectionCellWithCoord) return;
        // const { rangeWithCoord: cursorCellRange, primaryWithCoord: _primaryCursorCellRange } = selectionCellWithCoord;

        let activeSelectionControl: Nullable<SelectionControl> = this.getActiveSelectionControl();
        const cursorRangeWidthCoord: IRangeWithCoord = { ...selectionCellWithCoord.rangeWithCoord, rangeType };
        const curControls = this.getSelectionControls();
        for (const control of curControls) {
            // right click
            if (evt.button === 2 && control.model.isInclude(cursorRangeWidthCoord)) {
                activeSelectionControl = control;
                return;
            }
            // Click to an existing selection, then what?
            // if (control.model.isEqual(cursorCellRangeWithRangeType)) {
            //     activeSelectionControl = control;
            //     break;
            // }
        }

        this._checkClearPreviousControls(evt);

        const currentCell = activeSelectionControl?.model.currentCell;
        const expandByShiftKey = evt.shiftKey && currentCell;
        const remainLastEnable = this._remainLastEnabled &&
            !evt.ctrlKey &&
            !evt.shiftKey &&
            !this._skipLastEnabled &&
            !this._singleSelectionEnabled;

        //#region update selection control
        if (expandByShiftKey && currentCell) {
            // Perform pointer down selection.
            this._makeSelectionByTwoCells(
                currentCell,
                cursorRangeWidthCoord,
                skeleton,
                rangeType,
                activeSelectionControl! // Get updated in this method
            );
        } else if (remainLastEnable && activeSelectionControl) {
            // Supports the formula ref text selection feature,
            // under the condition of preserving all previous selections, it modifies the position of the latest selection.

            activeSelectionControl.updateRangeBySelectionWithCoord(selectionCellWithCoord);// (cursorRangeWidthCoord, primaryCursorCellRange);
        } else {
            // In normal situation, pointerdown ---> Create new SelectionControl,
            activeSelectionControl = this.newSelectionControl(scene, skeleton, selectionCellWithCoord);

            // activeSelectionControl.updateRangeBySelectionWithCoord(selectionCellWithCoord); //(cursorRangeWidthCoord, primaryCursorCellRange);
        }
        // clear highlight except last one.
        for (let i = 0; i < this.getSelectionControls().length - 1; i++) {
            this.getSelectionControls()[i].clearHighlight();
        }
        //#endregion

        scene.disableObjectsEvent();
        this._clearUpdatingListeners();
        this._addEndingListeners();
        scene.getTransformer()?.clearSelectedObjects();
        this._setupPointerMoveListener(viewportMain, activeSelectionControl!, rangeType, scrollTimerType, offsetX, offsetY);
        this._escapeShortcutDisposable = this._shortcutService.forceEscape();

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            this._clearUpdatingListeners();

            // selection control would be disposed in _selectionMoveEnd$.
            // SelectionRenderService@selectionMoveEnd$ exec SetSelectionsOperation
            // SheetsSelectionsService@setSelections
            // SelectionRenderService._workbookSelections.selectionMoveEnd$ call _reset() to clear selectionControl.
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            this._escapeShortcutDisposable?.dispose();
            this._escapeShortcutDisposable = null;
        });
    }
}
