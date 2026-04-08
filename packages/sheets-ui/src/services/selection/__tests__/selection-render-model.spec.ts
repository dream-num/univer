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

import { RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SelectionRenderModel } from '../selection-render-model';

const BASE_RANGE = {
    startColumn: 1,
    startRow: 2,
    endColumn: 4,
    endRow: 6,
    startX: 10,
    startY: 20,
    endX: 40,
    endY: 80,
};

const BASE_CELL = {
    ...BASE_RANGE,
    actualRow: 3,
    actualColumn: 2,
};

describe('SelectionRenderModel', () => {
    it('provides default value and getter states', () => {
        const model = new SelectionRenderModel();

        expect(model.startColumn).toBe(-1);
        expect(model.startRow).toBe(-1);
        expect(model.endColumn).toBe(-1);
        expect(model.endRow).toBe(-1);
        expect(model.startX).toBe(0);
        expect(model.startY).toBe(0);
        expect(model.endX).toBe(0);
        expect(model.endY).toBe(0);
        expect(model.currentCell).toBeUndefined();
        expect(model.getCell()).toBeUndefined();
        expect(model.rangeType).toBe(RANGE_TYPE.NORMAL);
        expect(model.getRangeType()).toBe(RANGE_TYPE.NORMAL);
        expect(model.highlightToSelection()).toBeUndefined();
    });

    it('sets and reads value including range type and primary', () => {
        const model = new SelectionRenderModel();
        model.setValue(
            {
                ...BASE_RANGE,
                rangeType: RANGE_TYPE.ROW,
            } as any,
            BASE_CELL as any
        );

        expect(model.getRange()).toEqual({
            ...BASE_RANGE,
            rangeType: RANGE_TYPE.ROW,
        });
        expect(model.getValue()).toEqual({
            rangeWithCoord: {
                ...BASE_RANGE,
                rangeType: RANGE_TYPE.ROW,
            },
            primaryWithCoord: BASE_CELL,
        });
        expect(model.highlightToSelection()).toEqual({
            startRow: BASE_CELL.actualRow,
            endRow: BASE_CELL.actualRow,
            startColumn: BASE_CELL.actualColumn,
            endColumn: BASE_CELL.actualColumn,
            startX: BASE_CELL.startX,
            startY: BASE_CELL.startY,
            endX: BASE_CELL.endX,
            endY: BASE_CELL.endY,
        });
        expect(model.isEqual(BASE_RANGE as any)).toBe(true);
        expect(model.isEqual({ ...BASE_RANGE, endColumn: 5 } as any)).toBe(false);
    });

    it('keeps old rangeType/currentCell when setValue receives undefined fields', () => {
        const model = new SelectionRenderModel();
        model.setRangeType(RANGE_TYPE.COLUMN);
        model.setCurrentCell(BASE_CELL as any);

        model.setValue(
            {
                ...BASE_RANGE,
                startColumn: 8,
                endColumn: 8,
                rangeType: undefined,
            } as any,
            undefined as any
        );

        expect(model.rangeType).toBe(RANGE_TYPE.COLUMN);
        expect(model.currentCell).toEqual(BASE_CELL);
        expect(model.startColumn).toBe(8);
        expect(model.endColumn).toBe(8);
    });

    it('supports explicit current-cell clear flows', () => {
        const model = new SelectionRenderModel();
        model.setCurrentCell(BASE_CELL as any);
        expect(model.currentCell).toEqual(BASE_CELL);

        model.setValue(BASE_RANGE as any, null);
        expect(model.currentCell).toBeNull();

        model.setCurrentCell(BASE_CELL as any);
        model.clearCurrentCell();
        expect(model.currentCell).toBeNull();
        expect(model.highlightToSelection()).toBeUndefined();
    });
});
