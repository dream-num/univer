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

import { CommandType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    CompleteRecordingActionCommand,
    StartRecordingActionCommand,
    StopRecordingActionCommand,
} from '../record.command';
import { APPLY_CELL_VALUE_COMMAND_ID, createCommandTestBed, TestState } from './create-command-test-bed';

describe('record.command', () => {
    beforeEach(() => {
        TestState.reset();
    });

    it('records whitelisted user commands and exports them through the complete command', async () => {
        const { commandService, recorderService } = createCommandTestBed([
            StartRecordingActionCommand,
            CompleteRecordingActionCommand,
            StopRecordingActionCommand,
        ]);
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
        const { commandService, recorderService } = createCommandTestBed([
            StartRecordingActionCommand,
            CompleteRecordingActionCommand,
            StopRecordingActionCommand,
        ]);

        await commandService.executeCommand(StartRecordingActionCommand.id);
        expect(recorderService.recording).toBe(true);

        await commandService.executeCommand(StopRecordingActionCommand.id);

        expect(recorderService.recording).toBe(false);
        expect(TestState.downloads).toHaveLength(1);
        expect(TestState.downloads[0].fileName).toBe('recorded-commands.json');
    });
});
