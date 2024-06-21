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

import type { Nullable, ThemeService } from '@univerjs/core';
import type { BaseObject, IRectProps, Scene } from '@univerjs/engine-render';
import { Rect } from '@univerjs/engine-render';
import type { ISelectionStyle } from '@univerjs/sheets';

import { SHEET_COMPONENT_SELECTION_LAYER_INDEX } from '../../common/keys';
import { SELECTION_MANAGER_KEY, SelectionControl } from './selection-shape';

export class MobileSelectionControl extends SelectionControl {
    private _fillControlTopLeft: Rect | null;
    private _fillControlBottomRight: Rect | null;
    private _fillControlTopLeftInner: Rect | null;
    private _fillControlBottomRightInner: Rect | null;

    constructor(
        ...parentArgs: [Scene, number, boolean, ThemeService]
    ) {
        super(...parentArgs);
        const defaultStyle = this.defaultStyle!;
        const expandCornerSize = defaultStyle.expandCornerSize || 0;
        const expandCornerInnerSize = (defaultStyle.expandCornerSize || 0) / 4;
        const AutofillStrokeWidth = defaultStyle.AutofillStrokeWidth || 0;
        const stroke = defaultStyle.stroke!;
        const AutofillStroke = defaultStyle.AutofillStroke!;
        const zIndex = this.zIndex;
        this._fillControlTopLeft = new Rect(SELECTION_MANAGER_KEY.fillTopLeft + zIndex, {
            zIndex: zIndex + 2,
            width: expandCornerSize,
            height: expandCornerSize,
            radius: expandCornerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });
        this._fillControlTopLeftInner = new Rect(SELECTION_MANAGER_KEY.fillTopLeftInner + zIndex, {
            zIndex: zIndex + 1,
            width: expandCornerInnerSize,
            height: expandCornerInnerSize,
            radius: expandCornerInnerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });
        this._fillControlBottomRight = new Rect(SELECTION_MANAGER_KEY.fillBottomRight + zIndex, {
            zIndex: zIndex + 2,
            width: expandCornerSize,
            height: expandCornerSize,
            radius: expandCornerSize / 2,
            strokeWidth: AutofillStrokeWidth,
        });
        this._fillControlBottomRightInner = new Rect(SELECTION_MANAGER_KEY.fillBottomRightInner + zIndex, {
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
        this._fillControlTopLeftInner!.setProps({ ...fillProps });//...{ fill: 'black' } });
        this._fillControlBottomRightInner!.setProps({ ...fillProps });// ...{ fill: 'red' } });

        // put into scene
        this._selectionShapeGroup.addObjects(this._fillControlTopLeft, this._fillControlBottomRight, this._fillControlTopLeftInner, this._fillControlBottomRightInner);
        const objs = [this._fillControlTopLeft, this._fillControlBottomRight, this._fillControlTopLeftInner, this._fillControlBottomRightInner] as BaseObject[];
        const scene = this.getScene();
        scene.addObjects(objs, SHEET_COMPONENT_SELECTION_LAYER_INDEX);

        window.sp = this;
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

    override dispose() {
        this._fillControlBottomRight?.dispose();
        this._fillControlTopLeft?.dispose();
        super.dispose();
    }

    protected override _updateControl(style: Nullable<ISelectionStyle>, rowHeaderWidth: number, columnHeaderHeight: number) {
        super._updateControl(style, rowHeaderWidth, columnHeaderHeight);
        // startX startY shares same coordinate with viewport.(include row & colheader)
        const { startX, startY, endX, endY } = this.selectionModel;
        const defaultStyle = this.defaultStyle;
        if (style == null) {
            style = defaultStyle;
        }

        this.currentStyle = defaultStyle;

        const {
            widgets = defaultStyle.widgets!,
            hasAutoFill: autoFillEnabled = defaultStyle.hasAutoFill!,
            expandCornerSize = defaultStyle.expandCornerSize!,
        } = style;
        const expandCornerSizeInner = defaultStyle.expandCornerSize! / 4;

        if (autoFillEnabled === true && !super._hasWidgets(widgets)) {
            this.fillControlTopLeft!.transformByState({
                left: -expandCornerSize / 2,
                top: -expandCornerSize / 2,
            });
            this._fillControlTopLeftInner!.transformByState({
                left: -expandCornerSizeInner / 2,
                top: -expandCornerSizeInner / 2,
            });

            this.fillControlBottomRight!.transformByState({
                left: endX - startX - expandCornerSize / 2,
                top: endY - startY - expandCornerSize / 2,
            });
            this._fillControlBottomRightInner!.transformByState({
                left: endX - startX - expandCornerSizeInner / 2,
                top: endY - startY - expandCornerSizeInner / 2,
            });

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
}
