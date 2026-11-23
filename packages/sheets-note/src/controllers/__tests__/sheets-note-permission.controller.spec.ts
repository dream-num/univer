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

import {
    ICommandService,
    IPermissionService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SheetPermissionCheckController, WorksheetEditPermission } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    SheetDeleteNoteCommand,
    SheetToggleNotePopupCommand,
    SheetUpdateNoteCommand,
} from '../../commands/commands/note.command';
import enUS from '../../locale/en-US';
import { SheetsNoteModel } from '../../models/sheets-note.model';
import { UniverSheetsNotePlugin } from '../../plugin';
import { SheetsNotePermissionController } from '../sheets-note-permission.controller';
import '@univerjs/sheets/facade';

describe('SheetsNotePermissionController', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        univer.registerPlugin(UniverSheetsNotePlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'book',
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet' } },
        });
        univer.__getInjector().get(LocaleService).setDirection('ltr');
    });

    afterEach(() => univer.dispose());

    it('protects note contents at their cell while allowing edits to a neighboring cell', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetsNotePermissionController);
        const api = FUniver.newAPI(injector);
        const worksheet = api.getActiveWorkbook()!.getActiveSheet();
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetsNoteModel);
        const location = { unitId: 'book', sheetId: 'sheet', row: 1, col: 1 };
        const note = { id: 'original', row: 1, col: 1, note: 'Original', width: 160, height: 72 };
        expect(await commands.executeCommand(SheetUpdateNoteCommand.id, { ...location, note })).toBe(true);
        const protectedCell = worksheet.getRange('B2');
        const rule = await protectedCell.getRangePermission().protect({ name: 'Review' });
        await rule.setPoint(api.Enum.RangePermissionPoint.Edit, false);
        const messages: string[] = [];
        const subscription = injector.get(SheetPermissionCheckController).triggerPermissionUIEvent$.subscribe((message) => messages.push(message));
        try {
            const changedNote = { ...note, note: 'Revised' };
            expect(await commands.executeCommand(SheetUpdateNoteCommand.id, { ...location, note: changedNote })).toBe(false);
            expect(messages).toContain(enUS['sheets-note'].permission.editErr);
            expect(await commands.executeCommand(SheetDeleteNoteCommand.id, location)).toBe(false);
            protectedCell.activate();
            expect(await commands.executeCommand(SheetDeleteNoteCommand.id)).toBe(false);
            expect(await commands.executeCommand(SheetUpdateNoteCommand.id, { ...location, row: 2, note: changedNote })).toBe(false);
            expect(model.getNote('book', 'sheet', { row: 1, col: 1 })?.note).toBe('Original');
            expect(await commands.executeCommand(SheetUpdateNoteCommand.id, {
                ...location,
                row: 2,
                note: { ...changedNote, id: 'neighbor', row: 2 },
            })).toBe(true);
            expect(model.getNote('book', 'sheet', { row: 2, col: 1 })?.note).toBe('Revised');
            expect(await commands.executeCommand(SheetToggleNotePopupCommand.id)).toBe(true);
        } finally {
            subscription.unsubscribe();
        }
    });

    it('blocks toggling a note when worksheet editing is disabled', async () => {
        const injector = univer.__getInjector();
        injector.get(SheetsNotePermissionController);
        const commands = injector.get(ICommandService);
        const note = { id: 'visible', row: 0, col: 0, note: 'Original', width: 160, height: 72, show: true };
        expect(await commands.executeCommand(SheetUpdateNoteCommand.id, { unitId: 'book', sheetId: 'sheet', row: 0, col: 0, note })).toBe(true);
        const api = FUniver.newAPI(injector);
        api.getActiveWorkbook()!.getActiveSheet().getRange('A1').activate();
        const permission = injector.get(IPermissionService);
        const edit = new WorksheetEditPermission('book', 'sheet');
        permission.addPermissionPoint(edit);
        permission.updatePermissionPoint(edit.id, false);
        expect(await commands.executeCommand(SheetToggleNotePopupCommand.id)).toBe(false);
        expect(injector.get(SheetsNoteModel).getNote('book', 'sheet', { noteId: 'visible' })?.show).toBe(true);
    });
});
