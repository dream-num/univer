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

import type { Injector } from '../../common/di';
import type { IDocumentData, IDocumentRenderConfig, IPaddingData } from '../../types/interfaces';
import type { IWorkbookData } from '../typedef';
import { afterEach, describe, expect, it } from 'vitest';
import { IConfigService } from '../../services/config/config.service';
import { IContextService } from '../../services/context/context.service';
import { LocaleService } from '../../services/locale/locale.service';
import { BooleanNumber, HorizontalAlign } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { SheetSkeleton } from '../sheet-skeleton';
import { RANGE_TYPE } from '../typedef';
import { createCoreTestBed } from './create-core-test-bed';

const workbookDataFactory = (): IWorkbookData => ({
    id: 'styled-workbook',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'Styled workbook',
    sheetOrder: ['sheet-1'],
    styles: {},
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Styled sheet',
            rowCount: 8,
            columnCount: 6,
            defaultColumnWidth: 72,
            defaultRowHeight: 24,
            mergeData: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }],
            cellData: {
                0: {
                    3: { v: 'Stop overflow' },
                },
                1: {
                    1: { v: 'Merged main' },
                },
            },
            rowData: {
                0: { h: 28 },
                4: { hd: BooleanNumber.TRUE },
            },
            columnData: {
                1: { w: 120 },
                4: { hd: BooleanNumber.TRUE },
            },
            rowHeader: { width: 46 },
            columnHeader: { height: 28 },
        },
    },
});

class TestableSheetSkeleton extends SheetSkeleton {
    getOverflowBoundPublic(row: number, startColumn: number, endColumn: number, contentWidth: number, horizontalAlign = HorizontalAlign.LEFT) {
        return this._getOverflowBound(row, startColumn, endColumn, contentWidth, horizontalAlign);
    }

    hasUnMergedCellInRowPublic(rowIndex: number, startColumn: number, endColumn: number) {
        return this._hasUnMergedCellInRow(rowIndex, startColumn, endColumn);
    }

    updateConfigAndGetDocumentModelPublic(
        documentData: IDocumentData,
        horizontalAlign: HorizontalAlign,
        paddingData: IPaddingData,
        renderConfig?: IDocumentRenderConfig
    ) {
        return this._updateConfigAndGetDocumentModel(documentData, horizontalAlign, paddingData, renderConfig);
    }
}

describe('SheetSkeleton integration', () => {
    const disposables: Array<() => void> = [];

    afterEach(() => {
        while (disposables.length) {
            disposables.pop()?.();
        }
    });

    it('should calculate merged layout coordinates and offsets from a worksheet snapshot', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = new SheetSkeleton(
            worksheet,
            testBed.sheet.getStyles(),
            injector.get(LocaleService),
            injector.get(IContextService),
            injector.get(IConfigService),
            injector as Injector
        ).calculate()! as TestableSheetSkeleton;

        disposables.push(() => testBed.univer.dispose());

        expect(skeleton.getLocation()).toEqual(['styled-workbook', 'sheet-1']);
        expect(skeleton.rowHeightAccumulation).toEqual([28, 52, 76, 100, 100, 124, 148, 172]);
        expect(skeleton.columnWidthAccumulation).toEqual([72, 192, 264, 336, 336, 408]);
        expect(skeleton.rowTotalHeight).toBe(172);
        expect(skeleton.columnTotalWidth).toBe(408);
        expect(skeleton.rowHeaderWidth).toBe(46);
        expect(skeleton.columnHeaderHeight).toBe(28);
        expect(skeleton.getRowCount()).toBe(8);
        expect(skeleton.getColumnCount()).toBe(6);

        expect(skeleton.expandRangeByMerge({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2, rangeType: RANGE_TYPE.NORMAL })).toEqual({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        });
        expect(skeleton.expandRangeByMerge({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }, true)).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        });

        expect(skeleton.getNoMergeCellWithCoordByIndex(1, 1, false)).toEqual({
            startY: 28,
            endY: 52,
            startX: 72,
            endX: 192,
        });
        expect(skeleton.getCellWithCoordByIndex(1, 1)).toEqual({
            actualRow: 1,
            actualColumn: 1,
            startY: 56,
            endY: 80,
            startX: 118,
            endX: 238,
            isMerged: false,
            isMergedMainCell: true,
            mergeInfo: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startY: 56,
                endY: 104,
                startX: 118,
                endX: 310,
            },
        });

        expect(skeleton.getOffsetByColumn(1)).toBe(238);
        expect(skeleton.getOffsetByColumn(-1)).toBe(46);
        expect(skeleton.getOffsetByColumn(99)).toBe(454);
        expect(skeleton.getOffsetByRow(1)).toBe(80);
        expect(skeleton.getOffsetByRow(-1)).toBe(28);
        expect(skeleton.getOffsetByRow(99)).toBe(200);
        expect(skeleton.getOffsetRelativeToRowCol(100, 50)).toEqual({
            row: 1,
            column: 1,
            rowOffset: 22,
            columnOffset: 28,
        });
    });

    it('should resolve viewport offsets back to visible cells across hidden rows and columns', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = new SheetSkeleton(
            worksheet,
            testBed.sheet.getStyles(),
            injector.get(LocaleService),
            injector.get(IContextService),
            injector.get(IConfigService),
            injector as Injector
        ).calculate()! as TestableSheetSkeleton;

        disposables.push(() => testBed.univer.dispose());

        expect(skeleton.getCellIndexByOffset(150, 60, 1, 1, { x: 0, y: 0 })).toEqual({ row: 1, column: 1 });
        expect(skeleton.getCellByOffset(150, 60, 1, 1, { x: 0, y: 0 })).toMatchObject({
            actualRow: 1,
            actualColumn: 1,
            isMergedMainCell: true,
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        });
        expect(skeleton.getCellWithCoordByOffset(150, 60, 1, 1, { x: 0, y: 0 })).toMatchObject({
            actualRow: 1,
            actualColumn: 1,
            mergeInfo: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
            },
        });

        expect(skeleton.getCellIndexByOffset(382, 128, 1, 1, { x: 0, y: 0 }, { firstMatch: true })).toEqual({ row: 5, column: 5 });
        expect(skeleton.getCellIndexByOffset(252, 96, 2, 2, { x: 24, y: 12 })).toEqual({ row: 1, column: 1 });
        expect(skeleton.getRowIndexByOffsetY(128, 1, { x: 0, y: 0 }, { firstMatch: true })).toBe(5);
        expect(skeleton.getColumnIndexByOffsetX(382, 1, { x: 0, y: 0 }, { firstMatch: true })).toBe(5);
    });

    it('should compute overflow bounds and document render config through the real skeleton instance', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = new TestableSheetSkeleton(
            worksheet,
            testBed.sheet.getStyles(),
            injector.get(LocaleService),
            injector.get(IContextService),
            injector.get(IConfigService),
            injector as Injector
        ).calculate()! as TestableSheetSkeleton;

        disposables.push(() => testBed.univer.dispose());

        expect(skeleton.getOverflowBoundPublic(0, 0, 3, 100)).toBe(1);
        expect(skeleton.getOverflowBoundPublic(0, 0, 3, 500)).toBe(2);
        expect(skeleton.hasUnMergedCellInRowPublic(1, 1, 2)).toBe(false);
        expect(skeleton.hasUnMergedCellInRowPublic(1, 0, 2)).toBe(true);

        const docData: IDocumentData = {
            id: 'doc-in-skeleton',
            body: {
                dataStream: 'Hello\r\n',
                paragraphs: [{ startIndex: 5 }],
            },
            documentStyle: {
                marginTop: 9,
                marginBottom: 9,
                marginLeft: 9,
                marginRight: 9,
                renderConfig: {
                    horizontalAlign: HorizontalAlign.LEFT,
                },
            },
        };
        const updatedModel = skeleton.updateConfigAndGetDocumentModelPublic(
            docData,
            HorizontalAlign.CENTER,
            { t: 1, r: 4, b: 3, l: 2 },
            { horizontalAlign: HorizontalAlign.CENTER }
        );

        expect(skeleton.updateConfigAndGetDocumentModelPublic({ id: 'no-body' } as IDocumentData, HorizontalAlign.CENTER, { t: 0, r: 0, b: 0, l: 0 }, { horizontalAlign: HorizontalAlign.CENTER })).toBeUndefined();
        expect(skeleton.updateConfigAndGetDocumentModelPublic(docData, HorizontalAlign.CENTER, { t: 0, r: 0, b: 0, l: 0 })).toBeUndefined();
        expect(updatedModel?.getSnapshot()).toMatchObject({
            documentStyle: {
                marginTop: 1,
                marginBottom: 3,
                marginLeft: 2,
                marginRight: 4,
                pageSize: {
                    width: Number.POSITIVE_INFINITY,
                    height: Number.POSITIVE_INFINITY,
                },
                renderConfig: {
                    horizontalAlign: HorizontalAlign.CENTER,
                },
            },
            body: {
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.CENTER,
                    },
                }],
            },
        });
    });
});
