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

import type { DocumentDataModel, ICommand, IDocumentData } from '@univerjs/core';
import type { DateTimeFieldFormat } from '../../../utils/date-time-field';
import {
    BooleanNumber,
    CustomRangeType,
    DataStreamTreeTokenType,
    FOCUSING_DOC,
    FOCUSING_UNIVER_EDITOR,
    ICommandService,
    IContextService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    InsertTextCommand,
    RichTextEditingMutation,
    setDocumentPermissionValue,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import {
    IPlatformService,
    IUIRuntimeScopeService,
    KeyCode,
    PlatformService,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { UpdateDocFieldsShortcut } from '../../../shortcuts/format.shortcut';
import { createDateTimeField } from '../../../utils/date-time-field';
import {
    RefreshHeaderFooterFieldsCommand,
    UpdateSelectedDocFieldsCommand,
} from '../refresh-header-footer-fields.command';

const cleanups: Array<() => void> = [];
afterEach(() => {
    cleanups.splice(0).reverse().forEach((dispose) => dispose());
    vi.useRealTimers();
});

function createTestBed(locked = false, multipleStories = false, format: DateTimeFieldFormat = 'long') {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 29, 13, 14, 15));
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    injector.add([DocStateChangeManagerService]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const properties = createDateTimeField(format, 'en-US', new Date(2026, 4, 1));
    const text = `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${properties.cachedResult}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`;
    const snapshot: IDocumentData = {
        id: 'refresh-doc',
        body: { dataStream: 'Body\r\n' },
        documentStyle: {},
        headers: { header: { headerId: 'header', body: {
            dataStream: `${text} fixed\r\n`,
            customRanges: [{ rangeId: 'date-field', startIndex: 0, endIndex: text.length - 1, rangeType: CustomRangeType.FIELD, properties: { ...properties, locked: locked ? BooleanNumber.TRUE : BooleanNumber.FALSE } }],
            textRuns: [{ st: 0, ed: text.length, ts: { lang: 'en-US', bl: BooleanNumber.TRUE } }],
            paragraphs: [{ paragraphId: 'date-paragraph', startIndex: text.length + 6 }],
            customDecorations: [],
            customBlocks: [],
        } } },
    };
    if (multipleStories) {
        snapshot.body = JSON.parse(JSON.stringify(snapshot.headers!.header.body));
        snapshot.footers = { footer: { footerId: 'footer', body: JSON.parse(JSON.stringify(snapshot.body)) } };
    }
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, snapshot);
    injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
    const commands = injector.get(ICommandService);
    for (const command of [RefreshHeaderFooterFieldsCommand, UpdateSelectedDocFieldsCommand, InsertTextCommand, RichTextEditingMutation, SetTextSelectionsOperation]) {
        commands.registerCommand(command as ICommand);
    }
    injector.get(DocStateChangeManagerService);
    return { commands, model, injector };
}

describe('RefreshHeaderFooterFieldsCommand', () => {
    it('updates the cached value and offsets together, preserves text and supports undo/redo', async () => {
        const { commands, model, injector } = createTestBed();
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        expect(await commands.executeCommand(RefreshHeaderFooterFieldsCommand.id, { unitId: model.getUnitId() })).toBe(true);
        injector.get(DocStateChangeManagerService).flushPendingChanges(model.getUnitId());
        const body = model.getSelfOrHeaderFooterModel('header')!.getBody()!;
        expect(body.dataStream).toBe(`${DataStreamTreeTokenType.CUSTOM_RANGE_START}September 29, 2026${DataStreamTreeTokenType.CUSTOM_RANGE_END} fixed\r\n`);
        expect(body.customRanges?.[0]).toMatchObject({ startIndex: 0, endIndex: 19, properties: { cachedResult: 'September 29, 2026' } });
        expect(body.paragraphs?.[0].startIndex).toBe(body.dataStream.length - 2);
        const after = JSON.parse(JSON.stringify(model.getSnapshot()));
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSnapshot()).toEqual(before);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(model.getSnapshot()).toEqual(after);
    });

    it.each([true, false])('preserves locked or read-only fields (locked=%s)', async (locked) => {
        const { commands, model, injector } = createTestBed(locked);
        if (!locked) {
            setDocumentPermissionValue(injector.get(IPermissionService), model.getUnitId(), model.getUnitId(), UnitAction.Edit, false);
        }
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        expect(await commands.executeCommand(RefreshHeaderFooterFieldsCommand.id, { unitId: model.getUnitId() })).toBe(true);
        expect(model.getSnapshot()).toEqual(before);
    });

    it.each(['', 'header', 'footer'])('updates only the selected story after editing a date result (%s)', async (segmentId) => {
        const { commands, model, injector } = createTestBed(false, true);
        const selections = injector.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
        selections.__TEST_ONLY_add([{ startOffset: 2, endOffset: 2, collapsed: true, isActive: true, segmentId }]);
        const body = model.getSelfOrHeaderFooterModel(segmentId)!.getBody()!;
        const originalEnd = body.customRanges![0].endIndex;
        expect(await commands.executeCommand(InsertTextCommand.id, {
            unitId: model.getUnitId(),
            segmentId,
            debounce: false,
            range: { startOffset: 1, endOffset: originalEnd, collapsed: false },
            body: { dataStream: 'edited' },
            textRanges: [{ startOffset: 2, endOffset: 2, collapsed: true, isActive: true, segmentId }],
        })).toBe(true);
        injector.get(DocStateChangeManagerService).flushPendingChanges(model.getUnitId());
        expect(body.dataStream).toContain('edited');
        expect(body.customRanges![0].properties?.fieldType).toBe('DATE');
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        expect(await commands.executeCommand(UpdateSelectedDocFieldsCommand.id)).toBe(true);
        injector.get(DocStateChangeManagerService).flushPendingChanges(model.getUnitId());
        expect(body.dataStream).toContain('September 29, 2026');
        for (const [other, original] of Object.entries({ '': before.body, header: before.headers.header.body, footer: before.footers.footer.body }).filter(([id]) => id !== segmentId)) {
            expect(model.getSelfOrHeaderFooterModel(other)!.getBody()).toEqual(original);
        }
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getSnapshot()).toEqual(before);
    });

    it.each([
        ['', 'long'],
        ['header', 'long'],
        ['footer', 'long'],
        ['', 'time'],
        ['header', 'time'],
        ['footer', 'time'],
    ] as const)('routes F9 through the keyboard service to refresh the edited %s %s field only when focused', async (segmentId, format) => {
        const { commands, model, injector } = createTestBed(false, true, format);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
        injector.add([ShortcutService]);
        const shortcuts = injector.get(ShortcutService);
        cleanups.push(() => shortcuts.dispose());
        const registration = shortcuts.registerShortcut(UpdateDocFieldsShortcut);
        cleanups.push(() => registration.dispose());
        const selections = injector.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
        selections.__TEST_ONLY_add([{ startOffset: 2, endOffset: 2, collapsed: true, isActive: true, segmentId }]);
        await commands.executeCommand(InsertTextCommand.id, {
            unitId: model.getUnitId(),
            segmentId,
            debounce: true,
            range: { startOffset: 2, endOffset: 2, collapsed: true },
            body: { dataStream: 'X' },
            textRanges: [{ startOffset: 3, endOffset: 3, collapsed: true, isActive: true, segmentId }],
        });
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        const context = injector.get(IContextService);
        context.setContextValue(FOCUSING_DOC, true);
        context.setContextValue(FOCUSING_UNIVER_EDITOR, false);
        const unfocused = new KeyboardEvent('keydown', { key: 'F9', keyCode: KeyCode.F9, bubbles: true, cancelable: true });
        window.dispatchEvent(unfocused);
        expect(unfocused.defaultPrevented).toBe(false);
        expect(model.getSnapshot()).toEqual(before);
        context.setContextValue(FOCUSING_UNIVER_EDITOR, true);
        const complete = new Promise<void>((resolve) => {
            const listener = commands.onCommandExecuted((info) => {
                if (info.id === UpdateSelectedDocFieldsCommand.id) {
                    listener.dispose();
                    resolve();
                }
            });
            cleanups.push(() => listener.dispose());
        });
        const focused = new KeyboardEvent('keydown', { key: 'F9', keyCode: KeyCode.F9, bubbles: true, cancelable: true });
        window.dispatchEvent(focused);
        await complete;
        expect(focused.defaultPrevented).toBe(true);
        const body = model.getSelfOrHeaderFooterModel(segmentId)!.getBody()!;
        expect(body.dataStream).toContain(format === 'time' ? '13:14:15' : 'September 29, 2026');
        for (const [other, original] of Object.entries({ '': before.body, header: before.headers.header.body, footer: before.footers.footer.body }).filter(([id]) => id !== segmentId)) {
            expect(model.getSelfOrHeaderFooterModel(other)!.getBody()).toEqual(original);
        }
        const after = JSON.parse(JSON.stringify(model.getSnapshot()));
        await commands.executeCommand(UndoCommand.id);
        expect(model.getSnapshot()).toEqual(before);
        await commands.executeCommand(RedoCommand.id);
        expect(model.getSnapshot()).toEqual(after);
    });

    it.each(['', 'FIXED'])('does not recreate a removed field after replacing it with %j', async (replacement) => {
        const { commands, model, injector } = createTestBed();
        const selections = injector.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
        const body = model.getSelfOrHeaderFooterModel('header')!.getBody()!;
        await commands.executeCommand(InsertTextCommand.id, {
            unitId: model.getUnitId(),
            segmentId: 'header',
            debounce: false,
            range: { startOffset: 0, endOffset: body.customRanges![0].endIndex + 1, collapsed: false },
            body: { dataStream: replacement },
            textRanges: [{ startOffset: replacement.length, endOffset: replacement.length, collapsed: true, segmentId: 'header' }],
        });
        expect(body.customRanges).toEqual([]);
        expect(body.dataStream).toBe(`${replacement} fixed\r\n`);
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        await commands.executeCommand(UpdateSelectedDocFieldsCommand.id);
        expect(model.getSnapshot()).toEqual(before);
    });

    it('does not update any field with a caret outside the field', async () => {
        const { commands, model, injector } = createTestBed();
        const selections = injector.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
        selections.__TEST_ONLY_add([{ startOffset: 0, endOffset: 0, collapsed: true, isActive: true, segmentId: 'header' }]);
        const before = JSON.parse(JSON.stringify(model.getSnapshot()));
        expect(await commands.executeCommand(UpdateSelectedDocFieldsCommand.id)).toBe(true);
        expect(model.getSnapshot()).toEqual(before);
    });
});
