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

import { ICommandService, RedoCommand, UndoCommand } from '@univerjs/core';
import { SetTabColorCommand, SetTabColorMutation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { ChangeColorSheetMenuItemFactory } from '../sheet.menu';

describe('sheet tab color menu', () => {
    it('reads current tab colors and resets through the undoable tab color command', async () => {
        const testBed = createCommandTestBed();
        const commandService = testBed.get(ICommandService);
        [SetTabColorCommand, SetTabColorMutation].forEach((command) => commandService.registerCommand(command));
        const menu = ChangeColorSheetMenuItemFactory(testBed.univer.__getInjector());
        if (!Array.isArray(menu.selections)) throw new Error('Missing color selections');
        const reset = menu.selections.find((option) => option.value === '');
        const picker = menu.selections.find((option) => option.value$);
        expect(reset).toBeDefined();
        expect(picker?.value$).toBeDefined();
        const colors: string[] = [];
        const subscription = picker!.value$!.subscribe((color) => colors.push(color));
        try {
            expect(colors.at(-1)).toBe('');
            await commandService.executeCommand(SetTabColorCommand.id, { value: '#3f83f8' });
            expect(colors.at(-1)).toBe('#3f83f8');
            expect(await firstValueFrom(picker!.value$!)).toBe('#3f83f8');
            await commandService.executeCommand(menu.id, { value: reset!.value });
            expect(testBed.sheet.getActiveSheet().getTabColor()).toBe('');
            expect(colors.at(-1)).toBe('');
            await commandService.executeCommand(UndoCommand.id);
            expect(colors.at(-1)).toBe('#3f83f8');
            await commandService.executeCommand(RedoCommand.id);
            expect(colors.at(-1)).toBe('');
            subscription.unsubscribe();
            await commandService.executeCommand(SetTabColorCommand.id, { value: '#ffffff' });
            expect(colors.at(-1)).toBe('');
        } finally {
            subscription.unsubscribe();
            testBed.univer.dispose();
        }
    });

    it('follows the active tab when switching sheets', () => {
        const testBed = createCommandTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetWorksheetActiveOperation);
        const sheet = testBed.sheet;
        sheet.addWorksheet('sheet2', sheet.getSheets().length, { id: 'sheet2', name: 'Second', tabColor: '#f05252' });
        const menu = ChangeColorSheetMenuItemFactory(testBed.univer.__getInjector());
        if (!Array.isArray(menu.selections)) throw new Error('Missing color selections');
        const picker = menu.selections.find((option) => option.value$)!;
        const colors: string[] = [];
        const subscription = picker.value$!.subscribe((color) => colors.push(color));
        try {
            commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: sheet.getUnitId(), subUnitId: 'sheet2' });
            expect(colors.at(-1)).toBe('#f05252');
        } finally {
            subscription.unsubscribe();
            testBed.univer.dispose();
        }
    });
});
