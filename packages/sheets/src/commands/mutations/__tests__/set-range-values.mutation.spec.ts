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

import type { ICellData } from '@univerjs/core';
import {
    CellValueType,
    DEFAULT_NUMBER_FORMAT,
    DEFAULT_TEXT_FORMAT_EXCEL,
    ICommandService,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ISetRangeValuesMutationParams } from '../set-range-values.mutation';
import { prepareSetRangeValuesMutation, SetRangeValuesMutation } from '../set-range-values.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('SetRangeValuesMutation preparation', () => {
    let bed: ReturnType<typeof createCommandTestBed>;
    beforeEach(() => {
        bed = createCommandTestBed();
        bed.get(ICommandService).registerCommand(SetRangeValuesMutation);
    });
    afterEach(() => bed.univer.dispose());

    it.each<{
        name: string;
        cell: ICellData;
        update: ICellData;
        expected: ICellData;
        isOverrideStyle?: boolean;
    }>([
        {
            name: 'numeric text with leading zeroes',
            cell: { v: '014', t: CellValueType.STRING },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: '014', t: CellValueType.STRING },
        },
        {
            name: 'forced numeric text',
            cell: { v: '014', t: CellValueType.FORCE_STRING },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: '014', t: CellValueType.FORCE_STRING },
        },
        {
            name: 'text-formatted numeric text',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL } } },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: '014', t: CellValueType.STRING },
        },
        {
            name: 'boolean-looking text',
            cell: { v: 'TRUE', t: CellValueType.STRING },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: 'TRUE', t: CellValueType.STRING },
        },
        {
            name: 'numeric text exceeding number precision',
            cell: { v: '9007199254740993', t: CellValueType.STRING },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: '9007199254740993', t: CellValueType.STRING },
        },
        {
            name: 'number',
            cell: { v: 14, t: CellValueType.NUMBER },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'boolean',
            cell: { v: 1, t: CellValueType.BOOLEAN },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: 1, t: CellValueType.BOOLEAN },
        },
        {
            name: 'inherited numeric format during a color update',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: '0.00' } } },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: '014', t: CellValueType.STRING },
        },
        {
            name: 'unchanged number format in a style patch',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: '0.00' } } },
            update: { s: { bg: { rgb: '#2C53F1' }, n: { pattern: '0.00' } } },
            expected: { v: '014', t: CellValueType.STRING },
        },
        {
            name: 'unchanged number format in a replacement style',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: '0.00' } } },
            update: { s: { bg: { rgb: '#2C53F1' }, n: { pattern: '0.00' } } },
            expected: { v: '014', t: CellValueType.STRING },
            isOverrideStyle: true,
        },
        {
            name: 'cleared color without a number format',
            cell: { v: '014', t: CellValueType.STRING, s: { bg: { rgb: '#2C53F1' } } },
            update: { s: null },
            expected: { v: '014', t: CellValueType.STRING },
        },
        {
            name: 'new untyped value',
            cell: { v: '014', t: CellValueType.STRING },
            update: { v: '015' },
            expected: { v: 15, t: CellValueType.NUMBER },
        },
        {
            name: 'explicit numeric type',
            cell: { v: '014', t: CellValueType.STRING },
            update: { t: CellValueType.NUMBER },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'explicit text type',
            cell: { v: 14, t: CellValueType.NUMBER },
            update: { t: CellValueType.STRING },
            expected: { v: '14', t: CellValueType.STRING },
        },
        {
            name: 'cleared value',
            cell: { v: '014', t: CellValueType.STRING },
            update: { v: null },
            expected: {},
        },
        {
            name: 'new text format',
            cell: { v: 14, t: CellValueType.NUMBER },
            update: { s: { n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL } } },
            expected: { v: '14', t: CellValueType.STRING },
        },
        {
            name: 'new numeric format',
            cell: { v: '014', t: CellValueType.STRING },
            update: { s: { n: { pattern: '0.00' } } },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'text format replaced with a numeric format',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL } } },
            update: { s: { n: { pattern: '0.00' } } },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'new general format',
            cell: { v: '014', t: CellValueType.STRING },
            update: { s: { n: { pattern: DEFAULT_NUMBER_FORMAT } } },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'cleared numeric format',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: '0.00' } } },
            update: { s: { n: null } },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'cleared style with a numeric format',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: '0.00' } } },
            update: { s: null },
            expected: { v: 14, t: CellValueType.NUMBER },
        },
        {
            name: 'replacement style removing a numeric format',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: '0.00' } } },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: 14, t: CellValueType.NUMBER },
            isOverrideStyle: true,
        },
        {
            name: 'cleared text format retaining the original text type',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL } } },
            update: { s: null },
            expected: { v: '014', t: CellValueType.STRING },
        },
        {
            name: 'replacement style removing a text format',
            cell: { v: '014', t: CellValueType.STRING, s: { n: { pattern: DEFAULT_TEXT_FORMAT_EXCEL } } },
            update: { s: { bg: { rgb: '#2C53F1' } } },
            expected: { v: '014', t: CellValueType.STRING },
            isOverrideStyle: true,
        },
        {
            name: 'forced text with a new numeric format',
            cell: { v: '014', t: CellValueType.FORCE_STRING },
            update: { s: { n: { pattern: '0.00' } } },
            expected: { v: '014', t: CellValueType.FORCE_STRING },
        },
    ])('prepares and applies $name without unintended value conversions', ({ cell, update, expected, isOverrideStyle }) => {
        const sheet = bed.sheet.getSheets()[0];
        const styles = bed.sheet.getStyles();
        const commandService = bed.get(ICommandService);
        const address = { unitId: bed.sheet.getUnitId(), subUnitId: sheet.getSheetId() };
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...address,
            cellValue: { 0: { 0: Tools.deepClone(cell) } },
        })).toBe(true);
        const originalCell = Tools.deepClone(sheet.getCellRaw(0, 0));
        const originalStyles = Tools.deepClone(styles.toJSON());
        const params: ISetRangeValuesMutationParams = {
            ...address,
            cellValue: { 0: { 0: Tools.deepClone(update) } },
            isOverrideStyle,
        };
        const prepared = prepareSetRangeValuesMutation(sheet.getCellMatrix(), styles, params);
        expect(sheet.getCellRaw(0, 0)).toEqual(originalCell);
        expect(styles.toJSON()).toEqual(originalStyles);
        expect(prepared.after[0][0]?.v).toBe(expected.v);
        expect(prepared.after[0][0]?.t).toBe(expected.t);
        Object.entries(prepared.styles).forEach(([id, style]) => styles.addCustomStyle(id, style));
        expect(commandService.syncExecuteCommand(SetRangeValuesMutation.id, params)).toBe(true);
        expect(sheet.getCellRaw(0, 0) ?? null).toEqual(prepared.after[0][0]);
    });

    it('prepares native typed/formula/style changes without writing or leaking styles and matches native execution', () => {
        const sheet = bed.sheet.getSheets()[0];
        const styles = bed.sheet.getStyles();
        sheet.getCellMatrix().setValue(0, 0, { v: 4, t: CellValueType.NUMBER, f: '=2+2' });
        const originalCells = Tools.deepClone(sheet.getCellMatrix().getMatrix());
        const originalStyles = Tools.deepClone(styles.toJSON());
        const params: ISetRangeValuesMutationParams = { unitId: bed.sheet.getUnitId(), subUnitId: sheet.getSheetId(), cellValue: { 0: { 0: { v: '12', t: CellValueType.FORCE_STRING, f: null, s: { n: { pattern: '@' } } }, 1: { v: 3, f: '=1+2', t: CellValueType.NUMBER, s: { n: { pattern: '0.00' } } } } } };
        const prepared = prepareSetRangeValuesMutation(sheet.getCellMatrix(), styles, params);
        expect(sheet.getCellMatrix().getMatrix()).toEqual(originalCells);
        expect(styles.toJSON()).toEqual(originalStyles);
        expect(Object.keys(prepared.styles)).toHaveLength(2);
        Object.entries(prepared.styles).forEach(([id, style]) => styles.addCustomStyle(id, style));
        expect(bed.get(ICommandService).syncExecuteCommand(SetRangeValuesMutation.id, params)).toBe(true);
        expect(sheet.getCellMatrix().getMatrix()).toEqual(prepared.after);
        params.cellValue![0][0] = null;
        expect(prepared.after[0][0]).toMatchObject({ v: '12', t: CellValueType.FORCE_STRING });
    });

    it.each([
        { cell: null, source: { f: '=SUM(A1:B2)' }, accepts: false },
        { cell: { v: 42 }, source: { f: '=SUM(A1:B2)' }, accepts: false },
        { cell: { f: '=2', v: 2 }, source: { f: '=SUM(A1:B2)' }, accepts: false },
        { cell: { f: '=SUM(A1:B2)' }, source: { f: '=SUM(A1:B2)' }, accepts: true },
        { cell: { si: 'shared-1' }, source: { f: '', si: 'shared-1' }, accepts: true },
        { cell: { si: 'shared-2' }, source: { f: '', si: 'shared-1' }, accepts: false },
    ])('validates delayed formula writes during preparation and replay ($cell)', ({ cell, source, accepts }) => {
        const sheet = bed.sheet.getSheets()[0];
        const commandService = bed.get(ICommandService);
        const address = { unitId: bed.sheet.getUnitId(), subUnitId: sheet.getSheetId() };
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, { ...address, cellValue: { 0: { 0: cell } } });
        const before = Tools.deepClone(sheet.getCellMatrix().getValue(0, 0));
        const params: ISetRangeValuesMutationParams = {
            ...address,
            cellValue: { 0: { 0: { v: 10, t: CellValueType.NUMBER } } },
            sourceFormulaData: { 0: { 0: source } },
        };
        const prepared = prepareSetRangeValuesMutation(sheet.getCellMatrix(), bed.sheet.getStyles(), params);
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, JSON.parse(JSON.stringify(params)));
        if (accepts) {
            expect(prepared.after[0][0]).toMatchObject({ ...before, v: 10 });
            expect(sheet.getCellMatrix().getValue(0, 0)).toEqual(prepared.after[0][0]);
        } else {
            expect(prepared.before).toEqual({});
            expect(prepared.after).toEqual({});
            expect(prepared.styles).toEqual({});
            expect(sheet.getCellMatrix().getValue(0, 0)).toEqual(before);
        }
    });

    it('prepares clear and formula/style restoration using the same native normalization', () => {
        const sheet = bed.sheet.getSheets()[0];
        const styles = bed.sheet.getStyles();
        styles.addCustomStyle('number', { n: { pattern: '0.00' } });
        const initial = { v: 3, t: CellValueType.NUMBER, f: '=1+2', s: 'number', custom: { tag: 'keep' } };
        sheet.getCellMatrix().setValue(0, 0, initial);
        const clear: ISetRangeValuesMutationParams = { unitId: bed.sheet.getUnitId(), subUnitId: sheet.getSheetId(), cellValue: { 0: { 0: null } } };
        const forward = prepareSetRangeValuesMutation(sheet.getCellMatrix(), styles, clear);
        const restore = { ...clear, cellValue: forward.before };
        const inverse = prepareSetRangeValuesMutation(new ObjectMatrix(forward.after), styles, restore);
        expect(forward.after).toEqual({ 0: { 0: null } });
        expect(inverse.after).toEqual({ 0: { 0: initial } });
        expect(inverse.styles).toEqual({});
        expect(bed.get(ICommandService).syncExecuteCommand(SetRangeValuesMutation.id, clear)).toBe(true);
        expect(bed.get(ICommandService).syncExecuteCommand(SetRangeValuesMutation.id, restore)).toBe(true);
        expect(sheet.getCellMatrix().getValue(0, 0)).toEqual(initial);
    });
});
