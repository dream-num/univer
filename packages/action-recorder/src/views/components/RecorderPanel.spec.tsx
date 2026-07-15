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

import type { IAccessor } from '@univerjs/core';
import type { Root } from 'react-dom/client';
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
    LocaleService,
    LocaleType,
    LogLevel,
} from '@univerjs/core';
import { ILocalFileService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CompleteRecordingActionCommand, StartRecordingActionCommand, StopRecordingActionCommand } from '../../commands/commands/record.command';
import { CloseRecordPanelOperation, OpenRecordPanelOperation } from '../../commands/operations/operation';
import enUS from '../../locale/en-US';
import { ActionRecorderService } from '../../services/action-recorder.service';
import { RecorderPanel } from './RecorderPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const APPLY_CELL_VALUE_COMMAND_ID = 'action-recorder.panel-test.apply-cell-value';

interface IAppliedCommandParams {
    unitId?: string;
    subUnitId?: string;
    value?: string;
}

class TestState {
    static downloads: Array<{ data: Blob; fileName: string }> = [];
    static appliedParams: IAppliedCommandParams[] = [];

    static reset() {
        this.downloads = [];
        this.appliedParams = [];
    }
}

class TestLocalFileService implements ILocalFileService {
    openFile(): Promise<File[]> {
        return Promise.resolve([]);
    }

    downloadFile(data: Blob, fileName: string): void {
        TestState.downloads.push({ data, fileName });
    }
}

class TestWorkbook {
    getUnitId() {
        return 'focused-workbook';
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

function createRecorderPanelTestBed() {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILocalFileService, { useClass: TestLocalFileService }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([LocaleService]);
    injector.add([ActionRecorderService]);

    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    [
        OpenRecordPanelOperation,
        CloseRecordPanelOperation,
        StartRecordingActionCommand,
        CompleteRecordingActionCommand,
        StopRecordingActionCommand,
        {
            id: APPLY_CELL_VALUE_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: (_accessor: IAccessor, params?: IAppliedCommandParams) => {
                TestState.appliedParams.push({ ...params });
                return true;
            },
        },
    ].forEach((command) => commandService.registerCommand(command));

    const recorderService = injector.get(ActionRecorderService);
    recorderService.registerRecordedCommand({
        id: APPLY_CELL_VALUE_COMMAND_ID,
        type: CommandType.COMMAND,
        handler: () => true,
    });

    return {
        injector,
        commandService,
        recorderService,
    };
}

async function renderRecorderPanel(root: Root, injector: Injector) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <RecorderPanel />
            </RediContext.Provider>
        );
    });
}

function getButton(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll('[data-u-comp="button"]'))
        .find((item) => item.textContent === text);
    expect(button).toBeTruthy();
    return button as HTMLElement;
}

describe('RecorderPanel', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createRecorderPanelTestBed> | undefined;

    beforeEach(() => {
        TestState.reset();
    });

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed = undefined;
        root = undefined;
        container = undefined;
    });

    it('opens the panel and starts recording from the Start action', async () => {
        currentTestBed = createRecorderPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderRecorderPanel(root, currentTestBed.injector);
        expect(container.textContent).toBe('');

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(OpenRecordPanelOperation.id);
        });
        expect(container.textContent).toContain('Start Recording');

        await act(async () => {
            getButton(container!, 'Start').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(currentTestBed.recorderService.recording).toBe(true);
        expect(container.textContent).toContain('Recording...');
        expect(container.textContent).toContain('Cancel');
        expect(container.textContent).toContain('Save');
    });

    it('records a command with sheet names from Start(N) and exports it on Save', async () => {
        currentTestBed = createRecorderPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderRecorderPanel(root, currentTestBed.injector);

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(OpenRecordPanelOperation.id);
        });

        await act(async () => {
            getButton(container!, 'Start(N)').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(APPLY_CELL_VALUE_COMMAND_ID, {
                unitId: 'focused-workbook',
                subUnitId: 'sheet-1',
                value: '42',
            });
        });

        expect(container.textContent).toContain(`1: ${APPLY_CELL_VALUE_COMMAND_ID}`);

        await act(async () => {
            getButton(container!, 'Save').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(currentTestBed.recorderService.recording).toBe(false);
        expect(TestState.downloads).toHaveLength(1);
        expect(TestState.downloads[0].fileName).toBe('recorded-commands.json');
        expect(JSON.parse(await TestState.downloads[0].data.text())).toEqual([
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

    it('stops recording without exporting when the panel is closed', async () => {
        currentTestBed = createRecorderPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderRecorderPanel(root, currentTestBed.injector);

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(OpenRecordPanelOperation.id);
        });

        await act(async () => {
            getButton(container!, 'Start').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(CloseRecordPanelOperation.id);
        });

        expect(currentTestBed.recorderService.recording).toBe(false);
        expect(container.textContent).toBe('');
        expect(TestState.downloads).toHaveLength(0);
    });

    it('completes an active recording from the panel cancel action using the stop command', async () => {
        currentTestBed = createRecorderPanelTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await renderRecorderPanel(root, currentTestBed.injector);

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(OpenRecordPanelOperation.id);
        });

        await act(async () => {
            getButton(container!, 'Start').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        await act(async () => {
            await currentTestBed!.commandService.executeCommand(APPLY_CELL_VALUE_COMMAND_ID, {
                unitId: 'focused-workbook',
                subUnitId: 'sheet-1',
                value: 'cancelled',
            });
        });

        expect(container.textContent).toContain(`1: ${APPLY_CELL_VALUE_COMMAND_ID}`);

        await act(async () => {
            getButton(container!, 'Cancel').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(currentTestBed.recorderService.recording).toBe(false);
        expect(container.textContent).toContain('Start Recording');
        expect(TestState.downloads).toHaveLength(1);
        expect(JSON.parse(await TestState.downloads[0].data.text())).toEqual([
            {
                id: APPLY_CELL_VALUE_COMMAND_ID,
                type: CommandType.COMMAND,
                params: {
                    unitId: 'focused-workbook',
                    subUnitId: 'sheet-1',
                    value: 'cancelled',
                },
            },
        ]);
    });
});
