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

import type { IViewportInfo, Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import { BaseObject } from '../base-object';

export class CustomObject extends BaseObject {
    constructor(
        key?: string,
        private _render = (mainCtx: UniverRenderingContext) => { /* empty */ },
        private _isHitCustom?: (coord: Vector2) => boolean
    ) {
        super(key);
    }

    override toJson() {
        return {
            ...super.toJson(),
        };
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        // Temporarily ignore the on-demand display of elements within a group：this.isInGroup
        if (bounds && !this.isInGroup) {
            const { top, left, bottom, right } = bounds!.viewBound;

            if (
                this.width + this.strokeWidth < left ||
                right < 0 ||
                this.height + this.strokeWidth < top ||
                bottom < 0
            ) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._render(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    override isHit(coord: Vector2) {
        if (this._isHitCustom) {
            return this._isHitCustom(coord);
        }

        return super.isHit(coord);
    }
}
