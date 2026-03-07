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
import { SetSelectionsOperation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { ActionRecorderService } from './action-recorder.service';

describe('ActionRecorderService', () => {
    it('should record commands, replace selection entries and complete/stop', () => {
        let commandCallback: ((commandInfo: { id: string; type: CommandType; params?: Record<string, unknown> }) => void) | undefined;
        const recorderDisposable = { dispose: vi.fn() };
        const onCommandExecuted = vi.fn((callback: typeof commandCallback) => {
            commandCallback = callback;
            return recorderDisposable;
        });

        const downloadFile = vi.fn();
        const logError = vi.fn();
        const service = new ActionRecorderService(
            { onCommandExecuted } as never,
            { error: logError } as never,
            { downloadFile } as never,
            {
                getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'unit-1' })),
                getUnit: vi.fn(() => ({
                    getSheetBySheetId: vi.fn(() => ({ getName: () => 'Sheet-A' })),
                })),
            } as never
        );

        expect(() =>
            service.registerRecordedCommand({
                id: 'mutation-id',
                type: CommandType.MUTATION,
            } as never)
        ).toThrow('[CommandRecorderService] Cannot record mutation commands.');

        service.registerRecordedCommand({ id: 'cmd-1', type: CommandType.COMMAND } as never);
        service.registerRecordedCommand({ id: SetSelectionsOperation.id, type: CommandType.OPERATION } as never);

        const panelStates: boolean[] = [];
        const recordingStates: boolean[] = [];
        const commandStates: string[][] = [];
        service.panelOpened$.subscribe((v) => panelStates.push(v));
        service.recording$.subscribe((v) => recordingStates.push(v));
        service.recordedCommands$.subscribe((v) => commandStates.push(v.map((cmd) => cmd.id)));

        service.togglePanel(true);
        service.startRecording(true);
        expect(service.recording).toBe(true);
        expect(recordingStates[recordingStates.length - 1]).toBe(true);

        commandCallback?.({
            id: 'cmd-1',
            type: CommandType.COMMAND,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1' },
        });
        commandCallback?.({
            id: SetSelectionsOperation.id,
            type: CommandType.OPERATION,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', mark: 1 },
        });
        commandCallback?.({
            id: SetSelectionsOperation.id,
            type: CommandType.OPERATION,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', mark: 2 },
        });
        commandCallback?.({
            id: 'ignored',
            type: CommandType.COMMAND,
            params: {},
        });

        expect(commandStates[commandStates.length - 1]).toEqual(['cmd-1']);

        service.completeRecording();
        expect(downloadFile).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalled();
        expect(recorderDisposable.dispose).toHaveBeenCalled();
        expect(recordingStates[recordingStates.length - 1]).toBe(false);

        service.startRecording();
        commandCallback?.({
            id: 'cmd-1',
            type: CommandType.COMMAND,
            params: {},
        });
        service.togglePanel(false);
        expect(panelStates[panelStates.length - 1]).toBe(false);
        expect(recordingStates[recordingStates.length - 1]).toBe(false);
    });
});
