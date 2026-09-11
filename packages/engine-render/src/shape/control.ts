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

import { Vector2 } from '../basics/vector2';
import { Rect } from './rect';

const CONTROL_TOUCH_HIT_RADIUS = 22;

/** A precise mouse handle with a zoom-independent touch target. */
export class Control extends Rect {
    getTouchHitDistance(coord: Vector2): number {
        const center = this.ancestorTransform.applyPoint(new Vector2(this.width / 2, this.height / 2));
        const scale = this.getScene()?.getAncestorScale();
        const distance = Math.hypot(
            (coord.x - center.x) * (scale?.scaleX ?? 1),
            (coord.y - center.y) * (scale?.scaleY ?? 1)
        );
        return distance <= CONTROL_TOUCH_HIT_RADIUS || this.isHit(coord) ? distance : Number.POSITIVE_INFINITY;
    }
}
