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

import type { IKeyValue } from '@univerjs/core';

import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { ObjectType } from '../base-object';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '../basics/interfaces';
import { Shape } from './shape';

export interface ICircleProps extends IShapeProps {
    radius: number;
}

export const CIRCLE_OBJECT_ARRAY = ['radius'];

export class Circle extends Shape<ICircleProps> {
    private _radius: number;

    override objectType = ObjectType.CIRCLE;

    constructor(key?: string, props?: ICircleProps) {
        super(key, props);
        this._radius = props?.radius || 10;

        this._setFixBoundingBox();

        this.onTransformChange$.subscribeEvent((changeState) => {
            const { type, value, preValue } = changeState;
            if (type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize || type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.all) {
                const value = Math.min(this.width, this.height);
                this._radius = value / 2;
                this.width = value;
                this.height = value;
                this._setTransForm();
            }
        });
    }

    get radius() {
        return this._radius;
    }

    static override drawWith(ctx: UniverRenderingContext, props: ICircleProps | Circle) {
        let { radius } = props;

        radius = radius ?? 10;

        ctx.beginPath();

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }

        ctx.beginPath();
        ctx.arc(radius, radius, radius || 0, 0, Math.PI * 2, false);
        ctx.closePath();

        this._renderPaintInOrder(ctx, props);
    }

    override toJson() {
        const props: IKeyValue = {};
        CIRCLE_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Circle]) {
                props[key] = this[key as keyof Circle];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }

    protected override _draw(ctx: UniverRenderingContext) {
        Circle.drawWith(ctx, this);
    }

    private _setFixBoundingBox() {
        this.transformByState({
            width: this._radius * 2,
            height: this._radius * 2,
        });
    }
}
