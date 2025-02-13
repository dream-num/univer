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

import type { IShapeProps, UniverRenderingContext } from '@univerjs/engine-render';
import type { IDropdownLayoutInfo } from './layout';
import { Rect, Shape } from '@univerjs/engine-render';
import { DROP_DOWN_DEFAULT_COLOR } from '../../../const';
import { PADDING_H } from './layout';

const RADIUS = 8;

export interface IDropdownProps extends IShapeProps {
    fontString: string;
    fontFamily: string;
    fontSize: number;
    info: IDropdownLayoutInfo;
    color: string;
}

export class Dropdown extends Shape<IDropdownProps> {
    static override drawWith(ctx: UniverRenderingContext, props: IDropdownProps) {
        const { fontString, info, fill, color } = props;
        const { layout, text } = info;
        ctx.save();
        Rect.drawWith(ctx, {
            width: layout.width,
            height: layout.height,
            radius: RADIUS,
            fill: fill || DROP_DOWN_DEFAULT_COLOR,
        });
        ctx.translateWithPrecision(PADDING_H, layout.ba);
        ctx.font = fontString;
        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }
}
