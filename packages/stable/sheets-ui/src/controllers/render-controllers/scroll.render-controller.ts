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

import type { IFreeze, IRange, IWorksheetData, Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, IScrollObserverParam, IWheelEvent } from '@univerjs/engine-render';
import type { IScrollToCellOperationParams, ISetSelectionsOperationParams, SheetsSelectionsService } from '@univerjs/sheets';
import type { IScrollCommandParams } from '../../commands/commands/set-scroll.command';
import type { IExpandSelectionCommandParams } from '../../commands/commands/set-selection.command';
import type { IScrollState, IScrollStateSearchParam, IViewportScrollState } from '../../services/scroll-manager.service';

import type { ISheetSkeletonManagerParam } from '../../services/sheet-skeleton-manager.service';
import {
    Direction,
    Disposable,
    FOCUSING_SHEET,
    ICommandService,
    IContextService,
    Inject,
    Injector,
    RANGE_TYPE,
    toDisposable,
    Tools,
} from '@univerjs/core';
import { IRenderManagerService, RENDER_CLASS_TYPE, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { getSelectionsService, ScrollToCellOperation, SetSelectionsOperation } from '@univerjs/sheets';
import { ScrollCommand, SetScrollRelativeCommand } from '../../commands/commands/set-scroll.command';
import { ExpandSelectionCommand, MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../commands/commands/set-selection.command';
import { SheetScrollManagerService } from '../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { getSheetObject } from '../utils/component-tools';

const SHEET_NAVIGATION_COMMANDS = [MoveSelectionCommand.id, MoveSelectionEnterAndTabCommand.id];

const MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR = 3;
/**
 * This controller handles scroll logic in sheet interaction.
 */
export class SheetsScrollRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IContextService private readonly _contextService: IContextService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService
    ) {
        super();

        this._initCommandListener();
        this._wheelEventListener();
        this._scrollBarEventListener();
        this._initSkeletonListener();
    }

    private _wheelEventListener() {
        const { scene } = this._context;
        if (!scene) return;

        const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewMain) return;

        this.disposeWithMe(
            scene.onMouseWheel$.subscribeEvent((evt: IWheelEvent, state) => {
                if (evt.ctrlKey || !this._contextService.getContextValue(FOCUSING_SHEET)) {
                    return;
                }

                let offsetX = 0;
                let offsetY = 0;

                // what????
                // const scrollNum = Math.abs(evt.deltaX);
                // offsetX = evt.deltaX > 0 ? scrollNum : -scrollNum;
                offsetX = evt.deltaX;

                // with shift, scrollY will be scrollX
                if (evt.shiftKey) {
                    // mac is weird, when using track pad, scroll vertical with shift key, should get delta value from deltaY.
                    // but when using with mousewheel, scroll with shift key, only deltaX has value.
                    offsetX = (evt.deltaY || evt.deltaX) * MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR;
                } else {
                    offsetY = evt.deltaY;
                }
                this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetX, offsetY });
                this._context.scene.makeDirty(true);

                // add offset on scroll position to check whether scrolling is reaching limit
                const isLimitedStore = viewMain.limitedScroll(viewMain.scrollX + offsetX, viewMain.scrollY + offsetY);

                // if viewport still have space to scroll, prevent default event. (DO NOT move canvas element)
                // if scrolling is reaching limit, let scrolling event do the default behavior.
                if (isLimitedStore && !isLimitedStore.isLimitedX && !isLimitedStore.isLimitedY) {
                    evt.preventDefault();
                    if (scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                        state.stopPropagation();
                    }
                }

                if (viewMain.isWheelPreventDefaultX && viewMain.isWheelPreventDefaultY) {
                    evt.preventDefault();
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _scrollBarEventListener() {
        const { scene } = this._context;
        if (scene == null) return;

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;

        //#region scrollInfo$ subscriber ---> viewport.scrollTo
        this.disposeWithMe(
            toDisposable(
                this._scrollManagerService.rawScrollInfo$.subscribe((rawScrollInfo: Nullable<IScrollState>) => {
                    const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                    if (!skeleton) return;

                    if (rawScrollInfo == null) {
                        viewportMain.scrollToViewportPos({
                            viewportScrollX: 0,
                            viewportScrollY: 0,
                        });
                        return;
                    }

                    // prev scrolling state from rawScrollInfo$
                    const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = rawScrollInfo;

                    const { startX, startY } = skeleton.getCellWithCoordByIndex(
                        sheetViewStartRow,
                        sheetViewStartColumn,
                        false
                    );

                    const viewportScrollX = startX + offsetX;
                    const viewportScrollY = startY + offsetY;

                    viewportMain.scrollToViewportPos({ viewportScrollX, viewportScrollY });
                })
            )
        );
        //#endregion

        //#region viewport.onScrollAfter$ --> setScrollInfoToCurrSheet & validViewportScrollInfo$
        this.disposeWithMe(
            // set scrollInfo, the event is triggered in viewport@_scrollToScrollbarPos
            viewportMain.onScrollAfter$.subscribeEvent((scrollAfterParam: IScrollObserverParam) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                if (skeleton == null || scrollAfterParam.isTrigger === false) {
                    return;
                }

                const sheetObject = this._getSheetObject();
                if (skeleton == null || sheetObject == null) {
                    return;
                }

                //#region set scrollInfo with validScrollValue
                const { viewportScrollX, viewportScrollY, scrollX, scrollY } = scrollAfterParam;

                // according to the actual scroll position, the most suitable row, column and offset combination is recalculated.
                const { row, column, rowOffset, columnOffset } = skeleton.getOffsetRelativeToRowCol(
                    viewportScrollX,
                    viewportScrollY
                );

                const scrollInfo: IViewportScrollState = {
                    sheetViewStartRow: row,
                    sheetViewStartColumn: column,
                    offsetX: columnOffset,
                    offsetY: rowOffset,
                    viewportScrollX,
                    viewportScrollY,
                    scrollX,
                    scrollY,
                };
                this._scrollManagerService.setValidScrollStateToCurrSheet(scrollInfo);
                //#endregion

                this._scrollManagerService.validViewportScrollInfo$.next({
                    ...scrollInfo,
                    viewportScrollX,
                    viewportScrollY,
                    scrollX,
                    scrollY,
                });
                // snapshot is diff by diff users!
                // this._scrollManagerService.setScrollInfoToSnapshot({ ...lastestScrollInfo, viewportScrollX, viewportScrollY });
            })
        );
        //#endregion

        //#region scroll by bar
        this.disposeWithMe(
            // get scrollByBar event from viewport and exec ScrollCommand.id.
            viewportMain.onScrollByBar$.subscribeEvent((param) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                if (skeleton == null || param.isTrigger === false) {
                    return;
                }

                const sheetObject = this._getSheetObject();
                if (skeleton == null || sheetObject == null) {
                    return;
                }
                const { viewportScrollX = 0, viewportScrollY = 0 } = param;

                const freeze = this._getFreeze();

                const { row, column, rowOffset, columnOffset } = skeleton.getOffsetRelativeToRowCol(
                    viewportScrollX,
                    viewportScrollY
                );

                // NOT same as SetScrollRelativeCommand. that was exec in sheetRenderController
                // const freeze = this._getFreeze();
                this._commandService.executeCommand(ScrollCommand.id, {
                    sheetViewStartRow: row,
                    sheetViewStartColumn: column,
                    offsetX: columnOffset,
                    offsetY: rowOffset,
                });
            })
        );
        //#endregion
    }

    private _initSkeletonListener() {
        this.disposeWithMe(toDisposable(
            this._sheetSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
                if (param == null) {
                    return;
                }
                const scrollParam = { unitId: param.unitId, sheetId: param.sheetId } as IScrollStateSearchParam;
                this._scrollManagerService.setSearchParam(scrollParam);
                const sheetObject = this._getSheetObject();
                if (!sheetObject) return;
                const currScrollInfo = this._scrollManagerService.getScrollStateByParam(scrollParam);
                const { viewportScrollX, viewportScrollY } = this._scrollManagerService.calcViewportScrollFromRowColOffset(currScrollInfo as unknown as Nullable<IViewportScrollState>);

                if (currScrollInfo) {
                    this._updateViewportScroll(viewportScrollX, viewportScrollY);
                }
            })
        ));
    }

    _updateViewportScroll(viewportScrollX: number = 0, viewportScrollY: number = 0) {
        const sheetObject = this._getSheetObject();
        if (!sheetObject) return;
        const scene = sheetObject.scene;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        const viewColRight = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT);
        const viewRowBottom = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM);
        const viewportMainLeft = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT);
        const viewportMainTop = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);
        if (viewportMain) {
            viewportMain.viewportScrollX = viewportScrollX;
            viewportMain.viewportScrollY = viewportScrollY;
        }
        if (viewRowBottom) {
            viewRowBottom.viewportScrollY = viewportScrollY;
        }
        if (viewColRight) {
            viewColRight.viewportScrollX = viewportScrollX;
        }
        if (viewportMainLeft) {
            viewportMainLeft.viewportScrollY = viewportScrollY;
        }
        if (viewportMainTop) {
            viewportMainTop.viewportScrollX = viewportScrollX;
        }
    }

    scrollToRange(range: IRange, forceTop?: boolean, forceLeft?: boolean): boolean {
        let { endRow, endColumn, startColumn, startRow } = range;
        const bounding = this._getViewportBounding();
        if (range.rangeType === RANGE_TYPE.ROW) {
            startColumn = 0;
            endColumn = 0;
        } else if (range.rangeType === RANGE_TYPE.COLUMN) {
            startRow = 0;
            endRow = 0;
        }

        if (bounding && !forceTop && !forceLeft) {
            const row = bounding.startRow > endRow ? startRow : endRow;
            const col = bounding.startColumn > endColumn ? startColumn : endColumn;
            return this._scrollToCell(row, col);
        } else {
            return this._scrollToCell(startRow, startColumn, forceTop, forceLeft);
        }
    }

    /**
     * Scroll spreadsheet(viewMain) to cell position. Based on the limitations of viewport and the number of rows and columns, you can only scroll to the maximum scrollable range.
     *
     * if column A ~ B is frozen. set second param to 0 would make viewMain start at column C.
     * set second param to 2 would make viewMain start at column E.
     * @param {number} row - Cell row
     * @param {number} column - Cell column
     * @returns {boolean} - true if scroll is successful
     */
    scrollToCell(row: number, column: number) {
        const worksheet = this._context.unit.getActiveSheet();
        const {
            ySplit: freezeYSplit,
            xSplit: freezeXSplit,
        } = worksheet.getFreeze();
        return this._commandService.syncExecuteCommand(ScrollCommand.id, {
            sheetViewStartRow: row - freezeYSplit,
            sheetViewStartColumn: column - freezeXSplit,
            offsetX: 0,
            offsetY: 0,
        });
    }

    private _initCommandListener(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            switch (command.id) {
                case SetSelectionsOperation.id:
                    {
                        const p = command.params as ISetSelectionsOperationParams;
                        if (p.unitId === this._context.unitId && p.reveal) {
                            this._scrollToSelection();
                        }
                    }
                    break;

                case ScrollToCellOperation.id:
                    {
                        const p = command.params as IScrollToCellOperationParams;
                        if (p.unitId === this._context.unitId) {
                            const rangeParam = p.range;
                            this.scrollToRange(rangeParam);
                        }
                    }
                    break;

                case ExpandSelectionCommand.id:
                    {
                        const expandParam = command.params as IExpandSelectionCommandParams;
                        this._scrollToSelectionForExpand(expandParam);
                    }
                    break;

                default:
                    break;
            }
        }));
    }

    private _scrollToSelectionForExpand(param: IExpandSelectionCommandParams) {
        setTimeout(() => {
            const selection = this._getSelectionsService().getCurrentLastSelection();
            if (selection == null) {
                return;
            }

            const { startRow, startColumn, endRow, endColumn } = selection.range;

            const bounds = this._getViewportBounding();
            if (bounds == null) {
                return;
            }

            const { startRow: viewportStartRow, startColumn: viewportStartColumn, endRow: viewportEndRow, endColumn: viewportEndColumn } = bounds;

            let row = 0;
            let column = 0;

            if (startRow > viewportStartRow) {
                row = endRow;
            } else if (endRow < viewportEndRow) {
                row = startRow;
            } else {
                row = viewportStartRow;
            }

            if (startColumn > viewportStartColumn) {
                column = endColumn;
            } else if (endColumn < viewportEndColumn) {
                column = startColumn;
            } else {
                column = viewportStartColumn;
            }

            if (param.direction === Direction.DOWN) {
                row = endRow;
            } else if (param.direction === Direction.UP) {
                row = startRow;
            } else if (param.direction === Direction.RIGHT) {
                column = endColumn;
            } else if (param.direction === Direction.LEFT) {
                column = startColumn;
            }

            this._scrollToCell(row, column);
        }, 0);
    }

    private _getFreeze(): Nullable<IFreeze> {
        const snapshot: IWorksheetData | undefined = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton.getWorksheetConfig();
        if (snapshot == null) {
            return;
        }

        return snapshot.freeze;
    }

    private _updateSceneSize(param: ISheetSkeletonManagerParam) {
        if (param == null) {
            return;
        }

        const { unitId } = this._context;
        const { skeleton } = param;
        const scene = this._renderManagerService.getRenderById(unitId)?.scene;

        if (skeleton == null || scene == null) {
            return;
        }

        const { rowTotalHeight, columnTotalWidth, rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } =
            skeleton;
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;

        // @TODO lumixraku why handle zoom in scroll.render-controller ???
        // const zoomRatio = worksheet.getZoomRatio() || 1;
        // scene?.setScaleValueOnly(zoomRatio, zoomRatio);
        scene?.transformByState({
            width: rowHeaderWidthAndMarginLeft + columnTotalWidth,
            height: columnHeaderHeightAndMarginTop + rowTotalHeight,
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context);
    }

    private _scrollToSelectionByDirection(range: IRange) {
        const bounds = this._getViewportBounding();
        if (bounds == null) {
            return false;
        }
        const {
            startRow: viewportStartRow,
            startColumn: viewportStartColumn,
            endRow: viewportEndRow,
            endColumn: viewportEndColumn,
        } = bounds;

        let row = 0;
        let column = 0;

        const { startRow, startColumn, endRow, endColumn } = range;

        if (startRow >= viewportStartRow) {
            row = endRow;
        }

        if (endRow <= viewportEndRow) {
            row = startRow;
        }

        if (startColumn >= viewportStartColumn) {
            column = endColumn;
        }

        if (endColumn <= viewportEndColumn) {
            column = startColumn;
        }

        this._scrollToCell(row, column);
    }

    private _scrollToSelection(targetIsActualRowAndColumn = true) {
        const selection = this._getSelectionsService().getCurrentLastSelection();
        if (!selection) return;

        const { startRow, startColumn, actualRow, actualColumn } = selection.primary ?? selection.range;
        const selectionStartRow = targetIsActualRowAndColumn ? actualRow ?? startRow : startRow;
        const selectionStartColumn = targetIsActualRowAndColumn ? actualColumn ?? startColumn : startColumn;

        this._scrollToCell(selectionStartRow, selectionStartColumn);
    }

    private _getSelectionsService(): SheetsSelectionsService {
        return getSelectionsService(this._injector);
    }

    private _getViewportBounding() {
        const scene = this._getSheetObject()?.scene;
        if (scene == null) {
            return;
        }

        const viewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) {
            return;
        }

        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const vpInfo = viewport.calcViewportInfo();
        return skeleton.getRangeByViewBound(vpInfo.viewBound);
    }

    // For arrow key to active cell cause scrolling.
    // eslint-disable-next-line max-lines-per-function, complexity
    private _scrollToCell(row: number, column: number, forceTop = false, forceLeft = false) {
        const { rowHeightAccumulation, columnWidthAccumulation } = this._sheetSkeletonManagerService.getCurrentSkeleton() ?? {};

        if (rowHeightAccumulation == null || columnWidthAccumulation == null) return false;

        const scene = this._getSheetObject()?.scene;
        if (scene == null) return false;

        const viewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) return false;

        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) return false;

        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) return false;

        row = Tools.clamp(row, 0, rowHeightAccumulation.length - 1);
        column = Tools.clamp(column, 0, columnWidthAccumulation.length - 1);

        const {
            startColumn: scrollableStartCol,
            startRow: scrollableStartRow,
            ySplit: freezedRowCount,
            xSplit: freezedColCount,
        } = worksheet.getFreeze();

        const bounds = this._getViewportBounding();
        if (bounds == null) return false;

        const {
            startRow: viewMainStartRow,
            startColumn: viewMainStartColumn,
            endRow: viewMainEndRow,
            endColumn: viewMainEndColumn,
        } = bounds;

        // why undefined?
        let startSheetViewRow: number | undefined;
        let startSheetViewColumn: number | undefined;

        // vertical overflow only happens when the selection's row is in not the freeze area
        // row >= scrollableStartRow means row is in scrollable area.
        if (row >= scrollableStartRow && column >= scrollableStartCol - freezedRowCount) {
            // top overflow: to row above first row in curr viewMain.
            if (row <= viewMainStartRow) {
                startSheetViewRow = row;
                forceTop = true;
            }

            // bottom overflow: to row below last row.
            if (row >= viewMainEndRow) {
                const minRowAccumulation = rowHeightAccumulation[row] - viewport.height!;
                for (let r = viewMainStartRow; r <= row; r++) {
                    startSheetViewRow = r + 1;
                    if (rowHeightAccumulation[r] >= minRowAccumulation) {
                        break;
                    }
                }
            }
        }
        // why need row >= scrollableStartRow - freezedRowCount ?? we are handling column here, why need row?
        // column >= scrollableStartCol means column is in scrollable area.
        if (column >= scrollableStartCol && row >= scrollableStartRow - freezedRowCount) {
            // left overflow
            if (column <= viewMainStartColumn) {
                startSheetViewColumn = column;
                forceLeft = true;
            }

            // right overflow
            if (column >= viewMainEndColumn) {
                const minColumnAccumulation = columnWidthAccumulation[column] - viewport.width!;
                for (let c = viewMainStartColumn; c <= column; c++) {
                    startSheetViewColumn = c + 1;
                    if (columnWidthAccumulation[c] >= minColumnAccumulation) {
                        break;
                    }
                }
            }
        }

        if (startSheetViewRow === undefined && startSheetViewColumn === undefined) return false;

        let { offsetX, offsetY, sheetViewStartRow: preSheetViewStartRow, sheetViewStartColumn: preSheetViewStartColumn } = this._scrollManagerService.getCurrentScrollState() || {};

        // startSheetViewRow is undefined means not top overflow or bottom overflow.
        // means keep current scroll state.
        startSheetViewRow = startSheetViewRow ? Math.min(startSheetViewRow, row) : preSheetViewStartRow + freezedRowCount; ;
        startSheetViewColumn = startSheetViewColumn ? Math.min(startSheetViewColumn, column) : preSheetViewStartColumn + freezedColCount;

        if (forceLeft) {
            offsetX = 0;
            startSheetViewColumn = column;
            // for hidden columns
            const hiddenColumns = skeleton.getHiddenColumnsInRange({ startColumn: startSheetViewColumn - freezedColCount, endColumn: startSheetViewColumn });
            startSheetViewColumn = startSheetViewColumn - hiddenColumns.length;
        }

        if (forceTop) {
            offsetY = 0;
            startSheetViewRow = row;
            // for hidden rows, consider hidden rows above the viewport visible area(not in scrollable area)
            const hiddenRows = skeleton.getHiddenRowsInRange({ startRow: startSheetViewRow - freezedRowCount, endRow: startSheetViewRow });
            startSheetViewRow = startSheetViewRow - hiddenRows.length;
        }

        return this._commandService.syncExecuteCommand(ScrollCommand.id, {
            // sheetViewStartRow & offsetX should never be undefined, it's rendering, there should always be a value!

            // sheetViewStartRow: forceTop ? Math.max(0, row - freezeYSplit) : ((startSheetViewRow ?? 0) - freezeYSplit),
            // sheetViewStartColumn: forceLeft ? Math.max(0, column - freezeXSplit) : ((startSheetViewColumn ?? 0) - freezeXSplit),
            // offsetX: startSheetViewColumn === undefined ? offsetX : 0,
            // offsetY: startSheetViewRow === undefined ? offsetY : 0,

            sheetViewStartRow: Math.max(0, startSheetViewRow - freezedRowCount),
            sheetViewStartColumn: Math.max(0, startSheetViewColumn - freezedColCount),
            offsetX,
            offsetY,
        } as IScrollCommandParams);
    }
}
