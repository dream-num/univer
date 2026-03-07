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

import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import {
    checkCellContentInRange,
    checkCellContentInRanges,
    getCellIndexByOffsetWithMerge,
    getCellRealRange,
    getHoverCellPosition,
    getUserListEqual,
    getViewportByCell,
    transformBound2OffsetBound,
    transformPosition2Offset,
} from '../utils';

describe('common utils', () => {
    it('compares collaborator user lists by user id and role', () => {
        const list1 = [
            { id: 'b', subject: { userID: 'u2' }, role: 'viewer' },
            { id: 'a', subject: { userID: 'u1' }, role: 'editor' },
        ] as any;
        const list2 = [
            { id: 'a', subject: { userID: 'u1' }, role: 'editor' },
            { id: 'b', subject: { userID: 'u2' }, role: 'viewer' },
        ] as any;
        const list3 = [{ id: 'a', subject: { userID: 'u1' }, role: 'viewer' }] as any;

        expect(getUserListEqual(list1, list2)).toBe(true);
        expect(getUserListEqual(list1, list3)).toBe(false);
        expect(getUserListEqual(list2, [{ id: 'a', subject: { userID: 'u1' }, role: 'viewer' }, { id: 'b', subject: { userID: 'u2' }, role: 'viewer' }] as any)).toBe(false);
    });

    it('checks whether cell contents exist in single or multiple ranges', () => {
        const matrixWithValue = {
            forValue: (cb: (...args: any[]) => void) => {
                cb(0, 0, { v: 'primary' });
                cb(0, 1, { v: 'other' });
            },
        };
        const matrixWithoutValue = {
            forValue: (cb: (...args: any[]) => void) => {
                cb(0, 0, { v: 'primary' });
                cb(1, 1, null);
            },
        };

        const worksheet = {
            getMatrixWithMergedCells: (_sr: number, _sc: number, _er: number, ec: number) => (ec > 1 ? matrixWithoutValue : matrixWithValue),
            cellHasValue: (cell: any) => !!cell?.v,
        };

        expect(checkCellContentInRange(worksheet as any, { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } as any)).toBe(true);
        expect(checkCellContentInRanges(worksheet as any, [
            { startRow: 0, startColumn: 0, endRow: 0, endColumn: 2 },
            { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
        ] as any)).toBe(true);
    });

    it('gets cell index by offset with merged-cell fallback', () => {
        const scene = {
            getActiveViewportByCoord: () => ({ viewportScrollX: 10, viewportScrollY: 20 }),
            getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
        };
        const skeleton = {
            getCellIndexByOffset: () => ({ row: 4, column: 5 }),
            worksheet: {
                getMergedCell: () => ({ startRow: 1, startColumn: 2 }),
            },
        };

        const result = getCellIndexByOffsetWithMerge(100, 120, scene as any, skeleton as any)!;
        expect(result).toEqual(expect.objectContaining({
            row: 4,
            col: 5,
            actualRow: 1,
            actualCol: 2,
        }));

        const noViewport = {
            getActiveViewportByCoord: () => null,
        };
        expect(getCellIndexByOffsetWithMerge(1, 2, noViewport as any, skeleton as any)).toBeUndefined();
    });

    it('resolves viewport by cell with and without freeze panes', () => {
        const scene = {
            getViewport: (key: string) => key,
        };
        const noFreezeSheet = { getFreeze: () => null };
        expect(getViewportByCell(1, 1, scene as any, noFreezeSheet as any)).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN);

        const freezeSheet = { getFreeze: () => ({ startRow: 2, startColumn: 3 }) };
        expect(getViewportByCell(3, 3, scene as any, freezeSheet as any)).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        expect(getViewportByCell(1, 1, scene as any, freezeSheet as any)).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
        expect(getViewportByCell(1, 3, scene as any, freezeSheet as any)).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);
        expect(getViewportByCell(3, 1, scene as any, freezeSheet as any)).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT);
    });

    it('transforms sheet position to viewport offset', () => {
        const sceneNoViewport = {
            getAncestorScale: () => ({ scaleX: 2, scaleY: 2 }),
            getViewport: () => null,
        };
        expect(transformPosition2Offset(10, 20, sceneNoViewport as any, {} as any, {} as any)).toEqual({ x: 10, y: 20 });

        const scene = {
            getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
            getViewport: () => ({ top: 50, left: 40, viewportScrollX: 5, viewportScrollY: 6 }),
        };
        const skeleton = {
            getNoMergeCellWithCoordByIndex: (row: number, col: number) => {
                if (row === 1 && col === 2) {
                    return { startX: 20, startY: 30 };
                }
                return { startX: 70, startY: 90 };
            },
            rowHeaderWidth: 10,
            columnHeaderHeight: 8,
        };
        const worksheet = {
            getFreeze: () => ({ startColumn: 3, startRow: 2, xSplit: 1, ySplit: 1 }),
        };

        const result = transformPosition2Offset(60, 20, scene as any, skeleton as any, worksheet as any);
        expect(result).toEqual({ x: 110, y: 76 });

        const bound = transformBound2OffsetBound({ left: 30, top: 20, right: 60, bottom: 70 } as any, scene as any, skeleton as any, worksheet as any);
        expect(bound.left).toBeTypeOf('number');
        expect(bound.right).toBeTypeOf('number');
        expect(bound.top).toBeTypeOf('number');
        expect(bound.bottom).toBeTypeOf('number');
    });

    it('gets real cell range and hover cell position with overflow and merge fallback', () => {
        const overflowRange = { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 };
        const skeleton = {
            overflowCache: {
                forValue: (cb: (...args: any[]) => void) => cb(1, 1, overflowRange),
            },
            getCellWithCoordByIndex: (row: number, col: number) => ({
                actualRow: row,
                actualColumn: col,
                mergeInfo: row === 1 && col === 1 ? { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 } : null,
            }),
            getOffsetByColumn: (col: number) => col * 20,
            getOffsetByRow: (row: number) => row * 10,
            getCellIndexByOffset: () => ({ row: 1, column: 1 }),
            worksheet: { getMergedCell: () => null },
        };
        const workbook = { getUnitId: () => 'unit-1' };
        const worksheet = { getSheetId: () => 'sheet-1' };

        const location = getCellRealRange(workbook as any, worksheet as any, skeleton as any, 2, 2);
        expect(location.row).toBe(1);
        expect(location.col).toBe(1);

        const scene = {
            getActiveViewportByCoord: () => ({ viewportScrollX: 3, viewportScrollY: 4 }),
            getAncestorScale: () => ({ scaleX: 2, scaleY: 2 }),
        };
        const currentRender = { scene };
        const hover = getHoverCellPosition(
            currentRender as any,
            workbook as any,
            worksheet as any,
            { skeleton, sheetId: 'sheet-1' } as any,
            100,
            120
        );
        expect(hover?.location.row).toBe(1);
        expect(hover?.overflowLocation.row).toBe(1);
        expect(hover?.position.startX).toBeTypeOf('number');

        const noCellIndexSkeleton = {
            ...skeleton,
            getCellIndexByOffset: () => ({ row: 1, column: 1 }),
        };
        const noActiveViewportRender = {
            scene: {
                getActiveViewportByCoord: () => null,
                getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
            },
        };
        expect(getHoverCellPosition(noActiveViewportRender as any, workbook as any, worksheet as any, { skeleton: noCellIndexSkeleton, sheetId: 'sheet-1' } as any, 1, 2)).toBeNull();
    });
});
