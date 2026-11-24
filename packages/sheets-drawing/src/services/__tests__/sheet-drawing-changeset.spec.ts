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

import { DrawingTypeEnum, JSON1 } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import type { ISheetDrawing } from '../sheet-drawing.service';
import { normalizeHistoricalSheetDrawingEdit } from '../sheet-drawing-changeset';

const unitId = 'unit';
const subUnitId = 'sheet';
const position = (row: number) => ({ from: { row, column: 1, rowOffset: 0, columnOffset: 0 }, to: { row: row + 3, column: 4, rowOffset: 0, columnOffset: 0 } });
const current: ISheetDrawing = {
    unitId,
    subUnitId,
    drawingId: 'd',
    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
    transform: { left: 10, top: 20, width: 100, height: 60 },
    axisAlignSheetTransform: position(2),
};
const path = (...keys: string[]) => [unitId, subUnitId, 'data', 'd', ...keys];
const compose = (...ops: JSON1.JSONOp[]) => ops.reduce(JSON1.type.compose, null);
const normalize = (op: JSON1.JSONOp, drawing: ISheetDrawing | undefined = current) =>
    normalizeHistoricalSheetDrawingEdit(op, unitId, subUnitId, () => drawing, () => undefined);

describe('normalizeHistoricalSheetDrawingEdit', () => {
    it('returns edits that touch neither sheetTransform nor axisAlignSheetTransform unchanged', () => {
        const op = compose(JSON1.replaceOp(path('transform', 'left'), 10, 30), JSON1.insertOp([unitId, subUnitId, 'order', 0], 'd'));
        expect(normalize(op)).toBe(op);
    });

    it('drops angle/flipX/flipY/skewX/skewY on sheetTransform and axisAlignSheetTransform and keeps them on transform', () => {
        const op = compose(
            JSON1.insertOp(path('axisAlignSheetTransform', 'angle'), 0),
            JSON1.insertOp(path('sheetTransform', 'flipX'), false),
            JSON1.removeOp(path('sheetTransform', 'skewY'), true),
            JSON1.insertOp(path('transform', 'flipX'), true)
        );
        expect(normalize(op)).toEqual(JSON1.insertOp(path('transform', 'flipX'), true));
    });

    it('drops sheetTransform when the same edit moves axisAlignSheetTransform', () => {
        const axis = JSON1.replaceOp(path('axisAlignSheetTransform', 'from', 'row'), 2, 5);
        const top = JSON1.replaceOp(path('transform', 'top'), 20, 92);
        const op = compose(axis, JSON1.replaceOp(path('sheetTransform', 'from', 'row'), 2, 5), JSON1.insertOp(path('sheetTransform', 'flipY'), false), top);
        expect(normalize(op)).toEqual(compose(axis, top));
    });

    it('turns a whole axisAlignSheetTransform insert into a replace only when the drawing already has the field', () => {
        // Clients up to v1.0.0-alpha.2 sent `replaceOp(path, undefined, value)`,
        // which serializes without `r`, for a field missing on their side.
        const value = position(5);
        const op = compose(
            JSON.parse(JSON.stringify(JSON1.replaceOp(path('axisAlignSheetTransform'), undefined as never, value))),
            JSON1.replaceOp(path('sheetTransform'), position(2), value)
        );
        expect(normalize(op)).toEqual(JSON1.replaceOp(path('axisAlignSheetTransform'), true, value));
        const { axisAlignSheetTransform: _axis, ...withoutAxis } = current;
        expect(normalize(op, withoutAxis as ISheetDrawing)).toEqual(JSON1.insertOp(path('axisAlignSheetTransform'), value));
    });
});
