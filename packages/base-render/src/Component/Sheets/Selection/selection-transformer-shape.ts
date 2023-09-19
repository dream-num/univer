import { ISelectionCellWithCoord, ISelectionRangeWithCoord, Nullable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

import { SELECTION_TYPE } from '../../../Basics/Const';
import {
    ISelectionDataWithStyle,
    ISelectionStyle,
    ISelectionWidgetConfig,
    NORMAL_SELECTION_PLUGIN_STYLE,
    SELECTION_CONTROL_BORDER_BUFFER_COLOR,
    SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
} from '../../../Basics/Selection';
import { Group } from '../../../Group';
import { Scene } from '../../../Scene';
import { Rect } from '../../../Shape/Rect';
import { SelectionTransformerModel } from './selection-transformer-model';

enum SELECTION_MANAGER_KEY {
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
    lineMain = '__SpreadsheetDragLineMainControl__',
    lineContent = '__SpreadsheetDragLineContentControl__',
    line = '__SpreadsheetDragLineControl__',

    rowTitleBackground = '__SpreadSheetSelectionRowTitleBackground__',
    rowTitleBorder = '__SpreadSheetSelectionRowTitleBorder__',
    rowTitleGroup = '__SpreadSheetSelectionRowTitleGroup__',
    columnTitleBackground = '__SpreadSheetSelectionColumnTitleBackground__',
    columnTitleBorder = '__SpreadSheetSelectionColumnTitleBorder__',
    columnTitleGroup = '__SpreadSheetSelectionColumnTitleGroup__',

    topLeftWidget = '__SpreadSheetSelectionTopLeftWidget__',
    topCenterWidget = '__SpreadSheetSelectionTopCenterWidget__',
    topRightWidget = '__SpreadSheetSelectionTopRightWidget__',
    middleLeftWidget = '__SpreadSheetSelectionMiddleLeftWidget__',
    middleRightWidget = '__SpreadSheetSelectionMiddleRightWidget__',
    bottomLeftWidget = '__SpreadSheetSelectionBottomLeftWidget__',
    bottomCenterWidget = '__SpreadSheetSelectionBottomCenterWidget__',
    bottomRightWidget = '__SpreadSheetSelectionBottomRightWidget__',
}

/**
 * The main selection canvas component
 */
export class SelectionTransformerShape {
    private _leftControl: Rect;

    private _rightControl: Rect;

    private _topControl: Rect;

    private _bottomControl: Rect;

    private _backgroundControlTop: Rect;

    private _backgroundControlBottom: Rect;

    private _backgroundControlMiddleLeft: Rect;

    private _backgroundControlMiddleRight: Rect;

    private _fillControl: Rect;

    private _selectionShape: Group;

    private _rowTitleBackground: Rect;

    private _rowTitleBorder: Rect;

    private _rowTitleGroup: Group;

    private _columnTitleBackground: Rect;

    private _columnTitleBorder: Rect;

    private _columnTitleGroup: Group;

    private _topLeftWidget: Rect;

    private _topCenterWidget: Rect;

    private _topRightWidget: Rect;

    private _middleLeftWidget: Rect;

    private _middleRightWidget: Rect;

    private _bottomLeftWidget: Rect;

    private _bottomCenterWidget: Rect;

    private _bottomRightWidget: Rect;

    private _selectionModel: SelectionTransformerModel;

    private _selectionStyle: Nullable<ISelectionStyle>;

    private _rowTitleWidth: number = 0;

    private _columnTitleHeight: number = 0;

    private _widgetRects: Rect[] = [];

    private _dispose$ = new BehaviorSubject<SelectionTransformerShape>(this);

    readonly dispose$ = this._dispose$.asObservable();

    readonly selectionMoving$ = new BehaviorSubject<Nullable<ISelectionRangeWithCoord>>(null);

    readonly selectionMoved$ = new BehaviorSubject<Nullable<ISelectionRangeWithCoord>>(null);

    readonly selectionScaling$ = new BehaviorSubject<Nullable<ISelectionRangeWithCoord>>(null);

    readonly selectionScaled$ = new BehaviorSubject<Nullable<ISelectionRangeWithCoord>>(null);

    readonly selectionFilling$ = new BehaviorSubject<Nullable<ISelectionRangeWithCoord>>(null);

    readonly selectionFilled$ = new BehaviorSubject<Nullable<ISelectionRangeWithCoord>>(null);

    constructor(private _scene: Scene, private _zIndex: number) {
        this._initialize();
    }

    get zIndex() {
        return this._zIndex;
    }

    get leftControl() {
        return this._leftControl;
    }

    get rightControl() {
        return this._rightControl;
    }

    get topControl() {
        return this._topControl;
    }

    get bottomControl() {
        return this._bottomControl;
    }

    get fillControl() {
        return this._fillControl;
    }

    get backgroundControlTop() {
        return this._backgroundControlTop;
    }

    get backgroundControlBottom() {
        return this._backgroundControlBottom;
    }

    get backgroundControlMiddleLeft() {
        return this._backgroundControlMiddleLeft;
    }

    get backgroundControlMiddleRight() {
        return this._backgroundControlMiddleRight;
    }

    get selectionShape() {
        return this._selectionShape;
    }

    get model() {
        return this._selectionModel;
    }

    get topLeftWidget() {
        return this._topLeftWidget;
    }

    get topCenterWidget() {
        return this._topCenterWidget;
    }

    get topRightWidget() {
        return this._topRightWidget;
    }

    get middleLeftWidget() {
        return this._middleLeftWidget;
    }

    get middleRightWidget() {
        return this._middleRightWidget;
    }

    get bottomLeftWidget() {
        return this._bottomLeftWidget;
    }

    get bottomCenterWidget() {
        return this._bottomCenterWidget;
    }

    get bottomRightWidget() {
        return this._bottomRightWidget;
    }

    get selectionStyle() {
        return this._selectionStyle;
    }

    static create(scene: Scene, zIndex: number) {
        return new this(scene, zIndex);
    }

    static fromJson(scene: Scene, zIndex: number, newSelectionData: ISelectionDataWithStyle, rowTitleWidth: number, columnTitleHeight: number) {
        const { selection, cellInfo, style } = newSelectionData;
        const control = SelectionTransformerShape.create(scene, zIndex);
        control.update(selection, rowTitleWidth, columnTitleHeight, style, cellInfo);
        return control;
    }

    /**
     * just handle the view
     *
     * inner update
     */
    _updateControl(style: Nullable<ISelectionStyle>, rowTitleWidth: number, columnTitleHeight: number) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const {
            strokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.strokeWidth!,
            stroke = NORMAL_SELECTION_PLUGIN_STYLE.stroke!,
            widgets = NORMAL_SELECTION_PLUGIN_STYLE.widgets!,
            hasAutoFill = NORMAL_SELECTION_PLUGIN_STYLE.hasAutoFill!,
            AutofillSize = NORMAL_SELECTION_PLUGIN_STYLE.AutofillSize!,
            AutofillStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.AutofillStrokeWidth!,
            AutofillStroke = NORMAL_SELECTION_PLUGIN_STYLE.AutofillStroke!,
        } = style;

        const leftAdjustWidth = strokeWidth + SELECTION_CONTROL_BORDER_BUFFER_WIDTH;

        this.leftControl.transformByState({
            height: endY - startY,
            left: -leftAdjustWidth / 2,
            width: strokeWidth,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
            top: -SELECTION_CONTROL_BORDER_BUFFER_WIDTH / 2,
        });

        this.leftControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.rightControl.transformByState({
            height: endY - startY,
            left: endX - startX - leftAdjustWidth / 2,
            width: strokeWidth,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
            top: -SELECTION_CONTROL_BORDER_BUFFER_WIDTH / 2,
        });

        this.rightControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.topControl.transformByState({
            width: endX - startX + strokeWidth,
            top: -leftAdjustWidth / 2,
            left: -leftAdjustWidth / 2,
            height: strokeWidth,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
        });

        this.topControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        this.bottomControl.transformByState({
            width: endX - startX + strokeWidth,
            top: endY - startY - leftAdjustWidth / 2,
            height: strokeWidth,
            left: -leftAdjustWidth / 2,
            strokeWidth: SELECTION_CONTROL_BORDER_BUFFER_WIDTH,
        });

        this.bottomControl.setProps({
            fill: stroke,
            stroke: SELECTION_CONTROL_BORDER_BUFFER_COLOR,
        });

        if (hasAutoFill === true && !this._hasWidgets(widgets)) {
            this.fillControl.setProps({
                fill: stroke,
                stroke: AutofillStroke,
            });
            this.fillControl.transformByState({
                width: AutofillSize - AutofillStrokeWidth,
                height: AutofillSize - AutofillStrokeWidth,
                left: endX - startX - AutofillSize / 2,
                top: endY - startY - AutofillSize / 2,
                strokeWidth: AutofillStrokeWidth,
            });
            this.fillControl.show();
        } else {
            this.fillControl.hide();
        }

        this._updateBackgroundControl(style);

        this._updateBackgroundTitle(style, rowTitleWidth, columnTitleHeight);

        this._updateWidgets(style);

        this.selectionShape.show();
        this.selectionShape.translate(startX, startY);

        this._selectionStyle = style;

        this._rowTitleWidth = rowTitleWidth || 0;

        this._columnTitleHeight = columnTitleHeight || 0;

        this.selectionShape.makeDirty(true);
    }

    update(
        newSelectionRange: ISelectionRangeWithCoord,
        rowTitleWidth: number,
        columnTitleHeight: number,
        style: Nullable<ISelectionStyle> = NORMAL_SELECTION_PLUGIN_STYLE,
        highlight: Nullable<ISelectionCellWithCoord>
    ) {
        this._selectionModel.setValue(newSelectionRange, highlight);
        if (style == null) {
            style = this._selectionStyle;
        }
        this._updateControl(style, rowTitleWidth, columnTitleHeight);
    }

    clearHighlight() {
        this._selectionModel.clearCurrentCell();
        this._updateControl(this._selectionStyle, this._rowTitleWidth, this._columnTitleHeight);
    }

    getScene() {
        return this._scene;
    }

    dispose() {
        this._leftControl?.dispose();
        this._rightControl?.dispose();
        this._topControl?.dispose();
        this._bottomControl?.dispose();
        this._backgroundControlTop?.dispose();
        this._backgroundControlMiddleLeft?.dispose();
        this._backgroundControlMiddleRight?.dispose();
        this._backgroundControlBottom?.dispose();
        this._fillControl?.dispose();
        this._selectionShape?.dispose();

        this._rowTitleBackground?.dispose();

        this._rowTitleBorder?.dispose();

        this._rowTitleGroup?.dispose();

        this._columnTitleBackground?.dispose();

        this._columnTitleBorder?.dispose();

        this._columnTitleGroup?.dispose();

        this._topLeftWidget?.dispose();

        this._topCenterWidget?.dispose();

        this._topRightWidget?.dispose();

        this._middleLeftWidget?.dispose();

        this._middleRightWidget?.dispose();

        this._bottomLeftWidget?.dispose();

        this._bottomCenterWidget?.dispose();

        this._bottomRightWidget?.dispose();

        this._dispose$.next(this);

        this._dispose$.complete();
    }

    /**
     * Get the cell information of the current selection, considering the case of merging cells
     */
    getCurrentCellInfo(): Nullable<ISelectionRangeWithCoord> {
        const currentCell = this.model.currentCell;

        if (currentCell) {
            let currentRangeData: ISelectionRangeWithCoord;

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
                const { row, column, startX, endX, startY, endY } = currentCell;
                currentRangeData = {
                    startRow: row,
                    endRow: row,
                    startColumn: column,
                    endColumn: column,
                    startX,
                    endX,
                    startY,
                    endY,
                };
            }

            return currentRangeData;
        }
    }

    getValue(): ISelectionDataWithStyle {
        return {
            ...this._selectionModel.getValue(),
            style: this._selectionStyle,
        };
    }

    private _initialize() {
        this._selectionModel = new SelectionTransformerModel(SELECTION_TYPE.NORMAL);
        const zIndex = this._zIndex;
        this._leftControl = new Rect(SELECTION_MANAGER_KEY.left + zIndex, {
            zIndex,
        });

        this._rightControl = new Rect(SELECTION_MANAGER_KEY.right + zIndex, {
            zIndex,
        });

        this._topControl = new Rect(SELECTION_MANAGER_KEY.top + zIndex, {
            zIndex,
        });

        this._bottomControl = new Rect(SELECTION_MANAGER_KEY.bottom + zIndex, {
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

        this._fillControl = new Rect(SELECTION_MANAGER_KEY.fill + zIndex, {
            zIndex: zIndex + 1,
        });

        const shapes = [
            this._fillControl,
            this._leftControl,
            this._rightControl,
            this._topControl,
            this._bottomControl,
            this._backgroundControlTop,
            this._backgroundControlMiddleLeft,
            this._backgroundControlMiddleRight,
            this._backgroundControlBottom,
        ];

        this._widgetRects = this._initialWidget();

        this._selectionShape = new Group(SELECTION_MANAGER_KEY.Selection + zIndex, ...shapes, ...this._widgetRects);

        this._selectionShape.hide();

        this._selectionShape.evented = false;

        this._selectionShape.zIndex = zIndex;

        const scene = this.getScene();
        scene.addObject(this._selectionShape);

        this._initialTitle();
    }

    private _initialTitle() {
        const zIndex = this._zIndex;
        this._rowTitleBackground = new Rect(SELECTION_MANAGER_KEY.rowTitleBackground + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._rowTitleBorder = new Rect(SELECTION_MANAGER_KEY.rowTitleBorder + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._rowTitleGroup = new Group(SELECTION_MANAGER_KEY.rowTitleGroup + zIndex, this._rowTitleBackground, this._rowTitleBorder);

        this._rowTitleGroup.hide();

        this._rowTitleGroup.evented = false;

        this._rowTitleGroup.zIndex = zIndex;

        this._columnTitleBackground = new Rect(SELECTION_MANAGER_KEY.columnTitleBackground + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._columnTitleBorder = new Rect(SELECTION_MANAGER_KEY.columnTitleBorder + zIndex, {
            zIndex: zIndex - 1,
            evented: false,
        });

        this._columnTitleGroup = new Group(SELECTION_MANAGER_KEY.columnTitleGroup + zIndex, this._columnTitleBackground, this._columnTitleBorder);

        this._columnTitleGroup.hide();

        this._columnTitleGroup.evented = false;

        this._columnTitleGroup.zIndex = zIndex;

        const scene = this.getScene();
        const maxLayerIndex = scene.getLayerMaxZIndex();
        scene.addObjects([this._rowTitleGroup, this._columnTitleGroup], maxLayerIndex);
    }

    private _initialWidget() {
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

    private _updateBackgroundTitle(style: Nullable<ISelectionStyle>, rowTitleWidth: number, columnTitleHeight: number) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const {
            hasRowTitle,
            rowTitleFill = NORMAL_SELECTION_PLUGIN_STYLE.rowTitleFill!,
            rowTitleStroke = NORMAL_SELECTION_PLUGIN_STYLE.rowTitleStroke!,
            rowTitleStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.rowTitleStrokeWidth!,

            hasColumnTitle,
            columnTitleFill = NORMAL_SELECTION_PLUGIN_STYLE.columnTitleFill!,
            columnTitleStroke = NORMAL_SELECTION_PLUGIN_STYLE.columnTitleStroke!,
            columnTitleStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.columnTitleStrokeWidth!,
        } = style;

        if (hasColumnTitle === true) {
            this._columnTitleBackground.setProps({
                fill: columnTitleFill,
            });
            this._columnTitleBackground.resize(endX - startX, columnTitleHeight);

            this._columnTitleBorder.setProps({
                fill: columnTitleStroke,
            });
            this._columnTitleBorder.transformByState({
                width: endX - startX,
                height: columnTitleStrokeWidth,
                top: columnTitleHeight - columnTitleStrokeWidth,
            });

            this._columnTitleGroup.show();
            this._columnTitleGroup.translate(startX, 0);
        } else {
            this._columnTitleGroup.hide();
        }

        this._columnTitleGroup.makeDirty(true);

        if (hasRowTitle === true) {
            this._rowTitleBackground.setProps({
                fill: rowTitleFill,
            });
            this._rowTitleBackground.resize(rowTitleWidth, endY - startY);

            this._rowTitleBorder.setProps({
                fill: rowTitleStroke,
            });
            this._rowTitleBorder.transformByState({
                width: rowTitleStrokeWidth,
                height: endY - startY,
                left: rowTitleWidth - rowTitleStrokeWidth,
            });

            this._rowTitleGroup.show();
            this._rowTitleGroup.translate(0, startY);
        } else {
            this._rowTitleGroup.hide();
        }

        this._rowTitleGroup.makeDirty(true);
    }

    private _updateBackgroundControl(style: Nullable<ISelectionStyle>) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const { strokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.strokeWidth!, fill = NORMAL_SELECTION_PLUGIN_STYLE.fill! } = style;

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

    private _updateWidgets(style: Nullable<ISelectionStyle>) {
        const { startX, startY, endX, endY } = this._selectionModel;

        if (style == null) {
            style = NORMAL_SELECTION_PLUGIN_STYLE;
        }

        const {
            stroke = NORMAL_SELECTION_PLUGIN_STYLE.stroke!,
            widgets = NORMAL_SELECTION_PLUGIN_STYLE.widgets!,
            widgetSize = NORMAL_SELECTION_PLUGIN_STYLE.widgetSize!,
            widgetStrokeWidth = NORMAL_SELECTION_PLUGIN_STYLE.widgetStrokeWidth!,
            widgetStroke = NORMAL_SELECTION_PLUGIN_STYLE.widgetStroke!,
        } = style;

        const position = {
            left: -widgetSize / 2,
            center: (endX - startX) / 2 - widgetSize / 2,
            right: endX - startX - widgetSize / 2,
            top: -widgetSize / 2,
            middle: (endY - startY) / 2 - widgetSize / 2,
            bottom: endY - startY - widgetSize / 2,
        };

        const size = widgetSize - widgetStrokeWidth;

        this._widgetRects.forEach((widget) => {
            widget.setProps({
                fill: stroke,
                stroke: widgetStroke,
            });
        });

        if (widgets.tl === true) {
            this._topLeftWidget.transformByState({
                height: size,
                width: size,
                left: position.left,
                top: position.top,
                strokeWidth: widgetStrokeWidth,
            });

            this._topLeftWidget.show();
        } else {
            this._topLeftWidget.hide();
        }

        if (widgets.tc === true) {
            this._topCenterWidget.transformByState({
                height: size,
                width: size,
                left: position.center,
                top: position.top,
                strokeWidth: widgetStrokeWidth,
            });

            this._topCenterWidget.show();
        } else {
            this._topCenterWidget.hide();
        }

        if (widgets.tr === true) {
            this._topRightWidget.transformByState({
                height: size,
                width: size,
                left: position.right,
                top: position.top,
                strokeWidth: widgetStrokeWidth,
            });

            this._topRightWidget.show();
        } else {
            this._topRightWidget.hide();
        }

        if (widgets.ml === true) {
            this._middleLeftWidget.transformByState({
                height: size,
                width: size,
                left: position.left,
                top: position.middle,
                strokeWidth: widgetStrokeWidth,
            });

            this._middleLeftWidget.show();
        } else {
            this._middleLeftWidget.hide();
        }

        if (widgets.mr === true) {
            this._middleRightWidget.transformByState({
                height: size,
                width: size,
                left: position.right,
                top: position.middle,
                strokeWidth: widgetStrokeWidth,
            });

            this._middleRightWidget.show();
        } else {
            this._middleRightWidget.hide();
        }

        if (widgets.bl === true) {
            this._bottomLeftWidget.transformByState({
                height: size,
                width: size,
                left: position.left,
                top: position.bottom,
                strokeWidth: widgetStrokeWidth,
            });

            this._bottomLeftWidget.show();
        } else {
            this._bottomLeftWidget.hide();
        }

        if (widgets.bc === true) {
            this._bottomCenterWidget.transformByState({
                height: size,
                width: size,
                left: position.center,
                top: position.bottom,
                strokeWidth: widgetStrokeWidth,
            });

            this._bottomCenterWidget.show();
        } else {
            this._bottomCenterWidget.hide();
        }

        if (widgets.br === true) {
            this._bottomRightWidget.transformByState({
                height: size,
                width: size,
                left: position.right,
                top: position.bottom,
                strokeWidth: widgetStrokeWidth,
            });

            this._bottomRightWidget.show();
        } else {
            this._bottomRightWidget.hide();
        }
    }

    private _hasWidgets(widgets: ISelectionWidgetConfig) {
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
}
