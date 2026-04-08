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

import type { ICellData, ICellWithCoord, IRange, ISelectionCell } from '../../sheets/typedef';
import type { IDocumentData } from '../../types/interfaces';
import { describe, expect, it } from 'vitest';
import {
    RANGE_TYPE,
} from '../../sheets/typedef';
import { BorderStyleTypes, ThemeColorType } from '../../types/enum';
import {
    BaselineOffset,
    HorizontalAlign,
    TextDirection,
    VerticalAlign,
    WrapStrategy,
} from '../../types/enum/text-style';
import {
    cellToRange,
    convertCellToRange,
    covertCellValue,
    covertCellValues,
    getBorderStyleType,
    getColorStyle,
    getDocsUpdateBody,
    handleStyleToString,
    isCellCoverable,
    isEmptyCell,
    isFormulaId,
    isFormulaString,
    isValidRange,
    makeCellRangeToRangeData,
} from '../common';

function createCellWithCoord(overrides?: Partial<ICellWithCoord>): ICellWithCoord {
    return {
        actualRow: 1,
        actualColumn: 2,
        startX: 10,
        endX: 20,
        startY: 30,
        endY: 40,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: {
            startRow: 0,
            startColumn: 0,
            endRow: 2,
            endColumn: 3,
            startX: 1,
            endX: 4,
            startY: 5,
            endY: 6,
        },
        ...overrides,
    } as ICellWithCoord;
}

describe('Test common', () => {
    it('Test cellToRange', () => {
        expect(cellToRange(0, 1)).toStrictEqual({ startRow: 0, startColumn: 1, endRow: 0, endColumn: 1 });
    });

    it('Test isFormulaString', () => {
        expect(isFormulaString('=SUM(1)')).toBe(true);
        expect(isFormulaString('SUM(1)')).toBe(false);
        expect(isFormulaString('=')).toBe(false);
        expect(isFormulaString('')).toBe(false);
        expect(isFormulaString(1)).toBe(false);
        expect(isFormulaString(null)).toBe(false);
        expect(isFormulaString(undefined)).toBe(false);
        expect(isFormulaString(true)).toBe(false);
        expect(isFormulaString({})).toBe(false);
        expect(isFormulaString({ f: '' })).toBe(false);
    });

    it('Test isFormulaId', () => {
        expect(isFormulaId('id1')).toBe(true);
        expect(isFormulaId('')).toBe(false);
        expect(isFormulaId(1)).toBe(false);
        expect(isFormulaId(null)).toBe(false);
        expect(isFormulaId(undefined)).toBe(false);
        expect(isFormulaId(true)).toBe(false);
        expect(isFormulaId({})).toBe(false);
        expect(isFormulaId({ f: '' })).toBe(false);
    });

    it('should convert merged and merged-main cells into ranges', () => {
        expect(convertCellToRange(createCellWithCoord())).toEqual({
            startRow: 1,
            startColumn: 2,
            endRow: 1,
            endColumn: 2,
            startY: 30,
            endY: 40,
            startX: 10,
            endX: 20,
        });

        expect(convertCellToRange(createCellWithCoord({ isMerged: true }))).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 2,
            endColumn: 3,
            startY: 5,
            endY: 6,
            startX: 1,
            endX: 4,
        });

        expect(convertCellToRange(createCellWithCoord({ isMergedMainCell: true }))).toEqual({
            startRow: 1,
            startColumn: 2,
            endRow: 2,
            endColumn: 3,
            startY: 5,
            endY: 6,
            startX: 1,
            endX: 4,
        });
    });

    it('should build plain ranges and check empty or coverable cells', () => {
        expect(makeCellRangeToRangeData(null)).toBeUndefined();
        expect(makeCellRangeToRangeData({
            actualRow: 4,
            actualColumn: 5,
            isMerged: true,
            isMergedMainCell: false,
            startRow: 1,
            startColumn: 2,
            endRow: 6,
            endColumn: 7,
        } as ISelectionCell)).toEqual({
            startRow: 1,
            startColumn: 2,
            endRow: 6,
            endColumn: 7,
        });

        expect(isEmptyCell(null)).toBe(true);
        expect(isEmptyCell({ v: '', p: null } as ICellData)).toBe(true);
        expect(isEmptyCell({ v: '', p: { body: { dataStream: 'x' } } } as unknown as ICellData)).toBe(false);
        expect(isCellCoverable({ v: '', p: null } as unknown as ICellData)).toBe(true);
        expect(isCellCoverable({ v: '', p: null, coverable: false } as never)).toBe(false);
    });

    it('should resolve colors and style strings', () => {
        expect(getColorStyle({ rgb: 'rgb(255, 0, 0)' })).toBe('#ff0000');
        expect(getColorStyle({ th: ThemeColorType.ACCENT1 })).toBe('rgb(68,114,196)');
        expect(getColorStyle(null)).toBeNull();

        const style = handleStyleToString({
            ff: 'Mono',
            fs: 20,
            it: 1,
            bl: 1,
            ul: { s: 1, cl: { rgb: '#00ff00' }, t: 'solid' as never },
            st: { s: 1, cl: { rgb: '#ff0000' }, t: 'solid' as never },
            ol: { s: 1, cl: { rgb: '#0000ff' }, t: 'solid' as never },
            bg: { rgb: '#ffffff' },
            bd: { b: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } } },
            cl: { rgb: '#111111' },
            va: BaselineOffset.SUPERSCRIPT,
            td: TextDirection.RIGHT_TO_LEFT,
            tr: { a: 45, v: 1 },
            ht: HorizontalAlign.CENTER,
            vt: VerticalAlign.MIDDLE,
            tb: WrapStrategy.WRAP,
            pd: { t: 1, r: 2, b: 3, l: 4 },
        } as never);

        expect(style).toContain('font-family: Mono;');
        expect(style).toContain('font-size: 10pt;');
        expect(style).toContain('font-style: italic;');
        expect(style).toContain('font-weight: bold;');
        expect(style).toContain('text-decoration');
        expect(style).toContain('background: #ffffff;');
        expect(style).toContain('border-bottom: 0.5pt solid #000000;');
        expect(style).toContain('color: #111111;');
        expect(style).toContain('vertical-align: super;');
        expect(style).toContain('direction: rtl;');
        expect(style).toContain('--data-rotate: (45deg ,1);');
        expect(style).toContain('text-align: center;');
        expect(style).toContain('white-space: normal;');
        expect(style).toContain('padding-left: 4pt;');

        const cellStyle = handleStyleToString({
            bd: { b: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } } },
            tr: { a: 30 },
            tb: WrapStrategy.CLIP,
        } as never, true);
        expect(cellStyle).toBe('');
    });

    it('should map border types and document segments', () => {
        expect(getBorderStyleType('none')).toBe(BorderStyleTypes.NONE);
        expect(getBorderStyleType('0.5pt dashed')).toBe(BorderStyleTypes.DASHED);
        expect(getBorderStyleType('1pt solid')).toBe(BorderStyleTypes.MEDIUM);
        expect(getBorderStyleType('unknown solid')).toBe(BorderStyleTypes.THIN);

        const model: IDocumentData = {
            id: 'doc-1',
            body: { dataStream: 'body' },
            headers: { h1: { headerId: 'h1', body: { dataStream: 'header' } } },
            footers: { f1: { footerId: 'f1', body: { dataStream: 'footer' } } },
            documentStyle: {
                pageSize: { width: 100, height: 100 },
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
            },
        } as IDocumentData;

        expect(getDocsUpdateBody(model)?.dataStream).toBe('body');
        expect(getDocsUpdateBody(model, 'h1')?.dataStream).toBe('header');
        expect(getDocsUpdateBody(model, 'f1')?.dataStream).toBe('footer');
    });

    it('should validate ranges and convert cell values or matrices', () => {
        const worksheet = {
            getRowCount: () => 10,
            getColumnCount: () => 10,
        };

        expect(isValidRange({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }, worksheet as never)).toBe(true);
        expect(isValidRange({ startRow: -1, endRow: 1, startColumn: 0, endColumn: 1 })).toBe(false);
        expect(isValidRange({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.COLUMN })).toBe(false);
        expect(isValidRange({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.ROW })).toBe(false);
        expect(isValidRange({ startRow: 0, endRow: 10, startColumn: 0, endColumn: 1 }, worksheet as never)).toBe(false);
        expect(isValidRange({
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: 0,
            endColumn: 1,
            rangeType: RANGE_TYPE.COLUMN,
        })).toBe(true);

        expect(covertCellValue('=SUM(1,2)')).toEqual({ f: '=SUM(1,2)', v: null, p: null });
        expect(covertCellValue(1)).toEqual({ v: 1, p: null, f: null });
        const cell = { v: 'text', p: null, f: null } as ICellData;
        expect(covertCellValue(cell)).toBe(cell);

        const mixedValues = [
            [1, '=A1'],
            ['2%', null],
        ] as unknown as Parameters<typeof covertCellValues>[0];

        expect(covertCellValues(mixedValues, { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } as IRange)).toEqual({
            0: {
                0: { v: 1, p: null, f: null },
                1: { f: '=A1', v: null, p: null },
            },
            1: {
                0: {
                    v: 0.02,
                    p: null,
                    f: null,
                    s: { n: { pattern: '0%' } },
                },
                1: null,
            },
        });

        expect(covertCellValues({
            3: { 4: '=B2' },
        }, { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 } as IRange)).toEqual({
            3: {
                4: { f: '=B2', v: null, p: null },
            },
        });
    });
});
