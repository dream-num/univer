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
import type { IMouseEvent, IPoint, IPointerEvent, IRenderContext, IRenderModule, IScrollObserverParam } from '@univerjs/engine-render';
import type { IScrollToCellOperationParams } from '@univerjs/sheets';
import type { IExpandSelectionCommandParams } from '../../../commands/commands/set-selection.command';
import type { IScrollState, IScrollStateSearchParam, IViewportScrollState } from '../../../services/scroll-manager.service';

import type { ISheetSkeletonManagerParam } from '../../../services/sheet-skeleton-manager.service';
import {
    Direction,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    RANGE_TYPE,
    toDisposable,
} from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { ScrollToCellOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { ScrollCommand, SetScrollRelativeCommand } from '../../../commands/commands/set-scroll.command';
import { ExpandSelectionCommand, MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../../commands/commands/set-selection.command';
import { SetZoomRatioCommand } from '../../../commands/commands/set-zoom-ratio.command';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { getSheetObject } from '../../utils/component-tools';

const SHEET_NAVIGATION_COMMANDS = [MoveSelectionCommand.id, MoveSelectionEnterAndTabCommand.id];

/**
 * This controller handles scroll logic in sheet interaction.
 */
export class MobileSheetsScrollRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    scrollToRange(range: IRange): boolean {
        let { endRow, endColumn, startColumn, startRow } = range;
        const bounding = this._getViewportBounding();
        if (range.rangeType === RANGE_TYPE.ROW) {
            startColumn = 0;
            endColumn = 0;
        } else if (range.rangeType === RANGE_TYPE.COLUMN) {
            startRow = 0;
            endRow = 0;
        }

        if (bounding) {
            const row = bounding.startRow > endRow ? startRow : endRow;
            const col = bounding.startColumn > endColumn ? startColumn : endColumn;
            return this._scrollToCell(row, col);
        } else {
            return this._scrollToCell(startRow, startColumn);
        }
    }

    private _init() {
        this._initCommandListener();
        this._initScrollEventListener();
        this._initPointerScrollEvent();
        this._initSkeletonListener();
    }

    private _initCommandListener(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (SHEET_NAVIGATION_COMMANDS.includes(command.id)) {
                    this._scrollToSelection();
                } else if (command.id === ScrollToCellOperation.id) {
                    const param = (command.params as IScrollToCellOperationParams).range;
                    this.scrollToRange(param);
                } else if (command.id === ExpandSelectionCommand.id) {
                    const param = command.params as IExpandSelectionCommandParams;
                    this._scrollToSelectionForExpand(param);
                }
            })
        );
    }

    private _scrollToSelectionForExpand(param: IExpandSelectionCommandParams) {
        setTimeout(() => {
            const selection = this._selectionManagerService.getCurrentLastSelection();
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

    // eslint-disable-next-line max-lines-per-function
    private _initScrollEventListener() {
        const { scene } = this._context;
        if (scene == null) return;

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (!viewportMain) return;

        //#region scrollInfo$ subscriber ---> viewport.scrollTo
        this.disposeWithMe(
            toDisposable(
                // wheel event --> set-scroll.command('sheet.operation.set-scroll') --> scroll.operation.ts -->
                // scrollManagerService.setScrollInfoAndEmitEvent --->  scrollManagerService.setScrollInfo(raw value, may be negative) &&
                // _notifyCurrentScrollInfo
                this._scrollManagerService.rawScrollInfo$.subscribe((rawScrollInfo: Nullable<IScrollState>) => {
                    if (rawScrollInfo == null) {
                        viewportMain.scrollToViewportPos({
                            viewportScrollX: 0,
                            viewportScrollY: 0,
                        });
                        return;
                    }

                    const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                    if (!skeleton) return;

                    // data source: scroll-manager.service.ts@_scrollInfo
                    const { sheetViewStartRow, sheetViewStartColumn, offsetX, offsetY } = rawScrollInfo;

                    const { startX, startY } = skeleton.getCellWithCoordByIndex(
                        sheetViewStartRow,
                        sheetViewStartColumn,
                        false
                    );

                    // viewportScrollXByEvent is not same as viewportScrollX, by event, the value may be negative, or over max
                    const viewportScrollX = startX + offsetX;
                    const viewportScrollY = startY + offsetY;

                    // const config = viewportMain.transViewportScroll2ScrollValue(viewportScrollXByEvent, viewportScrollYByEvent);
                    viewportMain.scrollToViewportPos({ viewportScrollX, viewportScrollY });
                })
            )
        );
        //#endregion

        //#region viewport.onScrollAfter$ --> setScrollInfoToCurrSheet & validViewportScrollInfo$
        this.disposeWithMe(
            viewportMain.onScrollAfter$.subscribeEvent((scrollAfterParam: IScrollObserverParam) => {
                if (!scrollAfterParam) return;
                const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                if (skeleton == null) return;
                const sheetObject = this._getSheetObject();
                if (skeleton == null || sheetObject == null) return;

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
                // lastestScrollInfo derived from viewportScrollX, viewportScrollY from onScrollAfter$
                this._scrollManagerService.setValidScrollStateToCurrSheet(scrollInfo);
                this._scrollManagerService.validViewportScrollInfo$.next({
                    ...scrollInfo,
                    scrollX,
                    scrollY,
                    viewportScrollX,
                    viewportScrollY,
                });
                // snapshot is diff by diff people!
                // this._scrollManagerService.setScrollInfoToSnapshot({ ...lastestScrollInfo, viewportScrollX, viewportScrollY });
            })
        );
        //#endregion

        //#region scroll by bar
        this.disposeWithMe(
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

                this._commandService.executeCommand(ScrollCommand.id, {
                    sheetViewStartRow: row + (freeze?.ySplit || 0),
                    sheetViewStartColumn: column + (freeze?.xSplit || 0),
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
                const scene = sheetObject.scene;
                const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
                const currScrollInfo = this._scrollManagerService.getScrollStateByParam(scrollParam);
                const { viewportScrollX, viewportScrollY } = this._scrollManagerService.calcViewportScrollFromRowColOffset(currScrollInfo as unknown as Nullable<IViewportScrollState>);
                if (viewportMain) {
                    if (currScrollInfo) {
                        viewportMain.viewportScrollX = viewportScrollX;
                        viewportMain.viewportScrollY = viewportScrollY;
                    } else {
                        viewportMain.viewportScrollX = 0;
                        viewportMain.viewportScrollY = 0;
                    }
                    this._updateSceneSize(param as unknown as ISheetSkeletonManagerParam);
                }
            })
        ));
    }

    /**
     * for mobile - iOS-like smooth inertia scrolling
     * Uses native touch events for better mobile experience while keeping onPointerDown$ as trigger
     * to avoid interfering with header events
     */
    // eslint-disable-next-line max-lines-per-function
    private _initPointerScrollEvent() {
        const sheetObject = this._getSheetObject();
        if (!sheetObject) return;

        const scene = sheetObject.scene;
        const spreadsheet = sheetObject.spreadsheet;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        const lastTouchPos: IPoint = { x: 0, y: 0 };
        let _touchScrolling: boolean = false;

        // Velocity tracking for smooth inertia (iOS-like)
        const velocity = { x: 0, y: 0 };
        let scrollInertiaAnimationID: null | number = null;

        // Track velocity history for smoother calculation (like iOS)
        const VELOCITY_HISTORY_SIZE = 5;
        const velocityHistory: Array<{ x: number; y: number; time: number }> = [];
        let lastMoveTime = 0;

        // Track swipe characteristics for dynamic inertia calculation
        let swipeStartTime = 0;
        let swipeTotalDisplacement = { x: 0, y: 0 };

        // Direction locking - prevent simultaneous X/Y scrolling
        let lockedDirection: 'x' | 'y' | null = null;
        const DIRECTION_LOCK_THRESHOLD = 8; // px - minimum movement to lock direction

        // iOS-like physics constants (tuned for smoother feel)
        const BASE_DECELERATION_RATE = 0.99; // Per millisecond deceleration (lower = stops faster)
        const BASE_MIN_VELOCITY_THRESHOLD = 0.3; // Minimum velocity to continue animation
        const BASE_MAX_VELOCITY = 10; // Cap maximum velocity for stability

        // Flick detection thresholds
        const FLICK_TIME_THRESHOLD = 300; // ms - swipes faster than this are considered "flicks"
        const FLICK_DISTANCE_THRESHOLD = 30; // px - minimum distance to be considered a flick
        const MIN_VELOCITY_MULTIPLIER = 0.08; // For slow drags
        const MAX_VELOCITY_MULTIPLIER = 0.25; // For quick flicks

        /**
         * Get current zoom ratio for adjusting physics parameters
         */
        const getCurrentZoomRatio = (): number => {
            const worksheet = this._context.unit.getActiveSheet();
            return worksheet?.getZoomRatio() || 1;
        };

        /**
         * Get zoom-adjusted physics parameters
         * When zoomed in, we need faster deceleration and lower velocity for precise control
         * When zoomed out, we need slower deceleration and higher velocity for faster navigation
         */
        const getZoomAdjustedParams = () => {
            const zoomRatioOrigin = getCurrentZoomRatio();
            const zoomRatio = Math.max(zoomRatioOrigin, 1); // Only adjust for zoom >= 100%
            // Adjust deceleration: higher zoom = faster deceleration (more precise)
            const decelerationRate = BASE_DECELERATION_RATE ** (1 / Math.sqrt(zoomRatio));
            // Adjust velocity threshold based on zoom
            const minVelocityThreshold = BASE_MIN_VELOCITY_THRESHOLD * zoomRatio;
            // Adjust max velocity: higher zoom = lower max velocity
            const maxVelocity = BASE_MAX_VELOCITY / Math.sqrt(zoomRatio);

            return { decelerationRate, minVelocityThreshold, maxVelocity };
        };

        /**
         * Calculate dynamic velocity multiplier based on swipe characteristics
         * Quick short flicks get higher multiplier, slow drags get lower multiplier
         */
        const calculateDynamicVelocityMultiplier = (
            swipeDuration: number,
            swipeDistance: number,
            instantVelocity: number
        ): number => {
            // Calculate swipe speed (distance / time)
            const swipeSpeed = swipeDuration > 0 ? swipeDistance / swipeDuration : 0;

            // Detect if this is a "flick" gesture (quick, intentional swipe)
            const isFlick = swipeDuration < FLICK_TIME_THRESHOLD && swipeDistance > FLICK_DISTANCE_THRESHOLD;

            // Base multiplier calculation
            let multiplier: number;

            if (isFlick) {
                // Quick flick: use higher multiplier based on speed
                // Faster flicks get closer to MAX_VELOCITY_MULTIPLIER
                const speedFactor = Math.min(swipeSpeed / 2, 1); // Normalize speed (2 px/ms = fast)
                multiplier = MIN_VELOCITY_MULTIPLIER + (MAX_VELOCITY_MULTIPLIER - MIN_VELOCITY_MULTIPLIER) * speedFactor;

                // Boost multiplier for very quick flicks with high instantaneous velocity
                if (swipeDuration < 150 && Math.abs(instantVelocity) > 3) {
                    multiplier *= 1.3;
                }
            } else {
                // Slow drag: use lower multiplier, but still proportional to final velocity
                const velocityFactor = Math.min(Math.abs(instantVelocity) / 5, 1);
                multiplier = MIN_VELOCITY_MULTIPLIER * (0.5 + velocityFactor * 0.5);
            }

            // Clamp the multiplier
            return Math.max(MIN_VELOCITY_MULTIPLIER * 0.5, Math.min(MAX_VELOCITY_MULTIPLIER * 1.5, multiplier));
        };

        /**
         * Calculate weighted average velocity from history (iOS-like behavior)
         * More recent samples have higher weight
         */
        const calculateAverageVelocity = (): { x: number; y: number } => {
            if (velocityHistory.length === 0) {
                return { x: 0, y: 0 };
            }

            let totalWeight = 0;
            let weightedVelX = 0;
            let weightedVelY = 0;

            // Give more weight to recent velocity samples
            for (let i = 0; i < velocityHistory.length; i++) {
                const weight = (i + 1) * (i + 1); // Quadratic weighting
                weightedVelX += velocityHistory[i].x * weight;
                weightedVelY += velocityHistory[i].y * weight;
                totalWeight += weight;
            }

            return {
                x: weightedVelX / totalWeight,
                y: weightedVelY / totalWeight,
            };
        };

        /**
         * iOS-like inertia animation with time-based deceleration
         */
        let lastFrameTime = 0;
        let _pinchZooming = false;
        let initialPinchDistance = 0;
        let initialZoomRatio = 1;
        let pinchCenter: IPoint = { x: 0, y: 0 };
        const cancelInertiaAnimation = () => {
            if (scrollInertiaAnimationID !== null) {
                cancelAnimationFrame(scrollInertiaAnimationID);
                scrollInertiaAnimationID = null;
            }
            lastFrameTime = 0;
            velocity.x = 0;
            velocity.y = 0;
        };

        const scrollInertia = (currentTime: number) => {
            if (!viewportMain) return;

            // Stop inertia if pinch zooming has started
            if (_pinchZooming) {
                cancelInertiaAnimation();
                return;
            }

            if (lastFrameTime === 0) {
                lastFrameTime = currentTime;
                scrollInertiaAnimationID = requestAnimationFrame(scrollInertia);
                return;
            }

            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            const { decelerationRate, minVelocityThreshold } = getZoomAdjustedParams();

            // Apply time-based exponential deceleration (iOS-like)
            const decelerationFactor = decelerationRate ** deltaTime;
            velocity.x *= decelerationFactor;
            velocity.y *= decelerationFactor;

            // Calculate displacement for this frame
            // Using integral of velocity over time for smoother motion
            const dampingFactor = -Math.log(decelerationRate);
            const offsetX = velocity.x * (1 - decelerationFactor) / dampingFactor;
            const offsetY = velocity.y * (1 - decelerationFactor) / dampingFactor;

            if (Math.abs(offsetX) > 0.01 || Math.abs(offsetY) > 0.01) {
                this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY, offsetX });
            }

            // Continue animation if velocity is above threshold
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > minVelocityThreshold) {
                scrollInertiaAnimationID = requestAnimationFrame(scrollInertia);
            } else {
                scrollInertiaAnimationID = null;
                lastFrameTime = 0;
            }
        };
        // Get the canvas element for native touch events
        const engine = scene.getEngine();
        const canvasElement = engine?.getCanvasElement();
        if (!canvasElement) return;

        // ============== Pinch-to-Zoom State ==============

        // Store the cell position at pinch center for maintaining focus point
        let pinchCenterCellInfo: {
            row: number;
            column: number;
            rowOffset: number; // offset within the cell
            columnOffset: number;
            cellStartX: number; // cell's start X in viewport coords
            cellStartY: number;
        } | null = null;

        // Create zoom indicator overlay
        const zoomIndicator = this._createZoomIndicator(canvasElement);

        /**
         * Convert touch event to offset coordinates relative to canvas
         */
        const getTouchOffset = (touch: Touch): { offsetX: number; offsetY: number } => {
            const rect = canvasElement.getBoundingClientRect();
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top,
            };
        };

        /**
         * Calculate distance between two touch points
         */
        const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        /**
         * Get center point between two touches (in canvas coordinates)
         */
        const getPinchCenter = (touch1: Touch, touch2: Touch): IPoint => {
            const offset1 = getTouchOffset(touch1);
            const offset2 = getTouchOffset(touch2);
            return {
                x: (offset1.offsetX + offset2.offsetX) / 2,
                y: (offset1.offsetY + offset2.offsetY) / 2,
            };
        };

        /**
         * Check if touch is within spreadsheet area (not on headers)
         */
        const isTouchOnSpreadsheet = (offsetX: number, offsetY: number): boolean => {
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (!skeleton) return false;
            const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;
            return offsetX > rowHeaderWidthAndMarginLeft && offsetY > columnHeaderHeightAndMarginTop;
        };

        /**
         * Convert canvas coordinates to cell information
         */
        const getCellInfoAtPoint = (canvasX: number, canvasY: number, zoomRatio: number): typeof pinchCenterCellInfo => {
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (!skeleton || !viewportMain) return null;

            const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

            // Convert canvas coordinates to viewport scroll coordinates
            const viewportScrollX = viewportMain.viewportScrollX || 0;
            const viewportScrollY = viewportMain.viewportScrollY || 0;

            // Calculate the actual position in the sheet (accounting for zoom and scroll)
            const sheetX = (canvasX - rowHeaderWidthAndMarginLeft) / zoomRatio + viewportScrollX;
            const sheetY = (canvasY - columnHeaderHeightAndMarginTop) / zoomRatio + viewportScrollY;

            // Find which cell this corresponds to
            const { row, column, rowOffset, columnOffset } = skeleton.getOffsetRelativeToRowCol(
                Math.max(0, sheetX),
                Math.max(0, sheetY)
            );

            // Get the cell's start position
            const cellInfo = skeleton.getCellWithCoordByIndex(row, column, false);

            return {
                row,
                column,
                rowOffset,
                columnOffset,
                cellStartX: cellInfo.startX,
                cellStartY: cellInfo.startY,
            };
        };

        /**
         * Apply zoom and adjust scroll to keep pinch center in place
         */
        const applyZoomWithFocus = (newZoomRatio: number, oldZoomRatio: number) => {
            if (!pinchCenterCellInfo || !viewportMain) return;

            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (!skeleton) return;

            const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop } = skeleton;

            // Get current scroll position
            const currentViewportScrollX = viewportMain.viewportScrollX || 0;
            const currentViewportScrollY = viewportMain.viewportScrollY || 0;

            // The position in sheet coordinates where the pinch center was
            const pinchSheetX = pinchCenterCellInfo.cellStartX + pinchCenterCellInfo.columnOffset;
            const pinchSheetY = pinchCenterCellInfo.cellStartY + pinchCenterCellInfo.rowOffset;

            // The position of pinch center in canvas coordinates (relative to content area)
            const pinchCanvasX = pinchCenter.x - rowHeaderWidthAndMarginLeft;
            const pinchCanvasY = pinchCenter.y - columnHeaderHeightAndMarginTop;

            // Calculate new scroll position to keep the pinch point stationary
            // At old zoom: canvasPos = (sheetPos - scrollPos) * oldZoom
            // At new zoom: canvasPos = (sheetPos - newScrollPos) * newZoom
            // Solving for newScrollPos: newScrollPos = sheetPos - canvasPos / newZoom
            let newViewportScrollX = pinchSheetX - pinchCanvasX / newZoomRatio;
            let newViewportScrollY = pinchSheetY - pinchCanvasY / newZoomRatio;

            // Handle zoom out when scroll is at origin - zoom from top-left corner
            if (newZoomRatio < oldZoomRatio) {
                if (currentViewportScrollX <= 0 && newViewportScrollX < 0) {
                    newViewportScrollX = 0;
                }
                if (currentViewportScrollY <= 0 && newViewportScrollY < 0) {
                    newViewportScrollY = 0;
                }
            }

            // Clamp to valid scroll range
            newViewportScrollX = Math.max(0, newViewportScrollX);
            newViewportScrollY = Math.max(0, newViewportScrollY);

            // Apply zoom first
            const workbook = this._context.unit;
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return;

            this._commandService.executeCommand(SetZoomRatioCommand.id, {
                zoomRatio: newZoomRatio,
                unitId: workbook.getUnitId(),
                subUnitId: worksheet.getSheetId(),
            });

            // Then apply scroll adjustment
            const { row, column, rowOffset, columnOffset } = skeleton.getOffsetRelativeToRowCol(
                newViewportScrollX,
                newViewportScrollY
            );

            this._commandService.executeCommand(ScrollCommand.id, {
                sheetViewStartRow: row,
                sheetViewStartColumn: column,
                offsetX: columnOffset,
                offsetY: rowOffset,
            });
        };

        // Use onPointerDown$ as trigger to maintain header event compatibility
        // This ensures the event system knows scrolling has started
        spreadsheet.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            cancelInertiaAnimation();
            state.stopPropagation();
        });

        // Native touch event handlers for better mobile scrolling experience
        const handleTouchStart = (e: TouchEvent) => {
            // Handle pinch-to-zoom (two fingers)
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // Check if both touches are on spreadsheet area
                const offset1 = getTouchOffset(touch1);
                const offset2 = getTouchOffset(touch2);
                if (!isTouchOnSpreadsheet(offset1.offsetX, offset1.offsetY) ||
                    !isTouchOnSpreadsheet(offset2.offsetX, offset2.offsetY)) {
                    return;
                }

                // Cancel any single-touch scrolling
                _touchScrolling = false;
                cancelInertiaAnimation();

                // Initialize pinch state
                _pinchZooming = true;
                initialPinchDistance = getTouchDistance(touch1, touch2);
                initialZoomRatio = getCurrentZoomRatio();
                pinchCenter = getPinchCenter(touch1, touch2);

                // Store the cell info at pinch center
                pinchCenterCellInfo = getCellInfoAtPoint(pinchCenter.x, pinchCenter.y, initialZoomRatio);

                // Show zoom indicator
                this._showZoomIndicator(zoomIndicator, Math.round(initialZoomRatio * 100));

                e.preventDefault();
                return;
            }

            // Single touch - handle scrolling
            if (e.touches.length !== 1) return;

            // If we were pinch zooming and now only one finger, don't start scrolling immediately
            if (_pinchZooming) return;

            const touch = e.touches[0];
            const { offsetX, offsetY } = getTouchOffset(touch);

            // Only start scrolling if touch is on spreadsheet area
            if (!isTouchOnSpreadsheet(offsetX, offsetY)) return;

            cancelInertiaAnimation();

            lastTouchPos.x = offsetX;
            lastTouchPos.y = offsetY;
            lastMoveTime = performance.now();
            swipeStartTime = lastMoveTime;
            swipeTotalDisplacement = { x: 0, y: 0 };
            lockedDirection = null; // Reset direction lock on new touch
            velocityHistory.length = 0;
            _touchScrolling = true;

            // Prevent default to avoid browser scroll behavior
            e.preventDefault();
        };

        // eslint-disable-next-line max-lines-per-function
        const handleTouchMove = (e: TouchEvent) => {
            // Handle pinch-to-zoom
            if (_pinchZooming && e.touches.length === 2) {
                // Extra protection: ensure inertia is cancelled during zoom
                if (scrollInertiaAnimationID !== null) {
                    cancelInertiaAnimation();
                }

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                const currentDistance = getTouchDistance(touch1, touch2);
                const scale = currentDistance / initialPinchDistance;

                // Calculate new zoom ratio with constraints (mobile: 25% - 200%)
                let newZoomRatio = initialZoomRatio * scale;
                const MOBILE_ZOOM_MIN = 0.25;
                const MOBILE_ZOOM_MAX = 2;
                newZoomRatio = Math.max(MOBILE_ZOOM_MIN, Math.min(MOBILE_ZOOM_MAX, newZoomRatio));
                // Round to one decimal place for smoother updates
                newZoomRatio = Math.round(newZoomRatio * 10) / 10;

                const currentZoom = getCurrentZoomRatio();
                if (Math.abs(newZoomRatio - currentZoom) >= 0.05) {
                    // Update pinch center for smooth experience
                    pinchCenter = getPinchCenter(touch1, touch2);

                    // Apply zoom with focus point
                    applyZoomWithFocus(newZoomRatio, currentZoom);

                    // Update zoom indicator
                    this._showZoomIndicator(zoomIndicator, Math.round(newZoomRatio * 100));
                }

                e.preventDefault();
                return;
            }

            // Handle scrolling
            if (!_touchScrolling) return;
            if (e.touches.length !== 1) return;
            if (!viewportMain) return;

            const touch = e.touches[0];
            const { offsetX, offsetY } = getTouchOffset(touch);
            const currentTime = performance.now();
            const deltaTime = currentTime - lastMoveTime;

            if (deltaTime <= 0) return;

            let deltaX = -(offsetX - lastTouchPos.x);
            let deltaY = -(offsetY - lastTouchPos.y);

            // Track total displacement for flick detection
            swipeTotalDisplacement.x += Math.abs(deltaX);
            swipeTotalDisplacement.y += Math.abs(deltaY);

            // Direction locking logic - lock to primary axis once threshold is reached
            if (lockedDirection === null) {
                const totalX = swipeTotalDisplacement.x;
                const totalY = swipeTotalDisplacement.y;
                if (totalX > DIRECTION_LOCK_THRESHOLD || totalY > DIRECTION_LOCK_THRESHOLD) {
                    // Lock to the axis with more displacement
                    lockedDirection = totalX > totalY ? 'x' : 'y';
                }
            }

            // Apply direction lock - only scroll in locked direction
            if (lockedDirection === 'x') {
                deltaY = 0;
            } else if (lockedDirection === 'y') {
                deltaX = 0;
            }

            // Calculate instantaneous velocity (pixels per millisecond)
            const instantVelX = lockedDirection === 'y' ? 0 : deltaX / deltaTime * 16;
            const instantVelY = lockedDirection === 'x' ? 0 : deltaY / deltaTime * 16;

            // Add to velocity history
            velocityHistory.push({
                x: instantVelX,
                y: instantVelY,
                time: currentTime,
            });

            // Keep only recent samples
            while (velocityHistory.length > VELOCITY_HISTORY_SIZE) {
                velocityHistory.shift();
            }

            // Apply scroll immediately for responsive feel
            if (deltaX !== 0 || deltaY !== 0) {
                this._commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY: deltaY, offsetX: deltaX });
            }

            lastTouchPos.x = offsetX;
            lastTouchPos.y = offsetY;
            lastMoveTime = currentTime;

            // Prevent default to avoid browser scroll behavior
            e.preventDefault();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            // Handle pinch zoom end
            if (_pinchZooming) {
                if (e.touches.length < 2) {
                    _pinchZooming = false;
                    pinchCenterCellInfo = null;
                    // Ensure inertia is fully cancelled after zoom
                    cancelInertiaAnimation();
                    velocityHistory.length = 0;
                    // Hide zoom indicator with delay
                    this._hideZoomIndicator(zoomIndicator);
                }
                return;
            }

            // Handle scroll end
            if (!_touchScrolling) return;
            _touchScrolling = false;

            // Calculate final velocity from history
            const avgVelocity = calculateAverageVelocity();

            // Calculate swipe characteristics for dynamic inertia
            const swipeDuration = performance.now() - swipeStartTime;
            const totalDistance = Math.sqrt(
                swipeTotalDisplacement.x * swipeTotalDisplacement.x +
                swipeTotalDisplacement.y * swipeTotalDisplacement.y
            );
            const instantVelocity = Math.sqrt(avgVelocity.x * avgVelocity.x + avgVelocity.y * avgVelocity.y);

            // Get dynamic velocity multiplier based on swipe characteristics
            const dynamicMultiplier = calculateDynamicVelocityMultiplier(swipeDuration, totalDistance, instantVelocity);

            const { maxVelocity, minVelocityThreshold } = getZoomAdjustedParams();

            // Adjust multiplier for zoom level
            const zoomRatio = getCurrentZoomRatio();
            const zoomAdjustedMultiplier = dynamicMultiplier / Math.sqrt(Math.max(zoomRatio, 1));

            // Apply dynamic velocity multiplier and cap, respecting direction lock
            velocity.x = lockedDirection === 'y' ? 0 : Math.max(-maxVelocity, Math.min(maxVelocity, avgVelocity.x * zoomAdjustedMultiplier));
            velocity.y = lockedDirection === 'x' ? 0 : Math.max(-maxVelocity, Math.min(maxVelocity, avgVelocity.y * zoomAdjustedMultiplier));

            // Only start inertia if velocity is significant
            const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            if (speed > minVelocityThreshold * 2) {
                lastFrameTime = 0;
                scrollInertiaAnimationID = requestAnimationFrame(scrollInertia);
            }

            velocityHistory.length = 0;
        };

        const handleTouchCancel = () => {
            if (_pinchZooming) {
                _pinchZooming = false;
                pinchCenterCellInfo = null;
                this._hideZoomIndicator(zoomIndicator);
            }
            if (_touchScrolling) {
                _touchScrolling = false;
                velocityHistory.length = 0;
            }
        };

        // Add native touch event listeners with passive: false to allow preventDefault
        canvasElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvasElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvasElement.addEventListener('touchend', handleTouchEnd, { passive: false });
        canvasElement.addEventListener('touchcancel', handleTouchCancel, { passive: false });

        // Clean up touch event listeners on dispose
        this.disposeWithMe(toDisposable(() => {
            canvasElement.removeEventListener('touchstart', handleTouchStart);
            canvasElement.removeEventListener('touchmove', handleTouchMove);
            canvasElement.removeEventListener('touchend', handleTouchEnd);
            canvasElement.removeEventListener('touchcancel', handleTouchCancel);
            // Remove zoom indicator
            if (zoomIndicator && zoomIndicator.parentElement) {
                zoomIndicator.parentElement.removeChild(zoomIndicator);
            }
        }));

        // Note: We intentionally do NOT add handleScrollEnd listeners for onPointerLeave$/onPointerOut$
        // When using native touch events, the touch can move outside the spreadsheet area (into headers)
        // but the scroll should continue. The scroll will only end on touchend/touchcancel events.
        // This fixes the issue where scrolling would stop when finger moves over row/column headers.
    }

    /**
     * Create zoom indicator overlay element
     */
    private _createZoomIndicator(canvasElement: HTMLCanvasElement): HTMLDivElement {
        const container = canvasElement.parentElement;
        if (!container) {
            // Fallback: create a detached element
            const div = document.createElement('div');
            div.style.display = 'none';
            return div;
        }

        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: bold;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease-in-out;
            z-index: 10000;
            user-select: none;
            -webkit-user-select: none;
        `;

        // Ensure container has relative positioning for absolute child
        const containerPosition = window.getComputedStyle(container).position;
        if (containerPosition === 'static') {
            container.style.position = 'relative';
        }

        container.appendChild(indicator);
        return indicator;
    }

    /**
     * Show zoom indicator with percentage
     */
    private _showZoomIndicator(indicator: HTMLDivElement, percentage: number): void {
        indicator.textContent = `${percentage}%`;
        indicator.style.opacity = '1';
    }

    /**
     * Hide zoom indicator with fade out
     */
    private _hideZoomIndicator(indicator: HTMLDivElement): void {
        // Delay hiding to show final zoom value briefly
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 300);
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

        // Note: Do NOT call scene.setScaleValueOnly here.
        // Zoom is handled by SheetsZoomRenderController._updateViewZoom which calls scene.scale().
        // Calling setScaleValueOnly here can cause scroll position issues when zooming back to 100%.
        scene?.transformByState({
            width: rowHeaderWidthAndMarginLeft + columnTotalWidth,
            height: columnHeaderHeightAndMarginTop + rowTotalHeight,
        });
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context);
    }

    private _scrollToSelection(targetIsActualRowAndColumn = true) {
        const selection = this._selectionManagerService.getCurrentLastSelection();
        if (selection == null) {
            return;
        }

        const { startRow, startColumn, actualRow, actualColumn } = selection.primary;
        const selectionStartRow = targetIsActualRowAndColumn ? actualRow : startRow;
        const selectionStartColumn = targetIsActualRowAndColumn ? actualColumn : startColumn;

        this._scrollToCell(selectionStartRow, selectionStartColumn);
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

        return skeleton.getRangeByViewport(viewport.calcViewportInfo());
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _scrollToCell(row: number, column: number): boolean {
        const { rowHeightAccumulation, columnWidthAccumulation } = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton ?? {};

        if (rowHeightAccumulation == null || columnWidthAccumulation == null) return false;

        const scene = this._getSheetObject()?.scene;
        if (scene == null) return false;

        const viewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        if (viewport == null) return false;

        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) return false;

        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) return false;

        const {
            startColumn: freezeStartColumn,
            startRow: freezeStartRow,
            ySplit: freezeYSplit,
            xSplit: freezeXSplit,
        } = worksheet.getFreeze();

        const bounds = this._getViewportBounding();
        if (bounds == null) return false;

        const {
            startRow: viewportStartRow,
            startColumn: viewportStartColumn,
            endRow: viewportEndRow,
            endColumn: viewportEndColumn,
        } = bounds;

        let startSheetViewRow: number | undefined;
        let startSheetViewColumn: number | undefined;

        // vertical overflow only happens when the selection's row is in not the freeze area
        if (row >= freezeStartRow && column >= freezeStartColumn - freezeXSplit) {
            // top overflow
            if (row <= viewportStartRow) {
                startSheetViewRow = row;
            }

            // bottom overflow
            if (row >= viewportEndRow) {
                const minRowAccumulation = rowHeightAccumulation[row] - viewport.height!;
                for (let r = viewportStartRow; r <= row; r++) {
                    if (rowHeightAccumulation[r] >= minRowAccumulation) {
                        startSheetViewRow = r + 1;
                        break;
                    }
                }
            }
        }
        // horizontal overflow only happens when the selection's column is in not the freeze area
        if (column >= freezeStartColumn && row >= freezeStartRow - freezeYSplit) {
            // left overflow
            if (column <= viewportStartColumn) {
                startSheetViewColumn = column;
            }

            // right overflow
            if (column >= viewportEndColumn) {
                const minColumnAccumulation = columnWidthAccumulation[column] - viewport.width!;
                for (let c = viewportStartColumn; c <= column; c++) {
                    if (columnWidthAccumulation[c] >= minColumnAccumulation) {
                        startSheetViewColumn = c + 1;
                        break;
                    }
                }
            }
        }

        if (startSheetViewRow === undefined && startSheetViewColumn === undefined) return false;

        const { offsetX, offsetY } = this._scrollManagerService.getCurrentScrollState() || {};
        return this._commandService.syncExecuteCommand(ScrollCommand.id, {
            sheetViewStartRow: startSheetViewRow,
            sheetViewStartColumn: startSheetViewColumn,
            offsetX: startSheetViewColumn === undefined ? offsetX : 0,
            offsetY: startSheetViewRow === undefined ? offsetY : 0,
        });
    }
}
