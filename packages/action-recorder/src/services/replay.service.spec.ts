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

/* eslint-disable import/first */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@univerjs/core', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/core')>('@univerjs/core');
    return {
        ...actual,
        awaitTime: vi.fn(async () => undefined),
    };
});

import { MessageType } from '@univerjs/design';
import { ActionReplayService, ReplayMode } from './replay.service';

describe('ActionReplayService', () => {
    it('should replay local json with success/failure branches', async () => {
        const show = vi.fn();
        const executeCommand = vi.fn(async () => true);
        const focusedUnit = {
            getUnitId: () => 'unit-1',
            getSheetBySheetName: vi.fn(() => ({ getSheetId: () => 'sheet-1' })),
            getActiveSheet: vi.fn(() => ({ getSheetId: () => 'active-sheet' })),
        };
        const localFileService = {
            openFile: vi.fn()
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([{ name: 'bad.json', text: async () => '{bad' }])
                .mockResolvedValueOnce([{ name: 'ok.json', text: async () => JSON.stringify([{ id: 'c1', params: {} }]) }]),
        };
        const service = new ActionReplayService(
            { show } as never,
            { getFocusedUnit: vi.fn(() => focusedUnit) } as never,
            localFileService as never,
            { error: vi.fn() } as never,
            { executeCommand } as never
        );

        await expect(service.replayLocalJSON()).resolves.toBe(false);
        await expect(service.replayLocalJSON()).resolves.toBe(false);
        await expect(service.replayLocalJSON()).resolves.toBe(true);
        expect(show).toHaveBeenCalledWith({
            type: MessageType.Error,
            content: 'Failed to replay commands from local file bad.json.',
        });
    });

    it('should replay commands with mode branches and failure paths', async () => {
        const logError = vi.fn();
        const executeCommandMain = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(false);
        const focusedUnit = {
            getUnitId: () => 'unit-focused',
            getSheetBySheetName: vi.fn((name: string) => (name === 'exists' ? { getSheetId: () => 'sheet-exists' } : undefined)),
            getActiveSheet: vi.fn(() => ({ getSheetId: () => 'active-sheet-id' })),
        };
        const service = new ActionReplayService(
            { show: vi.fn() } as never,
            { getFocusedUnit: vi.fn(() => focusedUnit) } as never,
            { openFile: vi.fn() } as never,
            { error: logError } as never,
            { executeCommand: executeCommandMain } as never
        );

        await expect(
            service.replayCommands([
                { id: 'cmd-name', params: { unitId: 'u', subUnitId: 'exists' } },
                { id: 'cmd-no-params' },
            ] as never, { mode: ReplayMode.NAME })
        ).resolves.toBe(true);

        await expect(
            service.replayCommands([{ id: 'cmd-name-miss', params: { unitId: 'u', subUnitId: 'missing' } }] as never, { mode: ReplayMode.NAME })
        ).resolves.toBe(true);

        await expect(
            service.replayCommands([{ id: 'cmd-active', params: { unitId: 'u', subUnitId: 'x' } }] as never, { mode: ReplayMode.ACTIVE })
        ).resolves.toBe(true);

        await expect(
            service.replayCommands([{ id: 'cmd-fail', params: { unitId: 'u' } }] as never, { mode: ReplayMode.DEFAULT })
        ).resolves.toBe(false);
        await expect(
            service.replayCommands([{ id: 'cmd-no-params-fail' }] as never, { mode: ReplayMode.DEFAULT })
        ).resolves.toBe(false);

        const activeMissingService = new ActionReplayService(
            { show: vi.fn() } as never,
            {
                getFocusedUnit: vi.fn(() => ({
                    getUnitId: () => 'unit-focused',
                    getSheetBySheetName: vi.fn(() => undefined),
                    getActiveSheet: vi.fn(() => undefined),
                })),
            } as never,
            { openFile: vi.fn() } as never,
            { error: logError } as never,
            { executeCommand: vi.fn(async () => true) } as never
        );
        await expect(
            activeMissingService.replayCommands([{ id: 'cmd-active-miss', params: { subUnitId: 'x' } }] as never, { mode: ReplayMode.ACTIVE })
        ).resolves.toBe(true);

        const noFocusService = new ActionReplayService(
            { show: vi.fn() } as never,
            { getFocusedUnit: vi.fn(() => undefined) } as never,
            { openFile: vi.fn() } as never,
            { error: logError } as never,
            { executeCommand: vi.fn(async () => true) } as never
        );
        await expect(noFocusService.replayCommands([{ id: 'cmd-no-focus' }] as never)).resolves.toBe(true);

        const noFocusDelayExec = vi.fn()
            .mockResolvedValueOnce(false);
        const noFocusDelayService = new ActionReplayService(
            { show: vi.fn() } as never,
            { getFocusedUnit: vi.fn(() => undefined) } as never,
            { openFile: vi.fn() } as never,
            { error: logError } as never,
            { executeCommand: noFocusDelayExec } as never
        );
        await expect(noFocusDelayService.replayCommandsWithDelay([{ id: 'cmd-delay-fail' }] as never)).resolves.toBe(false);

        const focusedDelayExec = vi.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const focusedDelayService = new ActionReplayService(
            { show: vi.fn() } as never,
            { getFocusedUnit: vi.fn(() => focusedUnit) } as never,
            { openFile: vi.fn() } as never,
            { error: logError } as never,
            { executeCommand: focusedDelayExec } as never
        );
        await expect(
            focusedDelayService.replayCommandsWithDelay([{ id: 'cmd-delay-param-fail', params: { subUnitId: 'x' } }] as never)
        ).resolves.toBe(false);
        await expect(
            focusedDelayService.replayCommandsWithDelay([{ id: 'cmd-delay-no-params-ok' }] as never)
        ).resolves.toBe(true);

        const focusedDelaySuccessService = new ActionReplayService(
            { show: vi.fn() } as never,
            { getFocusedUnit: vi.fn(() => focusedUnit) } as never,
            { openFile: vi.fn() } as never,
            { error: logError } as never,
            { executeCommand: vi.fn(async () => true) } as never
        );
        await expect(
            focusedDelaySuccessService.replayCommandsWithDelay([{ id: 'cmd-delay-param-ok', params: { unitId: 'will-change' } }] as never)
        ).resolves.toBe(true);

        expect(logError).toHaveBeenCalled();
    });
});
