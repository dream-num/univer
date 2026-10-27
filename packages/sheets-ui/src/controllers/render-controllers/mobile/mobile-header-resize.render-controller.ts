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

import type { IDisposable, Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { Subscription } from 'rxjs';
import {
    Disposable,
    ICommandService,
    IContextService,
    Inject,
    RANGE_TYPE,
    toDisposable,
} from '@univerjs/core';
import { Rect } from '@univerjs/engine-render';
import {
    attachSelectionWithCoord,
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX } from '../../../common/keys';
import { MOBILE_EXPANDING_SELECTION, MOBILE_PINCH_ZOOMING } from '../../../consts/mobile-context';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import {
    HEADER_MENU_SHAPE_SIZE,
    HEADER_MENU_SHAPE_THUMB_SIZE,
    HEADER_RESIZE_SHAPE_TYPE,
    HeaderMenuResizeShape,
    MAX_HEADER_MENU_SHAPE_SIZE,
} from '../../../views/header-resize-shape';

const MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_ROW = '__MobileHeaderResizeControllerShapeRow__';
const MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN = '__MobileHeaderResizeControllerShapeColumn__';
const MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_HELPER = '__MobileHeaderResizeControllerShapeHelper__';
const MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR = 'rgb(199, 199, 199)';

// The minimum move offset of header resize bar, less than this value will not be triggered any actions.
const MINIMAL_OFFSET = 2;

export class MobileHeaderResizeRenderController extends Disposable implements IRenderModule {
    private _currentRow: number = -1;
    private _currentColumn: number = -1;

    private _rowResizeButton: Nullable<HeaderMenuResizeShape>;
    private _columnResizeButton: Nullable<HeaderMenuResizeShape>;

    private _resizeHelperShape: Nullable<Rect>;

    private _isDragging: boolean = false;
    private _resizeListeners: Nullable<IDisposable>;

    private _selectionSubscription: Nullable<Subscription>;
    private _scrollSubscription: Nullable<Subscription>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService
    ) {
        super();
        this._init();
    }

    override dispose(): void {
        this._cancelResize();

        this._rowResizeButton?.dispose();
        this._rowResizeButton = null;

        this._columnResizeButton?.dispose();
        this._columnResizeButton = null;

        this._selectionSubscription?.unsubscribe();
        this._selectionSubscription = null;

        this._scrollSubscription?.unsubscribe();
        this._scrollSubscription = null;

        super.dispose();
    }

    private _init(): void {
        this._initResizeShapes();
        this._initSelectionListener();
        this._initScrollListener();
    }

    private _initResizeShapes(): void {
        const scene = this._context.scene;

        this._rowResizeButton = new HeaderMenuResizeShape(MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_ROW, {
            visible: false,
            mode: HEADER_RESIZE_SHAPE_TYPE.HORIZONTAL,
            zIndex: 100,
        });

        this._columnResizeButton = new HeaderMenuResizeShape(MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN, {
            visible: false,
            mode: HEADER_RESIZE_SHAPE_TYPE.VERTICAL,
            zIndex: 100,
        });

        scene.addObjects([this._rowResizeButton, this._columnResizeButton], SHEET_COMPONENT_HEADER_LAYER_INDEX);

        this._bindPointerEventsToButton(this._rowResizeButton, 'row');
        this._bindPointerEventsToButton(this._columnResizeButton, 'column');
    }

    private _initSelectionListener(): void {
        this._selectionSubscription = this._selectionManagerService.selectionMoveEnd$.subscribe(
            (selections: ISelectionWithStyle[]) => {
                this._handleSelectionChange(selections);
            }
        );
        this.disposeWithMe(this._selectionSubscription);
    }

    private _initScrollListener(): void {
        this._scrollSubscription = this._scrollManagerService.validViewportScrollInfo$.subscribe((scrollInfo) => {
            if (!scrollInfo) {
                return;
            }
            this._updateButtonPositionOnScroll();
        });
        this.disposeWithMe(this._scrollSubscription);
    }

    private _handleSelectionChange(selections: ISelectionWithStyle[]): void {
        // Hide all buttons first
        this._rowResizeButton?.hide();
        this._columnResizeButton?.hide();

        // Reset current row/column
        this._currentRow = -1;
        this._currentColumn = -1;

        if (!selections || selections.length === 0) {
            return;
        }

        const selection = selections[0];
        const rangeType = selection.range.rangeType;

        // Only show resize button for row/column selections
        if (rangeType === RANGE_TYPE.ROW) {
            this._showRowResizeButton(selection);
        } else if (rangeType === RANGE_TYPE.COLUMN) {
            this._showColumnResizeButton(selection);
        }
    }

    private _showRowResizeButton(selection: ISelectionWithStyle): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton || !this._rowResizeButton) {
            return;
        }

        const { scene } = this._context;
        const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
        const { endRow } = selectionWithCoord.rangeWithCoord;

        // Position button at the bottom of the selected row(s)
        const rowEndOffset = skeleton.getOffsetByRow(endRow);
        const { rowHeaderWidth, rowHeaderWidthAndMarginLeft } = skeleton;

        const { scaleX, scaleY } = scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY);
        const buttonSize = HEADER_MENU_SHAPE_SIZE / scale;

        // Position button in the row header area, centered horizontally, aligned to bottom of row
        this._rowResizeButton.transformByState({
            left: rowHeaderWidthAndMarginLeft - rowHeaderWidth / 2 - buttonSize / 2,
            top: rowEndOffset - buttonSize / 2,
        });

        this._rowResizeButton.setShapeProps({
            size: Math.min(MAX_HEADER_MENU_SHAPE_SIZE, rowHeaderWidth / 3),
        });

        this._currentRow = endRow;
        this._rowResizeButton.show();
    }

    private _showColumnResizeButton(selection: ISelectionWithStyle): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton || !this._columnResizeButton) {
            return;
        }

        const { scene } = this._context;
        const selectionWithCoord = attachSelectionWithCoord(selection, skeleton);
        const { endColumn } = selectionWithCoord.rangeWithCoord;

        // Position button at the right edge of the selected column(s)
        const colEndOffset = skeleton.getOffsetByColumn(endColumn);
        const { columnHeaderHeight } = skeleton;

        const { scaleX, scaleY } = scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY);
        const buttonSize = HEADER_MENU_SHAPE_SIZE / scale;

        // Position button in the column header area, centered vertically, aligned to right of column
        this._columnResizeButton.transformByState({
            left: colEndOffset - buttonSize / 2,
            top: columnHeaderHeight / 2 - buttonSize / 2,
        });

        this._columnResizeButton.setShapeProps({
            size: columnHeaderHeight * 0.7,
        });

        this._currentColumn = endColumn;
        this._columnResizeButton.show();
    }

    private _updateButtonPositionOnScroll(): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton) {
            return;
        }

        const { scene } = this._context;
        const { scaleX, scaleY } = scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY);
        const buttonSize = HEADER_MENU_SHAPE_SIZE / scale;

        // Update row button position if visible - keep it at the row's bottom edge
        if (this._rowResizeButton?.visible && this._currentRow >= 0) {
            const rowEndOffset = skeleton.getOffsetByRow(this._currentRow);
            const { rowHeaderWidth, rowHeaderWidthAndMarginLeft } = skeleton;

            this._rowResizeButton.transformByState({
                left: rowHeaderWidthAndMarginLeft - rowHeaderWidth / 2 - buttonSize / 2,
                top: rowEndOffset - buttonSize / 2,
            });
        }

        // Update column button position if visible - keep it at the column's right edge
        if (this._columnResizeButton?.visible && this._currentColumn >= 0) {
            const colEndOffset = skeleton.getOffsetByColumn(this._currentColumn);
            const { columnHeaderHeight } = skeleton;

            this._columnResizeButton.transformByState({
                left: colEndOffset - buttonSize / 2,
                top: columnHeaderHeight / 2 - buttonSize / 2,
            });
        }
    }

    private _bindPointerEventsToButton(button: HeaderMenuResizeShape, type: 'row' | 'column'): void {
        this.disposeWithMe(button.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            if (evt.button !== 0) {
                return;
            }
            // Don't start resize during pinch zoom or selection expansion
            if (this._contextService.getContextValue(MOBILE_PINCH_ZOOMING)) {
                return;
            }
            if (this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)) {
                return;
            }

            this._startResize(evt, type);
        }));
    }

    private _startResize(evt: IPointerEvent | IMouseEvent, type: 'row' | 'column'): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton) {
            return;
        }

        const scene = this._context.scene;
        const engine = scene.getEngine();
        const canvasElement = engine?.getCanvasElement();
        if (!canvasElement) {
            return;
        }

        this._cancelResize();

        // Get current row/column offset
        const currentOffset = type === 'row'
            ? skeleton.getOffsetByRow(this._currentRow)
            : skeleton.getOffsetByColumn(this._currentColumn);

        // Create helper line (like desktop)
        this._createResizeHelper(type, currentOffset, skeleton);

        // Disable scene object events during drag
        scene.disableObjectsEvent();

        this._setupPointerHandlers(canvasElement, evt, type, currentOffset);
    }

    private _setupPointerHandlers(
        canvasElement: HTMLCanvasElement,
        evt: IPointerEvent | IMouseEvent,
        type: 'row' | 'column',
        initialOffset: number
    ): void {
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            this._cancelResize();
            return;
        }
        const zoomRatio = worksheet.getZoomRatio() || 1;
        const initialSize = type === 'row'
            ? worksheet.getRowHeight(this._currentRow)
            : worksheet.getColumnWidth(this._currentColumn);
        const anchor = type === 'row' ? this._currentRow : this._currentColumn;
        const pointerId = 'pointerId' in evt ? evt.pointerId : 0;
        const startX = evt.offsetX;
        const startY = evt.offsetY;
        let totalDelta = 0;

        const handlePointerMove = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) {
                return;
            }
            if (this._contextService.getContextValue(MOBILE_PINCH_ZOOMING)) {
                this._cancelResize();
                return;
            }

            const rect = canvasElement.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            // Calculate raw delta
            const rawDelta = type === 'row'
                ? (offsetY - startY)
                : (offsetX - startX);

            // Apply zoom adjustment (like mobile scroll)
            const adjustedDelta = rawDelta / zoomRatio;

            // Mark as dragging if moved enough
            if (Math.abs(adjustedDelta) >= MINIMAL_OFFSET) {
                this._isDragging = true;
            }

            if (this._isDragging) {
                totalDelta = Math.max(adjustedDelta, -initialSize);
                this._updateResizeHelper(type, initialOffset + totalDelta);
                this._updateResizeButton(type, initialOffset + totalDelta);
            }

            e.preventDefault();
        };

        const handlePointerUp = async (e: PointerEvent) => {
            if (e.pointerId !== pointerId) {
                return;
            }
            const shouldResize = this._isDragging && totalDelta !== 0;
            this._cleanupResize();
            e.preventDefault();
            // A meaningful drag can collapse a dimension smaller than MINIMAL_OFFSET.
            if (shouldResize) {
                await this._commandService.executeCommand(
                    type === 'row' ? DeltaRowHeightCommand.id : DeltaColumnWidthCommand.id,
                    type === 'row' ? { deltaY: totalDelta, anchorRow: anchor } : { deltaX: totalDelta, anchorCol: anchor }
                );
            }
        };

        this._bindResizeListeners(canvasElement, pointerId, handlePointerMove, handlePointerUp);
    }

    private _bindResizeListeners(
        canvasElement: HTMLCanvasElement,
        pointerId: number,
        handlePointerMove: (event: PointerEvent) => void,
        handlePointerUp: (event: PointerEvent) => Promise<void>
    ): void {
        const ownerDocument = canvasElement.ownerDocument;
        const ownerWindow = ownerDocument.defaultView;
        const handlePointerCancel = (e: PointerEvent) => {
            if (e.pointerId === pointerId) {
                this._cancelResize();
            }
        };
        const handlePointerDown = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) {
                this._cancelResize();
            }
        };
        const handleBlur = () => this._cancelResize();

        // Listen on the document so releasing outside the canvas also restores scene events.
        ownerDocument.addEventListener('pointermove', handlePointerMove, { passive: false });
        ownerDocument.addEventListener('pointerup', handlePointerUp);
        ownerDocument.addEventListener('pointercancel', handlePointerCancel);
        ownerDocument.addEventListener('pointerdown', handlePointerDown);
        ownerWindow?.addEventListener('blur', handleBlur);
        this._resizeListeners = toDisposable(() => {
            ownerDocument.removeEventListener('pointermove', handlePointerMove);
            ownerDocument.removeEventListener('pointerup', handlePointerUp);
            ownerDocument.removeEventListener('pointercancel', handlePointerCancel);
            ownerDocument.removeEventListener('pointerdown', handlePointerDown);
            ownerWindow?.removeEventListener('blur', handleBlur);
        });
    }

    private _createResizeHelper(type: 'row' | 'column', offset: number, skeleton: SpreadsheetSkeleton): void {
        const scene = this._context.scene;
        const { scaleX, scaleY } = scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY);
        const thumbSize = HEADER_MENU_SHAPE_THUMB_SIZE / scale;

        const engine = scene.getEngine();
        const canvasMaxWidth = engine?.width || 0;
        const canvasMaxHeight = engine?.height || 0;

        if (type === 'row') {
            this._resizeHelperShape = new Rect(MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                width: Math.max(canvasMaxWidth, skeleton.columnTotalWidth + skeleton.rowHeaderWidth),
                height: thumbSize,
                fill: MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                left: 0,
                top: offset - thumbSize / 2,
            });
        } else {
            this._resizeHelperShape = new Rect(MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                width: thumbSize,
                height: Math.max(canvasMaxHeight, skeleton.rowTotalHeight + skeleton.columnHeaderHeight),
                fill: MOBILE_HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                left: offset - thumbSize / 2,
                top: 0,
            });
        }

        scene.addObject(this._resizeHelperShape, SHEET_COMPONENT_HEADER_LAYER_INDEX);
    }

    private _updateResizeHelper(type: 'row' | 'column', newOffset: number): void {
        if (!this._resizeHelperShape) {
            return;
        }

        const scene = this._context.scene;
        const { scaleX, scaleY } = scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY);
        const thumbSize = HEADER_MENU_SHAPE_THUMB_SIZE / scale;

        if (type === 'row') {
            this._resizeHelperShape.transformByState({
                top: newOffset - thumbSize / 2,
            });
        } else {
            this._resizeHelperShape.transformByState({
                left: newOffset - thumbSize / 2,
            });
        }
    }

    private _updateResizeButton(type: 'row' | 'column', newOffset: number): void {
        const button = type === 'row' ? this._rowResizeButton : this._columnResizeButton;
        if (!button) {
            return;
        }

        const scene = this._context.scene;
        const { scaleX, scaleY } = scene.getAncestorScale();
        const scale = Math.max(scaleX, scaleY);
        const buttonSize = HEADER_MENU_SHAPE_SIZE / scale;

        if (type === 'row') {
            button.transformByState({
                top: newOffset - buttonSize / 2,
            });
        } else {
            button.transformByState({
                left: newOffset - buttonSize / 2,
            });
        }
    }

    private _cleanupResize(): void {
        this._resizeListeners?.dispose();
        this._resizeListeners = null;
        this._context.scene.enableObjectsEvent();
        this._resizeHelperShape?.dispose();
        this._resizeHelperShape = null;
        this._isDragging = false;
    }

    private _cancelResize(): void {
        if (!this._resizeHelperShape && !this._resizeListeners) {
            return;
        }
        this._cleanupResize();
        this._updateButtonPositionOnScroll();
    }
}
