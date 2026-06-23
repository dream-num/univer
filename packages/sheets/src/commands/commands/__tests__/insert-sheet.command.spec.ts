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

import type { Injector, Univer, Workbook } from '@univerjs/core';
import type { LocaleKey } from '../../../locale/types';
import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InsertSheetMutation } from '../../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../../mutations/remove-sheet.mutation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { InsertSheetCommand } from '../insert-sheet.command';
import { SetWorksheetActivateCommand } from '../set-worksheet-activate.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test insert worksheet commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActivateCommand);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(RemoveSheetMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('insert sheet', () => {
        it('should auto-generate incremental names when name is not provided', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const localeService = get(LocaleService);
            const sheetPrefix = localeService.t<LocaleKey>('sheets.tabs.sheet');
            expect(workbook.getSheetSize()).toBe(1);

            await commandService.executeCommand(InsertSheetCommand.id, {
                unitId: 'test',
                sheet: { rowCount: 10, columnCount: 10 },
            });
            expect(workbook.getSheetSize()).toBe(2);
            const sheet2 = workbook.getSheets()[1];
            expect(sheet2.getName()).toBe(`${sheetPrefix}1`);

            await commandService.executeCommand(InsertSheetCommand.id, {
                unitId: 'test',
                sheet: { rowCount: 10, columnCount: 10 },
            });
            expect(workbook.getSheetSize()).toBe(3);
            const sheet3 = workbook.getSheets()[2];
            expect(sheet3.getName()).toBe(`${sheetPrefix}2`);
        });

        it('should use provided name directly when it is unique', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

            await commandService.executeCommand(InsertSheetCommand.id, {
                unitId: 'test',
                sheet: { name: 'MySheet', rowCount: 10, columnCount: 10 },
            });

            const newSheet = workbook.getSheets()[1];
            expect(newSheet.getName()).toBe('MySheet');
        });

        it('should deduplicate name when provided name already exists', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

            await commandService.executeCommand(InsertSheetCommand.id, {
                unitId: 'test',
                sheet: { name: 'sheet1', rowCount: 10, columnCount: 10 },
            });

            const newSheet = workbook.getSheets()[1];
            expect(newSheet.getName()).not.toBe('sheet1');
        });

        it('should not be affected by mergeWorksheetSnapshotWithDefault default name', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const initialSize = workbook.getSheetSize();

            await commandService.executeCommand(InsertSheetCommand.id, {
                unitId: 'test',
                sheet: { rowCount: 10, columnCount: 10 },
            });
            const firstNewSheet = workbook.getSheets()[initialSize];

            await commandService.executeCommand(InsertSheetCommand.id, {
                unitId: 'test',
                sheet: { rowCount: 10, columnCount: 10 },
            });
            const secondNewSheet = workbook.getSheets()[initialSize + 1];

            expect(firstNewSheet.getName()).not.toBe(secondNewSheet.getName());
        });
    });
});
