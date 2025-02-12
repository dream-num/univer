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

import type { Nullable } from '@univerjs/core';

import { Vector2 } from './vector2';

export const INITIAL_Path2: Vector2[] = [new Vector2(0, 0), new Vector2(1, 1)];

interface Line {
    from: Vector2;
    to: Vector2;
}

export class Path2 {
    constructor(private _lines: Vector2[] = INITIAL_Path2) {
        // empty
    }

    intersection(lines: Vector2[]): Nullable<Vector2[]> {
        if (this._lines.length < 1 || lines.length < 1) {
            return;
        }

        const crossPoint: Vector2[] = [];

        for (let o = 1; o < this._lines.length; o++) {
            const from = this._lines[o - 1];
            const to = this._lines[o];
            for (let n = 1; n < lines.length; n++) {
                const contrastFrom = this._lines[o - 1];
                const contrastTo = this._lines[o];

                const point = this._intersection(
                    {
                        from,
                        to,
                    },
                    {
                        from: contrastFrom,
                        to: contrastTo,
                    }
                );

                if (point) {
                    crossPoint.push(point);
                }
            }
        }

        return crossPoint;
    }

    private _intersection(line1: Line, line2: Line): Vector2 | false {
        const a = line1.from;
        const b = line1.to;
        const c = line2.from;
        const d = line2.to;

        // 2 times the area of triangle abc
        const area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);

        // 2 times the area of the triangle abd
        const area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

        // If the area symbols are the same, the two points are on the same side of the line segment and do not intersect (for the case where the points are on the line segment, this example is treated as disjoint);
        if (area_abc * area_abd >= 0) {
            return false;
        }

        // 2 times the area of the triangle cda
        const area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
        // 2 times the area of the triangle cdb
        // Note: There is a small optimization here. There is no need to calculate the area with the formula, but by adding and subtracting the three known areas.
        const area_cdb = area_cda + area_abc - area_abd;
        if (area_cda * area_cdb >= 0) {
            return false;
        }

        // Calculate intersection coordinates
        const t = area_cda / (area_abd - area_abc);
        const dx = t * (b.x - a.x);
        const dy = t * (b.y - a.y);
        return new Vector2(a.x + dx, a.y + dy);
    }
}
