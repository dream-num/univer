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

import { describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({
    extendUniver: vi.fn(),
    extendEvent: vi.fn(),
    colors: ['c1', 'c2'],
    enableId: 'enable',
    disableId: 'disable',
    toggleId: 'toggle',
}));

vi.mock('@univerjs/core/facade', () => {
    class FUniver {
        static extend = mocked.extendUniver;
    }
    class FEventName {
        static extend = mocked.extendEvent;
    }

    return {
        FUniver,
        FEventName,
    };
});

vi.mock('@univerjs/sheets-crosshair-highlight', () => ({
    DisableCrosshairHighlightOperation: { id: mocked.disableId },
    EnableCrosshairHighlightOperation: { id: mocked.enableId },
    ToggleCrosshairHighlightOperation: { id: mocked.toggleId },
    SheetsCrosshairHighlightService: class {},
}));

describe('crosshair facade', () => {
    it('should register mixins and cover event wiring + APIs', async () => {
        const module1 = await import('./f-univer');
        const module2 = await import('./f-event');

        expect(mocked.extendEvent).toHaveBeenCalledWith(module2.FSheetsCrosshairHighlightEventNameMixin);
        expect(mocked.extendUniver).toHaveBeenCalledWith(module1.FUniverSheetsCrosshairHighlightMixin);

        const callbacks: Array<(commandInfo: { id: string }) => void> = [];
        const commandService = {
            onCommandExecuted: vi.fn((cb: (commandInfo: { id: string }) => void) => {
                callbacks.push(cb);
                return { dispose: vi.fn() };
            }),
        };
        const fireEvent = vi.fn();
        const registerEventHandler = vi.fn((_eventName: string, setup: () => unknown) => setup());
        const thisArg = {
            Event: {
                CrosshairHighlightEnabledChanged: 'CrosshairHighlightEnabledChanged',
            },
            _injector: {
                get: vi.fn(() => ({
                    enabled: true,
                })),
            },
            _commandService: {
                syncExecuteCommand: vi.fn(),
            },
            getActiveSheet: vi.fn(() => ({
                workbook: { id: 'wb' },
                worksheet: { id: 'ws' },
            })),
            getCrosshairHighlightEnabled: vi.fn(() => true),
            fireEvent,
            registerEventHandler,
            disposeWithMe: vi.fn(),
        };

        module1.FUniverSheetsCrosshairHighlightMixin.prototype._initialize.call(
            thisArg,
            { get: vi.fn(() => commandService) } as never
        );
        expect(registerEventHandler).toHaveBeenCalledTimes(1);

        callbacks[0]({ id: mocked.enableId });
        callbacks[0]({ id: mocked.disableId });
        callbacks[0]({ id: mocked.toggleId });
        callbacks[0]({ id: 'other-command' });
        expect(fireEvent).toHaveBeenCalled();

        thisArg.getActiveSheet.mockReturnValue(undefined as never);
        callbacks[0]({ id: mocked.enableId });

        const enabledResult = module1.FUniverSheetsCrosshairHighlightMixin.prototype.setCrosshairHighlightEnabled.call(thisArg, true);
        const disabledResult = module1.FUniverSheetsCrosshairHighlightMixin.prototype.setCrosshairHighlightEnabled.call(thisArg, false);
        expect(enabledResult).toBe(thisArg);
        expect(disabledResult).toBe(thisArg);
        expect(thisArg._commandService.syncExecuteCommand).toHaveBeenCalledWith(mocked.enableId);
        expect(thisArg._commandService.syncExecuteCommand).toHaveBeenCalledWith(mocked.disableId);

        expect(module1.FUniverSheetsCrosshairHighlightMixin.prototype.getCrosshairHighlightEnabled.call(thisArg)).toBe(true);

        const eventEnum = new module2.FSheetsCrosshairHighlightEventNameMixin();
        expect(eventEnum.CrosshairHighlightEnabledChanged).toBe('CrosshairHighlightEnabledChanged');
    });

    it('should run facade entry export', async () => {
        await expect(import('./index')).resolves.toBeDefined();
    });
});
