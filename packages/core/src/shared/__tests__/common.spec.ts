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

import { describe, expect, it, vi } from 'vitest';
import type { ICellData, ICellWithCoord, IRange, ISelectionCell } from '../../sheets/typedef';
import type { IDocumentData } from '../../types/interfaces';
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
import { Tools } from '../tools';

function legacyIsFormulaString(value: unknown): boolean {
    return Tools.isString(value) && value.substring(0, 1) === '=' && value.length > 1;
}

function legacyIsFormulaId(value: unknown): boolean {
    return Tools.isString(value) && value.length > 0;
}

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

    it('checks primitive formula strings and ids without boxing through Tools', () => {
        const values = ['=A1', '=', '', ' =A1', '= ', 'id', '0', ' '];
        const expected = values.map((value) => [legacyIsFormulaString(value), legacyIsFormulaId(value)]);
        const isString = vi.spyOn(Tools, 'isString');
        let actual: boolean[][];
        let calls: number;
        try {
            actual = values.map((value) => [isFormulaString(value), isFormulaId(value)]);
            calls = isString.mock.calls.length;
        } finally {
            isString.mockRestore();
        }
        expect(actual!).toEqual(expected);
        expect(calls!).toBe(0);
    });

    it('matches the original predicates for nonprimitive inputs', () => {
        const values: unknown[] = [
            undefined,
            null,
            true,
            false,
            0,
            1,
            Number.NaN,
            0n,
            Symbol('=A1'),
            [],
            {},
            Object.create(null),
            new Object('=A1'),
            new Object('='),
            new Object(''),
            new Object('id'),
            new Object(1),
            { [Symbol.toStringTag]: 'Other' },
            {
                [Symbol.toStringTag]: 'String',
                substring: (start: number, end: number) => '=A1'.substring(start, end),
                length: 3,
            },
            new Proxy({ [Symbol.toStringTag]: 'Other' }, {}),
        ];
        for (const value of values) {
            expect(isFormulaString(value)).toBe(legacyIsFormulaString(value));
            expect(isFormulaId(value)).toBe(legacyIsFormulaId(value));
        }
    });

    it('preserves proxy property reads and errors in the original predicates', () => {
        const reads: PropertyKey[] = [];
        const value = new Proxy({
            [Symbol.toStringTag]: 'String',
            substring: (start: number, end: number) => '=A1'.substring(start, end),
            length: 3,
        }, {
            get(target, key, receiver) {
                reads.push(key);
                return Reflect.get(target, key, receiver);
            },
        });
        for (const [current, legacy] of [[isFormulaString, legacyIsFormulaString], [isFormulaId, legacyIsFormulaId]]) {
            reads.length = 0;
            const expected = legacy(value);
            const expectedReads = [...reads];
            reads.length = 0;
            expect(current(value)).toBe(expected);
            expect(reads).toEqual(expectedReads);
        }

        const invalidString = new Proxy(new Object('=1'), {
            get(target, key, receiver) {
                return key === Symbol.toStringTag ? 'String' : Reflect.get(target, key, receiver);
            },
        });
        expect(() => legacyIsFormulaString(invalidString)).toThrow(TypeError);
        expect(() => isFormulaString(invalidString)).toThrow(TypeError);
        expect(isFormulaId(invalidString)).toBe(legacyIsFormulaId(invalidString));

        const revoked = Proxy.revocable({}, {});
        revoked.revoke();
        for (const predicate of [isFormulaString, legacyIsFormulaString, isFormulaId, legacyIsFormulaId]) {
            expect(() => predicate(revoked.proxy)).toThrow(TypeError);
        }
    });

    it('preserves errors thrown by custom nonprimitive tags', () => {
        const failure = new Error('custom string tag');
        const value = Object.defineProperty({}, Symbol.toStringTag, {
            get() {
                throw failure;
            },
        });
        for (const predicate of [isFormulaString, legacyIsFormulaString, isFormulaId, legacyIsFormulaId]) {
            let caught: unknown;
            try {
                predicate(value);
            } catch (error) {
                caught = error;
            }
            expect(caught).toBe(failure);
        }
    });

    it('preserves inherited and own custom string prototype tags', () => {
        for (const prototype of [String.prototype, Object.prototype]) {
            const previous = Object.getOwnPropertyDescriptor(prototype, Symbol.toStringTag);
            let expected: boolean[];
            let actual: boolean[];
            let reads = 0;
            let expectedReads: number;
            let actualReads: number;
            try {
                Object.defineProperty(prototype, Symbol.toStringTag, {
                    configurable: true,
                    get() {
                        reads += 1;
                        return 'CustomString';
                    },
                });
                expected = [legacyIsFormulaString('=1'), legacyIsFormulaString(''), legacyIsFormulaId('id'), legacyIsFormulaId('')];
                expectedReads = reads;
                reads = 0;
                actual = [isFormulaString('=1'), isFormulaString(''), isFormulaId('id'), isFormulaId('')];
                actualReads = reads;
            } finally {
                if (previous) Object.defineProperty(prototype, Symbol.toStringTag, previous);
                else Reflect.deleteProperty(prototype, Symbol.toStringTag);
            }
            expect(actual!).toEqual(expected!);
            expect(actualReads!).toBe(expectedReads!);
        }
    });

    it('preserves errors raised by primitive string prototype tags', () => {
        const previous = Object.getOwnPropertyDescriptor(String.prototype, Symbol.toStringTag);
        const failure = new Error('primitive string tag');
        const failures: unknown[] = [];
        try {
            // eslint-disable-next-line no-extend-native -- This adversarial fixture restores the native descriptor in finally.
            Object.defineProperty(String.prototype, Symbol.toStringTag, {
                configurable: true,
                get() {
                    throw failure;
                },
            });
            for (const predicate of [isFormulaString, legacyIsFormulaString, isFormulaId, legacyIsFormulaId]) {
                try {
                    predicate('=1');
                } catch (error) {
                    failures.push(error);
                }
            }
        } finally {
            // eslint-disable-next-line no-extend-native -- Restore the native descriptor changed by this adversarial fixture.
            if (previous) Object.defineProperty(String.prototype, Symbol.toStringTag, previous);
            else Reflect.deleteProperty(String.prototype, Symbol.toStringTag);
        }
        expect(failures).toHaveLength(4);
        failures.forEach((error) => expect(error).toBe(failure));
    });

    it('preserves get behavior for custom proxy string prototype chains', () => {
        const previous = Object.getPrototypeOf(String.prototype);
        const reads: string[] = [];
        const customPrototype = new Proxy(previous, {
            get(target, key, receiver) {
                if (key === Symbol.toStringTag) {
                    reads.push('get');
                    return 'Other';
                }
                return Reflect.get(target, key, receiver);
            },
            has(target, key) {
                if (key === Symbol.toStringTag) {
                    reads.push('has');
                    return false;
                }
                return Reflect.has(target, key);
            },
        });
        const expected: boolean[] = [];
        const actual: boolean[] = [];
        const expectedReads: string[][] = [];
        const actualReads: string[][] = [];
        try {
            Object.setPrototypeOf(String.prototype, customPrototype);
            for (const [current, legacy] of [[isFormulaString, legacyIsFormulaString], [isFormulaId, legacyIsFormulaId]]) {
                reads.length = 0;
                expected.push(legacy('=1'));
                expectedReads.push([...reads]);
                reads.length = 0;
                actual.push(current('=1'));
                actualReads.push([...reads]);
            }
        } finally {
            Object.setPrototypeOf(String.prototype, previous);
        }
        expect(actual).toEqual(expected);
        expect(actualReads).toEqual(expectedReads);
    });

    it('preserves proxy string prototype errors without invoking has traps', () => {
        const previous = Object.getPrototypeOf(String.prototype);
        const getFailure = new Error('custom prototype get');
        const hasFailure = new Error('custom prototype has');
        const failures: unknown[] = [];
        const customPrototype = new Proxy(previous, {
            get(target, key, receiver) {
                if (key === Symbol.toStringTag) {
                    throw getFailure;
                }
                return Reflect.get(target, key, receiver);
            },
            has(target, key) {
                if (key === Symbol.toStringTag) {
                    throw hasFailure;
                }
                return Reflect.has(target, key);
            },
        });
        try {
            Object.setPrototypeOf(String.prototype, customPrototype);
            for (const predicate of [legacyIsFormulaString, isFormulaString, legacyIsFormulaId, isFormulaId]) {
                try {
                    predicate('=1');
                } catch (error) {
                    failures.push(error);
                }
            }
        } finally {
            Object.setPrototypeOf(String.prototype, previous);
        }
        expect(failures).toHaveLength(4);
        failures.forEach((error) => expect(error).toBe(getFailure));
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

        expect(covertCellValue('=SUM(1,2)')).toEqual({ f: '=SUM(1,2)', v: null, p: null, si: null });
        expect(covertCellValue(1)).toEqual({ v: 1, p: null, f: null, si: null });
        const cell = { v: 'text', p: null, f: null, si: null } as ICellData;
        expect(covertCellValue(cell)).toBe(cell);

        const mixedValues = [
            [1, '=A1'],
            ['2%', null],
        ] as unknown as Parameters<typeof covertCellValues>[0];

        expect(covertCellValues(mixedValues, { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } as IRange)).toEqual({
            0: {
                0: { v: 1, p: null, f: null, si: null },
                1: { f: '=A1', v: null, p: null, si: null },
            },
            1: {
                0: {
                    v: 0.02,
                    p: null,
                    f: null,
                    si: null,
                    s: { n: { pattern: '0%' } },
                },
                1: null,
            },
        });

        expect(covertCellValues({
            3: { 4: '=B2' },
        }, { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 } as IRange)).toEqual({
            3: {
                4: { f: '=B2', v: null, p: null, si: null },
            },
        });
    });

    it('should replace the target formula when a cell-data write supplies content without formula identity', () => {
        const content = { v: 300 } as ICellData;
        expect(covertCellValue(content)).toEqual({ v: 300, f: null, si: null });
        expect(content).toEqual({ v: 300 });

        const richText = { p: { id: 'rich-text', body: { dataStream: 'text' } } } as ICellData;
        expect(covertCellValue(richText)).toEqual({ p: richText.p, f: null, si: null });
        expect(richText).toEqual({ p: { id: 'rich-text', body: { dataStream: 'text' } } });

        const formula = { f: '=A1', si: null } as ICellData;
        expect(covertCellValue(formula)).toBe(formula);

        const sharedFormula = { f: '=A1' } as ICellData;
        expect(covertCellValue(sharedFormula)).toEqual({ f: '=A1', si: null });

        const style = { s: { bg: { rgb: '#ffffff' } } } as ICellData;
        expect(covertCellValue(style)).toBe(style);

        const sharedFollower = { si: 'shared-1' } as ICellData;
        expect(covertCellValue(sharedFollower)).toBe(sharedFollower);
    });
});
