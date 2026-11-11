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

import type { IBaseSnapshot, ICellData, Injector, IObjectMatrixPrimitiveType, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import {
    BASE_RECORD_ID_FIELD_ID,
    BaseDataModel,
    BaseFieldType,
    BooleanNumber,
    CellValueType,
    createBaseRecordIdField,
    isFormulaId,
    isFormulaString,
    IUniverInstanceService,
    LocaleType,
    ObjectMatrix,
    RANGE_TYPE,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { types as nodeUtilTypes } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFormulaData } from '../../basics/common';
import { FormulaDataModel } from '../formula-data.model';
import { createCommandTestBed } from './create-command-test-bed';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    3: {
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                    },
                },
                1: {
                    3: {
                        f: '=SUM(A2)',
                        si: 'OSPtzm',
                    },
                },
                2: {
                    3: {
                        si: 'OSPtzm',
                    },
                },
                3: {
                    3: {
                        si: 'OSPtzm',
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

const TEST_WORKBOOK_DATA_EXTRA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 5,
            rowData: {
                2: { hd: BooleanNumber.TRUE },
            },
            cellData: {
                0: {
                    0: { f: '=A1' },
                },
                1: {
                    0: { f: '=A2' },
                },
                2: {
                    0: { f: '=A3', v: 1 },
                },
                3: {
                    0: { f: '=A4' },
                },
                4: {
                    0: { f: '=A5', v: '' },
                    1: { f: '=B5', v: 0 },
                    2: { f: '=C5', v: '0' },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

const TEST_BASE_DATA: Partial<IBaseSnapshot> = {
    id: 'base-test',
    name: 'Base',
    schemaVersion: 2,
    tableOrder: ['table-main', 'tableOther'],
    createdAt: 0,
    updatedAt: 0,
    tables: {
        'table-main': {
            id: 'table-main',
            name: 'Sales',
            primaryFieldId: 'name',
            fieldOrder: [BASE_RECORD_ID_FIELD_ID, 'name', 'amount', 'qty', 'tags', 'link', 'attachment', 'total'],
            fields: {
                [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
                name: { id: 'name', name: 'Name', type: BaseFieldType.Text, config: {} },
                amount: { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: {} },
                qty: { id: 'qty', name: 'Qty', type: BaseFieldType.Number, config: {} },
                tags: { id: 'tags', name: 'Tags', type: BaseFieldType.Text, config: {} },
                link: { id: 'link', name: 'Link', type: BaseFieldType.Link, config: {} },
                attachment: { id: 'attachment', name: 'Files', type: BaseFieldType.Attachment, config: {} },
                total: {
                    id: 'total',
                    name: 'Total',
                    type: BaseFieldType.Formula,
                    config: {
                        formula: '=SUM({Amount}, [Qty], _T_tableOther[External])',
                    },
                },
            },
            records: {
                'record-1': {
                    id: 'record-1',
                    orderKey: 'a',
                    createdAt: 0,
                    updatedAt: 0,
                    values: {
                        [BASE_RECORD_ID_FIELD_ID]: 'record-1',
                        name: 'Order 1',
                        amount: 10,
                        qty: 2,
                        tags: ['paid', 'online'],
                        link: { text: 'Invoice', url: 'https://example.com/invoice' },
                        attachment: ['file-1'],
                    },
                },
            },
            recordOrder: ['record-1'],
            views: {},
            viewOrder: [],
        },
        tableOther: {
            id: 'tableOther',
            name: 'Sales',
            primaryFieldId: 'external',
            fieldOrder: [BASE_RECORD_ID_FIELD_ID, 'external'],
            fields: {
                [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
                external: { id: 'external', name: 'External', type: BaseFieldType.Number, config: {} },
            },
            records: {
                'record-2': {
                    id: 'record-2',
                    orderKey: 'a',
                    createdAt: 0,
                    updatedAt: 0,
                    values: { [BASE_RECORD_ID_FIELD_ID]: 'record-2', external: 8 },
                },
            },
            recordOrder: ['record-2'],
            views: {},
            viewOrder: [],
        },
    },
};

function createCompactFormulaTestBed(cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>>) {
    const data = Tools.deepClone(TEST_WORKBOOK_DATA_EXTRA);
    data.sheetOrder = ['sheet1', 'empty'];
    // These fixtures include runtime null/undefined slots, which the public cell matrix supports.
    // Keep their exact descriptors and prototypes when passing through the narrower snapshot type.
    data.sheets.sheet1.cellData = cellData as IObjectMatrixPrimitiveType<ICellData>;
    data.sheets.empty = { id: 'empty', name: 'Empty', rowCount: 2, columnCount: 2, cellData: {} };
    const testBed = createCommandTestBed(data);
    const worksheet = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('sheet1')!;
    return { ...testBed, worksheet, model: testBed.get(FormulaDataModel) };
}

function readFormulaInput(model: FormulaDataModel, compact: boolean): IFormulaData {
    if (!compact) return model.getFormulaData();
    const snapshot = model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
    expect(snapshot).toBeDefined();
    return snapshot!.materialize();
}

describe('compact execution formula snapshots', () => {
    it('compacts shared formulas and materializes the same items as getFormulaData', () => {
        const cellData: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {
            0: { 0: { v: 1 }, 1: { f: '=A1*2', si: 'shared' }, 2: { f: '=SUM(A1:B1)' } },
            1: { 0: { v: 2 }, 1: { si: 'shared' }, 2: { si: 'orphan' } },
            2: { 0: { v: 3 }, 1: { si: 'shared', v: 6 }, 3: { f: 'text', si: 'shared' } },
            // A follower before its anchor resolves against the finished map.
            3: { 1: { si: 'late' } },
            4: { 1: { f: '=A5+1', si: 'late' } },
        };
        const testBed = createCompactFormulaTestBed(cellData);
        try {
            const expected = testBed.model.getFormulaData();
            const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
            expect(snapshot).toBeDefined();
            // Edits after capture do not reach the snapshot.
            testBed.worksheet.getCellMatrix().getValue(0, 1)!.f = '=A1*3';
            const actual = snapshot!.materialize();
            expect(actual).toEqual(expected);
            expect(actual.test!.sheet1![1]![1]).toEqual({ f: '=A1*2', si: 'shared', x: 0, y: 1 });
            expect(actual.test!.sheet1![3]![1]).toEqual({ f: '=A5+1', si: 'late', x: 0, y: -1 });
            expect(actual.test!.sheet1![1]![2]).toBeUndefined();
            expect(actual.test!.sheet1![2]![3]).toEqual({ f: '=A1*2', si: 'shared', x: 2, y: 2 });
        } finally { testBed.univer.dispose(); }
    });

    it('keeps the object path result when a shared formula follows an uncompactable cell', () => {
        const testBed = createCompactFormulaTestBed({
            0: { 1: { f: '=A1*2', si: 'shared' } },
            1: { 1: { si: 'shared' }, 2: { f: '=B2', si: 7 as unknown as string } },
            2: { 1: { si: 'shared' } },
        });
        try {
            const expected = testBed.model.getFormulaData();
            expect(testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)?.materialize()).toEqual(expected);
        } finally { testBed.univer.dispose(); }
    });

    it('captures and materializes formulas when Object.hasOwn is unavailable', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=SUM(A1:A2)' } } });
        try {
            const expected = testBed.model.getFormulaData();
            const descriptor = Object.getOwnPropertyDescriptor(Object, 'hasOwn')!;
            let actual: IFormulaData | undefined;
            try {
                Object.defineProperty(Object, 'hasOwn', { ...descriptor, value: undefined });
                actual = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)?.materialize();
            } finally { Object.defineProperty(Object, 'hasOwn', descriptor); }
            expect(actual).toEqual(expected);
        } finally { testBed.univer.dispose(); }
    });

    it('declines an own getFormulaData override before calling it, then preserves the legacy result', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=BEFORE()' } } });
        const customData = { custom: { sheet: { 0: { 0: { f: '=CUSTOM()' } } } } };
        const override = vi.spyOn(testBed.model, 'getFormulaData').mockImplementation(() => {
            testBed.worksheet.getCellMatrix().getValue(0, 0)!.f = '=AFTER()';
            return customData;
        });
        try {
            expect(testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)).toBeUndefined();
            expect(override).not.toHaveBeenCalled();
            expect(testBed.worksheet.getCellMatrix().getValue(0, 0)?.f).toBe('=BEFORE()');
            expect(testBed.model.getFormulaData()).toBe(customData);
            expect(override).toHaveBeenCalledTimes(1);
        } finally {
            override.mockRestore();
            testBed.univer.dispose();
        }
    });

    it('declines a subclass formula getter without executing it during qualification', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1+2' } } });
        let calls = 0;
        class CustomFormulaDataModel extends FormulaDataModel {
            override getFormulaData(): IFormulaData {
                calls++;
                return { custom: {} };
            }
        }
        Object.setPrototypeOf(testBed.model, CustomFormulaDataModel.prototype);
        try {
            expect(testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)).toBeUndefined();
            expect(calls).toBe(0);
            expect(testBed.model.getFormulaData()).toEqual({ custom: {} });
            expect(calls).toBe(1);
        } finally {
            Object.setPrototypeOf(testBed.model, FormulaDataModel.prototype);
            testBed.univer.dispose();
        }
    });

    it('declines a changed prototype formula getter before legacy execution', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=BEFORE()' } } });
        const customData = { custom: {} };
        const override = vi.spyOn(FormulaDataModel.prototype, 'getFormulaData').mockReturnValue(customData);
        try {
            expect(testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)).toBeUndefined();
            expect(override).not.toHaveBeenCalled();
            expect(testBed.model.getFormulaData()).toBe(customData);
            expect(override).toHaveBeenCalledTimes(1);
        } finally {
            override.mockRestore();
            testBed.univer.dispose();
        }
    });

    it.each(['initSheetFormulaData', '_initSheetArrayFormulaData'] as const)('declines a custom %s method before observing its getter', (name) => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
        const original = Object.getOwnPropertyDescriptor(FormulaDataModel.prototype, name)!.value;
        let reads = 0;
        Object.defineProperty(testBed.model, name, {
            configurable: true,
            get: () => {
                reads++;
                return original;
            },
        });
        try {
            expect(testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)).toBeUndefined();
            expect(reads).toBe(0);
            expect(testBed.model.getFormulaData().test!.sheet1![0][0]?.f).toBe('=A1');
            expect(reads).toBe(2);
        } finally {
            Reflect.deleteProperty(testBed.model, name);
            testBed.univer.dispose();
        }
    });

    it('keeps the eager route when output matrix writes have been customized', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
        const writes = vi.spyOn(ObjectMatrix.prototype, 'setValue');
        try {
            expect(testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)).toBeUndefined();
            expect(writes).not.toHaveBeenCalled();
            expect(testBed.model.getFormulaData().test!.sheet1![0][0]?.f).toBe('=A1');
            expect(writes).toHaveBeenCalledTimes(1);
        } finally {
            writes.mockRestore();
            testBed.univer.dispose();
        }
    });

    it('preserves Sheets-then-Base callback order and captures before later edits', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=BEFORE()' } } });
            const service = testBed.get(IUniverInstanceService);
            const getUnits = service.getAllUnitsForType.bind(service);
            const events: UniverInstanceType[] = [];
            const override = vi.spyOn(service, 'getAllUnitsForType').mockImplementation(<T>(type: UniverInstanceType): T[] => {
                events.push(type);
                if (type === UniverInstanceType.UNIVER_BASE) {
                    testBed.worksheet.getCellMatrix().getValue(0, 0)!.f = '=AFTER()';
                }
                return getUnits<T>(type);
            });
            try {
                return {
                    data: readFormulaInput(testBed.model, compact),
                    events,
                    current: testBed.worksheet.getCellMatrix().getValue(0, 0)?.f,
                };
            } finally {
                override.mockRestore();
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.events).toEqual([UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_BASE]);
        expect(expected.data.test!.sheet1![0][0]?.f).toBe('=BEFORE()');
        expect(expected.current).toBe('=AFTER()');
        expect(run(true)).toStrictEqual(expected);
    });

    it.each(['custom', 'proxy'] as const)('preserves a %s unit service without repeating its callbacks', (kind) => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=BEFORE()' } } });
            const original = testBed.get(IUniverInstanceService);
            const getUnits = original.getAllUnitsForType.bind(original);
            const events: UniverInstanceType[] = [];
            const custom = {
                getAllUnitsForType: (type: UniverInstanceType) => {
                    events.push(type);
                    return getUnits(type);
                },
            };
            const proxy = new Proxy(original, {
                get: (target, key, receiver) => key === 'getAllUnitsForType'
                    ? custom.getAllUnitsForType
                    : Reflect.get(target, key, receiver),
            });
            Object.assign(testBed.model, { _univerInstanceService: kind === 'custom' ? custom : proxy });
            try {
                return { data: readFormulaInput(testBed.model, compact), events };
            } finally {
                Object.assign(testBed.model, { _univerInstanceService: original });
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.events).toEqual([UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_BASE]);
        expect(run(true)).toStrictEqual(expected);
    });

    it.each(['getMatrix', 'getValue'] as const)('does not read an ObjectMatrix.%s method the source traversal does not use', (name) => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
        const matrix = testBed.worksheet.getCellMatrix();
        let calls = 0;
        Object.defineProperty(matrix, name, {
            configurable: true,
            get: () => {
                calls++;
                throw new Error('unexpected matrix method');
            },
        });
        try {
            const expected = testBed.model.getFormulaData();
            expect(readFormulaInput(testBed.model, true)).toStrictEqual(expected);
            expect(calls).toBe(0);
        } finally {
            Reflect.deleteProperty(matrix, name);
            testBed.univer.dispose();
        }
    });

    it('propagates an original forValue getter failure once, without falling back and rereading it', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
            const matrix = testBed.worksheet.getCellMatrix();
            let calls = 0;
            const error = new Error('custom source traversal');
            Object.defineProperty(matrix, 'forValue', {
                configurable: true,
                get: () => {
                    calls++;
                    throw error;
                },
            });
            try {
                expect(() => readFormulaInput(testBed.model, compact)).toThrow(error);
                return calls;
            } finally {
                Reflect.deleteProperty(matrix, 'forValue');
                testBed.univer.dispose();
            }
        };
        expect(run(false)).toBe(1);
        expect(run(true)).toBe(1);
    });

    it('keeps private snapshot arrays independent of later global iterator callbacks', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
        const iterator = Object.getOwnPropertyDescriptor(Array.prototype, Symbol.iterator)!;
        let calls = 0;
        let result: IFormulaData | undefined;
        let captured = false;
        try {
            // eslint-disable-next-line no-extend-native -- This adversarial fixture restores the native descriptor in finally.
            Object.defineProperty(Array.prototype, Symbol.iterator, {
                configurable: true,
                get: () => {
                    calls++;
                    throw new Error('unexpected iterator');
                },
            });
            const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
            captured = snapshot != null;
            result = snapshot?.materialize();
        } finally {
            // eslint-disable-next-line no-extend-native -- Restore the native descriptor changed by this adversarial fixture.
            Object.defineProperty(Array.prototype, Symbol.iterator, iterator);
            testBed.univer.dispose();
        }
        expect(captured).toBe(true);
        expect(result?.test?.sheet1?.[0]?.[0]?.f).toBe('=A1');
        expect(calls).toBe(0);
    });

    it('captures formula values independently of subsequent cell edits and preserves exact DTO structure', () => {
        const testBed = createCompactFormulaTestBed({
            0: { 0: { f: '=A1+1', v: 4 }, 2: { f: '=B1+2' }, 3: { f: '=' } },
            1: { 1: { f: '=C2', s: 'style' } },
            5: { 0: { v: 9 } },
        });
        try {
            const expected = testBed.model.getFormulaData();
            const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
            expect(snapshot).toBeDefined();
            const matrix = testBed.worksheet.getCellMatrix();
            matrix.getValue(0, 0)!.f = '=99';
            matrix.realDeleteValue(0, 2);
            matrix.setValue(1, 1, { f: '=REPLACED()' });
            matrix.setValue(7, 0, { f: '=NEW()' });
            const actual = snapshot!.materialize();

            expect(actual).toStrictEqual(expected);
            expect(snapshot!.materialize()).toBe(actual);
            expect(Object.getPrototypeOf(actual)).toBeNull();
            expect(Object.getPrototypeOf(actual.test!)).toBeNull();
            expect(Object.getPrototypeOf(actual.test!.sheet1!)).toBeNull();
            expect(Object.getPrototypeOf(actual.test!.sheet1![0])).toBe(Object.prototype);
            expect(Object.getPrototypeOf(actual.test!.sheet1![0][0])).toBe(Object.prototype);
            expect(Object.getOwnPropertyDescriptors(actual.test!.sheet1![0][0]!))
                .toEqual(Object.getOwnPropertyDescriptors(expected.test!.sheet1![0][0]!));
            expect(Object.keys(actual.test!.sheet1![0][0]!)).toEqual(['f']);
            expect(actual.test!.empty).toEqual({});
            actual.test!.sheet1![0][0]!.f = '=LOCAL()';
            expect(matrix.getValue(0, 0)?.f).toBe('=99');
            expect(testBed.model.getFormulaData().test!.sheet1![0][0]?.f).toBe('=99');
        } finally {
            testBed.univer.dispose();
        }
    });

    it('keeps captured data alive after workbook disposal without observing later prototype setters', () => {
        const column = 90_000_001;
        const testBed = createCompactFormulaTestBed({ 7: { [column]: { f: '=1+2' } } });
        const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
        expect(snapshot).toBeDefined();
        testBed.univer.dispose();
        let calls = 0;
        try {
            // eslint-disable-next-line no-extend-native -- This adversarial fixture restores the native descriptor in finally.
            Object.defineProperty(Object.prototype, String(column), {
                configurable: true,
                set: () => { calls++; },
            });
            const result = snapshot!.materialize();
            expect(result.test!.sheet1![7][column]).toEqual({ f: '=1+2' });
            expect(Object.getOwnPropertyDescriptor(result.test!.sheet1![7], String(column)))
                .toMatchObject({ enumerable: true, writable: true, configurable: true });
            expect(calls).toBe(0);
        } finally {
            Reflect.deleteProperty(Object.prototype, String(column));
        }
    });

    it('accepts null-prototype data and ignores cell fields the old formula builder never reads', () => {
        let reads = 0;
        const cell = Object.assign(Object.create(null), { f: '=SUM(A1)' });
        Object.defineProperty(cell, 'unrelated', {
            enumerable: true,
            get: () => {
                reads++;
                return 9;
            },
        });
        const data = Object.create(null);
        data[0] = Object.assign(Object.create(null), { 0: cell });
        const testBed = createCompactFormulaTestBed(data);
        try {
            reads = 0;
            const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
            expect(snapshot?.materialize()).toStrictEqual(testBed.model.getFormulaData());
            expect(reads).toBe(0);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('uses unit-array indices without observing an iterator the old getter does not read', () => {
        const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1+2' } } });
        const units = testBed.get(IUniverInstanceService).getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        let calls = 0;
        Object.defineProperty(units, Symbol.iterator, {
            configurable: true,
            get: () => {
                calls++;
                throw new Error('iterator must not be observed');
            },
        });
        try {
            const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
            expect(snapshot?.materialize()).toStrictEqual(testBed.model.getFormulaData());
            expect(calls).toBe(0);
        } finally {
            Reflect.deleteProperty(units, Symbol.iterator);
            testBed.univer.dispose();
        }
    });

    it('reads an own sheet-order constructor exactly as the eager getter does', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1+2' } } });
            const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!;
            const order = workbook.getSnapshot().sheetOrder;
            let calls = 0;
            Object.defineProperty(order, 'constructor', {
                configurable: true,
                get: () => {
                    calls++;
                    return Array;
                },
            });
            try {
                return { data: readFormulaInput(testBed.model, compact), calls };
            } finally {
                Reflect.deleteProperty(order, 'constructor');
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.calls).toBe(1);
        expect(run(true)).toStrictEqual(expected);
    });

    it('preserves custom array species without probing it or repeating getSheets', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1+2' } } });
            const original = Object.getOwnPropertyDescriptor(Array, Symbol.species)!;
            let calls = 0;
            let data: IFormulaData;
            try {
                Object.defineProperty(Array, Symbol.species, {
                    configurable: true,
                    get: () => {
                        calls++;
                        return Array;
                    },
                });
                data = readFormulaInput(testBed.model, compact);
            } finally {
                Object.defineProperty(Array, Symbol.species, original);
                testBed.univer.dispose();
            }
            return { data, calls };
        };
        const expected = run(false);
        expect(expected.calls).toBe(1);
        expect(run(true)).toStrictEqual(expected);
    });

    it.each(['f', 'si', 'ref'] as const)('reads a %s accessor the same number of times and in the same phase as eager capture', (key) => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
            const cell = testBed.worksheet.getCellMatrix().getValue(0, 0)!;
            const reads: string[] = [];
            const original = Object.getOwnPropertyDescriptor(cell, key);
            Object.defineProperty(cell, key, {
                configurable: true,
                get: () => {
                    reads.push(key);
                    return key === 'f' ? '=A1' : key === 'si' ? 'shared' : 'A1';
                },
            });
            try {
                return { data: readFormulaInput(testBed.model, compact), reads };
            } finally {
                if (original) Object.defineProperty(cell, key, original);
                else Reflect.deleteProperty(cell, key);
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.reads).toHaveLength(key === 'ref' ? 1 : 3);
        expect(run(true)).toStrictEqual(expected);
    });

    it.each(['matrix', 'row', 'cell'] as const)('preserves a %s Proxy trap sequence through the original traversal', (kind) => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
            const matrix = testBed.worksheet.getCellMatrix();
            const raw = matrix.getMatrix();
            const row = raw[0];
            const cell = row[0];
            const traps: string[] = [];
            const proxy = new Proxy(kind === 'matrix' ? raw : kind === 'row' ? row : cell!, {
                get: (target, key, receiver) => {
                    traps.push(`get:${String(key)}`);
                    return Reflect.get(target, key, receiver);
                },
                ownKeys: (target) => {
                    traps.push('ownKeys');
                    return Reflect.ownKeys(target);
                },
                getOwnPropertyDescriptor: (target, key) => {
                    traps.push(`descriptor:${String(key)}`);
                    return Reflect.getOwnPropertyDescriptor(target, key);
                },
                getPrototypeOf: (target) => {
                    traps.push('prototype');
                    return Reflect.getPrototypeOf(target);
                },
            });
            if (kind === 'matrix') Object.assign(matrix, { _matrix: proxy });
            else if (kind === 'row') raw[0] = proxy as typeof row;
            else row[0] = proxy as ICellData;
            try {
                return { data: readFormulaInput(testBed.model, compact), traps };
            } finally {
                Object.assign(matrix, { _matrix: raw });
                raw[0] = row;
                row[0] = cell;
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.traps.length).toBeGreaterThan(0);
        expect(run(true)).toStrictEqual(expected);
    });

    it('captures shared formulas and array metadata without replaying source reads', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({
                0: { 0: { f: '=1' }, 1: { si: 'late' }, 2: { si: 'missing' } },
                1: { 1: { f: '=A2+1', si: 'late' } },
                3: { 0: { f: '={1;2}', ref: 'A4:A5', v: 1 } as ICellData, 1: { f: '=4' } },
                4: { 0: { v: 2 } },
            });
            try {
                const data = readFormulaInput(testBed.model, compact);
                return {
                    data,
                    anchors: Object.getOwnPropertyDescriptor(testBed.model, '_formulaIdMapData')!.value,
                    arrays: testBed.model.getArrayFormulaRange(),
                    arrayCells: testBed.model.getArrayFormulaCellData(),
                };
            } finally {
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.data.test!.sheet1![0][1]).toEqual({ f: '=A2+1', si: 'late', x: 0, y: -1 });
        expect(expected.data.test!.sheet1![0][2]).toBeUndefined();
        expect(expected.arrays.test?.sheet1?.[3]?.[0]).toMatchObject({ startRow: 3, endRow: 4 });
        expect(expected.arrayCells.test?.sheet1?.[4]?.[0]?.v).toBe(2);
        expect(run(true)).toStrictEqual(expected);
    });

    it('does not reread getter values when a late shared formula changes the output representation', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=PREFIX()' }, 1: {} } });
            const cell = testBed.worksheet.getCellMatrix().getValue(0, 1)!;
            const reads: string[] = [];
            let formulaReads = 0;
            let idReads = 0;
            Object.defineProperties(cell, {
                f: {
                    configurable: true,
                    get: () => {
                        reads.push('f');
                        return `=${++formulaReads}`;
                    },
                },
                si: {
                    configurable: true,
                    get: () => {
                        reads.push('si');
                        return ++idReads === 3 ? 'late' : '';
                    },
                },
                ref: {
                    configurable: true,
                    get: () => {
                        reads.push('ref');
                        return undefined;
                    },
                },
            });
            try {
                return { data: readFormulaInput(testBed.model, compact), reads };
            } finally {
                Reflect.deleteProperty(cell, 'f');
                Reflect.deleteProperty(cell, 'si');
                Reflect.deleteProperty(cell, 'ref');
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.reads).toEqual(['si', 'f', 'ref', 'f', 'si', 'f', 'si']);
        expect(expected.data.test!.sheet1![0][1]).toEqual({ f: '=3', si: 'late' });
        expect(run(true)).toStrictEqual(expected);
    });

    it('preserves getter edits to cells later in each traversal pass', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: {}, 1: {} } });
            const row = testBed.worksheet.getCellMatrix().getMatrix()[0];
            const reads: string[] = [];
            let laterFormula = '=0';
            let changes = 0;
            Object.defineProperty(row[0], 'f', {
                configurable: true,
                get: () => {
                    reads.push('first');
                    laterFormula = `=${++changes}`;
                    return '=FIRST()';
                },
            });
            Object.defineProperty(row[1], 'f', {
                configurable: true,
                get: () => {
                    reads.push(`later:${laterFormula}`);
                    return laterFormula;
                },
            });
            try {
                return { data: readFormulaInput(testBed.model, compact), reads };
            } finally {
                Reflect.deleteProperty(row[0]!, 'f');
                Reflect.deleteProperty(row[1]!, 'f');
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.reads).toEqual(['first', 'later:=1', 'first', 'later:=2', 'first', 'later:=3']);
        expect(expected.data.test!.sheet1![0][1]?.f).toBe('=3');
        expect(run(true)).toStrictEqual(expected);
    });

    it('preserves earlier values when duplicate sheet ids merge a later partial traversal', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=SOURCE()' } } });
            const workbook = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!;
            workbook.getSnapshot().sheetOrder.splice(1, 0, 'sheet1');
            const matrix = testBed.worksheet.getCellMatrix();
            let calls = 0;
            const override = vi.spyOn(matrix, 'forValue').mockImplementation((callback) => {
                const capture = Math.floor(calls++ / 3);
                callback(0, 0, { f: `=${capture + 1}` });
                if (capture === 0) callback(0, 1, { f: '=KEEP()' });
                return matrix;
            });
            try {
                return { data: readFormulaInput(testBed.model, compact), calls };
            } finally {
                override.mockRestore();
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.calls).toBe(6);
        expect(expected.data.test!.sheet1![0]).toEqual({ 0: { f: '=2' }, 1: { f: '=KEEP()' } });
        expect(run(true)).toStrictEqual(expected);
    });

    it.each(['repeated', 'reversed', 'outside-uint32'] as const)('preserves %s coordinates from a custom source traversal', (kind) => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=SOURCE()' } } });
            const matrix = testBed.worksheet.getCellMatrix();
            const events: number[] = [];
            const coordinates = kind === 'repeated'
                ? [[0, 0], [0, 0]]
                : kind === 'reversed' ? [[1, 1], [0, 0]] : [[0, 0], [0x1_0000_0000, 1]];
            const override = vi.spyOn(matrix, 'forValue').mockImplementation((callback) => {
                events.push(events.length);
                for (let index = 0; index < coordinates.length; index++) {
                    const [row, column] = coordinates[index];
                    if (callback(row, column, { f: `=${index + 1}` }) === false) break;
                }
                return matrix;
            });
            try {
                return { data: readFormulaInput(testBed.model, compact), events };
            } finally {
                override.mockRestore();
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.events).toEqual([0, 1, 2]);
        expect(run(true)).toStrictEqual(expected);
    });

    it.each(['initial', 'during-capture'] as const)('preserves String tag classification when customized %s', (timing) => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1' }, 1: {} } });
            const cell = testBed.worksheet.getCellMatrix().getValue(0, 1)!;
            const original = Object.getOwnPropertyDescriptor(String.prototype, Symbol.toStringTag);
            const classifications: string[] = [];
            let reads = 0;
            let data: IFormulaData | undefined;
            const installTag = () => {
                // eslint-disable-next-line no-extend-native -- Restore this classification fixture before assertions and disposal.
                Object.defineProperty(String.prototype, Symbol.toStringTag, {
                    configurable: true,
                    get() {
                        classifications.push(String.prototype.valueOf.call(this));
                        return 'String';
                    },
                });
            };
            Object.defineProperty(cell, 'f', {
                configurable: true,
                get: () => {
                    reads++;
                    if (timing === 'during-capture' && reads === 3) installTag();
                    return '=2';
                },
            });
            try {
                if (timing === 'initial') installTag();
                data = compact
                    ? testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy)?.materialize()
                    : testBed.model.getFormulaData();
            } finally {
                // eslint-disable-next-line no-extend-native -- Restore the original global descriptor before assertions and disposal.
                if (original) Object.defineProperty(String.prototype, Symbol.toStringTag, original);
                else Reflect.deleteProperty(String.prototype, Symbol.toStringTag);
                Reflect.deleteProperty(cell, 'f');
                testBed.univer.dispose();
            }
            return { data, reads, classifications };
        };
        const expected = run(false);
        expect(expected.data!.test!.sheet1![0][1]).toEqual({ f: '=2' });
        expect(expected.reads).toBe(3);
        expect(expected.classifications).toEqual(timing === 'initial'
            ? ['=1', '=2', '=1', '=2', '=1', '', '=2', '', '', '']
            : ['=2', '', '', '']);
        expect(run(true)).toStrictEqual(expected);
    });

    it('preserves boxed formula strings after a compact prefix', () => {
        const run = (compact: boolean) => {
            const boxedFormula = new Object('=BOXED()') as string;
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=PREFIX()' }, 1: { f: boxedFormula } } });
            try {
                return readFormulaInput(testBed.model, compact);
            } finally {
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(typeof expected.test!.sheet1![0][1]?.f).toBe('object');
        expect(run(true)).toStrictEqual(expected);
    });

    it('preserves formulas across chunk boundaries and multiple sheets after edits and disposal', () => {
        const cellData: IObjectMatrixPrimitiveType<ICellData> = {};
        for (let index = 0; index < 8_193; index++) {
            const row = Math.floor(index / 3);
            cellData[row] ??= {};
            cellData[row][index % 3] = { f: `=${index}+1` };
        }
        const testBed = createCompactFormulaTestBed(cellData);
        const secondMatrix = testBed.get(IUniverInstanceService).getUnit<Workbook>('test')!.getSheetBySheetId('empty')!.getCellMatrix();
        secondMatrix.setValue(2, 2, { f: '=SECOND()' });
        const expected = testBed.model.getFormulaData();
        const snapshot = testBed.model.tryCreateFormulaDataSnapshot(nodeUtilTypes.isProxy);
        expect(snapshot).toBeDefined();
        testBed.worksheet.getCellMatrix().realDeleteValue(0, 0);
        secondMatrix.setValue(2, 2, { f: '=EDITED()' });
        testBed.univer.dispose();
        expect(snapshot!.materialize()).toStrictEqual(expected);
        expect(snapshot!.materialize()).toBe(snapshot!.materialize());
    });

    it('preserves numeric enumeration order when draining captured chunks, including the Uint32 boundary', () => {
        const last = 0xFFFF_FFFF;
        const testBed = createCompactFormulaTestBed({
            0: { 0: { f: '=1' }, [last]: { f: '=2' } },
            [last]: { 0: { f: '=3' }, [last]: { f: '=4' } },
        });
        try {
            const expected = testBed.model.getFormulaData();
            const actual = readFormulaInput(testBed.model, true);
            expect(actual).toStrictEqual(expected);
            expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
        } finally {
            testBed.univer.dispose();
        }
    });

    it('uses normal instance methods in their original order without requiring a proxy classifier', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1+2' } } });
            const worksheet = testBed.worksheet;
            const getMatrix = worksheet.getCellMatrix.bind(worksheet);
            const getId = worksheet.getSheetId.bind(worksheet);
            const events: string[] = [];
            const matrixMethod = vi.spyOn(worksheet, 'getCellMatrix').mockImplementation(() => {
                events.push('matrix');
                return getMatrix();
            });
            const idMethod = vi.spyOn(worksheet, 'getSheetId').mockImplementation(() => {
                events.push('id');
                return getId();
            });
            try {
                const snapshot = compact ? testBed.model.tryCreateFormulaDataSnapshot() : undefined;
                if (compact) expect(snapshot).toBeDefined();
                return { data: compact ? snapshot!.materialize() : testBed.model.getFormulaData(), events };
            } finally {
                matrixMethod.mockRestore();
                idMethod.mockRestore();
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.events).toEqual(['matrix', 'id']);
        expect(run(true)).toStrictEqual(expected);
    });

    it('preserves the original numeric-key coercion for noncanonical source keys', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 1: { 0: { f: '=CANONICAL()' } } });
            const raw = testBed.worksheet.getCellMatrix().getMatrix();
            Object.assign(raw, { '01': { 0: { f: '=ALIAS()' } } });
            try {
                return readFormulaInput(testBed.model, compact);
            } finally {
                Reflect.deleteProperty(raw, '01');
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.test!.sheet1![1][0]?.f).toBe('=CANONICAL()');
        expect(run(true)).toStrictEqual(expected);
    });

    it('keeps mixed Sheets and Base formula inputs unchanged', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=1+2' } } });
            testBed.get(IUniverInstanceService).registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
            testBed.univer.createUnit(UniverInstanceType.UNIVER_BASE, Tools.deepClone(TEST_BASE_DATA));
            try {
                return readFormulaInput(testBed.model, compact);
            } finally {
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected['base-test']!['table-main']![0][7]?.si).toBe('total');
        expect(run(true)).toStrictEqual(expected);
    });

    it('keeps existing array metadata when capturing subsequent calculations', () => {
        const run = (compact: boolean) => {
            const testBed = createCompactFormulaTestBed({ 0: { 0: { f: '=A1' } } });
            const arrays = { test: { sheet1: { 0: { 0: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 } } } } };
            testBed.model.setArrayFormulaRange(arrays);
            testBed.model.setArrayFormulaCellData({ test: { sheet1: { 1: { 0: { v: 7 } } } } });
            try {
                return {
                    data: readFormulaInput(testBed.model, compact),
                    arrays: testBed.model.getArrayFormulaRange(),
                    arrayCells: testBed.model.getArrayFormulaCellData(),
                };
            } finally {
                testBed.univer.dispose();
            }
        };
        const expected = run(false);
        expect(expected.arrayCells.test?.sheet1?.[1]?.[0]?.v).toBe(7);
        expect(run(true)).toStrictEqual(expected);
    });
});

describe('Test formula data model', () => {
    describe('formulaDataModel function', () => {
        let univer: Univer;
        let get: Injector['get'];
        let formulaDataModel: FormulaDataModel;

        beforeEach(() => {
            const testBed = createCommandTestBed(Tools.deepClone(TEST_WORKBOOK_DATA_DEMO));
            univer = testBed.univer;
            get = testBed.get;

            formulaDataModel = get(FormulaDataModel);
        });

        afterEach(() => {
            univer.dispose();
        });

        it.each(['__proto__', 'constructor', 'prototype', 'toString'])('keeps loaded formula dictionaries safe when merging (%s)', (key) => {
            const marker = '__formula_pollution__';
            const range = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
            try {
                formulaDataModel.setArrayFormulaRange(JSON.parse('{"normal":{}}'));
                formulaDataModel.mergeArrayFormulaRange({ [key]: { [marker]: { 0: { 0: range } } } });
                formulaDataModel.mergeArrayFormulaRange({ normal: { [key]: { 0: { 0: range } } } });
                expect(formulaDataModel.getArrayFormulaRange()[key]?.[marker]?.[0]?.[0]).toEqual(range);
                expect(formulaDataModel.getArrayFormulaRange().normal?.[key]?.[0]?.[0]).toEqual(range);
                const data: IFormulaData = {};
                formulaDataModel.initSheetFormulaData(data, key, marker, new ObjectMatrix({ 0: { 0: { f: '=1' } } }));
                expect(data[key]?.[marker]?.[0]?.[0]?.f).toBe('=1');
                expect(Object.getOwnPropertyDescriptor(Object.prototype, marker)).toBeUndefined();
            } finally {
                Reflect.deleteProperty(Object.prototype, marker);
                Reflect.deleteProperty(Object, marker);
            }
        });

        describe('updateFormulaData', () => {
            it('skips formula reconstruction for value updates', () => {
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>('test')
                    ?.getSheetBySheetId('sheet1');
                const worksheetCellMatrix = worksheet!.getCellMatrix();
                worksheetCellMatrix.setValue(10, 10, { v: 1 });
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');
                const scanWorksheet = vi.spyOn(worksheetCellMatrix, 'forValue');

                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        10: { v: 2 },
                    },
                })).toEqual({});
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
                expect(scanWorksheet).not.toHaveBeenCalled();
            });

            it('updates formulas without ids incrementally', () => {
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>('test')
                    ?.getSheetBySheetId('sheet1');
                const worksheetCellMatrix = worksheet!.getCellMatrix();
                worksheetCellMatrix.setValue(10, 11, { f: '=A1' });
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');
                const scanWorksheet = vi.spyOn(worksheetCellMatrix, 'forValue');

                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        10: { f: '=A1' },
                        11: { f: '=B1' },
                    },
                })).toEqual({
                    10: {
                        10: { f: '=A1' },
                        11: { f: '=B1' },
                    },
                });
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
                expect(scanWorksheet).not.toHaveBeenCalled();
            });

            it('deletes formulas without ids incrementally', () => {
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>('test')
                    ?.getSheetBySheetId('sheet1');
                worksheet?.getCellMatrix().setValue(10, 10, { f: '=A1' });
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');

                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        10: { v: 1, f: null },
                    },
                })).toEqual({
                    10: {
                        10: null,
                    },
                });
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
            });

            it('processes mixed updates containing shared formulas incrementally', () => {
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');

                const result = formulaDataModel.updateFormulaData('test', 'sheet1', {
                    0: {
                        0: { f: '=B1' },
                    },
                    1: {
                        3: { v: null, f: null, si: null },
                    },
                });

                expect(result[0]?.[0]).toEqual({ f: '=B1' });
                expect(result[1]?.[3]).toBeNull();
                expect(result[2]?.[3]).toEqual({ f: '=SUM(A3)', si: 'OSPtzm' });
                expect(getSheetFormulaData).not.toHaveBeenCalled();
            });

            it('updates both old and new shared formula groups', () => {
                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    1: {
                        3: { f: '=SUM(B2)', si: 'new-group' },
                    },
                })).toEqual({
                    1: {
                        3: { f: '=SUM(B2)', si: 'new-group' },
                    },
                    2: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm' },
                    },
                    3: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm', x: 0, y: 1 },
                    },
                });
            });

            it('detaches a shared formula anchor into a normal formula', () => {
                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    1: {
                        3: { f: '=SUM(B2)', si: null },
                    },
                })).toEqual({
                    1: {
                        3: { f: '=SUM(B2)' },
                    },
                    2: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm' },
                    },
                    3: {
                        3: { f: '=SUM(A3)', si: 'OSPtzm', x: 0, y: 1 },
                    },
                });
            });

            it('creates a shared formula group when a follower precedes its anchor', () => {
                expect(formulaDataModel.updateFormulaData('test', 'sheet1', {
                    10: {
                        3: { si: 'new-group' },
                    },
                    11: {
                        3: { f: '=SUM(A12)', si: 'new-group' },
                    },
                })).toEqual({
                    10: {
                        3: { f: '=SUM(A12)', si: 'new-group', x: 0, y: -1 },
                    },
                    11: {
                        3: { f: '=SUM(A12)', si: 'new-group' },
                    },
                });
            });

            it('delete formula with id', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const getFormulaData = vi.spyOn(formulaDataModel, 'getFormulaData');
                const getSheetFormulaData = vi.spyOn(formulaDataModel, 'getSheetFormulaData');
                const worksheetCellMatrix = get(IUniverInstanceService)
                    .getUnit<Workbook>(unitId)
                    ?.getSheetBySheetId(sheetId)
                    ?.getCellMatrix();
                const scanWorksheet = vi.spyOn(worksheetCellMatrix!, 'forValue');
                const cellValue = {
                    1: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    1: {
                        3: null,
                    },
                    2: {
                        3: {
                            f: '=SUM(A3)',
                            si: 'OSPtzm',
                        },
                    },
                    3: {
                        3: {
                            f: '=SUM(A3)',
                            si: 'OSPtzm',
                            x: 0,
                            y: 1,
                        },
                    },
                };

                const newFormulaData = formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
                expect(newFormulaData).toStrictEqual(result);
                expect(getFormulaData).not.toHaveBeenCalled();
                expect(getSheetFormulaData).not.toHaveBeenCalled();
                expect(scanWorksheet).toHaveBeenCalledOnce();
            });

            it('delete formulas with ids and formulas with only ids', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const cellValue = {
                    0: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                    1: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                    2: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    0: {
                        3: null,
                    },
                    1: {
                        3: null,
                    },
                    2: {
                        3: null,
                    },
                    3: {
                        3: {
                            f: '=SUM(A4)',
                            si: 'OSPtzm',
                        },
                    },
                };

                const newFormulaData = formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
                expect(newFormulaData).toStrictEqual(result);
            });

            it('delete the formula with only id', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const cellValue = {
                    3: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    3: {
                        3: null,
                    },
                };

                const newFormulaData = formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);
                expect(newFormulaData).toStrictEqual(result);
            });
        });

        describe('updateArrayFormulaRange', () => {
            it('update array formula range', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                formulaDataModel.setArrayFormulaRange({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    startRow: 0,
                                    startColumn: 3,
                                    endRow: 1,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                const cellValue = {
                    0: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    [unitId]: {
                        [sheetId]: {},
                    },
                };

                formulaDataModel.updateArrayFormulaRange(unitId, sheetId, cellValue);

                const formulaData = formulaDataModel.getArrayFormulaRange();
                expect(JSON.parse(JSON.stringify(formulaData))).toStrictEqual(result);
            });
        });
        describe('updateArrayFormulaCellData', () => {
            it('update array formula cell data', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                formulaDataModel.setArrayFormulaRange({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    startRow: 0,
                                    startColumn: 3,
                                    endRow: 1,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.setArrayFormulaCellData({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    v: 1,
                                },
                            },
                            1: {
                                3: {
                                    v: 2,
                                },
                            },
                        },
                    },
                });

                const cellValue = {
                    0: {
                        3: {
                            v: null,
                            p: null,
                            f: null,
                            si: null,
                        },
                    },
                };

                const result = {
                    [unitId]: {
                        [sheetId]: {},
                    },
                };

                formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, cellValue);

                const formulaData = formulaDataModel.getArrayFormulaCellData();
                expect(JSON.parse(JSON.stringify(formulaData))).toStrictEqual(result);
            });

            it('should clear only edited array formula cell data when editing a spill cell', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';

                formulaDataModel.setArrayFormulaRange({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    startRow: 0,
                                    startColumn: 3,
                                    endRow: 1,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.setArrayFormulaCellData({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    v: 1,
                                },
                            },
                            1: {
                                3: {
                                    v: 2,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.updateArrayFormulaCellData(unitId, sheetId, {
                    1: {
                        3: {
                            v: 111,
                        },
                    },
                });

                expect(JSON.parse(JSON.stringify(formulaDataModel.getArrayFormulaCellData()))).toStrictEqual({
                    [unitId]: {
                        [sheetId]: {
                            0: {
                                3: {
                                    v: 1,
                                },
                            },
                        },
                    },
                });
            });
        });

        describe('getFormulaStringByCell', () => {
            it('uses the initialized shared formula master index for repeated follower reads', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>(unitId)
                    ?.getSheetBySheetId(sheetId);

                const result = [
                    ['=SUM(A1)'],
                    ['=SUM(A2)'],
                    ['=SUM(A3)'],
                    ['=SUM(A4)'],
                ];

                formulaDataModel.getFormulaData();
                const scanWorksheet = vi.spyOn(worksheet!.getCellMatrix(), 'forValue');

                for (let i = 0; i < 4; i++) {
                    const formulaString = formulaDataModel.getFormulaStringByCell(i, 3, sheetId, unitId);
                    expect(formulaString).toBe(result[i][0]);
                }

                expect(scanWorksheet).not.toHaveBeenCalled();
            });

            it('rebuilds a stale shared formula master index after the master formula changes', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>(unitId)
                    ?.getSheetBySheetId(sheetId);
                const cellMatrix = worksheet!.getCellMatrix();

                formulaDataModel.getFormulaData();
                const scanWorksheet = vi.spyOn(cellMatrix, 'forValue');
                cellMatrix.setValue(1, 3, { f: '=SUM(B2)', si: 'OSPtzm' });

                expect(formulaDataModel.getFormulaStringByCell(2, 3, sheetId, unitId)).toBe('=SUM(B3)');
                expect(scanWorksheet).toHaveBeenCalledTimes(1);
                expect(formulaDataModel.getFormulaStringByCell(3, 3, sheetId, unitId)).toBe('=SUM(B4)');
                expect(scanWorksheet).toHaveBeenCalledTimes(1);
            });

            it('rebuilds a stale shared formula master index after rows move', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>(unitId)
                    ?.getSheetBySheetId(sheetId);
                const cellMatrix = worksheet!.getCellMatrix();

                formulaDataModel.getFormulaData();
                const scanWorksheet = vi.spyOn(cellMatrix, 'forValue');
                cellMatrix.insertRows(0, 1);

                expect(formulaDataModel.getFormulaStringByCell(3, 3, sheetId, unitId)).toBe('=SUM(A3)');
                expect(scanWorksheet).toHaveBeenCalledTimes(1);
                expect(formulaDataModel.getFormulaStringByCell(4, 3, sheetId, unitId)).toBe('=SUM(A4)');
                expect(scanWorksheet).toHaveBeenCalledTimes(1);
            });

            it('rebuilds the shared formula master index when a missing master is added', () => {
                const unitId = 'test';
                const sheetId = 'sheet1';
                const worksheet = get(IUniverInstanceService)
                    .getUnit<Workbook>(unitId)
                    ?.getSheetBySheetId(sheetId);
                const cellMatrix = worksheet!.getCellMatrix();

                formulaDataModel.getFormulaData();
                const scanWorksheet = vi.spyOn(cellMatrix, 'forValue');
                cellMatrix.setValue(10, 0, { f: '=B11', si: 'new-shared-formula' });
                cellMatrix.setValue(11, 0, { si: 'new-shared-formula' });

                expect(formulaDataModel.getFormulaStringByCell(11, 0, sheetId, unitId)).toBe('=B12');
                expect(scanWorksheet).toHaveBeenCalledTimes(1);
                expect(formulaDataModel.getFormulaStringByCell(11, 0, sheetId, unitId)).toBe('=B12');
                expect(scanWorksheet).toHaveBeenCalledTimes(1);
            });

            it('should return null when formula string source cell cannot be found', () => {
                expect(formulaDataModel.getFormulaStringByCell(0, 0, 'missing-sheet', 'test')).toBeNull();
                expect(formulaDataModel.getFormulaStringByCell(0, 0, 'sheet1', 'missing-unit')).toBeNull();
            });
        });

        describe('extra formula data branches', () => {
            beforeEach(() => {
                univer.dispose();
                const testBed = createCommandTestBed(TEST_WORKBOOK_DATA_EXTRA);
                univer = testBed.univer;
                get = testBed.get;
                formulaDataModel = get(FormulaDataModel);
            });

            it('should clear previous array formula cell data and remove range', () => {
                formulaDataModel.setArrayFormulaRange({
                    test: {
                        sheet1: {
                            0: {
                                0: {
                                    startRow: 0,
                                    startColumn: 0,
                                    endRow: 1,
                                    endColumn: 1,
                                },
                            },
                        },
                    },
                });
                formulaDataModel.setArrayFormulaCellData({
                    test: {
                        sheet1: {
                            0: {
                                0: { v: 1 },
                            },
                            1: {
                                1: { v: 2 },
                            },
                        },
                    },
                });

                const clearMatrix = new ObjectMatrix<Nullable<ICellData>>({
                    0: {
                        0: { v: null },
                    },
                });
                formulaDataModel.clearPreviousArrayFormulaCellData({
                    test: {
                        sheet1: clearMatrix,
                    },
                });

                expect(formulaDataModel.getArrayFormulaCellData().test?.sheet1).toEqual({});
            });

            it('should merge array formula range and cell data', () => {
                formulaDataModel.mergeArrayFormulaRange({
                    test: {
                        sheet1: {
                            2: {
                                2: {
                                    startRow: 2,
                                    startColumn: 2,
                                    endRow: 3,
                                    endColumn: 3,
                                },
                            },
                        },
                    },
                });

                const runtimeCellData = new ObjectMatrix<Nullable<ICellData>>({
                    2: {
                        2: { v: 10 },
                    },
                    3: {
                        3: { v: 11 },
                    },
                });
                formulaDataModel.mergeArrayFormulaCellData({
                    test: {
                        sheet1: runtimeCellData,
                    },
                });

                expect(formulaDataModel.getArrayFormulaRange().test?.sheet1?.[2]?.[2]).toEqual({
                    startRow: 2,
                    startColumn: 2,
                    endRow: 3,
                    endColumn: 3,
                });
                expect(formulaDataModel.getArrayFormulaCellData().test?.sheet1?.[3]?.[3]?.v).toBe(11);
            });

            it('should initialize array formula range and cached cells from snapshot refs', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'array-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                5: {
                                    10: {
                                        f: '=IF(A1:A6,B1,0)',
                                        ref: 'K6:K11',
                                        v: 0,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                                6: {
                                    10: {
                                        ref: 'K6:K11',
                                        v: -5300,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['array-test']?.sheet1?.[5]?.[10]).toEqual({
                    startRow: 5,
                    startColumn: 10,
                    endRow: 10,
                    endColumn: 10,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: RANGE_TYPE.NORMAL,
                });
                expect(formulaDataModel.getArrayFormulaCellData()['array-test']?.sheet1?.[6]?.[10]?.v).toBe(-5300);
            });

            it('should not initialize a single-cell ref as an array formula range', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'single-ref-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                11: {
                                    5: {
                                        f: '=IFERROR(1/0,"")',
                                        ref: 'F12',
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['single-ref-test']?.sheet1?.[11]?.[5]).toBeUndefined();
                expect(formulaDataModel.getArrayFormulaCellData()['single-ref-test']?.sheet1?.[11]?.[5]).toBeUndefined();
            });

            it('should preserve a single-cell ref for array constant formulas', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'single-array-constant-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                0: {
                                    1: {
                                        f: '={1,2;3,4}',
                                        ref: 'B1',
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['single-array-constant-test']?.sheet1?.[0]?.[1]).toEqual({
                    startRow: 0,
                    startColumn: 1,
                    endRow: 0,
                    endColumn: 1,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                });
            });

            it('should initialize array formula range for shared formula followers with refs', () => {
                univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                    id: 'shared-array-test',
                    appVersion: '3.0.0-alpha',
                    sheets: {
                        sheet1: {
                            id: 'sheet1',
                            name: 'Sheet1',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: {
                                5: {
                                    6: {
                                        f: '=SUMIFS($D$6:$D$13,$B$6:$B$13,G5,$C$6:$C$13,$F$10:$F$14)',
                                        si: '0',
                                        ref: 'G6:G10',
                                        v: 0,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                    7: {
                                        si: '0',
                                        ref: 'H6:H10',
                                        v: 0,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                                6: {
                                    7: {
                                        ref: 'H6:H10',
                                        v: 12,
                                        t: CellValueType.NUMBER,
                                    } as ICellData & { ref: string },
                                },
                            },
                        },
                    },
                    locale: LocaleType.ZH_CN,
                    name: '',
                    sheetOrder: ['sheet1'],
                    styles: {},
                });

                formulaDataModel.getFormulaData();

                expect(formulaDataModel.getArrayFormulaRange()['shared-array-test']?.sheet1?.[5]?.[7]).toEqual({
                    startRow: 5,
                    startColumn: 7,
                    endRow: 9,
                    endColumn: 7,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: RANGE_TYPE.NORMAL,
                });
                expect(formulaDataModel.getArrayFormulaCellData()['shared-array-test']?.sheet1?.[6]?.[7]?.v).toBe(12);
            });

            it('should merge and update image formula data', () => {
                const imageMatrix = new ObjectMatrix({
                    1: {
                        1: {
                            source: 'https://img',
                            altText: 'demo',
                            sizing: 1,
                            height: 10,
                            width: 20,
                        },
                    },
                });
                formulaDataModel.mergeUnitImageFormulaData({
                    test: {
                        sheet1: imageMatrix,
                    },
                });

                expect(formulaDataModel.getUnitImageFormulaData().test?.sheet1.getValue(1, 1)?.source).toBe('https://img');

                formulaDataModel.updateImageFormulaData('test', 'sheet1', {
                    1: {
                        1: { v: null },
                    },
                });
                expect(formulaDataModel.getUnitImageFormulaData().test?.sheet1.getValue(1, 1)).toBeUndefined();
            });

            it('should delete array formula range by anchor cell', () => {
                formulaDataModel.setArrayFormulaRange({
                    test: {
                        sheet1: {
                            5: {
                                6: {
                                    startRow: 5,
                                    startColumn: 6,
                                    endRow: 6,
                                    endColumn: 7,
                                },
                            },
                        },
                    },
                });

                formulaDataModel.deleteArrayFormulaRange('test', 'sheet1', 5, 6);
                expect(formulaDataModel.getArrayFormulaRange().test?.sheet1).toEqual({});
            });

            it('should calculate dirty ranges for empty formula cells by continuous rows', () => {
                const dirtyRanges = formulaDataModel.getFormulaDirtyRanges();

                expect(dirtyRanges).toEqual([
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 0,
                            endRow: 1,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 3,
                            endRow: 3,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                ]);
            });

            it('should ignore non-sheet formula units when calculating sheet dirty ranges', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                univer.createUnit(UniverInstanceType.UNIVER_BASE, TEST_BASE_DATA);

                const dirtyRanges = formulaDataModel.getFormulaDirtyRanges();

                expect(dirtyRanges).toEqual([
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 0,
                            endRow: 1,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                    {
                        unitId: 'test',
                        sheetId: 'sheet1',
                        range: {
                            rangeType: RANGE_TYPE.NORMAL,
                            startRow: 3,
                            endRow: 3,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                ]);
            });

            it('should expose calculate data and per-sheet formula data', () => {
                const calculateData = formulaDataModel.getCalculateData();
                expect(calculateData.allUnitData.test?.sheet1.rowCount).toBeGreaterThan(0);
                expect(calculateData.unitSheetNameMap.test?.Sheet1).toBe('sheet1');
                expect(calculateData.unitNameMap.test).toEqual({
                    name: '',
                    unitType: UniverInstanceType.UNIVER_SHEET,
                });

                const sheetFormulaData = formulaDataModel.getSheetFormulaData('test', 'sheet1');
                expect(sheetFormulaData?.[0]?.[0]?.f).toBe('=A1');
            });

            it('should expose manually hidden sheet rows for subtotal-style formulas', () => {
                expect(formulaDataModel.getHiddenRowsFiltered()).toEqual({
                    test: {
                        sheet1: {
                            2: { hd: BooleanNumber.TRUE },
                        },
                    },
                });
            });

            it('should build formula and runtime data for base tables', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                univer.createUnit(UniverInstanceType.UNIVER_BASE, TEST_BASE_DATA);

                const formulaData = formulaDataModel.getFormulaData();
                expect(formulaData['base-test']?.['table-main']).toEqual({
                    0: {
                        7: {
                            f: '=SUM(Sales[[#This Row],[Amount]], Sales[[#This Row],[Qty]], Sales_2[[#Data],[External]])',
                            si: 'total',
                        },
                    },
                });

                const calculateData = formulaDataModel.getCalculateData();
                const tableData = calculateData.allUnitData['base-test']?.['table-main'];

                expect(calculateData.unitNameMap['base-test']).toEqual({
                    name: 'Base',
                    unitType: UniverInstanceType.UNIVER_BASE,
                });
                expect(calculateData.unitSheetNameMap['base-test']?.Sales).toBe('table-main');
                expect(calculateData.unitSheetNameMap['base-test']?.Sales_2).toBe('tableOther');
                expect(calculateData.unitSheetNameMap['base-test']?._T_tableOther).toBeUndefined();
                expect(tableData?.rowCount).toBe(1);
                expect(tableData?.columnCount).toBe(8);
                expect(tableData?.cellData.getValue(0, 0)).toEqual({ v: 'record-1', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 1)).toEqual({ v: 'Order 1', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 2)).toEqual({ v: 10, t: CellValueType.NUMBER });
                expect(tableData?.cellData.getValue(0, 4)).toEqual({ v: 'paid, online', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 5)).toEqual({ v: 'Invoice', t: CellValueType.STRING });
                expect(tableData?.cellData.getValue(0, 6)).toEqual({ v: '', t: CellValueType.STRING });
            });

            it('preserves explicit current-row scope and expands qualified columns to #Data', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                const snapshot = structuredClone(TEST_BASE_DATA);
                snapshot.id = 'base-structured-scope';
                snapshot.tables!['table-main'].name = 'Orders';
                snapshot.tables!['table-main'].formulaName = 'Orders';
                snapshot.tables!.tableOther.name = 'Pricing';
                snapshot.tables!.tableOther.formulaName = 'Pricing';
                snapshot.tables!['table-main'].fields.total.config = {
                    formula: '=Orders[@[Amount]]+[@[Qty]]+SUM(Pricing[External])',
                };
                univer.createUnit(UniverInstanceType.UNIVER_BASE, snapshot);

                expect(formulaDataModel.getFormulaData()['base-structured-scope']?.['table-main']?.[0]?.[7]?.f).toBe(
                    '=Orders[[#This Row],[Amount]]+Orders[[#This Row],[Qty]]+SUM(Pricing[[#Data],[External]])'
                );
            });

            it('does not reinterpret an unresolved table identifier as the current Base table', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                const snapshot = structuredClone(TEST_BASE_DATA);
                snapshot.id = 'base-unresolved-table';
                snapshot.tables!['table-main'].name = 'Orders';
                snapshot.tables!['table-main'].fields.total.config = {
                    formula: '=SUM(table[Amount])+table[[#This Row],[Qty]]',
                };
                univer.createUnit(UniverInstanceType.UNIVER_BASE, snapshot);

                expect(formulaDataModel.getFormulaData()['base-unresolved-table']?.['table-main']?.[0]?.[7]?.f).toBe(
                    '=SUM(table[Amount])+table[[#This Row],[Qty]]'
                );
            });

            it('resolves table when it is the real Base table name', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                const snapshot = structuredClone(TEST_BASE_DATA);
                snapshot.id = 'base-real-table-name';
                snapshot.tables!['table-main'].name = 'table';
                snapshot.tables!['table-main'].formulaName = 'table';
                snapshot.tables!['table-main'].fields.total.config = {
                    formula: '=SUM(table[Amount])+table[[#This Row],[Qty]]',
                };
                univer.createUnit(UniverInstanceType.UNIVER_BASE, snapshot);

                expect(formulaDataModel.getFormulaData()['base-real-table-name']?.['table-main']?.[0]?.[7]?.f).toBe(
                    '=SUM(table[[#Data],[Amount]])+table[[#This Row],[Qty]]'
                );
            });

            it('should preserve workbook-qualified A1 references in Base formulas', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                const snapshot = structuredClone(TEST_BASE_DATA);
                snapshot.id = 'base-external-a1';
                snapshot.tables!['table-main'].fields.total.config = {
                    formula: '=SUM([Host.xlsx]Sheet1!$A$1:$B$10)',
                };
                univer.createUnit(UniverInstanceType.UNIVER_BASE, snapshot);

                expect(formulaDataModel.getFormulaData()['base-external-a1']?.['table-main']?.[0]?.[7]?.f).toBe(
                    '=SUM([Host.xlsx]Sheet1!$A$1:$B$10)'
                );
            });

            it('should preserve workbook-qualified structured references in Base formulas', () => {
                const univerInstanceService = get(IUniverInstanceService);
                univerInstanceService.registerCtorForType(UniverInstanceType.UNIVER_BASE, BaseDataModel);
                const snapshot = structuredClone(TEST_BASE_DATA);
                snapshot.id = 'base-external-table';
                snapshot.tables!['table-main'].fields.total.config = {
                    formula: '=SUM([Orders Base]!Orders[Amount])',
                };
                univer.createUnit(UniverInstanceType.UNIVER_BASE, snapshot);

                expect(formulaDataModel.getFormulaData()['base-external-table']?.['table-main']?.[0]?.[7]?.f).toBe(
                    '=SUM([Orders Base]!Orders[Amount])'
                );
            });
        });
    });

    describe('FormulaDataModel.initSheetFormulaData', () => {
        let univer: Univer;
        let formulaDataModel: FormulaDataModel;

        beforeEach(() => {
            const testBed = createCommandTestBed(Tools.deepClone(TEST_WORKBOOK_DATA_DEMO));
            univer = testBed.univer;
            formulaDataModel = testBed.get(FormulaDataModel);
        });

        afterEach(() => {
            univer.dispose();
        });

        it('preserves empty and whitespace semantics when scanning formulas and shared ids', () => {
            const result = formulaDataModel.initSheetFormulaData({}, 'unit', 'sheet', new ObjectMatrix<ICellData>({
                0: {
                    0: { f: '=1', si: '' },
                    1: { f: '=' },
                    2: { f: ' =1' },
                    3: { f: '', si: '' },
                    4: { f: '=2', si: ' ' },
                    5: { si: ' ' },
                    6: { f: '=3', si: '0' },
                    7: { si: '0' },
                    8: { v: 1 },
                },
            }));
            expect(result.unit?.sheet?.[0]).toEqual({
                0: { f: '=1' },
                4: { f: '=2', si: ' ' },
                5: { f: '=2', si: ' ', x: 1, y: 0 },
                6: { f: '=3', si: '0' },
                7: { f: '=3', si: '0', x: 1, y: 0 },
            });
        });

        it('keeps core formula predicate behavior for nonprimitive values', () => {
            const values: unknown[] = [
                new Object('=A1'),
                new Object('='),
                Symbol('=A1'),
                1,
                null,
                Object.assign(Object.create(null), { [Symbol.toStringTag]: 'Other' }),
                {
                    [Symbol.toStringTag]: 'String',
                    length: 3,
                    substring: (start: number, end: number) => '=A1'.substring(start, end),
                },
                new Proxy({ [Symbol.toStringTag]: 'Other' }, {}),
            ];
            for (const value of values) {
                const expected = isFormulaString(value || '');
                const result = formulaDataModel.initSheetFormulaData({}, 'unit', 'sheet', new ObjectMatrix<ICellData>({
                    0: { 0: { f: value } as ICellData },
                }));
                if (expected) {
                    expect(result.unit?.sheet?.[0]?.[0]?.f).toBe(value);
                } else {
                    expect(result.unit?.sheet?.[0]).toBeUndefined();
                }
            }
        });

        it('keeps core shared id predicate behavior for nonprimitive values', () => {
            const values: unknown[] = [
                new Object('shared'),
                new Object(''),
                Symbol('shared'),
                1,
                null,
                { [Symbol.toStringTag]: 'String', length: 1, toString: () => 'tagged-id' },
                new Proxy({ [Symbol.toStringTag]: 'Other' }, {}),
            ];
            for (const value of values) {
                const expected = isFormulaId(value || '');
                const result = formulaDataModel.initSheetFormulaData({}, 'unit', 'sheet', new ObjectMatrix<ICellData>({
                    0: { 0: { f: '=1', si: value } as ICellData },
                }));
                const cell = result.unit?.sheet?.[0]?.[0];
                expect(cell?.f).toBe('=1');
                expect(cell?.si).toBe(expected ? value : undefined);
            }
        });

        it('preserves errors raised by nonprimitive formula and id predicates', () => {
            const failure = new Error('tag getter');
            const throwing = new Proxy({}, {
                get(target, key, receiver) {
                    if (key === Symbol.toStringTag) throw failure;
                    return Reflect.get(target, key, receiver);
                },
            });
            const invalidStringProxy = new Proxy(new Object('=1'), {
                get(target, key, receiver) {
                    return key === Symbol.toStringTag ? 'String' : Reflect.get(target, key, receiver);
                },
            });
            expect(() => isFormulaString(invalidStringProxy)).toThrow(TypeError);
            expect(() => formulaDataModel.initSheetFormulaData({}, 'unit', 'sheet', new ObjectMatrix<ICellData>({
                0: { 0: { f: invalidStringProxy } as ICellData },
            }))).toThrow(TypeError);
            for (const cell of [{ f: throwing }, { f: '=1', si: throwing }]) {
                expect(() => formulaDataModel.initSheetFormulaData({}, 'unit', 'sheet', new ObjectMatrix<ICellData>({
                    0: { 0: cell as ICellData },
                }))).toThrow(failure);
            }
        });

        it('falls back when primitive strings have a custom prototype tag', () => {
            const previous = Object.getOwnPropertyDescriptor(String.prototype, Symbol.toStringTag);
            let result: IFormulaData;
            let tagReads = 0;
            try {
                // eslint-disable-next-line no-extend-native -- This adversarial fixture restores the native descriptor in finally.
                Object.defineProperty(String.prototype, Symbol.toStringTag, {
                    configurable: true,
                    get() {
                        tagReads += 1;
                        return 'CustomString';
                    },
                });
                result = formulaDataModel.initSheetFormulaData({}, 'unit', 'sheet', new ObjectMatrix<ICellData>({
                    0: { 0: { f: '=1', si: 'shared' } },
                }));
            } finally {
                // eslint-disable-next-line no-extend-native -- Restore the native descriptor changed by this adversarial fixture.
                if (previous) Object.defineProperty(String.prototype, Symbol.toStringTag, previous);
                else Reflect.deleteProperty(String.prototype, Symbol.toStringTag);
            }
            expect(result!.unit?.sheet?.[0]).toBeUndefined();
            expect(tagReads).toBe(2);
        });

        it('propagates explicit implicit intersection to shared formula followers', () => {
            const formula = '=RANK(E2,IF(@A$2:A$4=A2,E$2:E$4),0)';
            const result = formulaDataModel.initSheetFormulaData(
                {},
                'unit',
                'sheet',
                new ObjectMatrix<ICellData>({
                    1: {
                        7: {
                            f: formula,
                            si: '3',
                        },
                    },
                    2: {
                        7: { si: '3' },
                    },
                })
            );

            expect(result.unit?.sheet?.[1]?.[7]?.f).toBe(formula);
            expect(result.unit?.sheet?.[2]?.[7]?.f).toBe(formula);
        });

        it('init formula data', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';

            const formulaData: IFormulaData = {
                [unitId]: {},
            };

            const cellValue = {
                0: {
                    0: {
                        v: 1,
                    },
                    1: {
                        v: 2,
                    },
                    2: {
                        v: 3,
                    },
                    3: {
                        v: 2,
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                },
            };

            const cellMatrix = new ObjectMatrix<Nullable<ICellData>>(cellValue);

            const result = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A1)',
                                si: '3e4r5t',
                            },
                        },
                    },
                },
            };

            formulaDataModel.initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);
            expect(JSON.parse(JSON.stringify(formulaData))).toStrictEqual(result);
        });

        it('preserves Excel shared formula ids with relative offsets', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';

            const formulaData: IFormulaData = {
                [unitId]: {},
            };

            const cellValue = {
                5: {
                    4: {
                        v: 0,
                        f: '=E$4+$D6',
                        si: '0',
                    },
                    5: {
                        v: 1,
                        si: '0',
                    },
                },
                8: {
                    5: {
                        v: 2,
                        si: '0',
                    },
                },
            };

            const cellMatrix = new ObjectMatrix<Nullable<ICellData>>(cellValue);

            formulaDataModel.initSheetFormulaData(formulaData, unitId, sheetId, cellMatrix);

            expect(formulaData[unitId]?.[sheetId]).toEqual({
                5: {
                    4: {
                        f: '=E$4+$D6',
                        si: '0',
                    },
                    5: {
                        f: '=E$4+$D6',
                        si: '0',
                        x: 1,
                        y: 0,
                    },
                },
                8: {
                    5: {
                        f: '=E$4+$D6',
                        si: '0',
                        x: 1,
                        y: 3,
                    },
                },
            });
        });
    });
});

describe('formula dirty ranges', () => {
    const DIRTY_RANGE_WORKBOOK_DATA: IWorkbookData = {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {
                    0: { 0: { f: '=1' }, 2: { f: '=B1', si: 'shared' }, 4: { f: '=SEQUENCE(2)', ref: 'E1:E2' } },
                    1: { 0: { f: '=2', v: 2 }, 2: { si: 'shared' }, 3: { v: 5 } },
                    2: { 0: { f: '=3' }, 2: { si: 'shared', v: 0 } },
                    3: { 0: { f: '=4' }, 1: { f: '=A4', v: null }, 2: { si: 'shared' } },
                    4: { 2: { si: 'orphan' } },
                    5: { 2: { si: 'late' } },
                    6: { 2: { f: '=B7', si: 'late' } },
                },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {
                    5: { 1: { f: '=Sheet1!A1' } },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
    };

    function observe(model: FormulaDataModel) {
        return {
            dirtyRanges: model.getFormulaDirtyRanges(),
            arrayFormulaRange: model.getArrayFormulaRange(),
            arrayFormulaCellData: model.getArrayFormulaCellData(),
            sharedFormulas: [1, 2, 3].map((row) => model.getFormulaStringByCell(row, 2, 'sheet1', 'test')),
        };
    }

    it('reads cells directly and matches the formula data path of a customized model', () => {
        const standard = createCommandTestBed(Tools.deepClone(DIRTY_RANGE_WORKBOOK_DATA));
        const customized = createCommandTestBed(Tools.deepClone(DIRTY_RANGE_WORKBOOK_DATA));
        let formulaDataReads = 0;
        class CustomFormulaDataModel extends FormulaDataModel {
            override getFormulaData(): IFormulaData {
                formulaDataReads++;
                return super.getFormulaData();
            }
        }
        const customizedModel = customized.get(FormulaDataModel);
        Object.setPrototypeOf(customizedModel, CustomFormulaDataModel.prototype);
        try {
            const expected = observe(customizedModel);
            expect(formulaDataReads).toBe(1);
            const actual = observe(standard.get(FormulaDataModel));
            expect(actual).toEqual(expected);
            expect(actual.dirtyRanges).toEqual([
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } },
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 2, endRow: 3, startColumn: 0, endColumn: 0 } },
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 3, endRow: 3, startColumn: 1, endColumn: 1 } },
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 0, endRow: 1, startColumn: 2, endColumn: 2 } },
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 3, endRow: 3, startColumn: 2, endColumn: 2 } },
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 5, endRow: 6, startColumn: 2, endColumn: 2 } },
                { unitId: 'test', sheetId: 'sheet1', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 0, endRow: 0, startColumn: 4, endColumn: 4 } },
                { unitId: 'test', sheetId: 'sheet2', range: { rangeType: RANGE_TYPE.NORMAL, startRow: 5, endRow: 5, startColumn: 1, endColumn: 1 } },
            ]);
            expect(actual.arrayFormulaRange.test?.sheet1?.[0]?.[4]).toEqual(expect.objectContaining({ startRow: 0, endRow: 1, startColumn: 4, endColumn: 4 }));
            expect(actual.sharedFormulas).toEqual(['=B2', '=B3', '=B4']);
        } finally {
            Object.setPrototypeOf(customizedModel, FormulaDataModel.prototype);
            standard.univer.dispose();
            customized.univer.dispose();
        }
    });
});
