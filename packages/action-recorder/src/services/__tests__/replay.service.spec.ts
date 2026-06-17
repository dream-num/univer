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

import type { ICommandInfo } from '@univerjs/core';
import {
    CommandService,
    CommandType,
    ConfigService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    ILogService,
    Injector,
    IUniverInstanceService,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionReplayService, ReplayMode } from '../replay.service';

const APPLY_CELL_VALUE_COMMAND_ID = 'action-recorder.test.apply-cell-value';
const STOP_REPLAY_COMMAND_ID = 'action-recorder.test.stop-replay';

interface IAppliedCommand {
    id: string;
    params?: {
        unitId?: string;
        subUnitId?: string;
        value?: string;
    };
}

interface ITestFile {
    name: string;
    text(): Promise<string>;
}

class TestReplayState {
    static appliedCommands: IAppliedCommand[] = [];

    static reset() {
        this.appliedCommands = [];
    }
}

class TestLocalFileService {
    static files: ITestFile[] = [];

    static reset() {
        this.files = [];
    }

    openFile() {
        return Promise.resolve(TestLocalFileService.files);
    }
}

class TestMessageService {
    static messages: Array<{ type: MessageType; content: string }> = [];

    static reset() {
        this.messages = [];
    }

    show(message: { type: MessageType; content: string }) {
        TestMessageService.messages.push(message);
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
}

class TestUniverInstanceService {
    private readonly _workbook = new TestWorkbook();

    getFocusedUnit() {
        return this._workbook;
    }
}

class TestUniverInstanceServiceWithoutFocusedUnit {
    getFocusedUnit() {
        return null;
    }
}

function cloneCommandParams(params?: IAppliedCommand['params']) {
    if (!params) {
        return undefined;
    }

    return { ...params };
}

function createJsonFile(name: string, commands: ICommandInfo[]): ITestFile {
    return {
        name,
        text: () => Promise.resolve(JSON.stringify(commands)),
    };
}

function createInvalidJsonFile(name: string): ITestFile {
    return {
        name,
        text: () => Promise.resolve('{ invalid json'),
    };
}

function createReplayTestBed(instanceService: typeof TestUniverInstanceService | typeof TestUniverInstanceServiceWithoutFocusedUnit = TestUniverInstanceService) {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IMessageService, { useClass: TestMessageService as never }]);
    injector.add([ILocalFileService, { useClass: TestLocalFileService as never }]);
    injector.add([IUniverInstanceService, { useClass: instanceService as never }]);
    injector.add([ActionReplayService]);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand({
        id: APPLY_CELL_VALUE_COMMAND_ID,
        type: CommandType.COMMAND,
        handler: (_accessor, params?: IAppliedCommand['params']) => {
            TestReplayState.appliedCommands.push({
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: cloneCommandParams(params),
            });
            return true;
        },
    });
    commandService.registerCommand({
        id: STOP_REPLAY_COMMAND_ID,
        type: CommandType.COMMAND,
        handler: (_accessor, params?: IAppliedCommand['params']) => {
            TestReplayState.appliedCommands.push({
                id: STOP_REPLAY_COMMAND_ID,
                params: cloneCommandParams(params),
            });
            return false;
        },
    });

    return {
        commandService,
        replayService: injector.get(ActionReplayService),
    };
}

describe('ActionReplayService', () => {
    beforeEach(() => {
        TestReplayState.reset();
        TestLocalFileService.reset();
        TestMessageService.reset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('replays recorded sheet actions into the focused workbook and resolves recorded sheet names', async () => {
        const { replayService } = createReplayTestBed();

        const result = await replayService.replayCommands(
            [
                {
                    id: APPLY_CELL_VALUE_COMMAND_ID,
                    params: {
                        unitId: 'recorded-workbook',
                        subUnitId: 'Recorded Sheet',
                        value: 'replayed by sheet name',
                    },
                },
            ],
            { mode: ReplayMode.NAME }
        );

        expect(result).toBe(true);
        expect(TestReplayState.appliedCommands).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'actual-sheet-id',
                    value: 'replayed by sheet name',
                },
            },
        ]);
    });

    it('can replay recorded actions into the active sheet instead of the recorded sheet', async () => {
        const { replayService } = createReplayTestBed();

        const result = await replayService.replayCommands(
            [
                {
                    id: APPLY_CELL_VALUE_COMMAND_ID,
                    params: {
                        unitId: 'recorded-workbook',
                        subUnitId: 'recorded-sheet-id',
                        value: 'replayed into active sheet',
                    },
                },
            ],
            { mode: ReplayMode.ACTIVE }
        );

        expect(result).toBe(true);
        expect(TestReplayState.appliedCommands).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'active-sheet-id',
                    value: 'replayed into active sheet',
                },
            },
        ]);
    });

    it('stops replaying after a command reports failure', async () => {
        const { replayService } = createReplayTestBed();

        const result = await replayService.replayCommands([
            {
                id: STOP_REPLAY_COMMAND_ID,
                params: {
                    unitId: 'recorded-workbook',
                    subUnitId: 'recorded-sheet-id',
                    value: 'cannot apply',
                },
            },
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    unitId: 'recorded-workbook',
                    subUnitId: 'recorded-sheet-id',
                    value: 'must not be applied',
                },
            },
        ]);

        expect(result).toBe(false);
        expect(TestReplayState.appliedCommands).toEqual([
            {
                id: STOP_REPLAY_COMMAND_ID,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'recorded-sheet-id',
                    value: 'cannot apply',
                },
            },
        ]);
    });

    it('loads a local JSON recording and replays it against the focused workbook', async () => {
        const { replayService } = createReplayTestBed();
        TestLocalFileService.files = [
            createJsonFile('recording.json', [
                {
                    id: APPLY_CELL_VALUE_COMMAND_ID,
                    params: {
                        unitId: 'recorded-workbook',
                        subUnitId: 'Recorded Sheet',
                        value: 'loaded from json',
                    },
                },
            ]),
        ];

        const result = await replayService.replayLocalJSON(ReplayMode.NAME);

        expect(result).toBe(true);
        expect(TestReplayState.appliedCommands).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'actual-sheet-id',
                    value: 'loaded from json',
                },
            },
        ]);
    });

    it('does not replay anything when the local recording cannot be parsed', async () => {
        const { replayService } = createReplayTestBed();
        TestLocalFileService.files = [createInvalidJsonFile('broken-recording.json')];

        const result = await replayService.replayLocalJSON();

        expect(result).toBe(false);
        expect(TestReplayState.appliedCommands).toEqual([]);
        expect(TestMessageService.messages).toEqual([
            {
                type: MessageType.Error,
                content: 'Failed to replay commands from local file broken-recording.json.',
            },
        ]);
    });

    it('does not replay anything when the user cancels local recording selection', async () => {
        const { replayService } = createReplayTestBed();
        TestLocalFileService.files = [];

        const result = await replayService.replayLocalJSON();

        expect(result).toBe(false);
        expect(TestReplayState.appliedCommands).toEqual([]);
        expect(TestMessageService.messages).toEqual([]);
    });

    it('delays command execution while still targeting the focused workbook', async () => {
        vi.useFakeTimers();
        const { replayService } = createReplayTestBed();

        const result = replayService.replayCommandsWithDelay([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    unitId: 'recorded-workbook',
                    subUnitId: 'recorded-sheet-id',
                    value: 'delayed replay',
                },
            },
        ]);

        expect(TestReplayState.appliedCommands).toEqual([]);

        await vi.advanceTimersByTimeAsync(1000);

        await expect(result).resolves.toBe(true);
        expect(TestReplayState.appliedCommands).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'recorded-sheet-id',
                    value: 'delayed replay',
                },
            },
        ]);
    });

    it('keeps replaying commands without workbook params when no workbook is focused', async () => {
        const { replayService } = createReplayTestBed(TestUniverInstanceServiceWithoutFocusedUnit);

        const result = await replayService.replayCommands([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    value: 'global action',
                },
            },
        ]);

        expect(result).toBe(true);
        expect(TestReplayState.appliedCommands).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                params: {
                    value: 'global action',
                },
            },
        ]);
    });
});
