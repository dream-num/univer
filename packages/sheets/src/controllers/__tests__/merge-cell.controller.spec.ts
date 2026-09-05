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

import type { IRange, IWorkbookData, Univer, Workbook, Worksheet } from '@univerjs/core';
import {
    CellValueType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    ObjectMatrix,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { ClearSelectionAllCommand } from '../../commands/commands/clear-selection-all.command';
import { ClearSelectionFormatCommand } from '../../commands/commands/clear-selection-format.command';
import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../commands/mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { RefRangeService } from '../../services/ref-range/ref-range.service';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { MergeCellController } from '../merge-cell.controller';

const TARGET_RANGE: IRange = { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 };
const PEER_RANGE: IRange = { startRow: 5, endRow: 6, startColumn: 5, endColumn: 6 };

describe('MergeCellController clear-command ownership', () => {
    let univer: Univer;

    afterEach(() => univer.dispose());

    for (const command of [ClearSelectionFormatCommand, ClearSelectionAllCommand]) {
        for (const current of ['none', 'other-workbook', 'other-worksheet'] as const) {
            it(`${command.id} clears only the explicit target with ${current} current`, async () => {
                const testBed = createCommandTestBed(workbookSnapshot('test'), [[MergeCellController], [RefRangeService]]);
                univer = testBed.univer;
                const { get } = testBed;
                const instanceService = get(IUniverInstanceService);
                if (current === 'none') {
                    instanceService.disposeUnit('test');
                }
                const child = instanceService.createUnit<IWorkbookData, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    workbookSnapshot('child'),
                    { makeCurrent: false }
                );
                if (current === 'other-worksheet') {
                    instanceService.setCurrentUnitForType('child');
                }
                const selections = get(SheetsSelectionsService);
                if (current !== 'none') {
                    selections.setSelections(current === 'other-workbook' ? 'test' : 'child', 'sheet1', [{
                        range: PEER_RANGE,
                        primary: null,
                        style: null,
                    }]);
                }
                get(MergeCellController);
                const commandService = get(ICommandService);
                for (const registration of [command, AddWorksheetMergeMutation, RemoveWorksheetMergeMutation, SetRangeValuesMutation]) {
                    commandService.registerCommand(registration);
                }
                const target = child.getSheetBySheetId('sheet2')!;
                const otherSheet = child.getSheetBySheetId('sheet1')!;
                const before = sheetState(target);
                const peerBefore = Tools.deepClone(otherSheet.getSnapshot());
                const hostBefore = current === 'none' ? undefined : Tools.deepClone(testBed.sheet.getSnapshot());

                expect(await commandService.executeCommand(command.id, {
                    unitId: 'child',
                    subUnitId: 'sheet2',
                    ranges: [TARGET_RANGE],
                })).toBe(true);
                expect(target.getMergeData()).toEqual([PEER_RANGE]);
                expect(otherSheet.getSnapshot()).toEqual(peerBefore);
                if (hostBefore) {
                    expect(testBed.sheet.getSnapshot()).toEqual(hostBefore);
                }
                const cleared = sheetState(target);
                instanceService.focusUnit('child');
                expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
                expect(sheetState(target)).toEqual(before);
                expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
                expect(sheetState(target)).toEqual(cleared);
                expect(otherSheet.getSnapshot()).toEqual(peerBefore);
            });
        }
    }
});

function workbookSnapshot(id: string): IWorkbookData {
    return {
        id,
        name: id,
        appVersion: '0.0.0',
        locale: LocaleType.EN_US,
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
        sheets: Object.fromEntries(['sheet1', 'sheet2'].map((sheetId) => [sheetId, {
            id: sheetId,
            name: sheetId,
            rowCount: 10,
            columnCount: 10,
            mergeData: [Tools.deepClone(TARGET_RANGE), Tools.deepClone(PEER_RANGE)],
            cellData: {
                1: { 1: { v: 'target', t: CellValueType.STRING, s: { bl: 1 } } },
                5: { 5: { v: 'peer', t: CellValueType.STRING, s: { it: 1 } } },
            },
        }])),
    };
}

function sheetState(worksheet: Worksheet) {
    const snapshot = Tools.deepClone(worksheet.getSnapshot());
    // Undo may intern styles and append restored merges; compare their complete semantic state.
    new ObjectMatrix(snapshot.cellData).forValue((row, column, cell) => {
        if (cell?.s != null) {
            cell.s = Tools.deepClone(worksheet.getCellStyle(row, column));
        }
    });
    snapshot.mergeData.sort((left, right) => left.startRow - right.startRow || left.startColumn - right.startColumn);
    return snapshot;
}
