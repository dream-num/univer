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

import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import {
    buildCenteredPlusSegments,
    buildTableMenuRegions,
    hitTestTableControl,
    TABLE_CONTROL_INSERT_BUTTON_SIZE,
} from '../table-controls-util';
import { SheetTableControlsShape } from '../table-controls.shape';

class DrawableSheetTableControlsShape extends SheetTableControlsShape {
    drawForTest(ctx: UniverRenderingContext): void {
        this._draw(ctx);
    }
}

function createCanvasContext(): UniverRenderingContext {
    return new Proxy({}, {
        get(_target, property) {
            if (property === 'measureText') {
                return () => ({ width: 0 });
            }

            return () => {};
        },
        set() {
            return true;
        },
    }) as UniverRenderingContext;
}

function createSkeleton(): SpreadsheetSkeleton {
    return {
        rowHeaderWidth: 40,
        columnTotalWidth: 400,
        columnHeaderHeight: 32,
        rowTotalHeight: 600,
        getNoMergeCellWithCoordByIndex: () => ({
            startX: 40,
            startY: 60,
        }),
    } as unknown as SpreadsheetSkeleton;
}

describe('table controls geometry', () => {
    it('hit-tests the topmost region first', () => {
        const hit = hitTestTableControl([
            { type: 'anchor-main', tableId: 't1', left: 0, top: 0, width: 100, height: 24 },
            { type: 'anchor-menu-toggle', tableId: 't1', left: 76, top: 0, width: 24, height: 24 },
        ], 80, 12);

        expect(hit?.type).toBe('anchor-menu-toggle');
    });

    it('misses points outside all regions', () => {
        expect(hitTestTableControl([
            { type: 'insert-row', tableId: 't1', index: 2, left: 10, top: 10, width: TABLE_CONTROL_INSERT_BUTTON_SIZE, height: TABLE_CONTROL_INSERT_BUTTON_SIZE },
        ], 0, 0)).toBeNull();
    });

    it('builds menu item regions under the anchor', () => {
        const regions = buildTableMenuRegions('t1', 20, 30);

        expect(regions.map((item) => item.action)).toEqual(['rename', 'update-range', 'set-theme', 'delete']);
        expect(regions[0]).toMatchObject({ left: 20, top: 30 });
    });

    it('builds centered plus segments around the insert button center', () => {
        const segments = buildCenteredPlusSegments(20, 30, 8);

        expect(segments).toEqual([
            { fromX: 16, fromY: 30, toX: 24, toY: 30 },
            { fromX: 20, fromY: 26, toX: 20, toY: 34 },
        ]);
    });

    it('opens a table menu whose action rows can be hit-tested', () => {
        const shape = new DrawableSheetTableControlsShape('table-controls', createSkeleton);
        shape.setItems([{
            tableId: 'table-orders',
            tableName: 'Orders',
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 },
            fill: '#1f5eff',
            text: '#ffffff',
        }]);
        shape.setOpenedMenuTableId('table-orders');

        shape.drawForTest(createCanvasContext());

        expect(shape.hitTest(56, 170)).toMatchObject({
            type: 'menu-item',
            tableId: 'table-orders',
            action: 'delete',
        });
    });

    it('activates the hovered insert region for row and column insertion', () => {
        const shape = new DrawableSheetTableControlsShape('table-controls', createSkeleton);
        shape.setItems([{
            tableId: 'table-orders',
            tableName: 'Orders',
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 },
            fill: '#1f5eff',
            text: '#ffffff',
        }]);
        shape.setHoveredInsertRegion({
            type: 'insert-row',
            tableId: 'table-orders',
            index: 2,
            left: 100,
            top: 120,
            width: TABLE_CONTROL_INSERT_BUTTON_SIZE,
            height: TABLE_CONTROL_INSERT_BUTTON_SIZE,
        });

        shape.drawForTest(createCanvasContext());

        expect(shape.hitTest(111, 131)).toMatchObject({
            type: 'insert-row',
            tableId: 'table-orders',
            index: 2,
        });
    });
});
