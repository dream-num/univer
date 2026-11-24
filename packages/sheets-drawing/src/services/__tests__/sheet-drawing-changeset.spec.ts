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

    it('ignores a removal of the whole axisAlignSheetTransform without a sheetTransform edit', () => {
        // The undo of a first v0.15.5-era edit removes the field it added; with
        // nothing to derive a new one from, the current cell anchor stays.
        const top = JSON1.replaceOp(path('transform', 'top'), 92, 20);
        const op = compose(JSON1.removeOp(path('axisAlignSheetTransform'), true), top);
        expect(normalize(op)).toEqual(top);
    });

    it('turns an insert of angle/flipX/flipY/skewX/skewY on transform into a replace of the value loading filled in', () => {
        // XLSX imports keep the angle on sheetTransform only; loading copies it
        // into transform, while v1.5.2 clients inserted their own value.
        const loaded = { ...current, transform: { ...current.transform, angle: 90 } };
        const rotate = JSON1.insertOp(path('transform', 'angle'), 45);
        expect(normalize(rotate, loaded)).toEqual(JSON1.replaceOp(path('transform', 'angle'), true, 45));
        expect(normalize(rotate)).toEqual(rotate);
    });

    it('drops a removal of angle/flipX/flipY/skewX/skewY on transform that loading never filled in', () => {
        const top = JSON1.replaceOp(path('transform', 'top'), 92, 20);
        expect(normalize(compose(JSON1.removeOp(path('transform', 'flipX'), true), top))).toEqual(top);
    });
});
