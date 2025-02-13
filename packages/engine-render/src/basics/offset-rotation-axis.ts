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

import { degToRad } from './tools';
import type { Vector2 } from './vector2';

export function offsetRotationAxis(referenceCoords: Vector2, angleDegree: number, vertexCoords: Vector2, centerCoords: Vector2): Vector2 {
    const angleRad = degToRad(angleDegree);

    const newVertexCoords = vertexCoords.clone().rotateByPoint(angleRad, referenceCoords);

    const newCenterCoords = centerCoords.clone().rotateByPoint(angleRad, referenceCoords);

    const finalPoint = newVertexCoords.clone();
    finalPoint.rotateByPoint(degToRad(-angleDegree), newCenterCoords);

    return finalPoint;
}
