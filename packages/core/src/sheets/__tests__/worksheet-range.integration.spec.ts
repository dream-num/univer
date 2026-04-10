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

import type { IWorkbookData } from '../typedef';
import { afterEach, describe, expect, it } from 'vitest';
import { InterceptorEffectEnum } from '../../common/interceptor';
import { CellValueType } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { BooleanNumber, FontItalic, FontWeight, HorizontalAlign, TextDirection, VerticalAlign, WrapStrategy } from '../../types/enum/text-style';
import { CellModeEnum, RANGE_TYPE } from '../typedef';
import { createCoreTestBed } from './create-core-test-bed';

const workbookDataFactory = (): IWorkbookData => ({
    id: 'styled-workbook',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'Styled workbook',
    sheetOrder: ['sheet-1'],
    styles: {
        default: {
            bg: { rgb: '#ffffff' },
            cl: { rgb: '#111111' },
            ff: 'Arial',
            fs: 10,
            ht: HorizontalAlign.LEFT,
            vt: VerticalAlign.TOP,
            tb: WrapStrategy.CLIP,
            tr: { a: 0 },
            td: TextDirection.LEFT_TO_RIGHT,
        },
        rowStyle: {
            cl: { rgb: '#00aa00' },
            bl: BooleanNumber.TRUE,
        },
        colStyle: {
            bg: { rgb: '#ffeeee' },
            it: BooleanNumber.TRUE,
        },
        cellStyle: {
            bg: { rgb: '#654321' },
            cl: { rgb: '#123456' },
            ff: 'Inter',
            fs: 14,
            ol: { s: BooleanNumber.TRUE },
            ht: HorizontalAlign.CENTER,
            vt: VerticalAlign.MIDDLE,
            tb: WrapStrategy.WRAP,
            tr: { a: 45 },
            td: TextDirection.RIGHT_TO_LEFT,
        },
    },
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Styled sheet',
            rowCount: 8,
            columnCount: 6,
            defaultStyle: 'default',
            freeze: { xSplit: 1, ySplit: 1, startRow: 1, startColumn: 1 },
            zoomRatio: 1.25,
            scrollLeft: 15,
            scrollTop: 10,
            defaultColumnWidth: 72,
            defaultRowHeight: 24,
            hidden: BooleanNumber.FALSE,
            mergeData: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }],
            cellData: {
                0: {
                    1: { v: 'Composed' },
                },
                1: {
                    1: {
                        v: 'Rich',
                        t: CellValueType.STRING,
                        s: 'cellStyle',
                        p: {
                            id: 'cell-doc',
                            body: {
                                dataStream: 'Rich\r\n',
                                textRuns: [{ st: 0, ed: 4, ts: { fs: 18, it: BooleanNumber.TRUE, bl: BooleanNumber.TRUE, ul: { s: BooleanNumber.TRUE }, st: { s: BooleanNumber.TRUE } } }],
                            },
                            documentStyle: {
                                pageSize: { width: 100, height: 100 },
                                marginTop: 0,
                                marginBottom: 0,
                                marginLeft: 0,
                                marginRight: 0,
                            },
                        },
                    },
                },
                3: {
                    3: { v: true, t: CellValueType.BOOLEAN },
                },
                4: {
                    1: { f: '=SUM(A1:A2)', v: 3, t: CellValueType.NUMBER },
                },
            },
            rowData: {
                0: { h: 28, s: 'rowStyle' },
                4: { hd: BooleanNumber.TRUE },
            },
            columnData: {
                1: { w: 120, s: 'colStyle' },
                4: { hd: BooleanNumber.TRUE },
            },
            rowHeader: { width: 46 },
            columnHeader: { height: 28 },
            showGridlines: BooleanNumber.FALSE,
            gridlinesColor: '#d0d0d0',
            rightToLeft: BooleanNumber.TRUE,
            tabColor: '#abcdef',
            custom: { owner: 'qa' },
        },
    },
});

describe('Worksheet/range integration', () => {
    const disposables: Array<() => void> = [];

    afterEach(() => {
        while (disposables.length) {
            disposables.pop()?.();
        }
    });

    it('should read worksheet metadata, merged cells and formatted ranges from a realistic snapshot', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const worksheet = testBed.sheet.getActiveSheet()!;
        disposables.push(() => testBed.univer.dispose());

        expect(worksheet.getFreeze()).toEqual({ xSplit: 1, ySplit: 1, startRow: 1, startColumn: 1 });
        expect(worksheet.getZoomRatio()).toBe(1.25);
        expect(worksheet.getConfig().name).toBe('Styled sheet');
        expect(worksheet.getMaxRows()).toBe(8);
        expect(worksheet.getMaxColumns()).toBe(6);
        expect(worksheet.getRowCount()).toBe(8);
        expect(worksheet.getColumnCount()).toBe(6);
        expect(worksheet.isSheetHidden()).toBe(BooleanNumber.FALSE);
        expect(worksheet.hasHiddenGridlines()).toBe(true);
        expect(worksheet.getGridlinesColor()).toBe('#d0d0d0');
        expect(worksheet.getTabColor()).toBe('#abcdef');
        expect(worksheet.getColumnWidth(1)).toBe(120);
        expect(worksheet.getRowHeight(0)).toBe(28);
        expect(worksheet.getRowVisible(4)).toBe(false);
        expect(worksheet.getRowRawVisible(4)).toBe(false);
        expect(worksheet.getColVisible(4)).toBe(false);
        expect(worksheet.getHiddenRows()).toEqual([
            expect.objectContaining({ startRow: 4, endRow: 4, startColumn: 0, endColumn: 5 }),
        ]);
        expect(worksheet.getHiddenCols()).toEqual([
            expect.objectContaining({ startRow: 0, endRow: 7, startColumn: 4, endColumn: 4 }),
        ]);
        expect(worksheet.getVisibleRows()).toEqual(expect.arrayContaining([
            expect.objectContaining({ startRow: 0, endRow: 3 }),
            expect.objectContaining({ startRow: 5, endRow: 7 }),
        ]));
        expect(worksheet.getVisibleCols()).toEqual(expect.arrayContaining([
            expect.objectContaining({ startColumn: 0, endColumn: 3 }),
            expect.objectContaining({ startColumn: 5, endColumn: 5 }),
        ]));
        expect(worksheet.isRightToLeft()).toBe(BooleanNumber.TRUE);
        expect(worksheet.getLastRowWithContent()).toBe(4);
        expect(worksheet.getLastColumnWithContent()).toBe(3);
        expect(worksheet.getDataRealRange()).toEqual({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 });
        expect(worksheet.getDataRangeScope()).toEqual({ startRow: 0, endRow: 4, startColumn: 1, endColumn: 3 });

        expect(worksheet.getCustomMetadata()).toEqual({ owner: 'qa' });
        worksheet.setCustomMetadata({ owner: 'core' });
        expect(worksheet.getCustomMetadata()).toEqual({ owner: 'core' });

        const mergeMainCell = worksheet.getCellInfoInMergeData(1, 1);
        const mergeInnerCell = worksheet.getCellInfoInMergeData(2, 2);
        expect(worksheet.getMergedCell(2, 2)).toEqual({ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL });
        expect(worksheet.getMergedCellRange(1, 1, 2, 2)).toEqual([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }]);
        expect(worksheet.isRowContainsMergedCell(1)).toBe(true);
        expect(worksheet.isColumnContainsMergedCell(1)).toBe(true);
        expect(mergeMainCell.isMergedMainCell).toBe(true);
        expect(mergeInnerCell.isMerged).toBe(true);

        const composedStyle = worksheet.getComposedCellStyle(0, 1);
        expect(composedStyle.ff).toBe('Arial');
        expect(composedStyle.cl?.rgb).toBe('#00aa00');
        expect(composedStyle.bg?.rgb).toBe('#ffeeee');
        expect(composedStyle.it).toBe(BooleanNumber.TRUE);
        expect(composedStyle.bl).toBe(BooleanNumber.TRUE);

        expect(worksheet.getCell(-1, 0)).toBeNull();
        expect(worksheet.getCellValueOnly(-1, 0)).toBeNull();
        expect(worksheet.getCellStyleOnly(-1, 0)).toBeNull();
        expect(worksheet.getRangeFilterRows({ startRow: 0, endRow: 7, startColumn: 0, endColumn: 5, rangeType: RANGE_TYPE.NORMAL })).toEqual([]);
        expect(worksheet.cellHasValue({})).toBe(false);
        expect(worksheet.cellHasValue({ v: 0 })).toBe(true);

        const richCell = worksheet.getRange(1, 1);
        expect(richCell.getValue()?.v).toBe('Rich');
        expect(richCell.getA1Notation()).toBe('B2');
        expect(richCell.getBackground()).toBe('#654321');
        expect(richCell.getFontColor()).toBe('#123456');
        expect(richCell.getFontFamily()).toBe('Inter');
        expect(richCell.getFontSize()).toBe(18);
        expect(richCell.getFontStyle()).toBe(FontItalic.ITALIC);
        expect(richCell.getFontWeight()).toBe(FontWeight.BOLD);
        expect(richCell.getUnderline()).toEqual({ s: BooleanNumber.TRUE });
        expect(richCell.getOverline()).toEqual({ s: BooleanNumber.TRUE });
        expect(richCell.getStrikeThrough()).toEqual({ s: BooleanNumber.TRUE });
        expect(richCell.getHorizontalAlignment()).toBe(HorizontalAlign.CENTER);
        expect(richCell.getVerticalAlignment()).toBe(VerticalAlign.MIDDLE);
        expect(richCell.getTextDirection()).toBe(TextDirection.RIGHT_TO_LEFT);
        expect(richCell.getTextRotation()).toEqual({ a: 45 });
        expect(richCell.getWrap()).toBe(BooleanNumber.TRUE);
        expect(richCell.getWrapStrategy()).toBe(WrapStrategy.WRAP);
        expect(richCell.getRichTextValue()).toMatchObject({
            id: 'cell-doc',
            body: {
                dataStream: 'Rich\r\n',
                textRuns: [{ st: 0, ed: 4, ts: { fs: 18, it: BooleanNumber.TRUE, bl: BooleanNumber.TRUE, ul: { s: BooleanNumber.TRUE }, st: { s: BooleanNumber.TRUE } } }],
            },
        });
        expect(richCell.getTextStyle()?.ff).toBe('Inter');

        const mergedRange = worksheet.getRange(1, 1, 2, 2);
        expect(mergedRange.getRangeData()).toEqual({ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 });
        expect(mergedRange.getValues()).toHaveLength(2);
        expect(mergedRange.getMatrix().getValue(1, 1)?.v).toBe('Rich');
        expect(mergedRange.getMatrixObject().getValue(0, 0)?.v).toBe('Rich');
        expect(mergedRange.getObjectValue({ isIncludeStyle: true })?.s).toMatchObject({ ff: 'Inter' });
        expect(mergedRange.getObjectValues({ isIncludeStyle: true })?.[0]?.[0]?.s).toMatchObject({ ff: 'Inter' });
        expect(mergedRange.getGridId()).toBe('sheet-1');
        expect(mergedRange.getSheet().getSheetId()).toBe('sheet-1');
        expect(mergedRange.getColumn()).toBe(1);
        expect(mergedRange.getRowIndex()).toBe(1);
        expect(mergedRange.getLastColumn()).toBe(2);
        expect(mergedRange.getLastRow()).toBe(2);
        expect(mergedRange.getNumColumns()).toBe(2);
        expect(mergedRange.getNumRows()).toBe(2);

        const visited: Array<[number, number]> = [];
        mergedRange.forEach((row, column) => {
            visited.push([row, column]);
        });
        expect(visited).toEqual([
            [1, 1],
            [1, 2],
            [2, 1],
            [2, 2],
        ]);
        expect(mergedRange.getCell(0, 0).getA1Notation()).toBe('B2');

        const widthHeightRange = worksheet.getRange(0, 0, 1, 1);
        expect(widthHeightRange.getWidth()).toBe(192);
        expect(widthHeightRange.getHeight()).toBe(52);

        expect(worksheet.getCellDocumentModelWithFormula({ f: '=SUM(A1:A2)', v: 3, t: CellValueType.NUMBER }, 4, 1)?.documentModel).toBeDefined();
        expect(worksheet.getBlankCellDocumentModel(null, 6, 5).documentModel).toBeDefined();

        worksheet.setRowCount(10);
        worksheet.setColumnCount(7);
        expect(worksheet.getRowCount()).toBe(10);
        expect(worksheet.getColumnCount()).toBe(7);
    });

    it('should mutate row and column managers through real worksheet state', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const worksheet = testBed.sheet.getActiveSheet()!;
        const rowManager = worksheet.getRowManager();
        const columnManager = worksheet.getColumnManager();
        disposables.push(() => testBed.univer.dispose());

        expect(rowManager.getRowData()[0]).toMatchObject({ h: 28, s: 'rowStyle' });
        expect(rowManager.getRowStyle(0)).toBe('rowStyle');
        rowManager.setRowStyle(2, 'rowStyle');
        expect(rowManager.getRowStyle(2)).toBe('rowStyle');
        expect(rowManager.getRowDatas(0, 3)).toEqual({
            0: { h: 28, s: 'rowStyle' },
            1: { h: 24, hd: BooleanNumber.FALSE },
            2: { s: 'rowStyle' },
        });
        expect(rowManager.getRowHeight(0, 2)).toBe(52);

        rowManager.setRowHeight(6, 4000);
        expect(rowManager.getRowHeight(6)).toBe(2000);
        rowManager.setRowHeight(6, 24);
        expect(rowManager.getRow(6)).toBeUndefined();

        rowManager.insertRowsWithData(1, 2, {
            0: { h: 40, custom: { label: 'inserted-row' } },
            1: { hd: BooleanNumber.TRUE },
        });
        expect(rowManager.getRow(1)).toMatchObject({ h: 40, custom: { label: 'inserted-row' } });
        expect(rowManager.getRowRawVisible(2)).toBe(false);
        expect(rowManager.getHiddenRows(0, 8)).toEqual(expect.arrayContaining([
            expect.objectContaining({ startRow: 2, endRow: 2, rangeType: RANGE_TYPE.ROW }),
            expect.objectContaining({ startRow: 6, endRow: 6, rangeType: RANGE_TYPE.ROW }),
        ]));
        expect(rowManager.getVisibleRows(0, 8)).toEqual(expect.arrayContaining([
            expect.objectContaining({ startRow: 0, endRow: 1, rangeType: RANGE_TYPE.ROW }),
            expect.objectContaining({ startRow: 3, endRow: 5, rangeType: RANGE_TYPE.ROW }),
            expect.objectContaining({ startRow: 7, endRow: 8, rangeType: RANGE_TYPE.ROW }),
        ]));
        rowManager.removeRow(1);
        expect(rowManager.getRow(1)).toBeUndefined();

        rowManager.getRowOrCreate(3);
        rowManager.setCustomMetadata(3, { tag: 'row-meta' });
        expect(rowManager.getCustomMetadata(3)).toEqual({ tag: 'row-meta' });
        expect(rowManager.getRowOrCreate(5)).toMatchObject({});
        expect(rowManager.getSize()).toBeGreaterThanOrEqual(7);

        expect(columnManager.getColumnData()[1]).toMatchObject({ w: 120, s: 'colStyle' });
        expect(columnManager.getColumnStyle(1)).toBe('colStyle');
        columnManager.setColumnStyle(2, 'colStyle');
        expect(columnManager.getColumnStyle(2)).toBe('colStyle');
        expect(columnManager.getColumnDatas(0, 3)).toEqual({
            0: { w: 72, hd: BooleanNumber.FALSE },
            1: { w: 120, s: 'colStyle' },
            2: { s: 'colStyle' },
        });

        columnManager.setColumnWidth(5, 90);
        expect(columnManager.getColumnWidth(5)).toBe(90);
        columnManager.setColumnWidth(5, 72);
        expect(columnManager.getColumn(5)).toBeUndefined();

        columnManager.insertColumnsWithData(1, 2, {
            0: { w: 88, custom: { label: 'inserted-column' } },
            1: { hd: BooleanNumber.TRUE },
        });
        expect(columnManager.getColumn(1)).toMatchObject({ w: 88, custom: { label: 'inserted-column' } });
        expect(columnManager.getColVisible(2)).toBe(false);
        expect(columnManager.getHiddenCols(0, 7)).toEqual(expect.arrayContaining([
            expect.objectContaining({ startColumn: 2, endColumn: 2, rangeType: RANGE_TYPE.COLUMN }),
            expect.objectContaining({ startColumn: 6, endColumn: 6, rangeType: RANGE_TYPE.COLUMN }),
        ]));
        expect(columnManager.getVisibleCols(0, 7)).toEqual(expect.arrayContaining([
            expect.objectContaining({ startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.COLUMN }),
            expect.objectContaining({ startColumn: 3, endColumn: 5, rangeType: RANGE_TYPE.COLUMN }),
            expect.objectContaining({ startColumn: 7, endColumn: 7, rangeType: RANGE_TYPE.COLUMN }),
        ]));
        columnManager.removeColumn(1);
        expect(columnManager.getColumn(1)).toBeUndefined();

        columnManager.getColumnOrCreate(3);
        columnManager.setCustomMetadata(3, { tag: 'column-meta' });
        expect(columnManager.getCustomMetadata(3)).toEqual({ tag: 'column-meta' });
        expect(columnManager.getColumn(6)).toMatchObject({ hd: BooleanNumber.TRUE });
        expect(columnManager.getColumnOrCreate(8)).toMatchObject({});
        expect(columnManager.getSize()).toBeGreaterThanOrEqual(7);
    });

    it('should expose worksheet utility apis through real style, interceptor and matrix flows', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const worksheet = testBed.sheet.getActiveSheet()!;
        disposables.push(() => testBed.univer.dispose());

        const getCellHeightDisposable = worksheet.__registerGetCellHeight((row, column) => row + column + 100);
        expect(worksheet.getCellHeight(2, 3)).toBe(105);
        getCellHeightDisposable.dispose();
        expect(worksheet.getCellHeight(2, 3)).toBe(24);

        const styleHash = worksheet.setStyleData({ ff: 'Manrope', fs: 16, bg: { rgb: '#101010' } })!;
        expect(worksheet.getStyleDataByHash(styleHash)).toMatchObject({ ff: 'Manrope', fs: 16 });

        worksheet.setColumnStyle(3, styleHash);
        worksheet.setRowStyle(3, styleHash);
        expect(worksheet.getColumnStyle(3, true)).toBe(styleHash);
        expect(worksheet.getColumnStyle(3)).toMatchObject({ ff: 'Manrope' });
        expect(worksheet.getRowStyle(3, true)).toBe(styleHash);
        expect(worksheet.getRowStyle(3)).toMatchObject({ ff: 'Manrope' });

        expect(worksheet.getDefaultCellStyle()).toBe('default');
        worksheet.setDefaultCellStyle(styleHash);
        expect(worksheet.getDefaultCellStyle()).toBe(styleHash);
        expect(worksheet.getDefaultCellStyleInternal()).toMatchObject({ ff: 'Manrope' });
        expect(worksheet.getCellStyle(1, 1)).toMatchObject({ ff: 'Inter' });

        const rawCell = worksheet.getCellRaw(1, 1);
        expect(rawCell?.v).toBe('Rich');
        expect(worksheet.getComposedCellStyleByCellData(1, 1, rawCell)).toMatchObject({ ff: 'Inter', bg: { rgb: '#654321' } });
        expect(worksheet.getComposedCellStyleWithoutSelf(1, 1, rawCell)).toMatchObject({});

        worksheet.setIsRowStylePrecedeColumnStyle(true);
        expect(worksheet.getComposedCellStyle(0, 1).cl?.rgb).toBe('#00aa00');
        worksheet.setIsRowStylePrecedeColumnStyle(false);

        worksheet.__interceptViewModel((viewModel) => {
            disposables.push(() => viewModel.dispose());
            const cellContentDisposable = viewModel.registerCellContentInterceptor({
                getCell(row, col, effect) {
                    const cell = worksheet.getCellRaw(row, col);
                    if (!cell) {
                        return null;
                    }

                    if (effect === InterceptorEffectEnum.Style) {
                        return { ...cell, interceptorStyle: { bg: { rgb: '#abcdef' } } };
                    }

                    if (effect === InterceptorEffectEnum.Value) {
                        return { ...cell, v: `value-${row}-${col}` };
                    }

                    return { ...cell, v: `both-${row}-${col}`, interceptorStyle: { bg: { rgb: '#fedcba' } } };
                },
            });
            const rowFilteredDisposable = viewModel.registerRowFilteredInterceptor({
                getRowFiltered(row) {
                    return row === 1;
                },
            });
            disposables.push(() => cellContentDisposable.dispose());
            disposables.push(() => rowFilteredDisposable.dispose());
        });

        expect(worksheet.getCell(1, 1)?.v).toBe('both-1-1');
        expect(worksheet.getCellValueOnly(1, 1)?.v).toBe('value-1-1');
        expect(worksheet.getCellStyleOnly(1, 1)?.interceptorStyle).toEqual({ bg: { rgb: '#abcdef' } });
        expect(worksheet.getCellWithFilteredInterceptors(1, 1, 'demo', () => true)?.v).toBe('both-1-1');
        expect(worksheet.getRowFiltered(1)).toBe(true);
        expect(worksheet.getRangeFilterRows({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2, rangeType: RANGE_TYPE.NORMAL })).toEqual([1]);

        const mergedMatrix = worksheet.getMatrixWithMergedCells(1, 1, 2, 2, CellModeEnum.Both);
        expect(mergedMatrix.getValue(1, 1)).toMatchObject({ rowSpan: 2, colSpan: 2, v: 'Rich' });
        expect(mergedMatrix.getValue(2, 2)).toBeUndefined();

        const objectRange = worksheet.getRange({ startRow: 0, startColumn: 1, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL });
        expect(objectRange.getA1Notation()).toBe('B1');
        expect(worksheet.getScrollLeftTopFromSnapshot()).toEqual({ scrollLeft: 15, scrollTop: 10 });
        expect(worksheet.getUnitId()).toBe('styled-workbook');
        expect(worksheet.getSheetId()).toBe('sheet-1');
        expect(worksheet.getName()).toBe('Styled sheet');

        const clone = worksheet.clone();
        expect(clone).not.toBe(worksheet);
        expect(clone.getSnapshot()).toEqual(worksheet.getSnapshot());

        worksheet.setMergeData([{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL }]);
        expect(worksheet.getMergeData()).toEqual([{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL }]);
        expect(worksheet.getSpanModel().getMergedCell(0, 1)).toEqual({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL });
    });
});
