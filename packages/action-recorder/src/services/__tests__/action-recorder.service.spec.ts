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
} from '@univerjs/core';
import { SetSelectionsOperation } from '@univerjs/sheets';
import { DesktopLocalFileService, ILocalFileService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionRecorderService } from '../action-recorder.service';

class TestUniverInstanceService {
    getFocusedUnit() {
        return { getUnitId: () => 'unit-1' };
    }

    getUnit() {
        return {
            getSheetBySheetId: () => ({ getName: () => 'Sheet-A' }),
        };
    }
}

describe('ActionRecorderService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should record commands, replace selection entries and complete/stop', () => {
        const link = { click: vi.fn(), download: '', href: '' };
        vi.stubGlobal('document', { createElement: () => link });
        vi.stubGlobal('window', { URL: { createObjectURL: () => 'blob:recording' } });

        const injector = new Injector();
        injector.add([ICommandService, { useClass: CommandService }]);
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IConfigService, { useClass: ConfigService }]);
        injector.add([ILocalFileService, { useClass: DesktopLocalFileService }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ActionRecorderService]);
        const service = injector.get(ActionRecorderService);
        const commandService = injector.get(ICommandService);
        const logService = injector.get(ILogService);
        const logError = vi.spyOn(logService, 'error');

        expect(() =>
            service.registerRecordedCommand({
                id: 'mutation-id',
                type: CommandType.MUTATION,
            } as never)
        ).toThrow('[CommandRecorderService] Cannot record mutation commands.');

        service.registerRecordedCommand({ id: 'cmd-1', type: CommandType.COMMAND } as never);
        service.registerRecordedCommand({ id: SetSelectionsOperation.id, type: CommandType.OPERATION } as never);
        commandService.registerCommand({
            id: 'cmd-1',
            type: CommandType.COMMAND,
            handler: () => true,
        });
        commandService.registerCommand({
            id: SetSelectionsOperation.id,
            type: CommandType.OPERATION,
            handler: () => true,
        });
        commandService.registerCommand({
            id: 'ignored',
            type: CommandType.COMMAND,
            handler: () => true,
        });

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

        commandService.syncExecuteCommand('cmd-1', {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        });
        commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            mark: 1,
        });
        commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            mark: 2,
        });
        commandService.syncExecuteCommand('ignored', {});

        expect(commandStates[commandStates.length - 1]).toEqual(['cmd-1']);

        service.completeRecording();
        expect(link.download).toBe('recorded-commands.json');
        expect(link.href).toBe('blob:recording');
        expect(link.click).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalled();
        expect(recordingStates[recordingStates.length - 1]).toBe(false);

        service.startRecording();
        commandService.syncExecuteCommand('cmd-1', {
            params: { unitId: 'unit-1', subUnitId: 'sheet-1' },
        });
        service.togglePanel(false);
        expect(panelStates[panelStates.length - 1]).toBe(false);
        expect(recordingStates[recordingStates.length - 1]).toBe(false);
    });
});
