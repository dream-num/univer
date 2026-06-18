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
import { ICommandService, Injector } from '@univerjs/core';
import { FEventName, FUniver } from '@univerjs/core/facade';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SheetsCrosshairHighlightService,
    ToggleCrosshairHighlightOperation,
} from '@univerjs/sheets-crosshair-highlight';
import { describe, expect, it, vi } from 'vitest';
import { FSheetsCrosshairHighlightEventNameMixin } from './f-event';
import { FUniverSheetsCrosshairHighlightMixin } from './f-univer';

class TestCommandService {
    readonly callbacks: Array<(commandInfo: { id: string }) => void> = [];
    readonly executedCommandIds: string[] = [];

    onCommandExecuted(callback: (commandInfo: { id: string }) => void): IDisposable {
        this.callbacks.push(callback);
        return { dispose: () => undefined };
    }

    syncExecuteCommand(id: string): boolean {
        this.executedCommandIds.push(id);
        return true;
    }
}

class TestCrosshairHighlightService {
    enabled = true;
}

describe('crosshair facade', () => {
    it('emits the enabled-change event for crosshair commands on the active sheet', () => {
        const injector = new Injector();
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([SheetsCrosshairHighlightService, { useClass: TestCrosshairHighlightService as never }]);
        const commandService = injector.get(ICommandService) as unknown as TestCommandService;
        const fireEvent = vi.fn();
        const registerEventHandler = vi.fn((_eventName: string, setup: () => unknown) => setup());
        const thisArg = {
            Event: FEventName.get(),
            _injector: injector,
            _commandService: commandService,
            getActiveSheet: vi.fn(() => ({
                workbook: { id: 'workbook-1' },
                worksheet: { id: 'sheet-1' },
            })),
            getCrosshairHighlightEnabled: () => FUniverSheetsCrosshairHighlightMixin.prototype.getCrosshairHighlightEnabled.call(thisArg as never),
            fireEvent,
            registerEventHandler,
            disposeWithMe: vi.fn(),
        };

        FUniverSheetsCrosshairHighlightMixin.prototype._initialize.call(thisArg as never, injector);
        expect(registerEventHandler).toHaveBeenCalledWith('CrosshairHighlightEnabledChanged', expect.any(Function));

        commandService.callbacks[0]({ id: EnableCrosshairHighlightOperation.id });
        commandService.callbacks[0]({ id: DisableCrosshairHighlightOperation.id });
        commandService.callbacks[0]({ id: ToggleCrosshairHighlightOperation.id });
        commandService.callbacks[0]({ id: 'unrelated-command' });

        expect(fireEvent).toHaveBeenCalledTimes(3);
        expect(fireEvent).toHaveBeenLastCalledWith('CrosshairHighlightEnabledChanged', {
            enabled: true,
            workbook: { id: 'workbook-1' },
            worksheet: { id: 'sheet-1' },
        });

        thisArg.getActiveSheet.mockReturnValue(undefined as never);
        commandService.callbacks[0]({ id: EnableCrosshairHighlightOperation.id });
        expect(fireEvent).toHaveBeenCalledTimes(3);
    });

    it('updates crosshair state through commands and exposes the event name on real facade classes', () => {
        const injector = new Injector();
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([SheetsCrosshairHighlightService, { useClass: TestCrosshairHighlightService as never }]);
        const commandService = injector.get(ICommandService) as unknown as TestCommandService;
        const thisArg = {
            _injector: injector,
            _commandService: commandService,
        };

        expect(FUniverSheetsCrosshairHighlightMixin.prototype.setCrosshairHighlightEnabled.call(thisArg as never, true)).toBe(thisArg);
        expect(FUniverSheetsCrosshairHighlightMixin.prototype.setCrosshairHighlightEnabled.call(thisArg as never, false)).toBe(thisArg);
        expect(commandService.executedCommandIds).toEqual([
            EnableCrosshairHighlightOperation.id,
            DisableCrosshairHighlightOperation.id,
        ]);
        expect(FUniverSheetsCrosshairHighlightMixin.prototype.getCrosshairHighlightEnabled.call(thisArg as never)).toBe(true);
        expect(FEventName.get().CrosshairHighlightEnabledChanged).toBe('CrosshairHighlightEnabledChanged');
        expect(Object.create(FSheetsCrosshairHighlightEventNameMixin.prototype).CrosshairHighlightEnabledChanged).toBe('CrosshairHighlightEnabledChanged');
        expect(typeof FUniver.prototype.setCrosshairHighlightEnabled).toBe('function');
    });
});
