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

import type { IRangeWithCoord, ISelectionCellWithCoord, Nullable, ThemeService } from '@univerjs/core';
import type { IObjectFullState, IRectProps, Scene } from '@univerjs/engine-render';
import type { ISelectionStyle, ISelectionWidgetConfig, ISelectionWithCoordAndStyle } from '@univerjs/sheets';
import { ColorKit, Disposable, RANGE_TYPE, toDisposable } from '@univerjs/core';
import { cancelRequestFrame, DashedRect, FIX_ONE_PIXEL_BLUR_OFFSET, Group, Rect, requestNewFrame, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import {
    getNormalSelectionStyle,
    SELECTION_CONTROL_BORDER_BUFFER_COLOR,
    SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
} from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';

import { SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX, SHEET_COMPONENT_SELECTION_LAYER_INDEX } from '../../common/keys';
import { SelectionRenderModel } from './selection-render-model';

export enum SELECTION_MANAGER_KEY {
    Selection = '__SpreadsheetSelectionShape__',
    top = '__SpreadsheetSelectionTopControl__',
    bottom = '__SpreadsheetSelectionBottomControl__',
    left = '__SpreadsheetSelectionShapeLeftControl__',
    right = '__SpreadsheetSelectionShapeRightControl__',
    backgroundTop = '__SpreadsheetSelectionBackgroundControlTop__',
    backgroundMiddleLeft = '__SpreadsheetSelectionBackgroundControlMiddleLeft__',
    backgroundMiddleRight = '__SpreadsheetSelectionBackgroundControlMiddleRight__',
    backgroundBottom = '__SpreadsheetSelectionBackgroundControlBottom__',
    fill = '__SpreadsheetSelectionFillControl__',

    // fillTopLeft & fillBottomRight are used for mobile selection
    fillTopLeft = '__SpreadsheetSelectionFillControlTopLeft__',
    fillBottomRight = '__SpreadsheetSelectionFillControlBottomRight__',
    fillTopLeftInner = '__SpreadsheetSelectionFillControlTopLeftInner__',
    fillBottomRightInner = '__SpreadsheetSelectionFillControlBottomRightInner__',

    lineMain = '__SpreadsheetDragLineMainControl__',
    lineContent = '__SpreadsheetDragLineContentControl__',
    line = '__SpreadsheetDragLineControl__',

    dash = '__SpreadsheetDragDashControl__',

    rowHeaderBackground = '__SpreadSheetSelectionRowHeaderBackground__',
    rowHeaderBorder = '__SpreadSheetSelectionRowHeaderBorder__',
    rowHeaderGroup = '__SpreadSheetSelectionRowHeaderGroup__',
    columnHeaderBackground = '__SpreadSheetSelectionColumnHeaderBackground__',
    columnHeaderBorder = '__SpreadSheetSelectionColumnHeaderBorder__',
    columnHeaderGroup = '__SpreadSheetSelectionColumnHeaderGroup__',

    topLeftWidget = '__SpreadSheetSelectionTopLeftWidget__',
    topCenterWidget = '__SpreadSheetSelectionTopCenterWidget__',
    topRightWidget = '__SpreadSheetSelectionTopRightWidget__',
    middleLeftWidget = '__SpreadSheetSelectionMiddleLeftWidget__',
    middleRightWidget = '__SpreadSheetSelectionMiddleRightWidget__',
    bottomLeftWidget = '__SpreadSheetSelectionBottomLeftWidget__',
    bottomCenterWidget = '__SpreadSheetSelectionBottomCenterWidget__',
    bottomRightWidget = '__SpreadSheetSelectionBottomRightWidget__',
}

const SELECTION_TITLE_HIGHLIGHT_ALPHA = 0.3;

/**
 * The main selection canvas component, includes leftControl,rightControl,topControl,bottomControl,backgroundControlTop,backgroundControlMiddleLeft,backgroundControlMiddleRight,backgroundControlBottom,fillControl
 */
export class SelectionControl extends Disposable {
    private _leftBorder!: Rect;
    private _rightBorder!: Rect;
    private _topBorder!: Rect;
    private _bottomBorder!: Rect;

    private _backgroundControlTop!: Rect;
    private _backgroundControlBottom!: Rect;
    private _backgroundControlMiddleLeft!: Rect;
    private _backgroundControlMiddleRight!: Rect;

    private _fillControl: Rect;

    private _selectionShapeGroup!: Group;

    private _rowHeaderBackground!: Rect;
    private _rowHeaderBorder!: Rect;
    private _rowHeaderGroup!: Group;
    // private _rowHeaderHighlight!: Rect;
    private _columnHeaderBackground!: Rect;
    private _columnHeaderBorder!: Rect;
    private _columnHeaderGroup!: Group;
    // private _columnHeaderHighlight!: Rect;

    // for ref selection
    private _topLeftWidget!: Rect;
    private _topCenterWidget!: Rect;
    private _topRightWidget!: Rect;
    private _middleLeftWidget!: Rect;
    private _middleRightWidget!: Rect;
    private _bottomLeftWidget!: Rect;
    private _bottomCenterWidget!: Rect;
    private _bottomRightWidget!: Rect;

    private _dashedRect!: Rect;

    protected _selectionModel!: SelectionRenderModel;

    // why three style prop? what's diff between _selectionStyle & _currentStyle?
    // protected _selectionStyle: Nullable<ISelectionStyle>;
    private _defaultStyle!: ISelectionStyle;
    private _currentStyle: ISelectionStyle;

    protected _rowHeaderWidth: number = 0;
    protected _columnHeaderHeight: number = 0;

    protected _widgetRects: Rect[] = [];

    private _dispose$ = new BehaviorSubject<SelectionControl>(this);
    readonly dispose$ = this._dispose$.asObservable();

    /**
     * eventSource: selectionShapeExtension selectionMoving$.next,
     * Observer: prompt.controller
     */
    readonly selectionMoving$ = new Subject<IRangeWithCoord>();
    readonly selectionMoved$ = new Subject<IRangeWithCoord>();
    readonly selectionScaling$ = new Subject<IRangeWithCoord>();
    readonly selectionScaled$ = new Subject<Nullable<IRangeWithCoord>>();
    readonly selectionFilling$ = new Subject<Nullable<IRangeWithCoord>>();

    private readonly _selectionFilled$ = new Subject<Nullable<IRangeWithCoord>>();

    readonly selectionFilled$ = this._selectionFilled$.asObservable();

    private _isHelperSelection: boolean = true;

    constructor(
        protected _scene: Scene,
        protected _zIndex: number,
        protected readonly _themeService: ThemeService,
        protected _highlightHeader: boolean = true,
        options?: {
            rowHeaderWidth: number;
            columnHeaderHeight: number;
        }
    ) {
        super();
        this._rowHeaderWidth = (options?.rowHeaderWidth) || 0;
        this._columnHeaderHeight = (options?.columnHeaderHeight) || 0;
        this._initialize();
    }

    get zIndex(): number {
        return this._zIndex;
    }

    get leftControl(): Rect {
        return this._leftBorder;
    }

    get rightControl(): Rect {
        return this._rightBorder;
    }

    get topControl(): Rect {
        return this._topBorder;
    }

    get bottomControl(): Rect {
        return this._bottomBorder;
    }

    get fillControl(): Rect {
        return this._fillControl;
    }

    get backgroundControlTop(): Rect {
        return this._backgroundControlTop;
    }

    get backgroundControlBottom(): Rect {
        return this._backgroundControlBottom;
    }

    get backgroundControlMiddleLeft(): Rect {
        return this._backgroundControlMiddleLeft;
    }

    get backgroundControlMiddleRight(): Rect {
        return this._backgroundControlMiddleRight;
    }

    get selectionShape(): Group {
        return this._selectionShapeGroup;
    }

    get columnHeaderGroup(): Group {
        return this._columnHeaderGroup;
    }

    get rowHeaderGroup(): Group {
        return this._rowHeaderGroup;
    }

    get selectionShapeGroup(): Group {
        return this._selectionShapeGroup;
    }

    get model(): SelectionRenderModel {
        return this._selectionModel;
    }

    get topLeftWidget(): Rect {
        return this._topLeftWidget;
    }

    get topCenterWidget(): Rect {
        return this._topCenterWidget;
    }

    get topRightWidget(): Rect {
        return this._topRightWidget;
    }

    get middleLeftWidget(): Rect {
        return this._middleLeftWidget;
    }

    get middleRightWidget(): Rect {
        return this._middleRightWidget;
    }

    get bottomLeftWidget(): Rect {
        return this._bottomLeftWidget;
    }

    get bottomCenterWidget(): Rect {
        return this._bottomCenterWidget;
    }

    get bottomRightWidget(): Rect {
        return this._bottomRightWidget;
    }

    get themeService(): ThemeService {
        return this._themeService;
    }

    get selectionModel(): SelectionRenderModel {
        return this._selectionModel;
    }

    set selectionModel(model: SelectionRenderModel) {
        this._selectionModel = model;
    }

    get defaultStyle(): ISelectionStyle {
        return this._defaultStyle;
    }

    set defaultStyle(style: ISelectionStyle) {
        this._defaultStyle = style;
    }

    get dashedRect(): Rect {
        return this._dashedRect;
    }

    get currentStyle(): Nullable<ISelectionStyle> {
        return this._currentStyle;
    }

    set currentStyle(style: Nullable<ISelectionStyle>) {
        if (style) {
            this._currentStyle = style;
        }
    }

    get isHelperSelection(): boolean {
        return this._isHelperSelection;
    }

    get rowHeaderWidth(): number {
        return this._rowHeaderWidth;
    }

    set rowHeaderWidth(width: number) {
        this._rowHeaderWidth = width;
    }

    get columnHeaderHeight(): number {
        return this._columnHeaderHeight;
    }

    set columnHeaderHeight(height: number) {
        this._columnHeaderHeight = height;
    }

    setEvent(state: boolean): void {
        this.leftControl.evented = state;
        this.rightControl.evented = state;
        this.topControl.evented = state;
        this.bottomControl.evented = state;
    }

    refreshSelectionFilled(val: IRangeWithCoord): void {
        this._selectionFilled$.next(val);
    }

    /**
     * Update Control Style And Position of SelectionControl
     * @param selectionStyle
     */
    // eslint-disable-next-line max-lines-per-function
    protected _setSizeAndStyleForSelectionControl(selectionStyle: ISelectionStyle): void {
        this.currentStyle = selectionStyle;
        const defaultStyle = this._defaultStyle;
        const currentStyle = this.currentStyle;

        const {
            stroke = defaultStyle.stroke!,
            widgets = defaultStyle.widgets!,
            hasAutoFill = defaultStyle.hasAutoFill!,
            AutofillStroke = defaultStyle.AutofillStroke!,
            strokeDash,
            isAnimationDash,
        } = currentStyle;

        let {
            strokeWidth = defaultStyle.strokeWidth!,
            AutofillSize = defaultStyle.AutofillSize!,
            AutofillStrokeWidth = defaultStyle.AutofillStrokeWidth!,
        } = currentStyle;
        const scale = this._getScale();
        const leftAdjustWidth = (strokeWidth + SELECTION_CONTROL_BORDER_BUFFER_WIDTH) / 2 / scale;
        strokeWidth /= scale;
        AutofillSize /= scale;
        AutofillStrokeWidth /= scale < 1 ? 1 : scale;
        // const selectBorderOffsetFix = SELECTION_BORDER_OFFSET_FIX / scale;
        const borderBuffer = SELECTION_CONTROL_BORDER_BUFFER_WIDTH / scale;
        const fixOnePixelBlurOffset = FIX_ONE_PIXEL_BLUR_OFFSET / scale;

        // startX startY shares same coordinate with viewport.(include row & colheader)
        const { startX, startY, endX, endY } = this._selectionModel;
        this.leftControl.transformByState({
            height: endY - startY,
            left: -leftAdjustWidth + fixOnePixelBlurOffset,
            width: strokeWidth,
            strokeWidth: borderBuffer,
            top: -borderBuffer / 2 + fixOnePixelBlurOffset,
        });

        this.leftControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.rightControl.transformByState({
            height: endY - startY,
            left: endX - startX - leftAdjustWidth + fixOnePixelBlurOffset,
            width: strokeWidth,
            strokeWidth: borderBuffer,
            top: -borderBuffer / 2 + fixOnePixelBlurOffset,
        });

        this.rightControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.topControl.transformByState({
            width: endX - startX + strokeWidth,
            top: -leftAdjustWidth + fixOnePixelBlurOffset,
            left: -leftAdjustWidth + fixOnePixelBlurOffset,
            height: strokeWidth,
            strokeWidth: borderBuffer,
        });

        this.topControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.bottomControl.transformByState({
            width: endX - startX + strokeWidth,
            top: endY - startY - leftAdjustWidth + fixOnePixelBlurOffset,
            height: strokeWidth,
            left: -leftAdjustWidth + fixOnePixelBlurOffset,
            strokeWidth: borderBuffer,
        });

        this.bottomControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        if (strokeDash === null || strokeDash === undefined) {
            this.dashedRect.hide();
            this._stopAntLineAnimation();
        } else {
            const dashRectBorderWidth = currentStyle.strokeWidth * 2 / scale;
            this.dashedRect.transformByState({
                height: endY - startY,
                width: endX - startX,
                strokeWidth: dashRectBorderWidth,
                left: -dashRectBorderWidth / 2 + fixOnePixelBlurOffset,
                top: -dashRectBorderWidth / 2 + fixOnePixelBlurOffset,
            });

            this.dashedRect.setProps({
                strokeDashArray: [0, strokeDash / scale],
            });

            this._stopAntLineAnimation();

            if (isAnimationDash !== false) {
                this._startAntLineAnimation();
            }

            this.dashedRect.show();
        }

        if (hasAutoFill === true && !this._hasWidgets(widgets)) {
            const fillProps: IRectProps = {
                fill: stroke,
                stroke: AutofillStroke,
                strokeScaleEnabled: false,
            };
            const sizeState: IObjectFullState = {
                width: AutofillSize - AutofillStrokeWidth,
                height: AutofillSize - AutofillStrokeWidth,
                left: endX - startX - AutofillSize / 2 + AutofillStrokeWidth / 2 - fixOnePixelBlurOffset,
                top: endY - startY - AutofillSize / 2 + AutofillStrokeWidth / 2 - fixOnePixelBlurOffset,
                strokeWidth: AutofillStrokeWidth,
            };
            this.fillControl.setProps(fillProps);
            this.fillControl.transformByState(sizeState);
            this.fillControl.show();
        } else {
            this.fillControl.hide();
        }

        this._updateBackgroundControl(selectionStyle);
        this._updateHeaderBackground(selectionStyle);
        this._updateWidgets(selectionStyle);
    }

    /**
     * update selection control position by curr selection model
     */
    protected _refreshControlPosition(): void {
        const { startX, startY } = this._selectionModel;
        this.selectionShapeGroup.show();
        this.selectionShapeGroup.translate(startX, startY);
        this.selectionShapeGroup.makeDirtyNoDebounce(true);
    }

    updateStyle(style: ISelectionStyle): void {
        this._setSizeAndStyleForSelectionControl(style);
        this._refreshControlPosition();
    }

    /**
     * Update range, primary may be null, especially for moving handler.
     * @param range
     * @param primaryCell
     */
    updateRange(range: IRangeWithCoord, primaryCell: Nullable<ISelectionCellWithCoord>): void {
        this._selectionModel.setValue(range, primaryCell);
        this._setSizeAndStyleForSelectionControl(this._currentStyle);
        this._refreshControlPosition();
    }

    /**
     * Update selection model with new range & primary cell(aka: highlight/current), also update row/col selection size & style.
     *
     * @param newSelectionRange
     * @param rowHeaderWidth
     * @param columnHeaderHeight
     * @param style
     * @param primaryCell primary cell
     */
    update(
        newSelectionRange: IRangeWithCoord,
        rowHeaderWidth: number = 0,
        columnHeaderHeight: number = 0,
        style?: Nullable<ISelectionStyle>,
        primaryCell?: Nullable<ISelectionCellWithCoord>
    ): void {
        this._selectionModel.setValue(newSelectionRange, primaryCell);
        this._rowHeaderWidth = rowHeaderWidth;
        this._columnHeaderHeight = columnHeaderHeight;

        this._setSizeAndStyleForSelectionControl(style || this._currentStyle);
        this._refreshControlPosition();
    }

    /**
     * update primary range
     * @param primaryCell model.current (aka: highlight)
     */
    updateCurrCell(primaryCell?: Nullable<ISelectionCellWithCoord>): void {
        this._selectionModel.setCurrentCell(primaryCell);
    }

    clearHighlight(): void {
        this._selectionModel.clearCurrentCell();
        this._setSizeAndStyleForSelectionControl(this._currentStyle);
    }

    getScene(): Scene {
        return this._scene;
    }

    // eslint-disable-next-line complexity
    override dispose(): void {
        this._leftBorder?.dispose();
        this._rightBorder?.dispose();
        this._topBorder?.dispose();
        this._bottomBorder?.dispose();
        this._backgroundControlTop?.dispose();
        this._backgroundControlMiddleLeft?.dispose();
        this._backgroundControlMiddleRight?.dispose();
        this._backgroundControlBottom?.dispose();
        this._fillControl.dispose();
        this._selectionShapeGroup?.dispose();

        this._rowHeaderBackground?.dispose();
        this._rowHeaderBorder?.dispose();
        this._rowHeaderGroup?.dispose();
        this._rowHeaderBackground?.dispose();
        this._columnHeaderBackground?.dispose();
        this._columnHeaderBorder?.dispose();
        this._columnHeaderGroup?.dispose();

        this._topLeftWidget?.dispose();
        this._topCenterWidget?.dispose();
        this._topRightWidget?.dispose();
        this._middleLeftWidget?.dispose();
        this._middleRightWidget?.dispose();
        this._bottomLeftWidget?.dispose();
        this._bottomCenterWidget?.dispose();
        this._bottomRightWidget?.dispose();

        super.dispose();

        this._dispose$.next(this);
        this._dispose$.complete();
    }

    /**
     * Get the cell information of the current selection, considering the case of merging cells
     */
    getCurrentCellInfo(): Nullable<IRangeWithCoord> {
        const currentCell = this.model.currentCell;

        if (currentCell) {
            let currentRangeData: IRangeWithCoord;

            if (currentCell.isMerged) {
                const mergeInfo = currentCell.mergeInfo;

                currentRangeData = {
                    startRow: mergeInfo.startRow,
                    endRow: mergeInfo.endRow,
                    startColumn: mergeInfo.startColumn,
                    endColumn: mergeInfo.endColumn,
                    startX: mergeInfo.startX,
                    endX: mergeInfo.endX,
                    startY: mergeInfo.startY,
                    endY: mergeInfo.endY,
                };
            } else {
                const { actualRow, actualColumn, startX, endX, startY, endY } = currentCell;
                currentRangeData = {
                    startRow: actualRow,
                    endRow: actualRow,
                    startColumn: actualColumn,
                    endColumn: actualColumn,
                    startX,
                    endX,
                    startY,
                    endY,
                };
            }

            return currentRangeData;
        }
    }

    getValue(): ISelectionWithCoordAndStyle {
        return {
            ...this._selectionModel.getValue(),
            style: this._currentStyle,
        };
    }

    getRange(): IRangeWithCoord {
        return this._selectionModel.getValue().rangeWithCoord;
    }

    enableHelperSelection(): void {
        this._isHelperSelection = true;
    }

    disableHelperSelection(): void {
        this._isHelperSelection = false;
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialize(): void {
        this._defaultStyle = getNormalSelectionStyle(this._themeService);
        this._currentStyle = getNormalSelectionStyle(this._themeService);

        this._selectionModel = new SelectionRenderModel();
        const zIndex = this._zIndex;
        this._leftBorder = new Rect(SELECTION_MANAGER_KEY.left + zIndex, {
            zIndex,
        });

        this._rightBorder = new Rect(SELECTION_MANAGER_KEY.right + zIndex, {
            zIndex,
        });

        this._topBorder = new Rect(SELECTION_MANAGER_KEY.top + zIndex, {
            zIndex,
        });

        this._bottomBorder = new Rect(SELECTION_MANAGER_KEY.bottom + zIndex, {
            zIndex,
        });

        this._backgroundControlTop = new Rect(SELECTION_MANAGER_KEY.backgroundTop + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._backgroundControlBottom = new Rect(SELECTION_MANAGER_KEY.backgroundBottom + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._backgroundControlMiddleLeft = new Rect(SELECTION_MANAGER_KEY.backgroundMiddleLeft + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });
        this._backgroundControlMiddleRight = new Rect(SELECTION_MANAGER_KEY.backgroundMiddleRight + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        // size of fillControl is set in _updateControlStyleAndLayout(), because control size(visual size) stays same when zoom change.
        // The size of control is not a const value, so it was handled by _updateWidgets() & _updateControlStyleAndLayout()
        this._fillControl = new Rect(SELECTION_MANAGER_KEY.fill + zIndex, {
            zIndex: zIndex + 1,
        });

        // That weird, new Dashedrect should called when strokeDash. not every selectionControl need dashedRect.
        // strokeDash === null || strokeDash === undefined ---> _dashRect.hide()
        this._dashedRect = new DashedRect(SELECTION_MANAGER_KEY.dash + zIndex, {
            zIndex: zIndex + 2,
            evented: false,
            stroke: '#fff',
        });

        const shapes = [
            this._fillControl,
            this._leftBorder, this._rightBorder, this._topBorder, this._bottomBorder,
            this._backgroundControlTop, this._backgroundControlMiddleLeft,
            this._backgroundControlMiddleRight, this._backgroundControlBottom,
            this._dashedRect,
        ];

        this._widgetRects = this._initialWidget();
        this._selectionShapeGroup = new Group(SELECTION_MANAGER_KEY.Selection + zIndex, ...shapes, ...this._widgetRects);
        this._selectionShapeGroup.hide();
        this._selectionShapeGroup.evented = false;
        this._selectionShapeGroup.zIndex = zIndex;

        const scene = this.getScene();
        scene.addObject(this._selectionShapeGroup, SHEET_COMPONENT_SELECTION_LAYER_INDEX);

        this.disposeWithMe(
            toDisposable(
                scene.onTransformChange$.subscribeEvent((state) => {
                    if (state.type !== TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale) {
                        return;
                    }

                    this._setSizeAndStyleForSelectionControl(this._currentStyle);
                    this._refreshControlPosition();
                })
            )
        );

        this._initialHeader();
    }

    private _initialHeader(): void {
        const zIndex = this._zIndex;
        this._rowHeaderBackground = new Rect(SELECTION_MANAGER_KEY.rowHeaderBackground + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._rowHeaderBorder = new Rect(SELECTION_MANAGER_KEY.rowHeaderBorder + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._rowHeaderGroup = new Group(
            SELECTION_MANAGER_KEY.rowHeaderGroup + zIndex,
            this._rowHeaderBackground,
            this._rowHeaderBorder
        );

        this._rowHeaderGroup.hide();
        this._rowHeaderGroup.evented = false;
        this._rowHeaderGroup.zIndex = zIndex;

        this._columnHeaderBackground = new Rect(SELECTION_MANAGER_KEY.columnHeaderBackground + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._columnHeaderBorder = new Rect(SELECTION_MANAGER_KEY.columnHeaderBorder + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._columnHeaderGroup = new Group(
            SELECTION_MANAGER_KEY.columnHeaderGroup + zIndex,
            this._columnHeaderBackground,
            this._columnHeaderBorder
        );

        this._columnHeaderGroup.hide();
        this._columnHeaderGroup.evented = false;
        this._columnHeaderGroup.zIndex = zIndex;

        const scene = this.getScene();
        scene.addObjects([this._rowHeaderGroup, this._columnHeaderGroup], SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX);
    }

    private _initialWidget(): Rect[] {
        const zIndex = this._zIndex;
        this._topLeftWidget = new Rect(SELECTION_MANAGER_KEY.topLeftWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._topCenterWidget = new Rect(SELECTION_MANAGER_KEY.topCenterWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._topRightWidget = new Rect(SELECTION_MANAGER_KEY.topRightWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._middleLeftWidget = new Rect(SELECTION_MANAGER_KEY.middleLeftWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._middleRightWidget = new Rect(SELECTION_MANAGER_KEY.middleRightWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._bottomLeftWidget = new Rect(SELECTION_MANAGER_KEY.bottomLeftWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._bottomCenterWidget = new Rect(SELECTION_MANAGER_KEY.bottomCenterWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        this._bottomRightWidget = new Rect(SELECTION_MANAGER_KEY.bottomRightWidget + zIndex, {
            zIndex: zIndex + 1,
        });

        return [
            this._topLeftWidget,
            this._topCenterWidget,
            this._topRightWidget,
            this._middleLeftWidget,
            this._middleRightWidget,
            this._bottomLeftWidget,
            this._bottomCenterWidget,
            this._bottomRightWidget,
        ];
    }

    private _updateHeaderBackground(style: Nullable<ISelectionStyle>): void {
        const { startX, startY, endX, endY, rangeType } = this._selectionModel;
        const defaultStyle = this._defaultStyle;

        if (style == null) {
            style = defaultStyle;
        }

        const scale = this._getScale();

        const {
            stroke, hasRowHeader, rowHeaderFill = defaultStyle.rowHeaderFill!, rowHeaderStroke = defaultStyle.rowHeaderStroke!,
            hasColumnHeader, columnHeaderFill = defaultStyle.columnHeaderFill!, columnHeaderStroke = defaultStyle.columnHeaderStroke!,
        } = style;

        let {
            rowHeaderStrokeWidth = defaultStyle.rowHeaderStrokeWidth!,

            columnHeaderStrokeWidth = defaultStyle.columnHeaderStrokeWidth!,
        } = style;

        rowHeaderStrokeWidth /= scale;
        columnHeaderStrokeWidth /= scale;
        const rowHeaderWidth = this._rowHeaderWidth;
        const columnHeaderHeight = this._columnHeaderHeight;

        if (hasColumnHeader === true) {
            let highlightTitleColor = columnHeaderFill;
            if (this._highlightHeader && rangeType === RANGE_TYPE.COLUMN) {
                highlightTitleColor = new ColorKit(stroke).setAlpha(SELECTION_TITLE_HIGHLIGHT_ALPHA).toString();
            }
            this._columnHeaderBackground.setProps({
                fill: highlightTitleColor,
            });
            this._columnHeaderBackground.resize(endX - startX, columnHeaderHeight);

            this._columnHeaderBorder.setProps({
                fill: columnHeaderStroke,
            });
            this._columnHeaderBorder.transformByState({
                width: endX - startX,
                height: columnHeaderStrokeWidth,
                top: columnHeaderHeight - columnHeaderStrokeWidth + 1 / scale,
            });

            this._columnHeaderGroup.show();
            this._columnHeaderGroup.translate(startX, 0);
        } else {
            this._columnHeaderGroup.hide();
        }

        this._columnHeaderGroup.makeDirty(true);

        if (hasRowHeader === true) {
            let highlightTitleColor = rowHeaderFill;
            if (this._highlightHeader && rangeType === RANGE_TYPE.ROW) {
                highlightTitleColor = new ColorKit(stroke).setAlpha(SELECTION_TITLE_HIGHLIGHT_ALPHA).toString();
            }
            this._rowHeaderBackground.setProps({
                fill: highlightTitleColor,
            });
            this._rowHeaderBackground.resize(rowHeaderWidth, endY - startY);

            this._rowHeaderBorder.setProps({
                fill: rowHeaderStroke,
            });
            this._rowHeaderBorder.transformByState({
                width: rowHeaderStrokeWidth,
                height: endY - startY,
                left: rowHeaderWidth - rowHeaderStrokeWidth + 1 / scale,
            });

            this._rowHeaderGroup.show();
            this._rowHeaderGroup.translate(0, startY);
        } else {
            this._rowHeaderGroup.hide();
        }

        this._rowHeaderGroup.makeDirty(true);
    }

    private _updateBackgroundControl(style: Nullable<ISelectionStyle>): void {
        const { startX, startY, endX, endY } = this._selectionModel;

        const defaultStyle = this._defaultStyle;

        if (style == null) {
            style = defaultStyle;
        }

        const scale = this._getScale();
        const { fill = defaultStyle.fill! } = style;
        let { strokeWidth = defaultStyle.strokeWidth! } = style;
        strokeWidth /= scale;
        const highlightSelection = this._selectionModel.highlightToSelection();

        if (!highlightSelection) {
            this._backgroundControlTop.resize(endX - startX, endY - startY);
            this._backgroundControlTop.setProps({ fill });
            this._backgroundControlBottom.resize(0, 0);
            this._backgroundControlMiddleLeft.resize(0, 0);
            this._backgroundControlMiddleRight.resize(0, 0);
            return;
        }

        const { startX: h_startX, startY: h_startY, endX: h_endX, endY: h_endY } = highlightSelection;
        const strokeOffset = strokeWidth / 2;

        const topConfig = {
            left: -strokeOffset,
            top: -strokeOffset,
            width: endX - startX + strokeOffset * 2,
            height: h_startY - startY + strokeOffset,
        };
        if (topConfig.height < 0) {
            topConfig.width = 0;
            topConfig.height = 0;
        }
        this._backgroundControlTop.transformByState(topConfig);

        const middleLeftConfig = {
            left: -strokeOffset,
            top: h_startY - startY,
            width: h_startX - startX + strokeOffset,
            height: h_endY - h_startY,
        };
        if (middleLeftConfig.width < 0) {
            middleLeftConfig.width = 0;
            middleLeftConfig.height = 0;
        }
        this._backgroundControlMiddleLeft.transformByState(middleLeftConfig);

        const middleRightConfig = {
            left: h_endX - startX - strokeOffset,
            top: h_startY - startY,
            width: endX - h_endX + strokeOffset * 2,
            height: h_endY - h_startY,
        };
        if (middleRightConfig.width < 0) {
            middleRightConfig.width = 0;
            middleRightConfig.height = 0;
        }
        this._backgroundControlMiddleRight.transformByState(middleRightConfig);

        const middleBottomConfig = {
            left: -strokeOffset,
            top: h_endY - startY,
            width: endX - startX + strokeOffset * 2,
            height: endY - h_endY + strokeOffset,
        };
        if (middleBottomConfig.height < 0) {
            middleBottomConfig.width = 0;
            middleBottomConfig.height = 0;
        }
        this._backgroundControlBottom.transformByState(middleBottomConfig);

        this._backgroundControlTop.setProps({ fill });
        this._backgroundControlMiddleLeft.setProps({ fill });
        this._backgroundControlMiddleRight.setProps({ fill });
        this._backgroundControlBottom.setProps({ fill });
    }

    private _updateWidgets(style: Nullable<ISelectionStyle>): void {
        const { startX, startY, endX, endY } = this._selectionModel;
        const defaultStyle = this._defaultStyle;

        if (style == null) {
            style = defaultStyle;
        }

        const { stroke = defaultStyle.stroke!, widgets = defaultStyle.widgets!, widgetStroke = defaultStyle.widgetStroke! } = style;
        const scale = this._getScale();
        let { widgetSize = defaultStyle.widgetSize!, widgetStrokeWidth = defaultStyle.widgetStrokeWidth! } = style;

        widgetSize /= scale;
        widgetStrokeWidth /= scale;

        const position = { left: -widgetSize / 2 + widgetStrokeWidth / 2, center: (endX - startX) / 2 - widgetSize / 2 + widgetStrokeWidth / 2, right: endX - startX - widgetSize / 2 + widgetStrokeWidth / 2, top: -widgetSize / 2, middle: (endY - startY) / 2 - widgetSize / 2, bottom: endY - startY - widgetSize / 2 + widgetStrokeWidth / 2 };
        const size = widgetSize - widgetStrokeWidth;

        this._widgetRects.forEach((widget) => {
            widget.setProps({ fill: stroke, stroke: widgetStroke });
        });

        if (widgets.tl === true) {
            this._topLeftWidget.transformByState({ height: size, width: size, left: position.left, top: position.top, strokeWidth: widgetStrokeWidth });
            this._topLeftWidget.show();
        } else {
            this._topLeftWidget.hide();
        }

        if (widgets.tc === true) {
            this._topCenterWidget.transformByState({ height: size, width: size, left: position.center, top: position.top, strokeWidth: widgetStrokeWidth });
            this._topCenterWidget.show();
        } else {
            this._topCenterWidget.hide();
        }

        if (widgets.tr === true) {
            this._topRightWidget.transformByState({ height: size, width: size, left: position.right, top: position.top, strokeWidth: widgetStrokeWidth });
            this._topRightWidget.show();
        } else {
            this._topRightWidget.hide();
        }

        if (widgets.ml === true) {
            this._middleLeftWidget.transformByState({ height: size, width: size, left: position.left, top: position.middle, strokeWidth: widgetStrokeWidth });
            this._middleLeftWidget.show();
        } else {
            this._middleLeftWidget.hide();
        }

        if (widgets.mr === true) {
            this._middleRightWidget.transformByState({ height: size, width: size, left: position.right, top: position.middle, strokeWidth: widgetStrokeWidth });
            this._middleRightWidget.show();
        } else {
            this._middleRightWidget.hide();
        }

        if (widgets.bl === true) {
            this._bottomLeftWidget.transformByState({ height: size, width: size, left: position.left, top: position.bottom, strokeWidth: widgetStrokeWidth });
            this._bottomLeftWidget.show();
        } else {
            this._bottomLeftWidget.hide();
        }

        if (widgets.bc === true) {
            this._bottomCenterWidget.transformByState({ height: size, width: size, left: position.center, top: position.bottom, strokeWidth: widgetStrokeWidth });
            this._bottomCenterWidget.show();
        } else {
            this._bottomCenterWidget.hide();
        }

        if (widgets.br === true) {
            this._bottomRightWidget.transformByState({ height: size, width: size, left: position.right, top: position.bottom, strokeWidth: widgetStrokeWidth });
            this._bottomRightWidget.show();
        } else {
            this._bottomRightWidget.hide();
        }
    }

    protected _hasWidgets(widgets: ISelectionWidgetConfig): boolean {
        if (widgets == null) {
            return false;
        }

        const keys = Object.keys(widgets);

        if (keys.length === 0) {
            return false;
        }

        for (const key of keys) {
            if (widgets[key as keyof ISelectionWidgetConfig] === true) {
                return true;
            }
        }

        return true;
    }

    private _getScale(): number {
        const { scaleX, scaleY } = this._scene.getAncestorScale();
        return Math.max(scaleX, scaleY);
    }

    private _antLineOffset = 0;

    private _antRequestNewFrame: number = -1;

    private _stopAntLineAnimation(): void {
        this._antLineOffset = 0;
        cancelRequestFrame(this._antRequestNewFrame);
    }

    private _startAntLineAnimation(): void {
        const scale = this._getScale();
        this._antLineOffset += 0.6 / scale;
        if (this._antLineOffset > 160 / scale) {
            this._antLineOffset = 0;
        }
        this.dashedRect.setProps({
            strokeDashOffset: -this._antLineOffset,
        });
        this._antRequestNewFrame = requestNewFrame(() => {
            this._startAntLineAnimation();
        });
    }
}
