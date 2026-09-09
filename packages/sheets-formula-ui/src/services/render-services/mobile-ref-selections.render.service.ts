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

import type { ICellWithCoord, IDisposable, Nullable, Workbook } from '@univerjs/core';
import type {
    IMouseEvent,
    IPointerEvent,
    IRenderContext,
    Scene,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetHeader,
    SpreadsheetSkeleton,
    Viewport,
} from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWithStyle, SheetsSelectionsService } from '@univerjs/sheets';
import { DisposableCollection, IContextService, Inject, Injector, RANGE_TYPE, ThemeService } from '@univerjs/core';
import { ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { attachSelectionWithCoord, IRefSelectionsService } from '@univerjs/sheets';
import {
    checkInHeaderRanges,
    getAllSelection,
    getCoordByOffset,
    MOBILE_EXPANDING_SELECTION,
    MOBILE_PINCH_ZOOMING,
    MobileSelectionControl,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { IShortcutService } from '@univerjs/ui';
import { RefSelectionsRenderService } from './ref-selections.render.service';

enum ExpandingControl {
    BOTTOM_RIGHT = 'bottom-right',
    TOP_LEFT = 'top-left',
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
}

class MobileRefSelectionControl extends MobileSelectionControl {
    protected override _updateLayoutOfSelectionControl(style: ISelectionStyle): void {
        super._updateLayoutOfSelectionControl(style);

        const expandCornerSize = this.currentStyle.expandCornerSize ?? 0;
        const visibleSize = expandCornerSize / 4;
        const props = {
            radius: expandCornerSize / 2,
            visualWidth: visibleSize,
            visualHeight: visibleSize,
            fill: this.currentStyle.stroke,
            stroke: this.currentStyle.widgetStroke ?? this.currentStyle.autofillStroke,
            strokeWidth: this.currentStyle.widgetStrokeWidth ?? this.currentStyle.autofillStrokeWidth,
        };

        this.expandControlTopLeft?.resize(expandCornerSize, expandCornerSize);
        this.expandControlTopLeft?.setProps(props);
        this.expandControlBottomRight?.resize(expandCornerSize, expandCornerSize);
        this.expandControlBottomRight?.setProps(props);
        this.fillControl.evented = false;
        this.fillControl.hide();
    }
}

export class MobileRefSelectionsRenderService extends RefSelectionsRenderService {
    private _expandingControlMode = ExpandingControl.BOTTOM_RIGHT;

    constructor(
        context: IRenderContext<Workbook>,
        @Inject(Injector) injector: Injector,
        @Inject(ThemeService) themeService: ThemeService,
        @IShortcutService shortcutService: IShortcutService,
        @Inject(SheetSkeletonManagerService) sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IContextService contextService: IContextService,
        @IRefSelectionsService refSelectionsService: SheetsSelectionsService
    ) {
        super(
            context,
            injector,
            themeService,
            shortcutService,
            sheetSkeletonManagerService,
            contextService,
            refSelectionsService
        );
    }

    override dispose(): void {
        this._contextService.setContextValue(MOBILE_EXPANDING_SELECTION, false);
        super.dispose();
    }

    protected override _initCanvasEventListeners(): IDisposable {
        const sheetObject = this._getSheetObject();
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;
        const { scene } = sheetObject;
        const listenerDisposables = new DisposableCollection();

        this._initSpreadsheetEvents(listenerDisposables, spreadsheet);
        this._initHeaderEvent(listenerDisposables, spreadsheetRowHeader, spreadsheet, scene, RANGE_TYPE.ROW);
        this._initHeaderEvent(listenerDisposables, spreadsheetColumnHeader, spreadsheet, scene, RANGE_TYPE.COLUMN);

        listenerDisposables.add(spreadsheetLeftTopPlaceholder.onPointerDown$.subscribeEvent((_evt, state) => {
            if (!this.inRefSelectionMode()) {
                return;
            }

            const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
            if (!skeleton) {
                return;
            }

            this._reset();
            this._addSelectionControlByModelData(getAllSelection(skeleton));
            this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
            this._selectionMoveEnd$.next(this.getSelectionDataWithStyle());
            state.stopPropagation();
        }));

        return listenerDisposables;
    }

    private _initSpreadsheetEvents(listenerDisposables: DisposableCollection, spreadsheet: Spreadsheet): void {
        const pointerDownPosition = { x: 0, y: 0 };

        listenerDisposables.add(spreadsheet.onPointerDown$.subscribeEvent((evt, state) => {
            if (!this.inRefSelectionMode() || this._contextService.getContextValue(MOBILE_PINCH_ZOOMING)) {
                return;
            }

            pointerDownPosition.x = evt.offsetX;
            pointerDownPosition.y = evt.offsetY;
            state.stopPropagation();
        }));

        listenerDisposables.add(spreadsheet.onPointerUp$.subscribeEvent((evt, state) => {
            if (!this.inRefSelectionMode() || this._contextService.getContextValue(MOBILE_PINCH_ZOOMING)) {
                return;
            }

            const tapMovementThreshold = 10;
            if (
                Math.abs(evt.offsetX - pointerDownPosition.x) > tapMovementThreshold ||
                Math.abs(evt.offsetY - pointerDownPosition.y) > tapMovementThreshold
            ) {
                return;
            }

            this._onPointerDown(evt, spreadsheet.zIndex + 1, RANGE_TYPE.NORMAL, this._getActiveViewport(evt));
            this.endSelection();
            state.stopPropagation();
        }));
    }

    private _initHeaderEvent(
        listenerDisposables: DisposableCollection,
        header: SpreadsheetHeader | SpreadsheetColumnHeader,
        spreadsheet: Spreadsheet,
        scene: Scene,
        rangeType: RANGE_TYPE.ROW | RANGE_TYPE.COLUMN
    ): void {
        listenerDisposables.add(header.onPointerDown$.subscribeEvent((evt, state) => {
            if (!this.inRefSelectionMode()) {
                return;
            }

            const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
            if (!skeleton) {
                return;
            }

            const coordinate = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
            const index = rangeType === RANGE_TYPE.ROW ? coordinate.row : coordinate.column;
            const matchSelectionData = checkInHeaderRanges(
                this._workbookSelections.getCurrentSelections(),
                index,
                rangeType
            );
            if (matchSelectionData) {
                return;
            }

            const scrollTimerType = rangeType === RANGE_TYPE.ROW ? ScrollTimerType.Y : ScrollTimerType.X;
            this._onPointerDown(
                evt,
                (spreadsheet.zIndex || 1) + 1,
                rangeType,
                this._getActiveViewport(evt),
                scrollTimerType
            );
            this.endSelection();
            state.stopPropagation();
        }));
    }

    override resetSelectionsByModelData(selectionsWithStyleList: readonly ISelectionWithStyle[]): void {
        super.resetSelectionsByModelData(
            selectionsWithStyleList.map((selection) => this._withMobileSelectionStyle(selection))
        );
    }

    override newSelectionControl(
        scene: Scene,
        skeleton: SpreadsheetSkeleton,
        selection: ISelectionWithStyle
    ): MobileSelectionControl {
        const {
            rowHeaderWidth,
            rowHeaderWidthAndMarginLeft,
            columnHeaderHeight,
            columnHeaderHeightAndMarginTop,
        } = skeleton;
        const rangeType = selection.range.rangeType ?? RANGE_TYPE.NORMAL;
        const control = new MobileRefSelectionControl(scene, this._selectionControls.length, this._themeService, {
            highlightHeader: this._highlightHeader,
            rowHeaderWidth,
            columnHeaderHeight,
            rowHeaderOffsetX: Math.max(0, rowHeaderWidthAndMarginLeft - rowHeaderWidth),
            columnHeaderOffsetY: Math.max(0, columnHeaderHeightAndMarginTop - columnHeaderHeight),
            rangeType,
        });
        const selectionWithMobileStyle = this._withMobileSelectionStyle(selection);
        const selectionWithCoord = attachSelectionWithCoord(selectionWithMobileStyle, skeleton);
        control.updateRangeBySelectionWithCoord(selectionWithCoord, skeleton);
        control.setEvent(false);
        [
            control.topLeftWidget,
            control.topCenterWidget,
            control.topRightWidget,
            control.middleLeftWidget,
            control.middleRightWidget,
            control.bottomLeftWidget,
            control.bottomCenterWidget,
            control.bottomRightWidget,
        ].forEach((widget) => {
            widget.evented = false;
        });
        this._selectionControls.push(control);

        const expandingModes = this._getExpandingModes(rangeType);
        control.expandControlTopLeft?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this._startExpandingSelection(evt, control, rangeType, expandingModes.topLeft);
        });
        control.expandControlBottomRight?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            this._startExpandingSelection(evt, control, rangeType, expandingModes.bottomRight);
        });

        return control;
    }

    private _withMobileSelectionStyle(selection: ISelectionWithStyle): ISelectionWithStyle {
        return {
            ...selection,
            style: {
                ...selection.style,
                widgets: {},
                expandCornerSize: 48,
            },
        };
    }

    private _getExpandingModes(rangeType: RANGE_TYPE): { topLeft: ExpandingControl; bottomRight: ExpandingControl } {
        if (rangeType === RANGE_TYPE.ROW) {
            return { topLeft: ExpandingControl.TOP, bottomRight: ExpandingControl.BOTTOM };
        }
        if (rangeType === RANGE_TYPE.COLUMN) {
            return { topLeft: ExpandingControl.LEFT, bottomRight: ExpandingControl.RIGHT };
        }
        return { topLeft: ExpandingControl.TOP_LEFT, bottomRight: ExpandingControl.BOTTOM_RIGHT };
    }

    private _startExpandingSelection(
        evt: IPointerEvent | IMouseEvent,
        activeSelectionControl: MobileSelectionControl,
        rangeType: RANGE_TYPE,
        expandingControlMode: ExpandingControl
    ): void {
        const scene = this._scene;
        if (!scene) {
            return;
        }

        this.setActiveSelectionIndex(this._selectionControls.indexOf(activeSelectionControl));
        this._expandingControlMode = expandingControlMode;
        this._contextService.setContextValue(MOBILE_EXPANDING_SELECTION, true);
        const anchorCell = this._changeCurrentCellWhenControlPointerDown(activeSelectionControl);
        this._startRangeWhenPointerDown = {
            ...anchorCell.mergeInfo,
            startRow: anchorCell.mergeInfo?.startRow ?? anchorCell.actualRow,
            endRow: anchorCell.mergeInfo?.endRow ?? anchorCell.actualRow,
            startColumn: anchorCell.mergeInfo?.startColumn ?? anchorCell.actualColumn,
            endColumn: anchorCell.mergeInfo?.endColumn ?? anchorCell.actualColumn,
        };
        this._selectionMoveStart$.next(this.getSelectionDataWithStyle());
        this._clearUpdatingListeners();
        this._addEndingListeners();
        scene.getTransformer()?.clearSelectedObjects();

        const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evt.offsetX, evt.offsetY]));
        this._startViewportPosX = relativeCoords.x;
        this._startViewportPosY = relativeCoords.y;
        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        this._setupPointerMoveListener(
            viewportMain,
            activeSelectionControl,
            rangeType,
            ScrollTimerType.ALL,
            relativeCoords.x,
            relativeCoords.y
        );

        this._escapeShortcutDisposable = this._shortcutService.forceEscape();
        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            this.endSelection();
            this._contextService.setContextValue(MOBILE_EXPANDING_SELECTION, false);
            this._expandingControlMode = ExpandingControl.BOTTOM_RIGHT;
        });
    }

    private _changeCurrentCellWhenControlPointerDown(activeSelectionControl: MobileSelectionControl): ICellWithCoord {
        const { startRow, startColumn, endRow, endColumn } = activeSelectionControl.model;
        let currentCell: ICellWithCoord;

        if (this._expandingControlMode === ExpandingControl.TOP_LEFT) {
            currentCell = this._skeleton.getCellWithCoordByIndex(endRow, endColumn);
        } else if (this._expandingControlMode === ExpandingControl.LEFT) {
            currentCell = this._skeleton.getCellWithCoordByIndex(startRow, endColumn);
        } else if (this._expandingControlMode === ExpandingControl.TOP) {
            currentCell = this._skeleton.getCellWithCoordByIndex(endRow, startColumn);
        } else {
            currentCell = this._skeleton.getCellWithCoordByIndex(startRow, startColumn);
        }

        if (
            this._expandingControlMode === ExpandingControl.LEFT ||
            this._expandingControlMode === ExpandingControl.RIGHT ||
            this._expandingControlMode === ExpandingControl.TOP ||
            this._expandingControlMode === ExpandingControl.BOTTOM
        ) {
            currentCell.isMerged = false;
            currentCell.isMergedMainCell = false;
        }

        activeSelectionControl.updateCurrCell(currentCell);
        return currentCell;
    }

    protected override _setupPointerMoveListener(
        viewportMain: Nullable<Viewport>,
        activeSelectionControl: MobileSelectionControl,
        rangeType: RANGE_TYPE,
        scrollTimerType: ScrollTimerType = ScrollTimerType.ALL,
        _moveStartPosX: number,
        _moveStartPosY: number
    ): void {
        this._scrollTimer = ScrollTimer.create(this._scene, scrollTimerType);
        this._scrollTimer.startScroll(viewportMain?.left ?? 0, viewportMain?.top ?? 0, viewportMain);

        const scene = this._scene;
        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            if (this._contextService.getContextValue(MOBILE_PINCH_ZOOMING)) {
                return;
            }

            const relativeCoords = scene.getCoordRelativeToViewport(
                Vector2.FromArray([moveEvt.offsetX, moveEvt.offsetY])
            );
            this._movingHandler(relativeCoords.x, relativeCoords.y, activeSelectionControl, rangeType);
            this._scrollTimer.scrolling(relativeCoords.x, relativeCoords.y, () => {
                this._movingHandler(relativeCoords.x, relativeCoords.y, activeSelectionControl, rangeType);
            });
        });
    }
}
