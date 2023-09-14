import { ICellInfo, ISelection, Nullable } from '@univerjs/core';

import { SELECTION_TYPE } from '../../../Basics/Const';
import { ISelectionDataWithStyle, ISelectionStyle, NORMAL_SELECTION_PLUGIN_STYLE } from '../../../Basics/Selection';
import { Group } from '../../../Group';
import { Scene } from '../../../Scene';
import { Rect } from '../../../Shape/Rect';
import { SelectionTransformerModel } from './selection-transformer-model';

// export enum DEFAULT_SELECTION_CONFIG {
//     strokeColor = 'rgb(1,136,251)',
//     backgroundColor = 'rgba(1,136,251, 0.1)',
//     strokeWidth = 2,
//     fillSideLength = 6,
//     fillStrokeLength = 1,
//     fillStrokeColor = 'rgb(255,255,255)',
// }
export const DEFAULT_SELECTION_CONFIG = {
    strokeColor: 'rgb(1,136,251)',
    backgroundColor: 'rgba(1,136,251, 0.1)',
    strokeWidth: 2,
    fillSideLength: 6,
    fillStrokeLength: 1,
    fillStrokeColor: 'rgb(255,255,255)',
};

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

    private _selectionModel: SelectionTransformerModel;

    private _selectionStyle: Nullable<ISelectionStyle>;

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

    static create(scene: Scene, zIndex: number) {
        return new this(scene, zIndex);
    }

    static fromJson(scene: Scene, zIndex: number, newSelectionData: ISelectionDataWithStyle) {
        const { selection, cellInfo, style } = newSelectionData;
        const control = SelectionTransformerShape.create(scene, zIndex);
        control.update(selection, cellInfo, style);
        return control;
    }

    /**
     * just handle the view
     *
     * inner update
     */
    _updateControl(style: Nullable<ISelectionStyle>) {
        const { startX, startY, endX, endY } = this._selectionModel;

        this.leftControl.resize(undefined, endY - startY);
        this.rightControl.transformByState({
            height: endY - startY,
            left: endX - startX - DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
        });
        this.topControl.resize(endX - startX + DEFAULT_SELECTION_CONFIG.strokeWidth);
        this.bottomControl.transformByState({
            width: endX - startX + DEFAULT_SELECTION_CONFIG.strokeWidth,
            top: endY - startY - DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
        });

        this.fillControl.translate(endX - startX - DEFAULT_SELECTION_CONFIG.fillSideLength / 2, endY - startY - DEFAULT_SELECTION_CONFIG.fillSideLength / 2);

        this._updateBackgroundControl();

        this.selectionShape.show();
        this.selectionShape.translate(startX, startY);

        this._selectionStyle = style;

        this.selectionShape.makeDirty(true);
    }

    update(newSelectionRange: ISelection, highlight: Nullable<ICellInfo>, style: Nullable<ISelectionStyle> = NORMAL_SELECTION_PLUGIN_STYLE) {
        this._selectionModel.setValue(newSelectionRange, highlight);
        this._updateControl(style);
    }

    clearHighlight() {
        this._selectionModel.clearCurrentCell();
        this._updateControl();
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
    }

    /**
     * Get the cell information of the current selection, considering the case of merging cells
     */
    getCurrentCellInfo(): Nullable<ISelection> {
        const currentCell = this.model.currentCell;

        if (currentCell) {
            let currentRangeData: ISelection;

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
            top: 0,
            left: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            width: DEFAULT_SELECTION_CONFIG.strokeWidth,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            zIndex,
        });
        this._rightControl = new Rect(SELECTION_MANAGER_KEY.right + zIndex, {
            width: DEFAULT_SELECTION_CONFIG.strokeWidth,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            zIndex,
        });
        this._topControl = new Rect(SELECTION_MANAGER_KEY.top + zIndex, {
            top: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            left: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            height: DEFAULT_SELECTION_CONFIG.strokeWidth,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            zIndex,
        });
        this._bottomControl = new Rect(SELECTION_MANAGER_KEY.bottom + zIndex, {
            height: DEFAULT_SELECTION_CONFIG.strokeWidth,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            left: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            zIndex,
        });
        this._backgroundControlTop = new Rect(SELECTION_MANAGER_KEY.backgroundTop + zIndex, {
            fill: DEFAULT_SELECTION_CONFIG.backgroundColor,
            zIndex: zIndex - 1,
            evented: false,
        });
        this._backgroundControlBottom = new Rect(SELECTION_MANAGER_KEY.backgroundBottom + zIndex, {
            fill: DEFAULT_SELECTION_CONFIG.backgroundColor,
            zIndex: zIndex - 1,
            evented: false,
        });
        this._backgroundControlMiddleLeft = new Rect(SELECTION_MANAGER_KEY.backgroundMiddleLeft + zIndex, {
            fill: DEFAULT_SELECTION_CONFIG.backgroundColor,
            zIndex: zIndex - 1,
            evented: false,
        });
        this._backgroundControlMiddleRight = new Rect(SELECTION_MANAGER_KEY.backgroundMiddleRight + zIndex, {
            fill: DEFAULT_SELECTION_CONFIG.backgroundColor,
            zIndex: zIndex - 1,
            evented: false,
        });
        const fillSideLength = DEFAULT_SELECTION_CONFIG.fillSideLength - DEFAULT_SELECTION_CONFIG.fillStrokeLength;
        this._fillControl = new Rect(SELECTION_MANAGER_KEY.fill + zIndex, {
            width: fillSideLength,
            height: fillSideLength,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            strokeWidth: DEFAULT_SELECTION_CONFIG.fillStrokeLength,
            stroke: DEFAULT_SELECTION_CONFIG.fillStrokeColor,
            zIndex: zIndex + 1,
        });
        this._selectionShape = new Group(
            SELECTION_MANAGER_KEY.Selection + zIndex,
            this._fillControl,
            this._leftControl,
            this._rightControl,
            this._topControl,
            this._bottomControl,
            this._backgroundControlTop,
            this._backgroundControlMiddleLeft,
            this._backgroundControlMiddleRight,
            this._backgroundControlBottom
        );

        this._selectionShape.hide();

        this._selectionShape.evented = false;

        this._selectionShape.zIndex = zIndex;

        const scene = this.getScene();
        scene.addObject(this._selectionShape);
    }

    private _updateBackgroundControl() {
        const {
            startColumn,
            startRow,
            endColumn,
            endRow,

            startX,
            startY,
            endX,
            endY,
        } = this._selectionModel;

        const highlightSelection = this._selectionModel.highlightToSelection();

        if (!highlightSelection) {
            this._backgroundControlTop.resize(endX - startX, endY - startY);
            this._backgroundControlBottom.resize(0, 0);
            this._backgroundControlMiddleLeft.resize(0, 0);
            this._backgroundControlMiddleRight.resize(0, 0);
            return;
        }

        const { startX: h_startX, startY: h_startY, endX: h_endX, endY: h_endY } = highlightSelection;

        const strokeOffset = DEFAULT_SELECTION_CONFIG.strokeWidth / 2;

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
    }
}
