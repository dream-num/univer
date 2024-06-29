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
    private _fillControlTopLeft: Rect | null;
    private _fillControlBottomRight: Rect | null;
    private _fillControlTopLeftInner: Rect | null;
    private _fillControlBottomRightInner: Rect | null;

    constructor(
        protected override _scene: Scene,
        protected override _zIndex: number,
        protected override _isHeaderHighlight: boolean = true,
        protected override readonly _themeService: ThemeService,
        protected _rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL
    ) {
        super(_scene, _zIndex, _isHeaderHighlight, _themeService);
        window.sp = this;
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
        // this.fillControlTopLeft!.setProps({ ...fillProps, ...{ fill: 'red' } });
        // this.fillControlBottomRight!.setProps({ ...fillProps, ...{ fill: 'black' } });

        // put into scene
        const objs = [this._fillControlTopLeft, this._fillControlBottomRight, this._fillControlTopLeftInner, this._fillControlBottomRightInner] as BaseObject[];

        if (this._rangeType === RANGE_TYPE.COLUMN) {
            this._columnHeaderGroup.addObjects(...objs);
        } else {
            this._selectionShapeGroup.addObjects(...objs);
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

        const rangeType = this.rangeType;
        // startX startY shares same coordinate with viewport.(include row & colheader)
        // const { startX, startY, endX, endY } =  this.selectionModel;
        const defaultStyle = this.defaultStyle;
        if (style == null) {
            style = defaultStyle;
        }

        const {
            widgets = defaultStyle.widgets!,
            hasAutoFill: autoFillEnabled = defaultStyle.hasAutoFill!,
        } = style;
        this.currentStyle = style;

        // this condition is derived from selection-shape
        if (autoFillEnabled === true && !super._hasWidgets(widgets)) {
            if (rangeType) {
                this.selectionModel.setRangeType(rangeType);
            }
            const { offsetX, offsetY } = this.getViewportMainScrollingOffset();
            this.transformControlPoint(offsetX, offsetY);

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
        // if (rangeType) {
        //     this.selectionModel.setRangeType(rangeType);
        //     if (rangeType === RANGE_TYPE.COLUMN) {
        //         this.fillControlTopLeft!.transformByState({
        //             left: -expandCornerSize / 2,
        //             top: (endY - startY) / 2,
        //         });
        //         this.fillControlBottomRight!.transformByState({
        //             left: endX - startX - expandCornerSize / 2,
        //             top: (endY - startY) / 2,
        //         });
        //     }
        // }
    }

    getViewportMainScrollingOffset() {
        const viewMain = this.getScene().getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        return {
            offsetX: viewMain?.viewportScrollX || 0,
            offsetY: viewMain?.viewportScrollY || 0,
            width: viewMain?.width || 0,
            height: viewMain?.height || 0,
        };
    }

    /**
     *
     * @param offsetX viewport viewportScrollX
     * @param offsetY viewport viewportScrollY
     */
    transformControlPoint(offsetX: number = 0, offsetY: number = 0) {
        const style = this.currentStyle!;
        const rangeType = this.selectionModel.rangeType;
        const expandCornerSizeInner = style.expandCornerSize! / 4;
        const expandCornerSize = style.expandCornerSize!;
        const { startX, startY, endX, endY } = this.selectionModel;

        // const scene = this.getScene();
        const viewportSizeInfo = this.getViewportMainScrollingOffset();
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

            case RANGE_TYPE.ROW:
                this.fillControlTopLeft!.transformByState({
                    left: -expandCornerSize / 2 + viewportW / 2 + offsetX,
                    top: -expandCornerSize / 2,
                });
                this.fillControlBottomRight!.transformByState({
                    left: -expandCornerSize / 2 + viewportW / 2 + offsetX,
                    top: -expandCornerSize / 2 + endY - startY,
                });
                this._fillControlTopLeftInner!.transformByState({
                    left: -expandCornerSizeInner / 2 + viewportW / 2 + offsetX,
                    top: -expandCornerSizeInner / 2,
                });
                this._fillControlBottomRightInner!.transformByState({
                    left: -expandCornerSizeInner / 2 + viewportW / 2 + offsetX,
                    top: -expandCornerSizeInner / 2 + endY - startY,
                });

                break;
            case RANGE_TYPE.COLUMN:
                this.fillControlTopLeft!.transformByState({
                    left: -expandCornerSize / 2,
                    top: -expandCornerSize / 2 + viewportH / 2 + offsetY,
                });
                this.fillControlBottomRight!.transformByState({
                    left: -expandCornerSize / 2 + endX - startX,
                    top: -expandCornerSize / 2 + viewportH / 2 + offsetY,
                });
                this._fillControlTopLeftInner!.transformByState({
                    left: -expandCornerSizeInner / 2,
                    top: -expandCornerSizeInner / 2 + viewportH / 2 + offsetY,
                });
                this._fillControlBottomRightInner!.transformByState({
                    left: -expandCornerSizeInner / 2 + endX - startX,
                    top: -expandCornerSizeInner / 2 + viewportH / 2 + offsetY,
                });
                break;
            default:
                console.error('unknown range type');
        }
    }
}
