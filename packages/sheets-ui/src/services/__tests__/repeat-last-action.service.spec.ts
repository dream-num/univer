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

import type { IRange } from '@univerjs/core';
import { ICommandService, Injector, LocaleService } from '@univerjs/core';
import {
    AddWorksheetMergeCommand,
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveWorksheetMergeCommand,
    SetBorderCommand,
    SetColWidthCommand,
    SetRowHeightCommand,
    SetStyleCommand,
    SheetPermissionCheckController,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { RepeatLastActionCommand } from '../../commands/commands/repeat-last-action.command';
import { IRepeatLastActionService, RepeatLastActionPermission, RepeatLastActionService } from '../repeat-last-action.service';

const FIRST_RANGE: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 };
const LAST_RANGE: IRange = { startRow: 4, endRow: 6, startColumn: 2, endColumn: 3 };
const SELECTIONS = [FIRST_RANGE, LAST_RANGE];

class RecordingCommandService {
    readonly executions: Array<{ id: string; params?: unknown }> = [];
    onExecute?: () => void;
    failNext = false;

    async executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.executions.push({ id, params });
        this.onExecute?.();

        if (this.failNext) {
            this.failNext = false;
            throw new Error('command failed');
        }

        return true;
    }
}

class CommandSelectionsService {
    selections: Array<{ range: IRange }> | null = SELECTIONS.map((range) => ({ range }));

    getCurrentSelections() {
        return this.selections;
    }
}

class CommandRepeatLastActionService {
    permission: RepeatLastActionPermission | RepeatLastActionPermission[] = RepeatLastActionPermission.None;
    readonly repeatedSelections: IRange[][] = [];
    result = true;

    getActionPermission() {
        return this.permission;
    }

    async runWithoutRecording(selections: IRange[]) {
        this.repeatedSelections.push(selections);
        return this.result;
    }
}

class CommandPermissionCheckController {
    permissions: boolean[] = [true];
    readonly checks: unknown[] = [];
    readonly blockedMessages: string[] = [];

    permissionCheckWithRanges(permissionTypes: unknown) {
        this.checks.push(permissionTypes);
        return this.permissions.shift() ?? true;
    }

    blockExecuteWithoutPermission(message: string) {
        this.blockedMessages.push(message);
    }
}

class CommandLocaleService {
    t(key: string) {
        return `translated:${key}`;
    }
}

function addUseClass(injector: Injector, token: unknown, useClass: unknown) {
    injector.add([token, { useClass }] as any);
}

function createRepeatCommandInjector(): Injector {
    const injector = new Injector();
    addUseClass(injector, SheetsSelectionsService, CommandSelectionsService);
    addUseClass(injector, IRepeatLastActionService, CommandRepeatLastActionService);
    addUseClass(injector, SheetPermissionCheckController, CommandPermissionCheckController);
    addUseClass(injector, LocaleService, CommandLocaleService);
    return injector;
}

describe('RepeatLastActionService', () => {
    let service: IRepeatLastActionService;
    let commandService: RecordingCommandService;

    beforeEach(() => {
        const injector = new Injector();
        addUseClass(injector, ICommandService, RecordingCommandService);
        injector.add([IRepeatLastActionService, { useClass: RepeatLastActionService }]);
        service = injector.get(IRepeatLastActionService);
        commandService = injector.get(ICommandService) as unknown as RecordingCommandService;
    });

    it('records repeatable commands with the permission type needed by the current selection', () => {
        const disposable = service.registerRepeatableCommand(
            'sheet.command.fill-series',
            () => ({ direction: 'down' }),
            RepeatLastActionPermission.CellValue
        );

        service.setAction({ id: 'sheet.command.fill-series' });

        expect(service.getRepeatableCommands().has('sheet.command.fill-series')).toBe(true);
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.CellValue);

        disposable.dispose();
        expect(service.getRepeatableCommands().has('sheet.command.fill-series')).toBe(false);
        service.setAction({ id: 'sheet.command.fill-series' });
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.None);
    });

    it('maps built-in repeatable commands to the permissions they need', () => {
        service.setAction({ id: SetStyleCommand.id });
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.CellStyle);

        service.setAction({ id: SetRowHeightCommand.id });
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.RowStyle);

        service.setAction({ id: SetColWidthCommand.id });
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.ColumnStyle);

        service.setAction({ id: ClearSelectionAllCommand.id });
        expect(service.getActionPermission()).toEqual([
            RepeatLastActionPermission.CellStyle,
            RepeatLastActionPermission.CellValue,
        ]);

        service.setAction({ id: 'sheet.command.not-repeatable' });
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.None);
    });

    it('replays commands with the current selection shape expected by each command family', async () => {
        service.setAction({ id: SetStyleCommand.id, params: { style: { bl: 1 }, range: FIRST_RANGE } });
        await expect(service.runWithoutRecording(SELECTIONS)).resolves.toBe(true);
        expect(commandService.executions.at(-1)).toEqual({
            id: SetStyleCommand.id,
            params: { style: { bl: 1 }, range: LAST_RANGE },
        });

        service.setAction({ id: AddWorksheetMergeCommand.id, params: { type: 1 } });
        await service.runWithoutRecording(SELECTIONS);
        expect(commandService.executions.at(-1)).toEqual({
            id: AddWorksheetMergeCommand.id,
            params: { type: 1, selections: SELECTIONS },
        });

        for (const [sourceCommand, replayCommand] of [
            [InsertRowCommand.id, InsertRangeMoveDownCommand.id],
            [InsertColCommand.id, InsertRangeMoveRightCommand.id],
            [RemoveRowCommand.id, DeleteRangeMoveUpCommand.id],
            [RemoveColCommand.id, DeleteRangeMoveLeftCommand.id],
        ]) {
            service.setAction({ id: sourceCommand });
            await service.runWithoutRecording(SELECTIONS);
            expect(commandService.executions.at(-1)).toEqual({
                id: replayCommand,
                params: { range: LAST_RANGE },
            });
        }

        for (const commandId of [
            SetBorderCommand.id,
            SetRowHeightCommand.id,
            SetColWidthCommand.id,
            ClearSelectionContentCommand.id,
            ClearSelectionFormatCommand.id,
            ClearSelectionAllCommand.id,
            RemoveWorksheetMergeCommand.id,
        ]) {
            service.setAction({ id: commandId, params: { unitId: 'unit-1' } });
            await service.runWithoutRecording(SELECTIONS);
            expect(commandService.executions.at(-1)).toEqual({
                id: commandId,
                params: { unitId: 'unit-1', ranges: SELECTIONS },
            });
        }
    });

    it('uses registered command handlers and falls back to original params for custom replay', async () => {
        const customParams = { fillType: 'series' };
        service.registerRepeatableCommand(
            'sheet.command.fill-series',
            (selections, params) => ({ ...params, anchor: selections.at(-1) }),
            RepeatLastActionPermission.CellValue
        );

        service.setAction({ id: 'sheet.command.fill-series', params: customParams });
        await service.runWithoutRecording(SELECTIONS);
        expect(commandService.executions.at(-1)).toEqual({
            id: 'sheet.command.fill-series',
            params: { fillType: 'series', anchor: LAST_RANGE },
        });

        service.setAction({ id: 'sheet.command.other', params: { keep: true } });
        await service.runWithoutRecording(SELECTIONS);
        expect(commandService.executions.at(-1)).toEqual({
            id: 'sheet.command.other',
            params: { keep: true },
        });
    });

    it('does not record nested actions while a repeat is running', async () => {
        service.setAction({ id: SetStyleCommand.id, params: { style: { it: 1 } } });
        commandService.onExecute = () => service.setAction({ id: SetBorderCommand.id });

        await service.runWithoutRecording(SELECTIONS);

        expect(service.getAction()).toEqual({ id: SetStyleCommand.id, params: { style: { it: 1 } } });
    });

    it('stops recording depth after failed replay and can repeat again', async () => {
        service.setAction({ id: SetStyleCommand.id, params: { style: { ul: { s: 1 } } } });
        commandService.failNext = true;

        await expect(service.runWithoutRecording(SELECTIONS)).rejects.toThrow('command failed');

        service.setAction({ id: SetBorderCommand.id, params: { unitId: 'unit-1' } });
        await expect(service.runWithoutRecording(SELECTIONS)).resolves.toBe(true);
        expect(commandService.executions.at(-1)).toEqual({
            id: SetBorderCommand.id,
            params: { unitId: 'unit-1', ranges: SELECTIONS },
        });
    });

    it('returns false when there is no action to replay', async () => {
        await expect(service.runWithoutRecording(SELECTIONS)).resolves.toBe(false);
        expect(commandService.executions).toEqual([]);
    });
});

describe('RepeatLastActionCommand', () => {
    it('does not repeat when the sheet has no current selection', async () => {
        const injector = createRepeatCommandInjector();
        (injector.get(SheetsSelectionsService) as unknown as CommandSelectionsService).selections = [];

        await expect(RepeatLastActionCommand.handler(injector)).resolves.toBe(false);
        expect((injector.get(IRepeatLastActionService) as unknown as CommandRepeatLastActionService).repeatedSelections).toEqual([]);
    });

    it('repeats the last action without permission checks for actions that do not need them', async () => {
        const injector = createRepeatCommandInjector();
        const repeatService = injector.get(IRepeatLastActionService) as unknown as CommandRepeatLastActionService;

        await expect(RepeatLastActionCommand.handler(injector)).resolves.toBe(true);

        expect(repeatService.repeatedSelections).toEqual([SELECTIONS]);
        expect((injector.get(SheetPermissionCheckController) as unknown as CommandPermissionCheckController).checks).toEqual([]);
    });

    it('blocks a single-permission repeat when the current range cannot be edited', async () => {
        const injector = createRepeatCommandInjector();
        const repeatService = injector.get(IRepeatLastActionService) as unknown as CommandRepeatLastActionService;
        const permissionController = injector.get(SheetPermissionCheckController) as unknown as CommandPermissionCheckController;
        repeatService.permission = RepeatLastActionPermission.CellStyle;
        permissionController.permissions = [false];

        await expect(RepeatLastActionCommand.handler(injector)).resolves.toBe(false);

        expect(repeatService.repeatedSelections).toEqual([]);
        expect(permissionController.blockedMessages).toEqual(['translated:sheets-ui.permission.dialog.setStyleErr']);
    });

    it('checks every required permission and stops at the first failed range rule', async () => {
        const injector = createRepeatCommandInjector();
        const repeatService = injector.get(IRepeatLastActionService) as unknown as CommandRepeatLastActionService;
        const permissionController = injector.get(SheetPermissionCheckController) as unknown as CommandPermissionCheckController;
        repeatService.permission = [
            RepeatLastActionPermission.None,
            RepeatLastActionPermission.CellStyle,
            RepeatLastActionPermission.CellValue,
        ];
        permissionController.permissions = [true, false];

        await expect(RepeatLastActionCommand.handler(injector)).resolves.toBe(false);

        expect(permissionController.checks.length).toBe(2);
        expect(permissionController.blockedMessages).toEqual(['translated:sheets-ui.permission.dialog.editErr']);
        expect(repeatService.repeatedSelections).toEqual([]);
    });

    it('returns the replay result after all required permissions pass', async () => {
        const injector = createRepeatCommandInjector();
        const repeatService = injector.get(IRepeatLastActionService) as unknown as CommandRepeatLastActionService;
        repeatService.permission = RepeatLastActionPermission.Editable;
        repeatService.result = false;

        await expect(RepeatLastActionCommand.handler(injector)).resolves.toBe(false);
        expect(repeatService.repeatedSelections).toEqual([SELECTIONS]);
    });
});
