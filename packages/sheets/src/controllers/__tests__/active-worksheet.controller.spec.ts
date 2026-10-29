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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    LocaleType,
    mergeWorksheetSnapshotWithDefault,
    SheetTypes,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { describe, expect, it, onTestFinished } from 'vitest';
import { InsertSheetMutation } from '../../commands/mutations/insert-sheet.mutation';
import { SetWorksheetOrderMutation } from '../../commands/mutations/set-worksheet-order.mutation';
import { SetWorksheetActiveOperation } from '../../commands/operations/set-worksheet-active.operation';
import { UniverSheetsPlugin } from '../../plugin';
import { ActiveWorksheetController } from '../active-worksheet.controller';

function createRuntime() {
    const univer = new Univer();
    onTestFinished(() => univer.dispose());
    univer.registerPlugin(UniverSheetsPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        name: 'Workbook',
        styles: {},
        sheetOrder: ['data'],
        sheets: { data: { id: 'data', name: 'Data', cellData: {} } },
    });
    const injector = univer.__getInjector();
    injector.get(ActiveWorksheetController);
    return { workbook, commands: injector.get(ICommandService) };
}

describe('ActiveWorksheetController insert activation', () => {
    it.each([SheetTypes.GRID, SheetTypes.CHART])('activates a locally inserted sheet of type %s with the existing insert payload', (type) => {
        const { workbook, commands } = createRuntime();
        expect(commands.syncExecuteCommand(InsertSheetMutation.id, {
            unitId: 'unit',
            index: 0,
            sheet: mergeWorksheetSnapshotWithDefault({ id: 'inserted', name: 'Inserted', type }),
        })).toBe(true);
        expect(workbook.getActiveSheet()?.getSheetId()).toBe('inserted');
    });

    it('retains the local active sheet when replaying a remote insert', () => {
        const { workbook, commands } = createRuntime();
        expect(commands.syncExecuteCommand(InsertSheetMutation.id, {
            unitId: 'unit',
            index: 0,
            sheet: mergeWorksheetSnapshotWithDefault({ id: 'remote', name: 'Remote' }),
        }, { fromCollab: true })).toBe(true);
        expect(workbook.getActiveSheet()?.getSheetId()).toBe('data');
    });
});

describe('ActiveWorksheetController model lifecycle', () => {
    it('selects the previous surviving sheet when an atomic model write removes the active Chart Sheet', () => {
        const { workbook, commands } = createRuntime();
        workbook.addWorksheet('host', 1, mergeWorksheetSnapshotWithDefault({ id: 'host', name: 'Charts', type: SheetTypes.CHART }));
        workbook.addWorksheet('tail', 2, mergeWorksheetSnapshotWithDefault({ id: 'tail', name: 'Tail' }));
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'unit', subUnitId: 'host' });
        expect(workbook.removeSheet('host')).toBe(true);
        expect(workbook.getActiveSheet()?.getSheetId()).toBe('data');
        expect(workbook.getActiveSheetIndex()).toBe(0);
    });

    it('retains the local active sheet when another sheet is removed by the model owner', () => {
        const { workbook } = createRuntime();
        workbook.addWorksheet('host', 1, mergeWorksheetSnapshotWithDefault({ id: 'host', name: 'Charts', type: SheetTypes.CHART }));
        expect(workbook.removeSheet('host')).toBe(true);
        expect(workbook.getActiveSheet()?.getSheetId()).toBe('data');
    });

    it('selects the previous survivor using the current order after a peer reordered other sheets', () => {
        const { workbook, commands } = createRuntime();
        workbook.addWorksheet('host', 1, mergeWorksheetSnapshotWithDefault({ id: 'host', name: 'Charts', type: SheetTypes.CHART }));
        workbook.addWorksheet('tail', 2, mergeWorksheetSnapshotWithDefault({ id: 'tail', name: 'Tail' }));
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'unit', subUnitId: 'host' });
        commands.syncExecuteCommand(SetWorksheetOrderMutation.id, { unitId: 'unit', subUnitId: 'tail', fromOrder: 2, toOrder: 0 });
        expect(workbook.removeSheet('host')).toBe(true);
        expect(workbook.getActiveSheet()?.getSheetId()).toBe('data');
        expect(workbook.getActiveSheetIndex()).toBe(1);
    });
});
