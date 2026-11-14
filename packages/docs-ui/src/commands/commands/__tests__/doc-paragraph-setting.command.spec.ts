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

import type { ICommand, IDocumentData } from '@univerjs/core';
import { awaitTime, BooleanNumber, DocStyleType, DocumentFlavor, ICommandService, NumberUnitType, RedoCommand, resolveDocumentParagraphWordWrap, UndoCommand } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { describe, expect, it } from 'vitest';
import { DocParagraphSettingCommand } from '../doc-paragraph-setting.command';
import { createCommandTestBed } from './create-command-test-bed';

it('persists paragraph word wrapping through mutations, undo and redo without changing inherited styles', async () => {
    const data: IDocumentData = {
        id: 'test-doc',
        documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, defaultParagraphStyle: { wordWrap: BooleanNumber.TRUE } },
        styles: { keep: { name: 'Keep words', type: DocStyleType.paragraph, paragraphStyle: { wordWrap: BooleanNumber.FALSE } } },
        body: {
            dataStream: '오늘 전략을\r오늘 전략을\r\n',
            paragraphs: [
                { startIndex: 6, paragraphId: 'first', styleId: 'keep', paragraphStyle: { spaceAbove: { v: 24 } } },
                { startIndex: 13, paragraphId: 'second' },
            ],
        },
    };
    const { univer, get, doc } = createCommandTestBed(data);
    try {
        const commands = get(ICommandService);
        commands.registerCommand(DocParagraphSettingCommand);
        commands.registerCommand(SetTextSelectionsOperation);
        commands.registerCommand(RichTextEditingMutation as unknown as ICommand);
        const selection = get(DocSelectionManagerService);
        selection.__TEST_ONLY_setCurrentSelection({ unitId: data.id, subUnitId: data.id });
        selection.__TEST_ONLY_add([{ startOffset: 0, endOffset: 13, collapsed: false, isActive: true, segmentId: '', style: null! }]);
        const values = () => doc.getBody()!.paragraphs!.map((paragraph) => resolveDocumentParagraphWordWrap(doc.getSnapshot(), paragraph));
        expect(values()).toEqual([0, 1]);
        for (const wordWrap of [BooleanNumber.FALSE, BooleanNumber.TRUE]) {
            expect(await commands.executeCommand(DocParagraphSettingCommand.id, { paragraph: { wordWrap } })).toBe(true);
            await awaitTime(0);
            expect(values()).toEqual([wordWrap, wordWrap]);
            const saved = JSON.parse(JSON.stringify(doc.getSnapshot())) as IDocumentData;
            expect(saved.body!.paragraphs!.map((paragraph) => paragraph.paragraphStyle?.wordWrap)).toEqual([wordWrap, wordWrap]);
        }
        await commands.executeCommand(UndoCommand.id);
        expect(values()).toEqual([0, 0]);
        await commands.executeCommand(UndoCommand.id);
        expect(values()).toEqual([0, 1]);
        expect(doc.getBody()!.paragraphs!.every((paragraph) => !Object.hasOwn(paragraph.paragraphStyle ?? {}, 'wordWrap'))).toBe(true);
        await commands.executeCommand(RedoCommand.id);
        expect(values()).toEqual([0, 0]);
        expect(doc.getBody()!.paragraphs![0].paragraphStyle?.spaceAbove).toEqual({ v: 24 });
        expect(doc.getSnapshot().styles).toEqual(data.styles);
        expect(doc.getSnapshot().documentStyle.defaultParagraphStyle).toEqual(data.documentStyle.defaultParagraphStyle);
    } finally {
        univer.dispose();
    }
});

describe('DocParagraphSettingCommand', () => {
    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('clears inherited line spacing for absolute edits with undo and redo (%s)', async (documentFlavor) => {
        const data: IDocumentData = {
            id: 'test-doc',
            documentStyle: { documentFlavor },
            styles: { base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: {
                spaceAbove: { v: 2, u: NumberUnitType.LINE, fallback: 12 },
                spaceBelow: { v: 3, u: NumberUnitType.LINE, fallback: 12 },
            } } },
            body: { dataStream: 'Text\r\n', paragraphs: [{ startIndex: 4, paragraphId: 'paragraph', styleId: 'base' }], sectionBreaks: [] },
        };
        const { univer, get, doc } = createCommandTestBed(data);
        try {
            const commands = get(ICommandService);
            for (const command of [DocParagraphSettingCommand, SetTextSelectionsOperation, RichTextEditingMutation]) {
                commands.registerCommand(command as ICommand);
            }
            const selection = get(DocSelectionManagerService);
            selection.__TEST_ONLY_setCurrentSelection({ unitId: 'test-doc', subUnitId: 'test-doc' });
            selection.__TEST_ONLY_add([{ startOffset: 0, endOffset: 0, collapsed: true, isActive: true, segmentId: '', style: null as never }]);
            for (const value of [0, 24]) {
                const before = doc.getBody()?.paragraphs?.[0].paragraphStyle;
                const update = { spaceAbove: { v: value }, spaceBelow: { v: 16 } };
                expect(await commands.executeCommand(DocParagraphSettingCommand.id, { paragraph: update })).toBe(true);
                const expected = documentFlavor === DocumentFlavor.TRADITIONAL
                    ? { spaceAbove: { v: 0, u: NumberUnitType.LINE, fallback: value }, spaceBelow: { v: 0, u: NumberUnitType.LINE, fallback: 16 } }
                    : update;
                expect(doc.getBody()?.paragraphs?.[0].paragraphStyle).toEqual(expected);
                expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
                expect(doc.getBody()?.paragraphs?.[0].paragraphStyle).toEqual(before);
                expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
                expect(doc.getBody()?.paragraphs?.[0].paragraphStyle).toEqual(expected);
                expect(update).toEqual({ spaceAbove: { v: value }, spaceBelow: { v: 16 } });
            }
        } finally {
            univer.dispose();
        }
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('clears inherited character indents for absolute edits with undo and redo (%s)', async (documentFlavor) => {
        const data: IDocumentData = {
            id: 'test-doc',
            documentStyle: { documentFlavor },
            styles: {
                base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: {
                    indentStart: { v: 2, u: NumberUnitType.CHARACTER, fallback: 12 },
                    hanging: { v: 2, u: NumberUnitType.CHARACTER, fallback: 12 },
                } },
            },
            body: {
                dataStream: 'Text\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'paragraph', styleId: 'base' }],
                sectionBreaks: [],
            },
        };
        const { univer, get, doc } = createCommandTestBed(data);
        try {
            const commands = get(ICommandService);
            for (const command of [DocParagraphSettingCommand, SetTextSelectionsOperation, RichTextEditingMutation]) {
                commands.registerCommand(command as ICommand);
            }
            const selection = get(DocSelectionManagerService);
            selection.__TEST_ONLY_setCurrentSelection({ unitId: 'test-doc', subUnitId: 'test-doc' });
            selection.__TEST_ONLY_add([{
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                isActive: true,
                segmentId: '',
                style: null as never,
            }]);
            const update = { indentStart: { v: 24 }, indentFirstLine: { v: 16 } };
            expect(await commands.executeCommand(DocParagraphSettingCommand.id, { paragraph: update })).toBe(true);
            const expected = documentFlavor === DocumentFlavor.TRADITIONAL
                ? {
                    indentStart: { v: 0, u: NumberUnitType.CHARACTER, fallback: 24 },
                    indentFirstLine: { v: 0, u: NumberUnitType.CHARACTER, fallback: 16 },
                }
                : update;
            expect(doc.getBody()?.paragraphs?.[0].paragraphStyle).toEqual(expected);
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(doc.getBody()?.paragraphs?.[0].paragraphStyle).toBeUndefined();
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(doc.getBody()?.paragraphs?.[0].paragraphStyle).toEqual(expected);
            expect(update).toEqual({ indentStart: { v: 24 }, indentFirstLine: { v: 16 } });
        } finally {
            univer.dispose();
        }
    });
});
