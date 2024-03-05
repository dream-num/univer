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

import type { IKeyValue } from '@univerjs/core';
import { Tools } from '@univerjs/core';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { Shape } from './shape';
import { Rect } from './rect';

export interface ICheckboxProps extends IShapeProps {
    checked?: boolean;
}

export const CHECK_OBJECT_ARRAY = ['checked'];

export class Checkbox extends Shape<ICheckboxProps> {
    _checked = false;

    constructor(key: string, props: ICheckboxProps) {
        super(key, props);

        if (Tools.isDefine(props.checked)) {
            this._checked = props.checked;
        }
    }

    get checked() {
        return this._checked;
    }

    // TODO: draw check shape
    static override drawWith(ctx: UniverRenderingContext, props: ICheckboxProps) {
        const { width = 16, height = 16, fill, checked, ...extProps } = props;

        ctx.save();
        ctx.translate(1, 1);

        if (checked) {
            Rect.drawWith(ctx, {
                ...extProps,
                radius: 0,
                width: width - 2,
                height: height - 2,
                fill,
                stroke: fill,

            });
        } else {
            Rect.drawWith(ctx, {
                ...extProps,
                radius: 0,
                width: width - 2,
                height: height - 2,
                stroke: fill,
            });
        }

        ctx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext) {
        Checkbox.drawWith(ctx, this);
    }

    override toJson() {
        const props: IKeyValue = {};
        CHECK_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Checkbox]) {
                props[key] = this[key as keyof Checkbox];
            }
        });

        return {
            ...super.toJson(),
            ...props,
        };
    }
}
