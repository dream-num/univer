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

import type { ICommand } from '@univerjs/core';
import { awaitTime, BooleanNumber, DocumentFlavor, ICommandService, LocaleService, LocaleType, UndoCommand } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { DocParagraphSettingCommand } from '../../../commands/commands/doc-paragraph-setting.command';
import enUS from '../../../locale/en-US';
import { ParagraphWordWrapSetting } from '../ParagraphWordWrapSetting';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });

it('shows mixed paragraph settings, applies the checkbox and restores inherited values on undo', async () => {
    const { univer, injector, doc } = createCommandTestBed({
        id: 'test-doc',
        documentStyle: { documentFlavor: DocumentFlavor.MODERN },
        body: {
            dataStream: 'one\rtwo\r\n',
            paragraphs: [
                { startIndex: 3, paragraphId: 'one', paragraphStyle: { wordWrap: BooleanNumber.TRUE } },
                { startIndex: 7, paragraphId: 'two' },
            ],
        },
    });
    const commands = injector.get(ICommandService);
    commands.registerCommand(DocParagraphSettingCommand);
    commands.registerCommand(SetTextSelectionsOperation);
    commands.registerCommand(RichTextEditingMutation as unknown as ICommand);
    const selection = injector.get(DocSelectionManagerService);
    selection.__TEST_ONLY_setCurrentSelection({ unitId: 'test-doc', subUnitId: 'test-doc' });
    selection.__TEST_ONLY_add([{ startOffset: 0, endOffset: 7, collapsed: false, isActive: true, segmentId: '', style: null! }]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
        await act(async () => {
            root.render(<RediContext.Provider value={{ injector }}><ConfigProvider mountContainer={container}><ParagraphWordWrapSetting /></ConfigProvider></RediContext.Provider>);
        });
        const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
        expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
        await act(async () => {
            checkbox.click();
            await awaitTime(0);
        });
        expect(checkbox.getAttribute('aria-checked')).not.toBe('mixed');
        expect(doc.getBody()!.paragraphs!.map((p) => p.paragraphStyle?.wordWrap)).toEqual([1, 1]);
        await act(async () => {
            checkbox.click();
            await awaitTime(0);
        });
        expect(checkbox.checked).toBe(false);
        expect(doc.getBody()!.paragraphs!.map((p) => p.paragraphStyle?.wordWrap)).toEqual([0, 0]);
        await act(async () => {
            await commands.executeCommand(UndoCommand.id);
        });
        expect(checkbox.checked).toBe(true);
        await act(async () => {
            await commands.executeCommand(UndoCommand.id);
        });
        expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
        expect(doc.getBody()!.paragraphs!.map((p) => p.paragraphStyle?.wordWrap)).toEqual([1, undefined]);
    } finally {
        await act(async () => root.unmount());
        container.remove();
        univer.dispose();
    }
});
