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

import type { ICommand, IDisposable } from '@univerjs/core';
import type { IMessageProps } from '@univerjs/design';
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
    LogLevel,
    toDisposable,
} from '@univerjs/core';
import { ILocalFileService, IMessageService } from '@univerjs/ui';
import { ActionRecorderService } from '../../../services/action-recorder.service';
import { ActionReplayService } from '../../../services/replay.service';

export const APPLY_CELL_VALUE_COMMAND_ID = 'action-recorder.command-test.apply-cell-value';

interface ITestFile {
    name: string;
    text(): Promise<string>;
}

interface IAppliedCommandParams {
    unitId?: string;
    subUnitId?: string;
    value?: string;
}

export class TestState {
    static files: ITestFile[] = [];
    static downloads: Array<{ data: Blob; fileName: string }> = [];
    static messages: IMessageProps[] = [];
    static appliedParams: IAppliedCommandParams[] = [];

    static reset() {
        this.files = [];
        this.downloads = [];
        this.messages = [];
        this.appliedParams = [];
    }
}

class TestLocalFileService implements ILocalFileService {
    openFile(): Promise<File[]> {
        return Promise.resolve(TestState.files as File[]);
    }

    downloadFile(data: Blob, fileName: string): void {
        TestState.downloads.push({ data, fileName });
    }
}

class TestMessageService implements IMessageService {
    show(options: IMessageProps): IDisposable {
        TestState.messages.push(options);
        return toDisposable(() => {});
    }

    remove(): void {
        // no container in command tests
    }

    removeAll(): void {
        TestState.messages = [];
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

    getSheetBySheetId(sheetId: string) {
        if (sheetId !== 'sheet-1') {
            return null;
        }

        return { getName: () => 'Recorded Sheet' };
    }
}

class TestUniverInstanceService {
    private readonly _workbook = new TestWorkbook();

    getFocusedUnit() {
        return this._workbook;
    }

    getUnit() {
        return this._workbook;
    }
}

export function createCommandTestBed(commands: ICommand[] = []) {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILocalFileService, { useClass: TestLocalFileService }]);
    injector.add([IMessageService, { useClass: TestMessageService }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([ActionRecorderService]);
    injector.add([ActionReplayService]);

    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    for (const command of commands) {
        commandService.registerCommand(command);
    }

    commandService.registerCommand({
        id: APPLY_CELL_VALUE_COMMAND_ID,
        type: CommandType.COMMAND,
        handler: (_accessor, params?: IAppliedCommandParams) => {
            TestState.appliedParams.push({ ...params });
            return true;
        },
    });

    return {
        commandService,
        recorderService: injector.get(ActionRecorderService),
    };
}
