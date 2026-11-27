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

import type { CanvasIconName } from '@univerjs/icons-svg';
import { drawCanvasIcon } from '@univerjs/icons-svg';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { Shape } from './shape';

export class CanvasIconShape extends Shape<IShapeProps> {
    constructor(key: string, private readonly _icon: CanvasIconName, props: IShapeProps) {
        super(key, props);
    }

    protected override _draw(ctx: UniverRenderingContext): void {
        const size = Math.min(this.width, this.height);
        drawCanvasIcon(ctx, this._icon, (this.width - size) / 2, (this.height - size) / 2, size, this.fill ? { black: this.fill } : undefined);
    }
}
