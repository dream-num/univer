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

import type { UniverRenderingContext } from '@univerjs/engine-render';
import { BooleanNumber, type IWorkbookData, LocaleType, Univer, UniverInstanceType, type Workbook } from '@univerjs/core';
import { SpreadsheetSkeleton } from '@univerjs/sheets';

import { SpreadsheetRenderSkeleton } from '@univerjs/sheets-ui';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
    buildCenteredPlusSegments,
    buildTableMenuRegions,
    hitTestTableControl,
    TABLE_CONTROL_ANCHOR_HEIGHT,
    TABLE_CONTROL_INSERT_BUTTON_SIZE,
    TABLE_CONTROL_MENU_ITEM_HEIGHT,
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

describe('table controls geometry', () => {
    let univer: Univer;
    let skeleton: SpreadsheetRenderSkeleton;

    beforeAll(() => {
        univer = new Univer();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'table-controls-workbook',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: '',
            sheetOrder: ['sheet1'],
            styles: {},
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Sheet1',
                    rowCount: 30,
                    columnCount: 10,
                    cellData: {},
                    hidden: BooleanNumber.FALSE,
                },
            },
        });
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('Active sheet is required for table control tests');
        }

        skeleton = univer.__getInjector().createInstance(
            SpreadsheetRenderSkeleton,
            new SpreadsheetSkeleton(worksheet).calculate(),
            workbook.getStyles()
        ).calculate();
    });

    afterAll(() => univer.dispose());

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
        const shape = new DrawableSheetTableControlsShape('table-controls', () => skeleton);
        shape.setItems([{
            tableId: 'table-orders',
            tableName: 'Orders',
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 },
            fill: '#1f5eff',
            text: '#ffffff',
        }]);
        shape.setOpenedMenuTableId('table-orders');

        shape.drawForTest(createCanvasContext());
        const position = skeleton.getNoMergeCellWithCoordByIndex(0, 0);
        const menuTop = Math.max(0, position.startY - TABLE_CONTROL_ANCHOR_HEIGHT) + TABLE_CONTROL_ANCHOR_HEIGHT;
        const deleteRowCenter = menuTop + TABLE_CONTROL_MENU_ITEM_HEIGHT * 3.5;

        expect(shape.hitTest(position.startX + 16, deleteRowCenter)).toMatchObject({
            type: 'menu-item',
            tableId: 'table-orders',
            action: 'delete',
        });
    });

    it('activates the hovered insert region for row and column insertion', () => {
        const shape = new DrawableSheetTableControlsShape('table-controls', () => skeleton);
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
