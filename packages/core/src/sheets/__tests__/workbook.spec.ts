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

import type { Univer } from '../../univer';
import type { IWorkbookData } from '../typedef';
import type { Workbook } from '../workbook';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BooleanNumber } from '../../types/enum';
import { createCoreTestBed } from './create-core-test-bed';

describe('Test workbook', () => {
    let univer: Univer;
    let workbook: Workbook;

    beforeEach(() => {
        const testBed = createCoreTestBed();
        univer = testBed.univer;
        workbook = testBed.sheet;
    });

    afterEach(() => univer.dispose());

    describe('Test workbook function', () => {
        it('function uniqueSheetName', () => {
            const newSheetName = workbook.uniqueSheetName('Sheet-002');
            expect(newSheetName).toBe('Sheet-002');

            workbook.addWorksheet('sheet2', 1, {
                id: 'sheet2',
                name: newSheetName,
            });

            const newSheetName2 = workbook.uniqueSheetName('Sheet-002');
            expect(newSheetName2).toBe('Sheet-0021');
        });

        it('function generateNewSheetName', () => {
            const newSheetName = workbook.generateNewSheetName('Sheet');
            expect(newSheetName).toBe('Sheet1');

            workbook.addWorksheet('sheet3', 1, {
                id: 'sheet3',
                name: newSheetName,
            });

            const newSheetName2 = workbook.generateNewSheetName('Sheet');
            expect(newSheetName2).toBe('Sheet2');
        });

        it('should save snapshot clone and update basic workbook metadata', () => {
            const saved = workbook.save();

            expect(saved).toEqual(workbook.getSnapshot());
            expect(saved).not.toBe(workbook.getSnapshot());
            expect(workbook.getName()).toBe('');

            workbook.setName('Renamed');
            workbook.setRev(5);
            workbook.incrementRev();
            workbook.setCustomMetadata({ owner: 'tester' } as never);

            expect(workbook.getSnapshot().name).toBe('Renamed');
            expect(workbook.getRev()).toBe(6);
            expect(workbook.getCustomMetadata()).toEqual({ owner: 'tester' });
            expect(workbook.getConfig()).toBe(workbook.getSnapshot());
        });

        it('should manage sheets and lookups', () => {
            expect(workbook.addWorksheet('sheet1', 1, { id: 'sheet1', name: 'Dup' })).toBe(false);
            expect(workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'Sheet-002' })).toBe(true);
            expect(workbook.getSheetOrders()).toEqual(['sheet1', 'sheet2']);
            expect(workbook.getSheetSize()).toBe(2);
            expect(workbook.getIndexBySheetId('sheet2')).toBe(1);
            expect(workbook.getSheetBySheetId('sheet2')?.getName()).toBe('Sheet-002');
            expect(workbook.getSheetBySheetName('Sheet-002')?.getSheetId()).toBe('sheet2');
            expect(workbook.getSheetByIndex(1)?.getSheetId()).toBe('sheet2');
            expect(workbook.getSheetsName()).toEqual(['Sheet-001', 'Sheet-002']);
            expect(workbook.getSheetIndex(workbook.getSheetBySheetId('sheet2')!)).toBe(1);
            expect(workbook.getSheets()).toHaveLength(2);

            expect(workbook.removeSheet('sheet2')).toBe(true);
            expect(workbook.removeSheet('sheet2')).toBe(false);
        });

        it('should ensure unique sheet order and preserve style changes', () => {
            workbook.getSnapshot().sheetOrder.push('sheet1', 'sheet1');
            workbook.ensureSheetOrderUnique();
            expect(workbook.getSheetOrders()).toEqual(['sheet1']);

            workbook.addStyles({ custom: { bg: { rgb: '#ffffff' } } });
            expect(workbook.getStyles().get('custom')).toEqual({ bg: { rgb: '#ffffff' } });
            workbook.removeStyles(['custom']);
            expect(workbook.getStyles().get('custom')).toBeUndefined();
        });

        it('should select active sheet and report hidden or visible sheets', () => {
            const customData: IWorkbookData = {
                id: 'book-hidden',
                appVersion: '3.0.0-alpha',
                name: 'Hidden Test',
                styles: {},
                sheetOrder: ['s1', 's2'],
                sheets: {
                    s1: { id: 's1', name: 'Hidden', hidden: BooleanNumber.TRUE },
                    s2: { id: 's2', name: 'Visible' },
                },
            } as IWorkbookData;

            const hiddenTestBed = createCoreTestBed(customData);
            const hiddenWorkbook = hiddenTestBed.sheet;

            expect(hiddenWorkbook.ensureActiveSheet().getSheetId()).toBe('s2');
            expect(hiddenWorkbook.getActiveSheet().getSheetId()).toBe('s2');
            expect(hiddenWorkbook.getActiveSheetIndex()).toBe(1);
            expect(hiddenWorkbook.getHiddenWorksheets()).toEqual(['s1']);
            expect(hiddenWorkbook.getUnhiddenWorksheets()).toEqual(['s2']);
            expect(hiddenWorkbook.checkSheetName('visible')).toBe(true);

            hiddenTestBed.univer.dispose();
        });

        it('should load external snapshot data directly', () => {
            const newConfig = {
                ...workbook.getSnapshot(),
                name: 'Loaded Workbook',
            };

            workbook.load(newConfig);

            expect(workbook.getSnapshot()).toBe(newConfig);
            expect(workbook.getSnapshot().name).toBe('Loaded Workbook');
        });
    });
});
