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
import {
    awaitTime,
    BlockType,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    ICommandService,
} from '@univerjs/core';
import { DocBlockMoveValidatorService, RichTextEditingMutation } from '@univerjs/docs';
import { afterEach, describe, expect, it } from 'vitest';
import { buildMoveDocBlockActions, buildReplaceDocumentBodyActions, MoveDocBlockCommand } from '../doc-block-move.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('buildMoveDocBlockActions', () => {
    it('moves a paragraph and remaps paragraph indexes', () => {
        const documentData = createDocument('A\rB\rC\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_9', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_10', startIndex: 3 }, { paragraphId: 'para_docs_ui_fixture_11', startIndex: 5 }],
            sectionBreaks: [{ sectionId: 'section_fixture_205', startIndex: 6 }],
        });

        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 6,
        });

        expect(nextDocumentData.body?.dataStream).toBe('B\rC\rA\r\n');
        expect(nextDocumentData.body?.paragraphs?.map((item) => item.startIndex)).toEqual([1, 3, 5]);
        expect(movedRange).toEqual({ startOffset: 4, endOffset: 6 });
    });

    it('moves a block range as one unit', () => {
        const documentData = createDocument('aa\rBB\rcc\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_12', startIndex: 2 }, { paragraphId: 'para_docs_ui_fixture_13', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_14', startIndex: 8 }],
            sectionBreaks: [{ sectionId: 'section_fixture_206', startIndex: 9 }],
            blockRanges: [{ blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 3, endIndex: 5 }],
        });

        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 3, endOffset: 6 },
            targetOffset: 0,
        });

        expect(nextDocumentData.body?.dataStream).toBe('BB\raa\rcc\r\n');
        expect(nextDocumentData.body?.blockRanges?.[0]).toMatchObject({ startIndex: 0, endIndex: 2 });
        expect(nextDocumentData.body?.paragraphs?.map((item) => item.startIndex)).toEqual([2, 5, 8]);
        expect(movedRange).toEqual({ startOffset: 0, endOffset: 3 });
    });

    it('moves a table range and remaps custom ranges and text runs', () => {
        const documentData = createDocument('aa\rTT\rcc\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_15', startIndex: 2 }, { paragraphId: 'para_docs_ui_fixture_16', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_17', startIndex: 8 }],
            sectionBreaks: [{ sectionId: 'section_fixture_207', startIndex: 9 }],
            tables: [{ tableId: 'table-1', startIndex: 3, endIndex: 6 }],
            customRanges: [{ rangeId: 'comment-1', rangeType: CustomRangeType.COMMENT, startIndex: 6, endIndex: 7 }],
            textRuns: [{ st: 6, ed: 8, ts: {} }],
        });

        const { nextDocumentData } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 3, endOffset: 6 },
            targetOffset: 0,
        });

        expect(nextDocumentData.body?.dataStream).toBe('TT\raa\rcc\r\n');
        expect(nextDocumentData.body?.tables?.[0]).toMatchObject({ startIndex: 0, endIndex: 3 });
        expect(nextDocumentData.body?.customRanges?.[0]).toMatchObject({ startIndex: 6, endIndex: 7 });
        expect(nextDocumentData.body?.textRuns?.[0]).toMatchObject({ st: 6, ed: 8 });
    });

    it('moves a custom block paragraph and keeps the custom block attached', () => {
        const documentData = createDocument('\b\raa\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_18', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_19', startIndex: 4 }],
            sectionBreaks: [{ sectionId: 'section_fixture_208', startIndex: 5 }],
            customBlocks: [{ blockId: 'custom-1', blockType: BlockType.CUSTOM, startIndex: 0 }],
        });

        const { nextDocumentData } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 5,
        });

        expect(nextDocumentData.body?.dataStream).toBe('aa\r\b\r\n');
        expect(nextDocumentData.body?.customBlocks?.[0]).toMatchObject({ startIndex: 3 });
    });

    it('keeps the document unchanged when there is no movable body range', () => {
        const emptyDocument = createDocument('', {
            paragraphs: [],
            sectionBreaks: [],
        });

        expect(buildMoveDocBlockActions({
            documentData: emptyDocument,
            sourceRange: { startOffset: 0, endOffset: 3 },
            targetOffset: 10,
        })).toEqual({
            nextDocumentData: emptyDocument,
            movedRange: { startOffset: 0, endOffset: 3 },
        });

        const documentData = createDocument('A\rB\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_20', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_21', startIndex: 3 }],
            sectionBreaks: [{ sectionId: 'section_fixture_209', startIndex: 4 }],
        });

        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: -5, endOffset: 2 },
            targetOffset: 1,
        });

        expect(nextDocumentData.body?.dataStream).toBe('A\rB\r\n');
        expect(movedRange).toEqual({ startOffset: 0, endOffset: 2 });
    });

    it('remaps custom decorations that move with their paragraph', () => {
        const documentData = createDocument('aa\rDD\rcc\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_22', startIndex: 2 }, { paragraphId: 'para_docs_ui_fixture_23', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_24', startIndex: 8 }],
            sectionBreaks: [{ sectionId: 'section_fixture_210', startIndex: 9 }],
            customDecorations: [{ id: 'decoration-1', startIndex: 3, endIndex: 5 } as never],
        });

        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 3, endOffset: 6 },
            targetOffset: 0,
        });

        expect(nextDocumentData.body?.dataStream).toBe('DD\raa\rcc\r\n');
        expect(nextDocumentData.body?.customDecorations?.[0]).toMatchObject({ startIndex: 0, endIndex: 2 });
        expect(movedRange).toEqual({ startOffset: 0, endOffset: 3 });
    });

    it('keeps every document metadata collection ordered after moving content upward', () => {
        const documentData = createDocument('aa\rMM\rzz\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_29', startIndex: 2 }, { paragraphId: 'para_docs_ui_fixture_30', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_31', startIndex: 8 }],
            sectionBreaks: [
                { sectionId: 'section_move_two', startIndex: 6 },
                { sectionId: 'section_move_three', startIndex: 9 },
            ],
            customBlocks: [{ blockId: 'custom-2', blockType: BlockType.CUSTOM, startIndex: 3 }, { blockId: 'custom-3', blockType: BlockType.CUSTOM, startIndex: 6 }],
            tables: [{ tableId: 'table-2', startIndex: 3, endIndex: 5 }, { tableId: 'table-3', startIndex: 6, endIndex: 8 }],
            blockRanges: [{ blockId: 'quote-2', blockType: DocumentBlockRangeType.QUOTE, startIndex: 3, endIndex: 5 }, { blockId: 'quote-3', blockType: DocumentBlockRangeType.QUOTE, startIndex: 6, endIndex: 8 }],
            customRanges: [{ rangeId: 'comment-2', rangeType: CustomRangeType.COMMENT, startIndex: 3, endIndex: 5 }, { rangeId: 'comment-3', rangeType: CustomRangeType.COMMENT, startIndex: 6, endIndex: 8 }],
            customDecorations: [{ id: 'decoration-2', startIndex: 3, endIndex: 5 }, { id: 'decoration-3', startIndex: 6, endIndex: 8 }] as never,
            textRuns: [{ st: 3, ed: 5, ts: {} }, { st: 6, ed: 8, ts: {} }],
        });

        const { nextDocumentData } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 3, endOffset: 6 },
            targetOffset: 0,
        });

        expect(nextDocumentData.body?.dataStream).toBe('MM\raa\rzz\r\n');
        expect(collectStarts(nextDocumentData.body?.sectionBreaks)).toEqual([6, 9]);
        expect(collectStarts(nextDocumentData.body?.customBlocks)).toEqual([0, 6]);
        expect(collectStarts(nextDocumentData.body?.tables)).toEqual([0, 6]);
        expect(collectStarts(nextDocumentData.body?.blockRanges)).toEqual([0, 6]);
        expect(collectStarts(nextDocumentData.body?.customRanges)).toEqual([0, 6]);
        expect(collectStarts(nextDocumentData.body?.customDecorations)).toEqual([0, 6]);
        expect(collectTextRunStarts(nextDocumentData.body?.textRuns)).toEqual([0, 6]);
    });

    it('remaps column group ranges when moving content before a column group', () => {
        const T = DataStreamTreeTokenType;
        const columnGroupStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}C${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}`;
        const documentData = createDocument(`A${T.PARAGRAPH}${columnGroupStream}Z${T.PARAGRAPH}${T.SECTION_BREAK}`, {
            paragraphs: [
                { paragraphId: 'para_docs_ui_fixture_32', startIndex: 1 },
                { paragraphId: 'para_docs_ui_fixture_33', startIndex: 5 },
                { paragraphId: 'para_docs_ui_fixture_34', startIndex: 9 },
                { paragraphId: 'para_docs_ui_fixture_35', startIndex: 13 },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_213', startIndex: 14 }],
            columnGroups: [{ columnGroupId: 'column-group-1', startIndex: 2, endIndex: 11 }],
        });

        const { nextDocumentData } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 12,
        });

        expect(nextDocumentData.body?.dataStream).toBe(`${columnGroupStream}A${T.PARAGRAPH}Z${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(nextDocumentData.body?.columnGroups).toEqual([{
            columnGroupId: 'column-group-1',
            startIndex: 0,
            endIndex: 9,
        }]);
    });
});

describe('MoveDocBlockCommand', () => {
    let testBed: ReturnType<typeof createCommandTestBed> | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('moves a block through the real rich text mutation flow', async () => {
        testBed = createCommandTestBed(createDocument('A\rB\rC\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_25', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_26', startIndex: 3 }, { paragraphId: 'para_docs_ui_fixture_27', startIndex: 5 }],
            sectionBreaks: [{ sectionId: 'section_fixture_214', startIndex: 6 }],
        }));
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(MoveDocBlockCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        await expect(commandService.executeCommand(MoveDocBlockCommand.id, {
            unitId: 'test-doc',
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 6,
        })).resolves.toBe(true);

        await awaitTime(0);
        expect(testBed.doc.getSnapshot().body?.dataStream).toBe('B\rC\rA\r\n');
        expect(testBed.doc.getSnapshot().body?.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([1, 3, 5]);
    });

    it('writes remapped column group ranges through the real rich text mutation flow', async () => {
        const T = DataStreamTreeTokenType;
        const columnGroupStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}C${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}`;
        testBed = createCommandTestBed(createDocument(`A${T.PARAGRAPH}${columnGroupStream}Z${T.PARAGRAPH}${T.SECTION_BREAK}`, {
            paragraphs: [
                { paragraphId: 'para_docs_ui_fixture_36', startIndex: 1 },
                { paragraphId: 'para_docs_ui_fixture_37', startIndex: 5 },
                { paragraphId: 'para_docs_ui_fixture_38', startIndex: 9 },
                { paragraphId: 'para_docs_ui_fixture_39', startIndex: 13 },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_215', startIndex: 14 }],
            columnGroups: [{ columnGroupId: 'column-group-1', startIndex: 2, endIndex: 11 }],
        }));
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(MoveDocBlockCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        await expect(commandService.executeCommand(MoveDocBlockCommand.id, {
            unitId: 'test-doc',
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 12,
        })).resolves.toBe(true);

        await awaitTime(0);
        expect(testBed.doc.getSnapshot().body?.columnGroups).toEqual([{
            columnGroupId: 'column-group-1',
            startIndex: 0,
            endIndex: 9,
        }]);
    });

    it('applies registered block move transformers through the real rich text mutation flow', async () => {
        testBed = createCommandTestBed(createDocument('A\rB\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_40', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_41', startIndex: 3 }],
            sectionBreaks: [{ sectionId: 'section_fixture_216', startIndex: 4 }],
        }));
        const commandService = testBed.get(ICommandService);
        const moveValidatorService = testBed.get(DocBlockMoveValidatorService);
        commandService.registerCommand(MoveDocBlockCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        moveValidatorService.registerTransformer((context) => ({
            ...context.result,
            nextDocumentData: {
                ...context.result.nextDocumentData,
                body: {
                    ...context.result.nextDocumentData.body!,
                    dataStream: `${context.result.nextDocumentData.body?.dataStream}!`,
                },
            },
        }));

        await expect(commandService.executeCommand(MoveDocBlockCommand.id, {
            unitId: 'test-doc',
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 4,
        })).resolves.toBe(true);

        await awaitTime(0);
        expect(testBed.doc.getSnapshot().body?.dataStream).toBe('B\rA\r\n!');
    });

    it('does not mutate when the target document is missing', async () => {
        testBed = createCommandTestBed(createDocument('A\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_28', startIndex: 1 }],
            sectionBreaks: [{ sectionId: 'section_fixture_217', startIndex: 2 }],
        }));
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(MoveDocBlockCommand);

        await expect(commandService.executeCommand(MoveDocBlockCommand.id, {
            unitId: 'missing-doc',
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 2,
        })).resolves.toBe(false);

        expect(testBed.doc.getSnapshot().body?.dataStream).toBe('A\r\n');
    });
});

describe('buildReplaceDocumentBodyActions', () => {
    it('uses TextX and local body patches instead of replacing whole body fields', () => {
        const previousDocumentData = createDocument('A\rB\rC\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_42', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_43', startIndex: 3 }, { paragraphId: 'para_docs_ui_fixture_44', startIndex: 5 }],
            sectionBreaks: [{ sectionId: 'section_fixture_218', startIndex: 6 }],
        });
        const sourceRange = { startOffset: 0, endOffset: 2 };
        const targetOffset = 6;
        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData: previousDocumentData,
            sourceRange,
            targetOffset,
        });

        const actions = buildReplaceDocumentBodyActions(previousDocumentData, nextDocumentData, {
            movedRange,
            sourceRange,
            targetOffset,
        });
        const serializedActions = JSON.stringify(actions);

        expect(actions).not.toBeNull();
        expect(serializedActions).not.toContain('["body","dataStream"');
        expect(serializedActions).not.toContain('["body","paragraphs",{"r"');
        expect(serializedActions).toContain('"et":"text-x"');
    });
});

function createDocument(dataStream: string, body: Partial<NonNullable<IDocumentData['body']>>): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream,
            customBlocks: [],
            ...body,
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginLeft: 72,
            marginRight: 72,
        },
    };
}

function collectStarts(items: Array<{ startIndex: number }> | undefined): number[] {
    const starts: number[] = [];
    for (const item of items ?? []) {
        starts.push(item.startIndex);
    }
    return starts;
}

function collectTextRunStarts(items: Array<{ st: number }> | undefined): number[] {
    const starts: number[] = [];
    for (const item of items ?? []) {
        starts.push(item.st);
    }
    return starts;
}
