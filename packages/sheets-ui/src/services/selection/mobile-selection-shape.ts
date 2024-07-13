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

import type { IRangeWithCoord, Nullable, ThemeService } from '@univerjs/core';
import { RANGE_TYPE } from '@univerjs/core';
import type { BaseObject, IRectProps, Scene } from '@univerjs/engine-render';
import { Rect, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import type { ISelectionStyle } from '@univerjs/sheets';

import { SHEET_COMPONENT_SELECTION_LAYER_INDEX } from '../../common/keys';
import { SELECTION_MANAGER_KEY, SelectionControl } from './selection-shape';

export class MobileSelectionControl extends SelectionControl {
    /**
     * topLeft controlPointer, it is not visible, just transparent, for handling event.
     */
    private _fillControlTopLeft: Rect | null;
    /**
     * bottomRight controlPointer, it is not visible, just transparent, for handling event.
     */
    private _fillControlBottomRight: Rect | null;
    /**
     * a very small visible point, placed in control pointer
     */
    private _fillControlTopLeftInner: Rect | null;
    /**
     * a very small visible point, placed in control pointer
     */
    private _fillControlBottomRightInner: Rect | null;

    constructor(
        protected override _scene: Scene,
        protected override _zIndex: number,
        protected override _isHeaderHighlight: boolean = true,
        protected override readonly _themeService: ThemeService,
        protected _rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL
    ) {
        super(_scene, _zIndex, _isHeaderHighlight, _themeService);
        this.initControlPoints();
    }

    initControlPoints() {
        const defaultStyle = this.defaultStyle!;
        const expandCornerSize = defaultStyle.expandCornerSize || 0;
        const expandCornerInnerSize = (defaultStyle.expandCornerSize || 0) / 4;
        const AutofillStrokeWidth = defaultStyle.AutofillStrokeWidth || 0;
        const stroke = defaultStyle.stroke!;
        const AutofillStroke = defaultStyle.AutofillStroke!;
        const zIndex = this.zIndex;
        const RectCtor = Rect;
        // if (this._rangeType === RANGE_TYPE.ROW || this._rangeType === RANGE_TYPE.COLUMN) {
        //     RectCtor = FloatRect;
        // }
        // @transformControlPoint takes care of left & top
        this._fillControlTopLeft = new RectCtor(SELECTION_MANAGER_KEY.fillTopLeft + zIndex, {
            zIndex: zIndex + 2,
            width: expandCornerSize,
            height: expandCornerSize,
            radius: expandCornerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });
        this._fillControlTopLeftInner = new RectCtor(SELECTION_MANAGER_KEY.fillTopLeftInner + zIndex, {
            zIndex: zIndex + 1,
            width: expandCornerInnerSize,
            height: expandCornerInnerSize,
            radius: expandCornerInnerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });
        this._fillControlBottomRight = new RectCtor(SELECTION_MANAGER_KEY.fillBottomRight + zIndex, {
            zIndex: zIndex + 2,
            width: expandCornerSize,
            height: expandCornerSize,
            radius: expandCornerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });
        this._fillControlBottomRightInner = new RectCtor(SELECTION_MANAGER_KEY.fillBottomRightInner + zIndex, {
            zIndex: zIndex + 1,
            width: expandCornerInnerSize,
            height: expandCornerInnerSize,
            radius: expandCornerInnerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });

        const fillProps: IRectProps = {
            fill: stroke,
            stroke: AutofillStroke,
            strokeScaleEnabled: false,
        };
        this._fillControlTopLeftInner!.setProps({ ...fillProps });
        this._fillControlBottomRightInner!.setProps({ ...fillProps });
        // for test
        // this.fillControlTopLeft!.setProps({ ...fillProps, ...{ fill: 'red' } });
        // this.fillControlBottomRight!.setProps({ ...fillProps, ...{ fill: 'black' } });

        // put into scene
        const objs = [this._fillControlTopLeft, this._fillControlBottomRight, this._fillControlTopLeftInner, this._fillControlBottomRightInner] as BaseObject[];

        // do not use this.model.rangeType, model has not been initialized yet
        switch (this._rangeType) {
            case RANGE_TYPE.ROW:
                this.rowHeaderGroup.addObjects(...objs);
                break;
            case RANGE_TYPE.COLUMN:
                this.columnHeaderGroup.addObjects(...objs);
                break;
            case RANGE_TYPE.NORMAL:
                this.selectionShapeGroup.addObjects(...objs);
        }

        const scene = this.getScene();
        scene.addObjects(objs, SHEET_COMPONENT_SELECTION_LAYER_INDEX);
    }

    get fillControlTopLeft(): Rect<IRectProps> | null {
        return this._fillControlTopLeft;
    }

    set fillControlTopLeft(value: Rect) {
        this._fillControlTopLeft = value;
    }

    get fillControlBottomRight(): Rect<IRectProps> | null {
        return this._fillControlBottomRight;
    }

    set fillControlBottomRight(value: Rect) {
        this._fillControlBottomRight = value;
    }

    get rangeType(): RANGE_TYPE {
        return this._rangeType;
    }

    set rangeType(value: RANGE_TYPE) {
        this._rangeType = value;
    }

    override dispose() {
        this._fillControlBottomRight?.dispose();
        this._fillControlTopLeft?.dispose();
        super.dispose();
    }

    override updateRange(range: IRangeWithCoord) {
        this._selectionModel.setValue(range);
        this._updateControl(null, this._rowHeaderWidth, this._columnHeaderHeight);
    }

    protected override _updateControl(style: Nullable<ISelectionStyle>, rowHeaderWidth: number, columnHeaderHeight: number) {
        super._updateControl(style, rowHeaderWidth, columnHeaderHeight);

        // const rangeType = this.rangeType;
        // startX startY shares same coordinate with viewport.(include row & colheader)

        const defaultStyle = this.defaultStyle;
        if (style == null) {
            style = defaultStyle;
        }

        const {
            widgets = defaultStyle.widgets!,
            hasAutoFill: autoFillEnabled = defaultStyle.hasAutoFill!,
        } = style;
        this.currentStyle = style;

        // this condition is derived from selection-shape, I do not understand.
        if (autoFillEnabled === true && !super._hasWidgets(widgets)) {
            const { viewportScrollX, viewportScrollY } = this.getViewportMainScrollInfo();
            const { endX, endY } = this.selectionModel;
            this.transformControlPoint(viewportScrollX, viewportScrollY, endX, endY);

            this.fillControlTopLeft!.show();
            this.fillControlBottomRight!.show();
            this._fillControlTopLeftInner!.show();
            this._fillControlBottomRightInner!.show();
        } else {
            this.fillControlTopLeft?.hide();
            this.fillControlBottomRight?.hide();
            this._fillControlTopLeftInner?.hide();
            this._fillControlBottomRightInner?.hide();
        }
    }

    getViewportMainScrollInfo() {
        const viewMain = this.getScene().getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        return {
            viewportScrollX: viewMain?.viewportScrollX || 0,
            viewportScrollY: viewMain?.viewportScrollY || 0,
            width: viewMain?.width || 0,
            height: viewMain?.height || 0,
        };
    }

    /**
     * Mainly for row & col selection control point position. update control point position by when scrolling.
     * @param viewportScrollX viewportScrollX
     * @param viewportScrollY
     * @param sheetContentWidth
     * @param sheetContentHeight max sheet content height, for very short sheet, control pointer shoud not out of sheet
     */
    // eslint-disable-next-line max-lines-per-function
    transformControlPoint(viewportScrollX: number = 0, viewportScrollY: number = 0, sheetContentWidth: number = 0, sheetContentHeight: number = 0) {
        const style = this.currentStyle!;
        const rangeType = this.selectionModel.rangeType;
        const expandCornerSizeInner = style.expandCornerSize! / 4;
        const expandCornerSize = style.expandCornerSize!;
        const { startX, startY, endX, endY } = this.selectionModel;

        // const scene = this.getScene();
        const viewportSizeInfo = this.getViewportMainScrollInfo();
        const viewportW = viewportSizeInfo.width;
        const viewportH = viewportSizeInfo.height;

        switch (rangeType) {
            case RANGE_TYPE.NORMAL:
                this.fillControlTopLeft!.transformByState({
                    left: -expandCornerSize / 2,
                    top: -expandCornerSize / 2,
                });
                this.fillControlBottomRight!.transformByState({
                    left: endX - startX - expandCornerSize / 2,
                    top: endY - startY - expandCornerSize / 2,
                });
                this._fillControlTopLeftInner!.transformByState({
                    left: -expandCornerSizeInner / 2,
                    top: -expandCornerSizeInner / 2,
                });
                this._fillControlBottomRightInner!.transformByState({
                    left: endX - startX - expandCornerSizeInner / 2,
                    top: endY - startY - expandCornerSizeInner / 2,
                });
                break;

            case RANGE_TYPE.ROW: {
                const left = Math.min(viewportW / 2 + viewportScrollX, sheetContentWidth);
                const controlLeft = -expandCornerSize / 2 + left;
                const innerLeft = -expandCornerSizeInner / 2 + left;
                this.fillControlTopLeft!.transformByState({
                    left: controlLeft,
                    top: -expandCornerSize / 2,
                });
                this.fillControlBottomRight!.transformByState({
                    left: controlLeft,
                    top: -expandCornerSize / 2 + endY - startY,
                });
                this._fillControlTopLeftInner!.transformByState({
                    left: innerLeft,
                    top: -expandCornerSizeInner / 2,
                });
                this._fillControlBottomRightInner!.transformByState({
                    left: innerLeft,
                    top: -expandCornerSizeInner / 2 + endY - startY,
                });
            }
                break;
            case RANGE_TYPE.COLUMN:
                {
                    const top = Math.min(+viewportH / 2 + viewportScrollY, sheetContentHeight);
                    const controlTop = -expandCornerSize / 2 + top;
                    const innerTop = -expandCornerSizeInner / 2 + top;

                    this.fillControlTopLeft!.transformByState({
                        left: -expandCornerSize / 2,
                        top: controlTop,
                    });
                    this.fillControlBottomRight!.transformByState({
                        left: -expandCornerSize / 2 + endX - startX,
                        top: controlTop,
                    });
                    this._fillControlTopLeftInner!.transformByState({
                        left: -expandCornerSizeInner / 2,
                        top: innerTop,
                    });
                    this._fillControlBottomRightInner!.transformByState({
                        left: -expandCornerSizeInner / 2 + endX - startX,
                        top: innerTop,
                    });
                }
                break;
            default:
                console.error('unknown range type');
        }
    }
}
