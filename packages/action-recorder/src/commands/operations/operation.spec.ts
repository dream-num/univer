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
} from '@univerjs/core';
import { ILocalFileService } from '@univerjs/ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { ActionRecorderService } from '../../services/action-recorder.service';
import { CloseRecordPanelOperation, OpenRecordPanelOperation } from './operation';

class TestLocalFileService implements ILocalFileService {
    static downloads = 0;

    static reset() {
        this.downloads = 0;
    }

    openFile(): Promise<File[]> {
        return Promise.resolve([]);
    }

    downloadFile(): void {
        TestLocalFileService.downloads += 1;
    }
}

class TestFocusedUnit {
    getUnitId() {
        return 'focused-workbook';
    }
}

class TestUniverInstanceService {
    private readonly _focusedUnit = new TestFocusedUnit();

    getFocusedUnit() {
        return this._focusedUnit;
    }
}

function createOperationTestBed() {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILocalFileService, { useClass: TestLocalFileService }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ActionRecorderService]);

    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(OpenRecordPanelOperation);
    commandService.registerCommand(CloseRecordPanelOperation);

    return {
        commandService,
        recorderService: injector.get(ActionRecorderService),
    };
}

describe('action-recorder panel operations', () => {
    beforeEach(() => {
        TestLocalFileService.reset();
    });

    it('opens the record panel and closes an active recording session without exporting', async () => {
        const { commandService, recorderService } = createOperationTestBed();
        const panelStates: boolean[] = [];
        recorderService.panelOpened$.subscribe((state) => panelStates.push(state));

        await commandService.executeCommand(OpenRecordPanelOperation.id);
        recorderService.startRecording();
        await commandService.executeCommand(CloseRecordPanelOperation.id);

        expect(panelStates).toEqual([false, true, false]);
        expect(recorderService.recording).toBe(false);
        expect(TestLocalFileService.downloads).toBe(0);
    });
});
