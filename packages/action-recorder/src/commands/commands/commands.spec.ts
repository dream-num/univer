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

import type { IDisposable } from '@univerjs/core';
import type { IMessageProps } from '@univerjs/design';
import {
    CommandService,
    CommandType,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LogLevel,
    toDisposable,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { ActionRecorderService } from '../../services/action-recorder.service';
import { ActionReplayService } from '../../services/replay.service';
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from './record.command';
import { ReplayLocalRecordCommand, ReplayLocalRecordOnActiveCommand, ReplayLocalRecordOnNamesakeCommand } from './replay.command';

const APPLY_CELL_VALUE_COMMAND_ID = 'action-recorder.command-test.apply-cell-value';

interface ITestFile {
    name: string;
    text(): Promise<string>;
}

interface IAppliedCommandParams {
    unitId?: string;
    subUnitId?: string;
    value?: string;
}

class TestState {
    static files: ITestFile[] = [];
    static downloads: Array<{ data: Blob; fileName: string }> = [];
    static messages: IMessageProps[] = [];
    static appliedParams: IAppliedCommandParams[] = [];

    static reset() {
        this.files = [];
        this.downloads = [];
        this.messages = [];
        this.appliedParams = [];
    }
}

class TestLocalFileService implements ILocalFileService {
    openFile(): Promise<File[]> {
        return Promise.resolve(TestState.files as File[]);
    }

    downloadFile(data: Blob, fileName: string): void {
        TestState.downloads.push({ data, fileName });
    }
}

class TestMessageService implements IMessageService {
    show(options: IMessageProps): IDisposable {
        TestState.messages.push(options);
        return toDisposable(() => {});
    }

    remove(): void {
        // no container in command tests
    }

    removeAll(): void {
        TestState.messages = [];
    }
}

class TestWorkbook {
    getUnitId() {
        return 'focused-workbook';
    }

    getSheetBySheetName(sheetName: string) {
        if (sheetName !== 'Recorded Sheet') {
            return null;
        }

        return { getSheetId: () => 'actual-sheet-id' };
    }

    getActiveSheet() {
        return { getSheetId: () => 'active-sheet-id' };
    }

    getSheetBySheetId(sheetId: string) {
        if (sheetId !== 'sheet-1') {
            return null;
        }

        return { getName: () => 'Recorded Sheet' };
    }
}

class TestUniverInstanceService {
    private readonly _workbook = new TestWorkbook();

    getFocusedUnit() {
        return this._workbook;
    }

    getUnit() {
        return this._workbook;
    }
}

function createCommandTestBed() {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILocalFileService, { useClass: TestLocalFileService }]);
    injector.add([IMessageService, { useClass: TestMessageService }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ActionRecorderService]);
    injector.add([ActionReplayService]);

    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(StartRecordingActionCommand);
    commandService.registerCommand(CompleteRecordingActionCommand);
    commandService.registerCommand(StopRecordingActionCommand);
    commandService.registerCommand(ReplayLocalRecordCommand);
    commandService.registerCommand(ReplayLocalRecordOnNamesakeCommand);
    commandService.registerCommand(ReplayLocalRecordOnActiveCommand);
    commandService.registerCommand({
        id: APPLY_CELL_VALUE_COMMAND_ID,
        type: CommandType.COMMAND,
        handler: (_accessor, params?: IAppliedCommandParams) => {
            TestState.appliedParams.push({ ...params });
            return true;
        },
    });

    return {
        commandService,
        recorderService: injector.get(ActionRecorderService),
    };
}

describe('action-recorder commands', () => {
    beforeEach(() => {
        TestState.reset();
    });

    it('records whitelisted user commands and exports them through the complete command', async () => {
        const { commandService, recorderService } = createCommandTestBed();
        const recordingStates: boolean[] = [];
        const commandIdsVisibleInPanel: string[][] = [];
        recorderService.recording$.subscribe((state) => recordingStates.push(state));
        recorderService.recordedCommands$.subscribe((commands) => {
            const ids: string[] = [];
            for (const command of commands) {
                ids.push(command.id);
            }
            commandIdsVisibleInPanel.push(ids);
        });
        recorderService.registerRecordedCommand({
            id: APPLY_CELL_VALUE_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: () => true,
        });

        await commandService.executeCommand(StartRecordingActionCommand.id, { replaceId: true });
        await commandService.executeCommand(APPLY_CELL_VALUE_COMMAND_ID, {
            unitId: 'focused-workbook',
            subUnitId: 'sheet-1',
            value: '42',
        });
        await commandService.executeCommand(CompleteRecordingActionCommand.id);

        expect(recordingStates.at(-1)).toBe(false);
        expect(commandIdsVisibleInPanel.at(-1)).toEqual([]);
        expect(TestState.downloads).toHaveLength(1);
        expect(TestState.downloads[0].fileName).toBe('recorded-commands.json');

        const exportedCommands = JSON.parse(await TestState.downloads[0].data.text());
        expect(exportedCommands).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                type: CommandType.COMMAND,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'Recorded Sheet',
                    value: '42',
                },
            },
        ]);
    });

    it('uses the same finalized export flow when the user stops recording', async () => {
        const { commandService, recorderService } = createCommandTestBed();

        await commandService.executeCommand(StartRecordingActionCommand.id);
        expect(recorderService.recording).toBe(true);

        await commandService.executeCommand(StopRecordingActionCommand.id);

        expect(recorderService.recording).toBe(false);
        expect(TestState.downloads).toHaveLength(1);
        expect(TestState.downloads[0].fileName).toBe('recorded-commands.json');
    });

    it('replays local records against the matching sheet name', async () => {
        const { commandService } = createCommandTestBed();
        TestState.files = [{
            name: 'recorded-commands.json',
            text: () => Promise.resolve(JSON.stringify([
                {
                    id: APPLY_CELL_VALUE_COMMAND_ID,
                    params: {
                        unitId: 'old-workbook',
                        subUnitId: 'Recorded Sheet',
                        value: 'from-file',
                    },
                },
            ])),
        }];

        const result = await commandService.executeCommand(ReplayLocalRecordOnNamesakeCommand.id);

        expect(result).toBe(true);
        expect(TestState.appliedParams).toEqual([{
            unitId: 'focused-workbook',
            subUnitId: 'actual-sheet-id',
            value: 'from-file',
        }]);
        expect(TestState.messages).toEqual([{
            type: MessageType.Success,
            content: 'Successfully replayed local records',
        }]);
    });

    it('replays local records against the active sheet when requested', async () => {
        const { commandService } = createCommandTestBed();
        TestState.files = [{
            name: 'recorded-commands.json',
            text: () => Promise.resolve(JSON.stringify([
                {
                    id: APPLY_CELL_VALUE_COMMAND_ID,
                    params: {
                        unitId: 'old-workbook',
                        subUnitId: 'any-recorded-sheet',
                        value: 'active-sheet-value',
                    },
                },
            ])),
        }];

        const result = await commandService.executeCommand(ReplayLocalRecordOnActiveCommand.id);

        expect(result).toBe(true);
        expect(TestState.appliedParams).toEqual([{
            unitId: 'focused-workbook',
            subUnitId: 'active-sheet-id',
            value: 'active-sheet-value',
        }]);
    });

    it('does not announce replay success when the user cancels local file selection', async () => {
        const { commandService } = createCommandTestBed();

        const result = await commandService.executeCommand(ReplayLocalRecordCommand.id);

        expect(result).toBe(false);
        expect(TestState.appliedParams).toEqual([]);
        expect(TestState.messages).toEqual([]);
    });
});
