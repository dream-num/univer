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

import type { ICommand, IDocumentBody, IDocumentData, IListData } from '@univerjs/core';
import {
    BooleanNumber,
    BulletAlignment,
    DocStyleType,
    HorizontalAlign,
    ICommandService,
    NamedStyleType,
    RedoCommand,
    Tools,
    UndoCommand,
} from '@univerjs/core';
import { RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { describe, expect, it, vi } from 'vitest';
import { ApplyTextFormatPainterCommand, captureTextFormat } from '../format-painter.command';
import { createCommandTestBed } from './create-command-test-bed';

const body = {
    dataStream: 'source\rtarget\r\n',
    customRanges: [],
    customDecorations: [],
    textRuns: [{ st: 0, ed: 6, ts: { fs: 24 } }, { st: 7, ed: 13, ts: { fs: 10, bl: BooleanNumber.TRUE } }],
    paragraphs: [
        { startIndex: 6, paragraphId: 'para_source', paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } },
        { startIndex: 13, paragraphId: 'para_target', bullet: { listId: 'target-list', listType: 'ORDER_LIST', nestingLevel: 0 }, paragraphStyle: { horizontalAlign: HorizontalAlign.RIGHT } },
    ],
};

describe('text format painter', () => {
    it('takes paragraph formatting only when the paragraph mark is included and detaches the sample', () => {
        const source = Tools.deepClone(body);
        const character = captureTextFormat(source, { startOffset: 0, endOffset: 6 });
        expect(character.paragraphStyle).toBeUndefined();
        expect(captureTextFormat(source, { startOffset: 0, endOffset: 7 }).paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
        source.textRuns[0].ts.fs = 99;
        expect(character.textStyle.fs).toBe(24);
    });

    it('samples rendered heading and imported paragraph styles, with direct formatting taking precedence', () => {
        const source: IDocumentBody = Tools.deepClone(body);
        source.textRuns = [{ st: 0, ed: 6, ts: { it: BooleanNumber.TRUE } }];
        source.paragraphs![0].paragraphStyle = { namedStyleType: NamedStyleType.HEADING_1 };
        expect(captureTextFormat(source, { startOffset: 0, endOffset: 6 }).textStyle).toMatchObject({ fs: 20, bl: BooleanNumber.TRUE, it: BooleanNumber.TRUE });
        source.paragraphs![0].styleId = 'heading';
        const document: IDocumentData = {
            id: 'source',
            documentStyle: { textStyle: { ff: 'Georgia' } },
            styles: {
                base: { name: 'Base', type: DocStyleType.paragraph, paragraphStyle: { spaceAbove: { v: 10 } } },
                heading: { name: 'Heading', type: DocStyleType.paragraph, basedOn: 'base', paragraphStyle: { textStyle: { fs: 30, bl: BooleanNumber.FALSE } } },
            },
        };
        const format = captureTextFormat(source, { startOffset: 0, endOffset: 7 }, {}, {}, document);
        expect(format.textStyle).toMatchObject({ ff: 'Georgia', fs: 30, bl: BooleanNumber.FALSE, it: BooleanNumber.TRUE });
        expect(format.paragraphStyle?.spaceAbove).toEqual({ v: 10 });
    });

    it('clears inherited target emphasis and paragraph style references while retaining identity and undo', async () => {
        const source: IDocumentBody = Tools.deepClone(body);
        source.paragraphs![1].styleId = 'heading';
        const bed = createCommandTestBed({
            id: 'test-doc',
            body: source,
            documentStyle: {},
            styles: { heading: { name: 'Heading', type: DocStyleType.paragraph, paragraphStyle: { textStyle: { bl: BooleanNumber.TRUE, it: BooleanNumber.TRUE } } } },
        });
        const commands = bed.get(ICommandService);
        [ApplyTextFormatPainterCommand, RichTextEditingMutation, SetTextSelectionsOperation].forEach((command) => commands.registerCommand(command as ICommand));
        const before = Tools.deepClone(bed.doc.getSnapshot());
        try {
            expect(await commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                unitId: 'test-doc',
                ranges: [{ startOffset: 7, endOffset: 13 }],
                format: captureTextFormat(body, { startOffset: 0, endOffset: 6 }),
            })).toBe(true);
            const character = captureTextFormat(bed.doc.getBody()!, { startOffset: 7, endOffset: 13 }, {}, {}, bed.doc.getSnapshot());
            expect(character.textStyle).toMatchObject({ fs: 24, bl: BooleanNumber.FALSE, it: BooleanNumber.FALSE });
            expect(bed.doc.getBody()?.paragraphs?.[1].styleId).toBe('heading');
            await commands.executeCommand(UndoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(before);
            expect(await commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                unitId: 'test-doc',
                ranges: [{ startOffset: 7, endOffset: 14 }],
                format: captureTextFormat(body, { startOffset: 0, endOffset: 7 }),
            })).toBe(true);
            expect(bed.doc.getBody()?.paragraphs?.[1].styleId).toBeUndefined();
            expect(bed.doc.getBody()?.paragraphs?.[1].paragraphId).toBe(before.body?.paragraphs?.[1].paragraphId);
            await commands.executeCommand(UndoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(before);
        } finally {
            bed.univer.dispose();
        }
    });

    it('paints a clicked word on browsers without Intl.Segmenter', async () => {
        const segmenter = Intl.Segmenter;
        vi.stubGlobal('Intl', new Proxy(Intl, { get: (target, property) => property === 'Segmenter' ? undefined : Reflect.get(target, property) }));
        const bed = createCommandTestBed({ id: 'test-doc', body: Tools.deepClone(body), documentStyle: {} });
        const commands = bed.get(ICommandService);
        [ApplyTextFormatPainterCommand, RichTextEditingMutation, SetTextSelectionsOperation].forEach((command) => commands.registerCommand(command as ICommand));
        try {
            expect(await commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                unitId: 'test-doc',
                ranges: [{ startOffset: 9, endOffset: 9 }],
                format: { textStyle: { fs: 24 } },
            })).toBe(true);
            expect(bed.doc.getBody()?.textRuns?.find((run) => run.st === 7)).toMatchObject({ st: 7, ed: 13, ts: { fs: 24 } });
            expect(bed.doc.getBody()?.dataStream).toBe(body.dataStream);
        } finally {
            bed.univer.dispose();
            vi.unstubAllGlobals();
        }
        expect(Intl.Segmenter).toBe(segmenter);
    });

    it('clears character and paragraph formatting while retaining content and supporting undo', async () => {
        const bed = createCommandTestBed({ id: 'test-doc', body: Tools.deepClone(body), documentStyle: {} });
        const commands = bed.get(ICommandService);
        [ApplyTextFormatPainterCommand, RichTextEditingMutation, SetTextSelectionsOperation].forEach((command) => commands.registerCommand(command as ICommand));
        const before = Tools.deepClone(bed.doc.getSnapshot());
        try {
            const format = captureTextFormat({ dataStream: '' }, { startOffset: 0, endOffset: 0 });
            expect(await commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                unitId: 'test-doc',
                ranges: [{ startOffset: 7, endOffset: 14 }],
                format: { ...format, paragraphStyle: {} },
            })).toBe(true);
            expect(bed.doc.getBody()?.dataStream).toBe(body.dataStream);
            expect(bed.doc.getBody()?.textRuns?.find((run) => run.st === 7)?.ts).toMatchObject({ fs: 11, bl: BooleanNumber.FALSE });
            expect(bed.doc.getBody()?.paragraphs?.[1].paragraphStyle).toEqual({});
            expect(bed.doc.getBody()?.paragraphs?.[1].bullet).toBeUndefined();
            await commands.executeCommand(UndoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(before);
        } finally {
            bed.univer.dispose();
        }
    });

    it('copies a custom list definition without overwriting an existing definition and undoes both changes', async () => {
        const originalList: IListData = { listType: 'custom', nestingLevel: [{ bulletAlignment: BulletAlignment.START, glyphFormat: 'old', startNumber: 0 }] };
        const copiedList: IListData = { listType: 'custom', nestingLevel: [{ bulletAlignment: BulletAlignment.START, glyphFormat: 'new', startNumber: 0 }] };
        const bed = createCommandTestBed({ id: 'test-doc', body: Tools.deepClone(body), lists: { custom: originalList }, documentStyle: {} });
        const commands = bed.get(ICommandService);
        [ApplyTextFormatPainterCommand, RichTextEditingMutation, SetTextSelectionsOperation].forEach((command) => commands.registerCommand(command as ICommand));
        const before = Tools.deepClone(bed.doc.getSnapshot());
        try {
            expect(await commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                unitId: 'test-doc',
                ranges: [{ startOffset: 7, endOffset: 14 }],
                format: { textStyle: { fs: 24 }, paragraphStyle: {}, bullet: { listId: 'source-list', listType: 'custom', nestingLevel: 0 }, listDefinition: copiedList },
            })).toBe(true);
            const listType = bed.doc.getBody()?.paragraphs?.[1].bullet?.listType;
            expect(listType).not.toBe('custom');
            expect(bed.doc.getSnapshot().lists?.custom).toEqual(originalList);
            expect(bed.doc.getSnapshot().lists?.[listType!].nestingLevel[0].glyphFormat).toBe('new');
            await commands.executeCommand(UndoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(before);
        } finally {
            bed.univer.dispose();
        }
    });

    it('replaces formatting without changing text or paragraph identity, and supports undo/redo', async () => {
        const bed = createCommandTestBed({ id: 'test-doc', body: Tools.deepClone(body), documentStyle: {} });
        const commands = bed.get(ICommandService);
        [ApplyTextFormatPainterCommand, RichTextEditingMutation, SetTextSelectionsOperation].forEach((command) => commands.registerCommand(command as ICommand));
        const before = Tools.deepClone(bed.doc.getSnapshot());
        try {
            expect(await commands.executeCommand(ApplyTextFormatPainterCommand.id, {
                unitId: 'test-doc',
                ranges: [{ startOffset: 7, endOffset: 14 }],
                format: captureTextFormat(body, { startOffset: 0, endOffset: 7 }),
            })).toBe(true);
            expect(bed.doc.getBody()?.dataStream).toBe(body.dataStream);
            const run = bed.doc.getBody()?.textRuns?.find((item) => item.st <= 7 && item.ed > 7);
            expect(run?.ts?.fs).toBe(24);
            expect(run?.ts?.bl).toBe(BooleanNumber.FALSE);
            expect(bed.doc.getBody()?.paragraphs?.[1]).toMatchObject({ paragraphId: before.body?.paragraphs?.[1].paragraphId, paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } });
            expect(bed.doc.getBody()?.paragraphs?.[1].bullet).toBeUndefined();
            const after = Tools.deepClone(bed.doc.getSnapshot());
            await commands.executeCommand(UndoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(before);
            await commands.executeCommand(RedoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(after);
        } finally {
            bed.univer.dispose();
        }
    });
});
