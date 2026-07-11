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

import type { ICommand, IDisposable, IDocumentData, Injector } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    HorizontalAlign,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FUniver } from '../f-univer';

const TEST_COMMAND_ID = 'test.facade.command';
const TEST_MUTATION_ID = 'test.facade.mutation';

function createDocData(id: string): Partial<IDocumentData> {
    return {
        id,
        body: {
            dataStream: 'Hello\r\n',
        },
        documentStyle: {
            pageSize: { width: 100, height: 100 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
    };
}

describe('FUniver integration', () => {
    let univer: Univer;
    let univerAPI: FUniver;

    beforeEach(() => {
        univer = new Univer();
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'sheet-for-facade',
            name: 'Sheet',
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    name: 'Sheet1',
                    cellData: {},
                    rowCount: 5,
                    columnCount: 5,
                },
            },
        });
        univerAPI = FUniver.newAPI(univer);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should bridge lifecycle, locale, unit and command flows through the facade api', async () => {
        const injector = univer.__getInjector();
        const commandService = injector.get(ICommandService);
        const localeService = injector.get(LocaleService);
        const themeService = injector.get(ThemeService);
        const logs: string[] = [];
        const disposables: IDisposable[] = [];

        commandService.registerCommand({
            id: TEST_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: (_accessor, params?: { value: string }) => params ? params.value === 'ok' : false,
        } as ICommand<{ value: string }, boolean>);

        disposables.push(
            univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => logs.push(`lifecycle:${stage}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, ({ id }) => logs.push(`before:${id}`)),
            univerAPI.addEvent(univerAPI.Event.CommandExecuted, ({ id }) => logs.push(`after:${id}`)),
            univerAPI.addEvent(univerAPI.Event.DocCreated, ({ unitId }) => logs.push(`doc-created:${unitId}`)),
            univerAPI.addEvent(univerAPI.Event.DocDisposed, ({ unitId }) => logs.push(`doc-disposed:${unitId}`))
        );

        univerAPI.loadLocales('esES', {
            facade: { hello: 'Hola {0}' },
        } as never);
        univerAPI.setLocale('esES');
        univerAPI.toggleDarkMode(true);

        expect(localeService.getCurrentLocale()).toBe('esES');
        expect(localeService.t('facade.hello', 'Univer')).toBe('Hola Univer');
        expect(themeService.darkMode).toBe(true);

        expect(await univerAPI.executeCommand(TEST_COMMAND_ID, { value: 'ok' })).toBe(true);
        expect(univerAPI.syncExecuteCommand(TEST_COMMAND_ID, { value: 'ok' })).toBe(true);

        const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocData('doc-from-facade'));
        expect(univerAPI.getCurrentLifecycleStage()).toBeGreaterThanOrEqual(1);
        expect(univerAPI.disposeUnit(doc.getUnitId())).toBe(true);

        const user = univerAPI.getUserManager().getCurrentUser();
        expect(user).toBeDefined();

        const blob = univerAPI.newBlob()
            .setDataFromString('facade-data', 'text/plain')
            .getAs('text/csv');

        expect(await blob.getDataAsString()).toBe('facade-data');
        expect(blob.getContentType()).toBe('text/csv');
        expect((await blob.copyBlob().getBytes()).length).toBeGreaterThan(0);

        const textStyle = univerAPI.newTextStyle({
            ff: 'Inter',
            fs: 12,
        }).build();
        const paragraph = univerAPI.newParagraphStyle({
            horizontalAlign: HorizontalAlign.CENTER,
            textStyle,
        }).build();

        expect(textStyle.ff).toBe('Inter');
        expect(paragraph.horizontalAlign).toBe(HorizontalAlign.CENTER);
        expect(univerAPI.newTextDecoration({ s: univerAPI.Enum.BooleanNumber.TRUE }).build().s).toBe(univerAPI.Enum.BooleanNumber.TRUE);
        const richTextBody = univerAPI.newRichTextValue(createDocData('facade-rich-text') as IDocumentData).getData().body;
        if (!richTextBody) {
            throw new Error('Expected rich text value to keep the document body.');
        }
        expect(richTextBody.dataStream).toBe('Hello\r\n');
        expect(univerAPI.Util.rectangle.intersects(
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }
        )).toBe(true);
        expect(univerAPI.Util.numfmt.format('#,##0.00', 1234.5)).toBe('1,234.50');

        expect(logs).toEqual(expect.arrayContaining([
            `before:${TEST_COMMAND_ID}`,
            `after:${TEST_COMMAND_ID}`,
            'doc-created:doc-from-facade',
            'doc-disposed:doc-from-facade',
        ]));

        disposables.forEach((disposable) => disposable.dispose());
    });

    it('should support cancelable commands and undo-redo facade events', async () => {
        const injector = univer.__getInjector();
        const commandService = injector.get(ICommandService);
        const undoRedoService = injector.get(IUndoRedoService);
        injector.get(IUniverInstanceService).focusUnit('sheet-for-facade');
        const executed: string[] = [];
        const undoRedoLogs: string[] = [];

        commandService.registerCommand({
            id: TEST_COMMAND_ID,
            type: CommandType.COMMAND,
            handler: () => {
                executed.push('command');
                return true;
            },
        } as ICommand);
        commandService.registerCommand({
            id: TEST_MUTATION_ID,
            type: CommandType.MUTATION,
            handler: (_accessor, params?: { label: string }) => {
                executed.push(params ? params.label : 'mutation');
                return true;
            },
        } as ICommand<{ label: string }, boolean>);

        const cancelCommand = univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event) => {
            if (event.id === TEST_COMMAND_ID) {
                event.cancel = true;
            }
        });

        expect(await univerAPI.executeCommand(TEST_COMMAND_ID)).toBe(false);
        expect(executed).toEqual([]);
        cancelCommand.dispose();

        undoRedoService.pushUndoRedo({
            unitID: 'sheet-for-facade',
            id: 'undo-item',
            undoMutations: [{ id: TEST_MUTATION_ID, params: { label: 'undo' } }],
            redoMutations: [{ id: TEST_MUTATION_ID, params: { label: 'redo' } }],
        });

        const beforeUndo = univerAPI.addEvent(univerAPI.Event.BeforeUndo, (event) => {
            undoRedoLogs.push(`before-undo:${event.id}`);
            event.cancel = true;
        });

        expect(await univerAPI.undo()).toBe(false);
        expect(executed).toEqual([]);

        beforeUndo.dispose();

        const beforeRedo = univerAPI.addEvent(univerAPI.Event.BeforeRedo, ({ id }) => undoRedoLogs.push(`before-redo:${id}`));
        const undoEvent = univerAPI.addEvent(univerAPI.Event.Undo, ({ id }) => undoRedoLogs.push(`undo:${id}`));
        const redoEvent = univerAPI.addEvent(univerAPI.Event.Redo, ({ id }) => undoRedoLogs.push(`redo:${id}`));

        expect(await univerAPI.undo()).toBe(true);
        expect(await univerAPI.redo()).toBe(true);
        expect(executed).toEqual(['undo', 'redo']);
        expect(undoRedoLogs).toEqual(expect.arrayContaining([
            'before-undo:univer.command.undo',
            'undo:univer.command.undo',
            'before-redo:univer.command.redo',
            'redo:univer.command.redo',
        ]));

        beforeRedo.dispose();
        undoEvent.dispose();
        redoEvent.dispose();
    });

    it('should expose extension hooks, locale getters, command hooks, and builder factories', async () => {
        const injector = univer.__getInjector();
        const commandService = injector.get(ICommandService);
        const observed: string[] = [];

        class FacadeExtension {
            static staticValue = 'extended';

            _initialize(_injector: Injector) {
                observed.push('initialized');
            }

            extendedMethod() {
                return 'method-result';
            }
        }

        FUniver.extend(FacadeExtension);
        const extendedAPI = FUniver.newAPI(injector) as FUniver & { extendedMethod: () => string };

        expect((FUniver as unknown as { staticValue: string }).staticValue).toBe('extended');
        expect(extendedAPI.extendedMethod()).toBe('method-result');
        expect(observed).toContain('initialized');

        commandService.registerCommand({
            id: 'facade.hook.command',
            type: CommandType.COMMAND,
            handler: (_accessor, params?: { value: string }) => params ? params.value === 'ok' : false,
        } as ICommand<{ value: string }, boolean>);

        const hookEvents: string[] = [];
        const beforeDisposable = extendedAPI.onBeforeCommandExecute((command, options) => hookEvents.push(`before:${command.id}:${options ? options.fromCollab : undefined}`));
        const afterDisposable = extendedAPI.onCommandExecuted((command, options) => hookEvents.push(`after:${command.id}:${options ? options.fromCollab : undefined}`));

        await expect(extendedAPI.executeCommand('facade.hook.command', { value: 'ok' }, { fromCollab: true })).resolves.toBe(true);
        expect(extendedAPI.syncExecuteCommand('facade.hook.command', { value: 'ok' }, { fromCollab: false })).toBe(true);
        expect(hookEvents).toEqual([
            'before:facade.hook.command:true',
            'after:facade.hook.command:true',
            'before:facade.hook.command:false',
            'after:facade.hook.command:false',
        ]);

        extendedAPI.loadLocales('frFR', { facade: { hello: 'Bonjour {0}' } } as never);
        extendedAPI.setLocale('frFR');
        expect(extendedAPI.getCurrentLocale()).toBe('frFR');
        const locales = extendedAPI.getLocales();
        if (!locales) {
            throw new Error('Expected loaded facade locales to be available.');
        }
        expect((locales.facade as { hello: string }).hello).toBe('Bonjour {0}');

        expect(() => extendedAPI.addEvent('' as never, () => {})).toThrow('Cannot add empty event');
        expect(extendedAPI.fireEvent(extendedAPI.Event.CommandExecuted, { id: 'manual', type: CommandType.COMMAND, params: undefined })).toBeUndefined();

        const documentData = createDocData('facade-builder') as IDocumentData;
        expect(extendedAPI.newRichTextFromDocumentData(documentData).getData().id).toBe('facade-builder');
        expect(extendedAPI.newParagraphStyleValue({ horizontalAlign: HorizontalAlign.RIGHT }).horizontalAlign).toBe(HorizontalAlign.RIGHT);
        expect(extendedAPI.newTextStyleValue({ ff: 'Inter', fs: 14, bl: BooleanNumber.TRUE }).fontFamily).toBe('Inter');
        expect(extendedAPI.newTextStyleValue({ ff: 'Inter', fs: 14, bl: BooleanNumber.TRUE }).bold).toBe(true);

        beforeDisposable.dispose();
        afterDisposable.dispose();
    });
});
