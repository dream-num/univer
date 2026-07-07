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

import type { IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import type { IPopup } from '@univerjs/ui';
import type { Root } from 'react-dom/client';
import {
    awaitTime,
    CommandType,
    ICommandService,
    IConfigService,
    ILogService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    RemoveNoteMutation,
    SheetsNoteModel,
    SheetUpdateNoteCommand,
    UpdateNoteMutation,
} from '@univerjs/sheets-note';
import { CellPopupManagerService } from '@univerjs/sheets-ui';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { SheetsNotePopupService } from '../../services/sheets-note-popup.service';
import { SheetsNote } from '../Note';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'note-view-workbook';
const SUB_UNIT_ID = 'sheet-1';

const FailingUpdateNoteMutation = {
    id: UpdateNoteMutation.id,
    type: CommandType.MUTATION,
    handler: () => false,
};

class TestRenderManagerService {
    getRenderById() {
        return {
            engine: {
                getCanvasElement() {
                    return document.createElement('canvas');
                },
            },
        };
    }
}

class TestCellPopupManagerService {
    showPopup(): IDisposable {
        return toDisposable(() => undefined);
    }
}

class TestResizeObserver {
    static callback: ResizeObserverCallback | undefined;

    constructor(callback: ResizeObserverCallback) {
        TestResizeObserver.callback = callback;
    }

    observe(): void {}

    unobserve(): void {}

    disconnect(): void {}
}

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        name: 'note workbook',
        locale: LocaleType.EN_US,
        sheetOrder: [SUB_UNIT_ID],
        styles: {},
        sheets: {
            [SUB_UNIT_ID]: {
                id: SUB_UNIT_ID,
                name: 'Sheet 1',
                cellData: {},
            },
        },
    };
}

function createNoteLocation(row: number, col: number) {
    return {
        unitId: UNIT_ID,
        subUnitId: SUB_UNIT_ID,
        row,
        col,
        trigger: 'context-menu',
    };
}

function createNotePopup(row: number, col: number): IPopup<{ location: { unitId: string; subUnitId: string; row: number; col: number; trigger: string } }> {
    return {
        extraProps: {
            location: createNoteLocation(row, col),
        },
    } as IPopup<{ location: { unitId: string; subUnitId: string; row: number; col: number; trigger: string } }>;
}

function createNoteViewTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([SheetsNoteModel]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService as never }]);
    injector.add([SheetsNotePopupService]);
    injector.get(IUndoRedoService);
    injector.get(IConfigService).setConfig(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY, {
        defaultNoteSize: {
            width: 180,
            height: 96,
        },
    });
    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-note-ui': {
                note: {
                    placeholder: 'Write a note',
                },
            },
        },
    });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const commandService = injector.get(ICommandService);
    commandService.registerCommand(UpdateNoteMutation);
    commandService.registerCommand(RemoveNoteMutation);
    commandService.registerCommand(SheetUpdateNoteCommand);

    return {
        univer,
        injector,
        workbook,
        noteModel: injector.get(SheetsNoteModel),
        commandService,
        notePopupService: injector.get(SheetsNotePopupService),
    };
}

function inputText(textarea: HTMLTextAreaElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    valueSetter?.call(textarea, value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function resizeTextarea(textarea: HTMLTextAreaElement, width: number, height: number) {
    textarea.style.width = `${width}px`;
    textarea.style.height = `${height}px`;
    TestResizeObserver.callback?.([{
        target: {
            getBoundingClientRect: () => ({ width, height }),
        },
    } as unknown as ResizeObserverEntry], {} as ResizeObserver);
}

async function renderNote(root: Root, testBed: ReturnType<typeof createNoteViewTestBed>, row = 2, col = 3) {
    await act(async () => {
        root.render(
            <RediContext.Provider value={{ injector: testBed.injector }}>
                <SheetsNote popup={createNotePopup(row, col)} />
            </RediContext.Provider>
        );
        await awaitTime(20);
    });
}

describe('SheetsNote', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createNoteViewTestBed> | undefined;
    let resizeObserverDescriptor: PropertyDescriptor | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        if (resizeObserverDescriptor) {
            Object.defineProperty(globalThis, 'ResizeObserver', resizeObserverDescriptor);
        } else {
            delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
        }
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
        resizeObserverDescriptor = undefined;
    });

    function createMountedNote() {
        resizeObserverDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
        Object.defineProperty(globalThis, 'ResizeObserver', {
            configurable: true,
            value: TestResizeObserver,
        });
        currentTestBed = createNoteViewTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        return currentTestBed;
    }

    it('creates a note with the configured default size when an empty cell popup opens', async () => {
        const testBed = createMountedNote();

        await renderNote(root!, testBed);
        await act(async () => {
            await awaitTime(350);
        });

        const note = testBed.noteModel.getNote(UNIT_ID, SUB_UNIT_ID, { row: 2, col: 3 });
        expect(note?.note).toBe('');
        expect(note?.width).toBe(180);
        expect(note?.height).toBe(96);
        expect(container!.querySelector('textarea')?.placeholder).toBe('Write a note');
    });

    it('persists edited note text through the sheet note command pipeline', async () => {
        const testBed = createMountedNote();

        await renderNote(root!, testBed);
        await act(async () => {
            await awaitTime(350);
        });

        const textarea = container!.querySelector('textarea') as HTMLTextAreaElement;

        await act(async () => {
            inputText(textarea, 'Follow up with finance');
            await awaitTime(350);
        });

        const note = testBed.noteModel.getNote(UNIT_ID, SUB_UNIT_ID, { row: 2, col: 3 });
        expect(note?.note).toBe('Follow up with finance');
        expect(note?.width).toBe(180);
        expect(note?.height).toBe(96);
    });

    it('moves an RTL note left while resizing wider, but reopens at the anchored position with the saved size', async () => {
        const testBed = createMountedNote();
        testBed.injector.get(LocaleService).setDirection('rtl');

        await renderNote(root!, testBed);
        await act(async () => {
            await awaitTime(350);
        });

        let textarea = container!.querySelector('textarea') as HTMLTextAreaElement;

        await act(async () => {
            resizeTextarea(textarea, 220, 96);
            await awaitTime(350);
        });

        expect(textarea.style.transform).toBe('translateX(-40px)');
        expect(testBed.noteModel.getNote(UNIT_ID, SUB_UNIT_ID, { row: 2, col: 3 })?.width).toBe(220);

        act(() => {
            root!.unmount();
        });
        root = createRoot(container!);

        await renderNote(root!, testBed);

        textarea = container!.querySelector('textarea') as HTMLTextAreaElement;
        expect(textarea.style.width).toBe('220px');
        expect(textarea.style.transform).toBe('');
    });

    it('closes the popup when creating the initial note cannot be saved', async () => {
        const testBed = createMountedNote();
        testBed.commandService.unregisterCommand(UpdateNoteMutation.id);
        testBed.commandService.registerCommand(FailingUpdateNoteMutation);
        testBed.notePopupService.showPopup(createNoteLocation(2, 3));

        await renderNote(root!, testBed);
        await act(async () => {
            await awaitTime(350);
        });

        expect(testBed.noteModel.getNote(UNIT_ID, SUB_UNIT_ID, { row: 2, col: 3 })).toBeUndefined();
        expect(testBed.notePopupService.activePopup).toBeNull();
    });

    it('restores the previous note text when an edit cannot be saved', async () => {
        const testBed = createMountedNote();

        testBed.commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
            unitId: UNIT_ID,
            sheetId: SUB_UNIT_ID,
            row: 2,
            col: 3,
            note: {
                id: 'existing-note',
                width: 180,
                height: 96,
                note: 'Original note',
            },
        });
        testBed.commandService.unregisterCommand(UpdateNoteMutation.id);
        testBed.commandService.registerCommand(FailingUpdateNoteMutation);

        await renderNote(root!, testBed);
        await act(async () => {
            await awaitTime(350);
        });

        const textarea = container!.querySelector('textarea') as HTMLTextAreaElement;

        await act(async () => {
            inputText(textarea, 'Unsaved edit');
            await awaitTime(350);
        });

        const note = testBed.noteModel.getNote(UNIT_ID, SUB_UNIT_ID, { row: 2, col: 3 });
        expect(note?.note).toBe('Original note');
        expect(textarea.value).toBe('Original note');
    });
});
