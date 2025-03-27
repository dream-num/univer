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
import { Tools } from '@univerjs/core';
import { Shape } from './shape';

export interface ICheckboxShapeProps extends IShapeProps {
    checked?: boolean;
}

export const CHECK_OBJECT_ARRAY = ['checked'];

export class CheckboxShape extends Shape<ICheckboxShapeProps> {
    _checked = false;

    constructor(key: string, props: ICheckboxShapeProps) {
        super(key, props);

        if (Tools.isDefine(props.checked)) {
            this._checked = props.checked;
        }
    }

    get checked() {
        return this._checked;
    }

    static override drawWith(ctx: UniverRenderingContext, props: ICheckboxShapeProps) {
        const { width = 16, height = 16, fill, checked, top = 0, left = 0 } = props;
        const uncheckedPath = new Path2D('M12 2.65381H4C3.17157 2.65381 2.5 3.32538 2.5 4.15381V12.1538C2.5 12.9822 3.17157 13.6538 4 13.6538H12C12.8284 13.6538 13.5 12.9822 13.5 12.1538V4.15381C13.5 3.32538 12.8284 2.65381 12 2.65381ZM4 1.65381C2.61929 1.65381 1.5 2.7731 1.5 4.15381V12.1538C1.5 13.5345 2.61929 14.6538 4 14.6538H12C13.3807 14.6538 14.5 13.5345 14.5 12.1538V4.15381C14.5 2.7731 13.3807 1.65381 12 1.65381H4Z');
        const checkedPath = new Path2D('M3.99243 1.65381C2.61172 1.65381 1.49243 2.77295 1.49243 4.15381V12.1538C1.49243 13.5347 2.61172 14.6538 3.99243 14.6538H11.9924C13.3731 14.6538 14.4924 13.5347 14.4924 12.1538V4.15381C14.4924 2.77295 13.3731 1.65381 11.9924 1.65381H3.99243ZM12.3779 6.3623C12.6317 6.1084 12.6317 5.69678 12.3779 5.44287C12.1241 5.18896 11.7125 5.18896 11.4586 5.44287L7.21062 9.69092L5.00681 7.4873C4.75296 7.2334 4.3414 7.2334 4.08755 7.4873C3.83372 7.74072 3.83372 8.15234 4.08757 8.40625L6.85709 11.1758C7.05234 11.3711 7.36893 11.3711 7.56418 11.1758L12.3779 6.3623Z');

        ctx.save();
        ctx.translate(left, top);
        ctx.scale(width / 16, height / 16);
        if (fill) {
            ctx.fillStyle = fill;
        }

        if (checked) {
            ctx.fill(checkedPath, 'evenodd');
        } else {
            ctx.fill(uncheckedPath, 'evenodd');
        }

        ctx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext) {
        CheckboxShape.drawWith(ctx, this);
    }

    override toJson() {
        const props: IKeyValue = {};
        CHECK_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof CheckboxShape]) {
                props[key] = this[key as keyof CheckboxShape];
            }
        });

        return {
            ...super.toJson(),
            ...props,
        };
    }
}
