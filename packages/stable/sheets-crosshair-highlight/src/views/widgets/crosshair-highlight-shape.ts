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

import type { IRgbColor, Nullable } from '@univerjs/core';
import type { IShapeProps, UniverRenderingContext } from '@univerjs/engine-render';
import { Rect, Shape } from '@univerjs/engine-render';

export interface ISheetCrossHairHighlightShapeProps extends IShapeProps {
    color: IRgbColor;
}

export class SheetCrossHairHighlightShape extends Shape<ISheetCrossHairHighlightShapeProps> {
    // protected _showHighLight = false;
    protected _color: Nullable<IRgbColor>;

    constructor(key?: string, props?: ISheetCrossHairHighlightShapeProps) {
        super(key, props);

        if (props) {
            this.setShapeProps(props);
        }
    }

    setShapeProps(props: Partial<ISheetCrossHairHighlightShapeProps>): void {
        if (typeof props.color !== 'undefined') {
            this._color = props.color;
        }

        this.transformByState({
            width: props.width!,
            height: props.height!,
        });
    }

    protected override _draw(ctx: CanvasRenderingContext2D): void {
        const color = `rgba(${this._color!.r}, ${this._color!.g}, ${this._color!.b}, ${this._color?.a ?? 0.5})`;

        Rect.drawWith(ctx as UniverRenderingContext, {
            width: this.width,
            height: this.height,
            fill: color,
            stroke: undefined,
            strokeWidth: 0,
            evented: false,
        });
    }
}
