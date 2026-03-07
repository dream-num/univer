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
    setColorId: 'set-color',
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
    CROSSHAIR_HIGHLIGHT_COLORS: mocked.colors,
    DisableCrosshairHighlightOperation: { id: mocked.disableId },
    EnableCrosshairHighlightOperation: { id: mocked.enableId },
    ToggleCrosshairHighlightOperation: { id: mocked.toggleId },
    SetCrosshairHighlightColorOperation: { id: mocked.setColorId },
    SheetsCrosshairHighlightService: class {},
}));

describe('crosshair facade', () => {
    it('should register mixins and cover event wiring + APIs', async () => {
        const module = await import('./f-univer');

        expect(mocked.extendEvent).toHaveBeenCalledWith(module.FSheetCrosshairHighlightEventMixin);
        expect(mocked.extendUniver).toHaveBeenCalledWith(module.FUniverCrosshairHighlightMixin);

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
                CrosshairHighlightColorChanged: 'CrosshairHighlightColorChanged',
            },
            _injector: {
                get: vi.fn(() => ({
                    enabled: true,
                    color: 'rgba(1,2,3,0.2)',
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
            getCrosshairHighlightColor: vi.fn(() => 'rgba(1,2,3,0.2)'),
            fireEvent,
            registerEventHandler,
            disposeWithMe: vi.fn(),
        };

        module.FUniverCrosshairHighlightMixin.prototype._initialize.call(
            thisArg,
            { get: vi.fn(() => commandService) } as never
        );
        expect(registerEventHandler).toHaveBeenCalledTimes(2);

        callbacks[0]({ id: mocked.enableId });
        callbacks[0]({ id: mocked.disableId });
        callbacks[0]({ id: mocked.toggleId });
        callbacks[0]({ id: 'other-command' });
        callbacks[1]({ id: mocked.setColorId });
        callbacks[1]({ id: 'other-color-command' });
        expect(fireEvent).toHaveBeenCalled();

        thisArg.getActiveSheet.mockReturnValue(undefined as never);
        callbacks[0]({ id: mocked.enableId });
        callbacks[1]({ id: mocked.setColorId });

        const enabledResult = module.FUniverCrosshairHighlightMixin.prototype.setCrosshairHighlightEnabled.call(thisArg, true);
        const disabledResult = module.FUniverCrosshairHighlightMixin.prototype.setCrosshairHighlightEnabled.call(thisArg, false);
        expect(enabledResult).toBe(thisArg);
        expect(disabledResult).toBe(thisArg);
        expect(thisArg._commandService.syncExecuteCommand).toHaveBeenCalledWith(mocked.enableId);
        expect(thisArg._commandService.syncExecuteCommand).toHaveBeenCalledWith(mocked.disableId);

        const colorResult = module.FUniverCrosshairHighlightMixin.prototype.setCrosshairHighlightColor.call(thisArg, '#ff0000');
        expect(colorResult).toBe(thisArg);
        expect(thisArg._commandService.syncExecuteCommand).toHaveBeenCalledWith(mocked.setColorId, { value: '#ff0000' });

        expect(module.FUniverCrosshairHighlightMixin.prototype.getCrosshairHighlightEnabled.call(thisArg)).toBe(true);
        expect(module.FUniverCrosshairHighlightMixin.prototype.getCrosshairHighlightColor.call(thisArg)).toBe('rgba(1,2,3,0.2)');
        expect(module.FUniverCrosshairHighlightMixin.prototype.CROSSHAIR_HIGHLIGHT_COLORS).toBe(mocked.colors);

        const eventEnum = new module.FSheetCrosshairHighlightEventMixin();
        expect(eventEnum.CrosshairHighlightEnabledChanged).toBe('CrosshairHighlightEnabledChanged');
        expect(eventEnum.CrosshairHighlightColorChanged).toBe('CrosshairHighlightColorChanged');
    });

    it('should run facade entry export', async () => {
        await expect(import('./index')).resolves.toBeDefined();
    });
});
