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

import { ICommandService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { ClearSelectionContentCommand, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { AddHyperLinkMutation } from '../../commands/mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../../commands/mutations/remove-hyper-link.mutation';
import { HyperLinkModel } from '../../models/hyper-link.model';
import { SheetHyperLinkSetRangeController } from '../set-range.controller';

describe('SheetHyperLinkSetRangeController', () => {
    it('clears only hyperlinks in resolved content ranges through redo and undo', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([HyperLinkModel]);
        injector.add([SheetsSelectionsService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetHyperLinkSetRangeController]);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'test',
            locale: LocaleType.EN_US,
            sheetOrder: ['sheet1'],
            sheets: { sheet1: { id: 'sheet1', name: 'Sheet1', cellData: {} } },
        });
        try {
            const commands = injector.get(ICommandService);
            commands.registerCommand(AddHyperLinkMutation);
            commands.registerCommand(RemoveHyperLinkMutation);
            const model = injector.get(HyperLinkModel);
            injector.get(SheetHyperLinkSetRangeController);
            injector.get(SheetsSelectionsService).addSelections([{
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
                primary: null,
                style: null,
            }]);
            ['A', 'B', 'C'].forEach((id, row) => model.addHyperLink('test', 'sheet1', {
                id,
                row,
                column: 0,
                display: id,
                payload: `https://example.com/${id}`,
            }));
            const mutations = injector.get(SheetInterceptorService).onCommandExecute({
                id: ClearSelectionContentCommand.id,
                params: {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    ranges: [0, 2].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 0 })),
                },
            });
            const links = () => [0, 1, 2].map((row) => model.getHyperLinkByLocation('test', 'sheet1', row, 0)?.id);
            mutations.redos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
            expect(links()).toEqual([undefined, 'B', undefined]);
            mutations.undos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
            expect(links()).toEqual(['A', 'B', 'C']);
            mutations.redos.forEach(({ id, params }) => commands.syncExecuteCommand(id, params));
            expect(links()).toEqual([undefined, 'B', undefined]);
        } finally {
            univer.dispose();
        }
    });
});
