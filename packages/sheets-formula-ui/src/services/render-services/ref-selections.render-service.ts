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

import type { IDisposable, IRangeWithCoord, Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWithCoord, ISelectionWithStyle, SheetsSelectionsService, WorkbookSelectionModel } from '@univerjs/sheets';
import { DisposableCollection, IContextService, Inject, Injector, RANGE_TYPE, Rectangle, ThemeService, toDisposable } from '@univerjs/core';
import { ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { convertSelectionDataToRange, IRefSelectionsService, SelectionMoveType } from '@univerjs/sheets';
import { attachSelectionWithCoord, BaseSelectionRenderService, checkInHeaderRanges, genNormalSelectionStyle, getAllSelection, getCoordByOffset, getSheetObject, SelectionControl, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IShortcutService } from '@univerjs/ui';

/**
 * This service extends the existing `SelectionRenderService` to provide the rendering of prompt selections
 * when user is editing ref ranges in formulas.
 *
 * Not that this service works with Uni-mode, which means it should be able to deal with multi render unit
 * and handle selections on them, though each at a time.
 *
 *
 *
 */
export class RefSelectionsRenderService extends BaseSelectionRenderService implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelectionModel;

    private _eventDisposables: Nullable<IDisposable>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) injector: Injector,
        @Inject(ThemeService) themeService: ThemeService,
        @IShortcutService shortcutService: IShortcutService,
        @Inject(SheetSkeletonManagerService) sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IContextService protected readonly _contextService: IContextService,
        @IRefSelectionsService private readonly _refSelectionsService: SheetsSelectionsService
    ) {
        super(
            injector,
            themeService,
            shortcutService,
            sheetSkeletonManagerService,
            _contextService
        );

        this._workbookSelections = this._refSelectionsService.getWorkbookSelections(this._context.unitId);

        this._initSelectionChangeListener();
        this._initSkeletonChangeListener();
        this._initUserActionSyncListener();

        this._setSelectionStyle(getDefaultRefSelectionStyle(this._themeService));
        this._remainLastEnabled = true; // For ref range selections, we should always remain others.
        this._highlightHeader = false;
    }

    getLocation(): [string, string] {
        return this._skeleton.getLocation();
    }

    setRemainLastEnabled(enabled: boolean): void {
        this._remainLastEnabled = enabled;
    }

    /**
     * This is set to true when you need to add a new selection.
     * @param {boolean} enabled
     * @memberof RefSelectionsRenderService
     */
    setSkipLastEnabled(enabled: boolean): void {
        this._skipLastEnabled = enabled;
    }

    clearLastSelection(): void {
        const last = this._selectionControls[this._selectionControls.length - 1];
        if (last) {
            last.dispose();
            this._selectionControls.pop();
        }
    }

    /**
     * Call this method and user will be able to select on the canvas to update selections.
     */
    enableSelectionChanging(): IDisposable {
        this._disableSelectionChanging();
        this._eventDisposables = this._initCanvasEventListeners();
        return toDisposable(() => this._disableSelectionChanging());
    }

    private _disableSelectionChanging(): void {
        this._eventDisposables?.dispose();
        this._eventDisposables = null;
    }

    disableSelectionChanging(): void {
        this._disableSelectionChanging();
    }

    private _initCanvasEventListeners(): IDisposable {
        const sheetObject = this._getSheetObject();
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;
        const { scene } = this._context;

        const listenerDisposables = new DisposableCollection();
        listenerDisposables.add(spreadsheet?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (!this.inRefSelectionMode()) return;

            this._onPointerDown(evt, spreadsheet.zIndex + 1, RANGE_TYPE.NORMAL, this._getActiveViewport(evt));
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        listenerDisposables.add(
            spreadsheetRowHeader?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                if (!this.inRefSelectionMode()) return;
                const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
                const { row } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
                const matchSelectionData = checkInHeaderRanges(this._workbookSelections.getCurrentSelections(), row, RANGE_TYPE.ROW);
                if (matchSelectionData) return;

                this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.ROW, this._getActiveViewport(evt), ScrollTimerType.Y);
                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );

        listenerDisposables.add(spreadsheetColumnHeader?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (!this.inRefSelectionMode()) return;
            const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
            const { column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
            const matchSelectionData = checkInHeaderRanges(this._workbookSelections.getCurrentSelections(), column, RANGE_TYPE.COLUMN);
            if (matchSelectionData) return;

            this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.COLUMN, this._getActiveViewport(evt), ScrollTimerType.X);

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        listenerDisposables.add(spreadsheetLeftTopPlaceholder?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            // remove all other selections
            this._reset();
            if (!this.inRefSelectionMode()) return;
            const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
            const selectionWithStyle = getAllSelection(skeleton);
            this._addSelectionControlByModelData(selectionWithStyle);
            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
            const dispose = scene.onPointerUp$.subscribeEvent(() => {
                dispose.unsubscribe();
                this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            });
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        return listenerDisposables;
    }

    /**
     * Add a selection in spreadsheet, create a new SelectionControl and then update this control by range derives from selection.
     * For ref selection, create selectionShapeExtension to handle user action.
     * @param {ISelectionWithCoord} selectionWithStyle
     */
    protected override _addSelectionControlByModelData(selectionWithStyle: ISelectionWithStyle): SelectionControl {
        const skeleton = this._skeleton;
        const style = selectionWithStyle.style ?? genNormalSelectionStyle(this._themeService);
        const scene = this._scene;

        selectionWithStyle.style = style;
        const control = this.newSelectionControl(scene, skeleton, selectionWithStyle);
        return control;
    }

    private _initSelectionChangeListener(): void {
        // used for refresh selection when focus in formula editor.
        // TODO @lumixraku The response of the formula selection to keyboard events is different from that of a regular selection; I believe they should be consistent.
        // unlike normal selection, there is no need to listen selectionService.selectionMoveEnd$ for keyboard moving event. prompt@highlightFormula would refresh selection.
        this.disposeWithMe(this._refSelectionsService.selectionSet$.subscribe((selectionsWithStyles) => {
            this._reset();
            const skeleton = this._skeleton;
            if (!skeleton) return;
            // The selections' style would be colorful here. PromptController would change the color of selections later.
            this.resetSelectionsByModelData(selectionsWithStyles || []);
        }));
    }

    /**
     * Update selectionModel in this._workbookSelections by user action in spreadsheet area.
     */
    private _initUserActionSyncListener(): void {
        this.disposeWithMe(this.selectionMoveStart$.subscribe((selectionDataWithStyle) => {
            this._updateSelections(selectionDataWithStyle, SelectionMoveType.MOVE_START);
        }));
        this.disposeWithMe(this.selectionMoving$.subscribe((selectionDataWithStyle) => {
            this._updateSelections(selectionDataWithStyle, SelectionMoveType.MOVING);
        }));
        this.disposeWithMe(this.selectionMoveEnd$.subscribe((selectionDataWithStyle) => {
            this._updateSelections(selectionDataWithStyle, SelectionMoveType.MOVE_END);
        }));
    }

    private _updateSelections(selectionDataWithStyleList: ISelectionWithCoord[], type: SelectionMoveType): void {
        const workbook = this._context.unit;
        const sheetId = workbook.getActiveSheet()!.getSheetId();

        if (selectionDataWithStyleList.length === 0) return;
        this._workbookSelections.setSelections(
            sheetId,
            selectionDataWithStyleList.map((selectionDataWithStyle) => convertSelectionDataToRange(selectionDataWithStyle)),
            type
        );
    }

    private _initSkeletonChangeListener(): void {
        // changing sheet is not the only way cause currentSkeleton$ emit, a lot of cmds will emit currentSkeleton$
        // COMMAND_LISTENER_SKELETON_CHANGE ---> currentSkeleton$.next
        // 'sheet.mutation.set-worksheet-row-auto-height' is one of COMMAND_LISTENER_SKELETON_CHANGE
        // dv render controller would cause row auto height, this._autoHeightController.getUndoRedoParamsOfAutoHeight
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (!param) {
                return;
            }

            const { skeleton } = param;
            const { scene } = this._context;
            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

            // changing sheet
            if (this._skeleton && this._skeleton.worksheet.getSheetId() !== skeleton.worksheet.getSheetId()) {
                this._reset();
            }
            this._changeRuntime(skeleton, scene, viewportMain);

            // for col width & row height resize
            const currentSelections = this._workbookSelections.getCurrentSelections();
            this.resetSelectionsByModelData(currentSelections);
        }));
    }

    private _getActiveViewport(evt: IPointerEvent | IMouseEvent): Nullable<Viewport> {
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
    // eslint-disable-next-line complexity, max-lines-per-function
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
        selectionWithStyle.range.rangeType = rangeType;
        // const selectionCellWithCoord = this._getSelectionWithCoordByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        const selectionCellWithCoord = attachSelectionWithCoord(selectionWithStyle, this._skeleton);
        this._startRangeWhenPointerDown = { ...selectionCellWithCoord.rangeWithCoord };

        const cursorCellRangeWithRangeType: IRangeWithCoord = { ...selectionCellWithCoord.rangeWithCoord, rangeType };

        let activeSelectionControl: Nullable<SelectionControl> = this.getActiveSelectionControl();
        const curControls = this.getSelectionControls();
        for (const control of curControls) {
            // If right click on a selection, we should not create a new selection control.
            // Instead, the context menu will popup.
            if (evt.button === 2 && Rectangle.contains(control.model, cursorCellRangeWithRangeType)) {
                activeSelectionControl = control;
                return;
            }
            // Click to an existing selection,
            if (control.model.isEqual(cursorCellRangeWithRangeType)) {
                activeSelectionControl = control;
                break;
            }
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
                cursorCellRangeWithRangeType,
                skeleton,
                rangeType,
                activeSelectionControl! // Get updated in this method
            );
        } else if (remainLastEnable && activeSelectionControl) {
            // Supports the formula ref text selection feature,
            // under the condition of preserving all previous selections, it modifies the position of the latest selection.

            activeSelectionControl.updateRangeBySelectionWithCoord(selectionCellWithCoord);
        } else {
            // In normal situation, pointerdown ---> Create new SelectionControl,
            activeSelectionControl = this.newSelectionControl(scene, skeleton, selectionWithStyle);
        }
        // clear highlight except last one.
        for (let i = 0; i < this.getSelectionControls().length - 1; i++) {
            this.getSelectionControls()[i].clearHighlight();
        }
        //#endregion

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());

        scene.disableObjectsEvent();
        this._clearUpdatingListeners();
        this._addEndingListeners();

        scene.getTransformer()?.clearSelectedObjects();

        // if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
        //     if (rangeType === RANGE_TYPE.ROW) {
        //         offsetX = 0;
        //     } else if (rangeType === RANGE_TYPE.COLUMN) {
        //         offsetY = 0;
        //     }
        //     // TODO @lumixraku. This is so bad! There should be a explicit way to update col&row range. But now depends on the side effect of _movingHandler.
        //     // call _movingHandler to update range, col selection, endRow should be last row of current sheet.
        //     this._movingHandler(offsetX, offsetY, activeSelectionControl, rangeType);
        // }

        this._setupPointerMoveListener(viewportMain, activeSelectionControl!, rangeType, scrollTimerType, offsetX, offsetY);

        this._escapeShortcutDisposable = this._shortcutService.forceEscape();
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

    /**
     * Diff between normal selection, no highlightHeader for ref selections.
     * @param scene
     * @param skeleton
     * @param selectionWithCoord
     * @returns {SelectionControl} selectionControl just created
     */
    override newSelectionControl(scene: Scene, skeleton: SpreadsheetSkeleton, selection: ISelectionWithStyle): SelectionControl {
        const zIndex = this.getSelectionControls().length;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const control = new SelectionControl(scene, zIndex, this._themeService, {
            highlightHeader: this._highlightHeader,
            enableAutoFill: false,
            rowHeaderWidth,
            columnHeaderHeight,
        });
        const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
        control.updateRangeBySelectionWithCoord(selectionWithCoord);
        this._selectionControls.push(control);

        control.setControlExtension({
            skeleton,
            scene,
            themeService: this._themeService,
            injector: this._injector,
            selectionHooks: {
                selectionMoveEnd: (): void => {
                    this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
                },
            },
        });
        return control;
    }
}

/**
 * Return the selections style while adding a range into the formula string (blue dashed).
 * @param themeService
 * @returns The selection's style.
 */
function getDefaultRefSelectionStyle(themeService: ThemeService): ISelectionStyle {
    const style = genNormalSelectionStyle(themeService);
    style.widgets = { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true };
    return style;
}
