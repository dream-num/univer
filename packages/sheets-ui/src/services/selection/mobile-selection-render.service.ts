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

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import type {
    EventState,
    ICellWithCoord,
    IDisposable,
    IRange,
    IRangeWithCoord,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import type { ISelectionWithCoord, ISelectionWithStyle, ISetSelectionsOperationParams, WorkbookSelectionModel } from '@univerjs/sheets';
import type { ISheetObjectParam } from '../../controllers/utils/component-tools';
import {
    ICommandService,
    IContextService,
    ILogService,
    Inject,
    Injector,
    RANGE_TYPE,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { convertSelectionDataToRange, REF_SELECTIONS_ENABLED, SelectionMoveType, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { distinctUntilChanged, startWith } from 'rxjs';
import { getCoordByOffset, getSheetObject } from '../../controllers/utils/component-tools';
import { isThisColSelected, isThisRowSelected } from '../../controllers/utils/selections-tools';
import { SheetScrollManagerService } from '../scroll-manager.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { BaseSelectionRenderService, getTopLeftSelectionOfCurrSheet, selectionDataForSelectAll } from './base-selection-render.service';
import { MobileSelectionControl } from './mobile-selection-shape';
import { attachSelectionWithCoord } from './util';

enum ExpandingControl {
    BOTTOM_RIGHT = 'bottom-right',
    TOP_LEFT = 'top-left',
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
}
export class MobileSheetsSelectionRenderService extends BaseSelectionRenderService implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelectionModel;
    private _renderDisposable: Nullable<IDisposable> = null;

    _expandingSelection: boolean = false;

    protected override _selectionControls: MobileSelectionControl[] = []; // sheetID:Controls

    expandingControlMode: ExpandingControl = ExpandingControl.BOTTOM_RIGHT;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) injector: Injector,
        @Inject(ThemeService) themeService: ThemeService,
        @IShortcutService shortcutService: IShortcutService,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonManagerService) sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService protected readonly _contextService: IContextService,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService

    ) {
        super(
            injector,
            themeService,
            shortcutService,
            sheetSkeletonManagerService,
            _contextService
        );
        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);
        this._init();
    }

    private _init() {
        const sheetObject = this._getSheetObject();

        this._initEventListeners(sheetObject);
        this._initSelectionChangeListener();
        // this._initThemeChangeListener();
        this._initSkeletonChangeListener();
        this._initUserActionSyncListener();
        this._updateControlPointWhenScrolling();
    }

    private _initSkeletonChangeListener() {
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                this._logService.error('[SelectionRenderService]: should not receive null!');
                return;
            }

            const unitId = this._context.unitId;
            const { sheetId, skeleton } = param;
            const { scene } = this._context;
            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            this._changeRuntime(skeleton, scene, viewportMain);

            // If there is no initial selection, add one by default in the top left corner.
            const firstSelection = this._workbookSelections.getCurrentLastSelection();
            if (!firstSelection) {
                this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                    unitId,
                    subUnitId: sheetId,
                    selections: [getTopLeftSelectionOfCurrSheet(skeleton)],
                } as ISetSelectionsOperationParams);
            }
        }));
    }

    private _initSelectionChangeListener() {
        // When selection completes, we need to update the selections' rendering and clear event handlers.
        // only ref selection need this. now mobile only has normal selection.
        // this.disposeWithMe(this._workbookSelections.selectionMoveEnd$.subscribe((ISelectionWithStyleList) => {
        //     this._reset();
        //     for (const selectionWithStyle of ISelectionWithStyleList) {
        //         this._addSelectionControlByModelData(selectionWithStyle);
        //     }
        // }));
    }

    private _initEventListeners(sheetObject: ISheetObjectParam): void {
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;
        const { scene } = this._context;
        this._initSpreadsheetEvent(sheetObject);

        this.disposeWithMe(
            spreadsheetRowHeader?.onPointerUp$.subscribeEvent((evt: IPointerEvent | IMouseEvent, _state: EventState) => {
                if (this._normalSelectionDisabled()) return;

                const skeleton = this._sheetSkeletonManagerService.getCurrentParam()!.skeleton;
                const { row } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
                const matchSelectionData = isThisRowSelected(this._workbookSelections.getCurrentSelections(), row);
                if (matchSelectionData) return;

                this.createNewSelection(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.ROW, this._getActiveViewport(evt));
                this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            })
        );

        this.disposeWithMe(
            spreadsheetColumnHeader?.onPointerUp$.subscribeEvent((evt: IPointerEvent | IMouseEvent, _state: EventState) => {
                if (this._normalSelectionDisabled()) return;

                const skeleton = this._sheetSkeletonManagerService.getCurrentParam()!.skeleton;
                const { column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
                const matchSelectionData = isThisColSelected(this._workbookSelections.getCurrentSelections(), column);
                if (matchSelectionData) return;
                this.createNewSelection(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.COLUMN, this._getActiveViewport(evt));
                this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            })
        );

        // in mobile version, create a selection when pointerup.
        // do not use onPointerDown$, pointerDown would close popup
        // see packages/ui/src/views/components/context-menu/ContextMenu.tsx
        this.disposeWithMe(spreadsheetLeftTopPlaceholder?.onPointerUp$.subscribeEvent((_evt: IPointerEvent | IMouseEvent, state: EventState) => {
            if (this._normalSelectionDisabled()) return;

            this._reset(); // remove all other selections

            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()!.skeleton;
            const selectionWithStyle = selectionDataForSelectAll(skeleton);
            this._addSelectionControlByModelData(selectionWithStyle);
            // pointerup --> create selection
            this.refreshSelectionMoveStart();

            state.stopPropagation();
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
        }));
    }

    private _initSpreadsheetEvent(sheetObject: ISheetObjectParam): void {
        const { spreadsheet } = sheetObject;
        let longPressTimer: ReturnType<typeof setTimeout>;
        const longPressDuration = 500; // Longpress duration in milliseconds
        const pointerDownPos = { x: 0, y: 0 };

        const clearLongPressTimer = () => {
            // Clear the timer if pointer is moved or released
            clearTimeout(longPressTimer);
        };

        const createNewSelection = (evt: IPointerEvent | IMouseEvent, showContextMenu: boolean) => {
            // TODO @lumixraku
            this.createNewSelection(
                evt,
                spreadsheet.zIndex + 1,
                RANGE_TYPE.NORMAL,
                this._getActiveViewport(evt)
            );

            // show contextmenu when longpress and change selection area
            // do not show contextmenu when click a cell
            if (showContextMenu) {
                this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            }
        };
        spreadsheet?.onPointerMove$.subscribeEvent((evt: IPointerEvent | IMouseEvent, _state) => {
            const edge = 10;
            if (Math.abs(evt.offsetX - pointerDownPos.x) > edge ||
            Math.abs(evt.offsetY - pointerDownPos.y) > edge) {
                clearLongPressTimer();
            }
        });
        const spreadsheetPointerDownSub = spreadsheet?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            pointerDownPos.x = evt.offsetX;
            pointerDownPos.y = evt.offsetY;
            longPressTimer = setTimeout(() => {
                createNewSelection(evt, true);
            }, longPressDuration);

            state.stopPropagation();
        });
        const spreadsheetPointerUpSub = spreadsheet?.onPointerUp$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            if (this._normalSelectionDisabled()) return;

            clearTimeout(longPressTimer);
            const edge = 10;
            if (Math.abs(evt.offsetX - pointerDownPos.x) > edge ||
            Math.abs(evt.offsetY - pointerDownPos.y) > edge) {
                return;
            }
            createNewSelection(evt, false);
            state.stopPropagation();
        });

        this.disposeWithMe(toDisposable(spreadsheetPointerDownSub));
        this.disposeWithMe(toDisposable(spreadsheetPointerUpSub));
    }

    private _initUserActionSyncListener() {
        this.disposeWithMe(this.selectionMoveStart$.subscribe((params) => this._updateSelections(params, SelectionMoveType.MOVE_START)));
        this.disposeWithMe(this.selectionMoving$.subscribe((params) => this._updateSelections(params, SelectionMoveType.MOVING)));

        this.disposeWithMe(this._contextService.subscribeContextValue$(REF_SELECTIONS_ENABLED)
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

    /**
     * invoked when pointerup or long press on spreadsheet, or pointerdown on row&col
     * then move curr selection to cell at cursor
     * Main purpose to create a new selection, or update curr selection to a new range.
     * @param evt
     * @param _zIndex
     * @param rangeType
     * @param viewport
     */
    createNewSelection(
        evt: IPointerEvent | IMouseEvent,
        _zIndex = 0,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport?: Viewport
    ) {
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
        const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: offsetX, y: offsetY } = relativeCoords;
        this._startViewportPosX = offsetX;
        this._startViewportPosY = offsetY;
        const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords);
        const { scaleX, scaleY } = scene.getAncestorScale();
        // const selectionCellWithCoord: Nullable<ISelectionWithCoord> = this._getSelectionWithCoordByOffset(viewportPosX, viewportPosY, scaleX, scaleY, scrollXY);
        // if (!selectionCellWithCoord) return;
        // const { rangeWithCoord: cursorCellRange, primaryWithCoord: primaryCursorCellRange } = cursorCellRangeInfo;
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
        const selectionCellWithCoord = attachSelectionWithCoord(selectionWithStyle, this._skeleton);
        this._startRangeWhenPointerDown = { ...selectionCellWithCoord.rangeWithCoord };

        let activeSelectionControl = this.getActiveSelectionControl<MobileSelectionControl>();

        const cursorRangeWidthCoord: IRangeWithCoord = { ...selectionCellWithCoord.rangeWithCoord };
        for (const control of this.getSelectionControls()) {
            // Click to an existing selection
            if (control.model.isEqual(cursorRangeWidthCoord)) {
                activeSelectionControl = control;
                break;
            }
        }

        // TODO merge to _checkClearPreviousControls
        if (activeSelectionControl?.model.rangeType !== rangeType) {
            this._clearAllSelectionControls();
            activeSelectionControl = this.newSelectionControl(scene, skeleton, selectionWithStyle);
        } else {
            activeSelectionControl.updateRangeBySelectionWithCoord(selectionCellWithCoord);
        }

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
        this._clearUpdatingListeners();
        // this._addEndingListeners();
        this._expandingSelection = false;
    }

    /**
     * Not same as PC version,
     * new selection control for mobile do one more thing: bind event for two control points.
     * @param scene
     * @param rangeType
     */
    override newSelectionControl(scene: Scene, skeleton: SpreadsheetSkeleton, selection: ISelectionWithStyle): MobileSelectionControl {
        const selectionControls = this.getSelectionControls();
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const rangeType = selection.range.rangeType;
        const control = new MobileSelectionControl(scene, selectionControls.length, this._themeService, {
            highlightHeader: this._highlightHeader,
            rowHeaderWidth,
            columnHeaderHeight,
            rangeType,
        });
        const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
        control.updateRangeBySelectionWithCoord(selectionWithCoord);
        this._selectionControls.push(control);

        const { expandingModeForTopLeft, expandingModeForBottomRight } = (() => {
            switch (rangeType) {
                case RANGE_TYPE.NORMAL:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP_LEFT,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM_RIGHT,
                    };
                case RANGE_TYPE.ROW:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM,
                    };
                case RANGE_TYPE.COLUMN:
                    return {
                        expandingModeForTopLeft: ExpandingControl.LEFT,
                        expandingModeForBottomRight: ExpandingControl.RIGHT,
                    };
                case RANGE_TYPE.ALL:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP_LEFT,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM_RIGHT,
                    };
                default:
                    return {
                        expandingModeForTopLeft: ExpandingControl.TOP_LEFT,
                        expandingModeForBottomRight: ExpandingControl.BOTTOM_RIGHT,
                    };
            }
        })();

        control.fillControlTopLeft!.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this._expandingSelection = true;
            this.expandingControlMode = expandingModeForTopLeft;
            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
            this._fillControlPointerDownHandler(
                evt,
                rangeType,
                this._activeViewport!
            );
        });
        control.fillControlBottomRight!.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this._expandingSelection = true;
            this.expandingControlMode = expandingModeForBottomRight;
            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
            this._fillControlPointerDownHandler(
                evt,
                rangeType,
                this._activeViewport!
            );
        });
        if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.COLUMN) {
            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            if (!viewportMain) return control;
        }

        return control;
    }

    // same as PC
    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const sheetObject = this._getSheetObject();
        return sheetObject?.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
    }

    // same as PC
    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }

    // same as PC
    private _normalSelectionDisabled(): boolean {
        return this._contextService.getContextValue(REF_SELECTIONS_ENABLED);
    }

    override getSelectionControls() {
        return this._selectionControls;
    }

    private _fillControlPointerDownHandler(
        evt: IPointerEvent | IMouseEvent,
        rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL,
        viewport?: Viewport,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL
    ) {
        const skeleton = this._skeleton;
        const scene = this._scene;
        if (!scene || !skeleton) {
            return;
        }

        if (viewport) {
            this._activeViewport = viewport;
        }

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

        const activeSelectionControl = this.getActiveSelectionControl<MobileSelectionControl>();

        if (!activeSelectionControl) return;

        this._changeCurrCellWhenControlPointerDown();

        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());

        this._clearUpdatingListeners();
        this._addEndingListeners();

        this._scrollTimer = ScrollTimer.create(this._scene, scrollTimerType);
        this._scrollTimer.startScroll(viewportMain?.left ?? 0, viewportMain?.top ?? 0, viewportMain);

        scene.getTransformer()?.clearSelectedObjects();

        // #region pointermove
        const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evt.offsetX, evt.offsetY]));
        this._setupPointerMoveListener(viewportMain, activeSelectionControl!, rangeType, scrollTimerType, relativeCoords.x, relativeCoords.y);
        // #endregion

        // #region pointerup
        // when selection mouse down, disable the short cut service
        const disposableShortcut = this._shortcutService.forceEscape();
        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent((_evt: IPointerEvent | IMouseEvent) => {
            this.endSelection();
            this._expandingSelection = false;
            this.expandingControlMode = ExpandingControl.BOTTOM_RIGHT;
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());

            // when selection mouse up, enable the short cut service
            disposableShortcut.dispose();
        });
        // #endregion
    }

    private _changeCurrCellWhenControlPointerDown(): ICellWithCoord {
        const activeSelectionControl = this.getActiveSelectionControl<MobileSelectionControl>()!;
        const skeleton = this._skeleton;

        let currCellRange: ICellWithCoord;

        const { startRow, startColumn, endRow, endColumn } = activeSelectionControl.model;
        switch (this.expandingControlMode) {
            case ExpandingControl.TOP_LEFT:
                currCellRange = skeleton.getCellWithCoordByIndex(endRow, endColumn);
                break;
            case ExpandingControl.BOTTOM_RIGHT:
                currCellRange =
                        skeleton.getCellWithCoordByIndex(startRow, startColumn);
                break;
            case ExpandingControl.LEFT:
                currCellRange =
                        skeleton.getCellWithCoordByIndex(startRow, endColumn);
                currCellRange.isMerged = false;
                currCellRange.isMergedMainCell = false;
                break;
            case ExpandingControl.RIGHT:
                currCellRange =
                        skeleton.getCellWithCoordByIndex(startRow, startColumn);
                currCellRange.isMerged = false;
                currCellRange.isMergedMainCell = false;
                break;
            case ExpandingControl.TOP:
                currCellRange =
                        skeleton.getCellWithCoordByIndex(endRow, startColumn);
                currCellRange.isMerged = false;
                currCellRange.isMergedMainCell = false;
                break;
            case ExpandingControl.BOTTOM:
                currCellRange =
                        skeleton.getCellWithCoordByIndex(startRow, startColumn);
                currCellRange.isMerged = false;
                currCellRange.isMergedMainCell = false;
                break;
            default:
                currCellRange =
                        skeleton.getCellWithCoordByIndex(startRow, startColumn);
        }
        activeSelectionControl.updateCurrCell(currCellRange);
        return currCellRange;
    }

    /**
     * Not same as _moving in PC (base selection render service)
     * The diff is
     * In base version, new selection is determined by the cursor cell and _startRangeWhenPointerDown
     *
     * In Mobile version, new selection is determined by cursor cell and current of activeSelectionControl.model
     */
    protected override _movingHandler(
        offsetX: number,
        offsetY: number,
        activeSelectionControl: MobileSelectionControl,
        rangeType: RANGE_TYPE
    ) {
        this._rangeType = rangeType;
        const skeleton = this._skeleton;
        const scene = this._scene;

        const currSelectionRange: IRange = {
            startRow: activeSelectionControl.model.startRow,
            endRow: activeSelectionControl.model.endRow,
            startColumn: activeSelectionControl.model.startColumn,
            endColumn: activeSelectionControl.model.endColumn,
        };

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;

        const targetViewport = this._getViewportByCell(currSelectionRange.endRow, currSelectionRange.endColumn) ?? viewportMain;

        const scrollXY = scene.getScrollXYInfoByViewport(
            Vector2.FromArray([this._startViewportPosX, this._startViewportPosY]),
            targetViewport
        );

        const { scaleX, scaleY } = scene.getAncestorScale();

        // const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        if (rangeType === RANGE_TYPE.ROW) {
            // eslint-disable-next-line no-param-reassign
            offsetX = Number.POSITIVE_INFINITY;
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            // eslint-disable-next-line no-param-reassign
            offsetY = Number.POSITIVE_INFINITY;
        }

        const cursorCellRangeInfo = this._getSelectionWithCoordByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        if (!cursorCellRangeInfo) {
            return false;
        }

        const { rangeWithCoord: cursorCellRange } = cursorCellRangeInfo;

        const currCellRange = activeSelectionControl.model.currentCell;
        const startRowOfActiveCell = currCellRange?.mergeInfo.startRow ?? -1;
        const endRowOfActiveCell = currCellRange?.mergeInfo.endRow ?? -1;
        const startColumnOfActiveCell = currCellRange?.mergeInfo.startColumn ?? -1;
        const endColOfActiveCell = currCellRange?.mergeInfo.endColumn ?? -1;

        let newSelectionRange: IRange = {
            startRow: Math.min(cursorCellRange.startRow, startRowOfActiveCell),
            startColumn: Math.min(cursorCellRange.startColumn, startColumnOfActiveCell),
            endRow: Math.max(cursorCellRange.endRow, endRowOfActiveCell),
            endColumn: Math.max(cursorCellRange.endColumn, endColOfActiveCell),
        };

        if (rangeType === RANGE_TYPE.NORMAL) {
            newSelectionRange = skeleton.expandRangeByMerge(newSelectionRange);
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            newSelectionRange = {
                startRow: Math.min(cursorCellRange.startRow, currCellRange?.actualRow ?? -1),
                startColumn: Math.min(cursorCellRange.startColumn, currCellRange?.actualColumn ?? -1),
                endRow: Math.max(cursorCellRange.endRow, currCellRange?.actualRow ?? -1),
                endColumn: Math.max(cursorCellRange.endColumn, currCellRange?.actualColumn ?? -1),

            };
        } else if (rangeType === RANGE_TYPE.ROW) {
            newSelectionRange = {
                startRow: Math.min(cursorCellRange.startRow, currCellRange?.actualRow ?? -1),
                startColumn: Math.min(cursorCellRange.startColumn, currCellRange?.actualColumn ?? -1),
                endRow: Math.max(cursorCellRange.endRow, currCellRange?.actualRow ?? -1),
                endColumn: Math.max(cursorCellRange.endColumn, currCellRange?.actualColumn ?? -1),

            };
        }

        if (!newSelectionRange) {
            return false;
        }
        const newSelection: ISelectionWithStyle = { range: newSelectionRange, style: null, primary: null };
        const newSelectionRangeWithCoord = attachSelectionWithCoord(newSelection, skeleton);
        // newSelectionRangeWithCoord.rangeWithCoord.unitId = unitId;
        // newSelectionRangeWithCoord.rangeWithCoord.sheetId = sheetId;

        // const startCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.startRow, newSelectionRange.startColumn);
        // const endCellXY = skeleton.getNoMergeCellPositionByIndex(newSelectionRange.endRow, newSelectionRange.endColumn);

        // const newSelectionRangeWithCoord: IRangeWithCoord = {
        //     startColumn: newSelectionRange.startColumn,
        //     startRow: newSelectionRange.startRow,
        //     endColumn: newSelectionRange.endColumn,
        //     endRow: newSelectionRange.endRow,
        //     startY: startCellXY?.startY || 0,
        //     endY: endCellXY?.endY || 0,
        //     startX: startCellXY?.startX || 0,
        //     endX: endCellXY?.endX || 0,
        // };

        const rangeChanged =
            currSelectionRange.startRow !== newSelectionRange.startRow ||
            currSelectionRange.startColumn !== newSelectionRange.startColumn ||
            currSelectionRange.endRow !== newSelectionRange.endRow ||
            currSelectionRange.endColumn !== newSelectionRange.endColumn;
        if (rangeChanged) {
            if (activeSelectionControl) {
                activeSelectionControl.updateRangeBySelectionWithCoord(newSelectionRangeWithCoord);
                this._selectionMoving$.next(this.getSelectionDataWithStyle());
            }
        }
    }

    private _updateControlPointWhenScrolling(): void {
        const { scene } = this._context;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;
        const sub = this._scrollManagerService.validViewportScrollInfo$.subscribe((param) => {
            if (param == null) {
                return;
            }
            const { viewportScrollX, viewportScrollY } = param!;

            const activeControl = this.getActiveSelectionControl<MobileSelectionControl>();
            if (activeControl == null) {
                return;
            }
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            const sheetContentHeight = skeleton?.rowTotalHeight;
            const sheetContentWidth = skeleton?.columnTotalWidth;
            const rangeType = activeControl.rangeType;
            if (rangeType === RANGE_TYPE.COLUMN) {
                activeControl.transformControlPoint(0, viewportScrollY, sheetContentWidth, sheetContentHeight);
            } else if (rangeType === RANGE_TYPE.ROW) {
                activeControl.transformControlPoint(viewportScrollX, 0, sheetContentWidth, sheetContentHeight);
            }
        });
        this.disposeWithMe(toDisposable(sub));
    }
}
