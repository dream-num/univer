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

import { MessageType } from '@univerjs/design';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    ReplayLocalRecordCommand,
    ReplayLocalRecordOnActiveCommand,
    ReplayLocalRecordOnNamesakeCommand,
} from '../replay.command';
import { APPLY_CELL_VALUE_COMMAND_ID, createCommandTestBed, TestState } from './create-command-test-bed';

describe('replay.command', () => {
    beforeEach(() => {
        TestState.reset();
    });

    it('replays local records against the matching sheet name', async () => {
        const { commandService } = createCommandTestBed([
            ReplayLocalRecordCommand,
            ReplayLocalRecordOnNamesakeCommand,
            ReplayLocalRecordOnActiveCommand,
        ]);
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
        const { commandService } = createCommandTestBed([
            ReplayLocalRecordCommand,
            ReplayLocalRecordOnNamesakeCommand,
            ReplayLocalRecordOnActiveCommand,
        ]);
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
        const { commandService } = createCommandTestBed([
            ReplayLocalRecordCommand,
            ReplayLocalRecordOnNamesakeCommand,
            ReplayLocalRecordOnActiveCommand,
        ]);

        const result = await commandService.executeCommand(ReplayLocalRecordCommand.id);

        expect(result).toBe(false);
        expect(TestState.appliedParams).toEqual([]);
        expect(TestState.messages).toEqual([]);
    });
});
