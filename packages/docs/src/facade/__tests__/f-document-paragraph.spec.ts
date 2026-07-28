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

import type { IDocumentData, Univer } from '@univerjs/core';
import type { FDocument } from '../f-document';
import { BooleanNumber, DataStreamTreeTokenType, DocumentBlockRangeType, ICommandService, IUndoRedoService, PresetListType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { UpdateDocumentParagraphStyleCommand } from '../../commands/commands/update-document-paragraph-style.command';
import {
    createBulletDocument,
    createDocumentData,
    createDuplicateDocument,
    createSimpleDocument,
    createTaskDocument,
    createTestBed,
} from './create-test-bed';

describe('FDocumentParagraph', () => {
    let univer: Univer | null = null;
    let document: FDocument;

    function createDocumentFacade(docData: IDocumentData) {
        univer?.dispose();
        const testBed = createTestBed(docData);
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;
    }

    afterEach(() => {
        univer?.dispose();
        univer = null;
    });

    it('keeps paragraph handles stable when text is duplicated or inserted before them', () => {
        createDocumentFacade(createDuplicateDocument());

        const secondSame = document.getParagraphs()[1];

        expect(secondSame.getId()).toBe('para_same_2');
        expect(document.insertParagraph(0, 'X').getText()).toBe('X');
        expect(secondSame.getInfo().paragraphIndex).toBe(2);
        expect(secondSame.setText('Picked')).toBe(true);
        expect(document.save().body?.dataStream).toBe('X\rSame\rPicked\rTail\r\n');
        expect(secondSame.remove()).toBe(true);
        expect(document.save().body?.dataStream).toBe('X\rSame\rTail\r\n');
    });

    it('marks paragraph handles as stale after their backing paragraph is removed', () => {
        createDocumentFacade(createSimpleDocument());

        const paragraph = document.getParagraphs()[1];
        expect(paragraph.remove()).toBe(true);
        expect(() => paragraph.getText()).toThrow('Document paragraph with id para_beta not found');
        expect(() => paragraph.remove()).toThrow('Document paragraph with id para_beta not found');
    });

    it('updates checklist paragraphs without changing non-task list items', () => {
        createDocumentFacade(createBulletDocument());

        const listItem = document.getParagraphs()[0];
        expect(listItem.getId()).toMatch(/^para_/);
        expect(listItem.isListItem()).toBe(true);
        expect(listItem.isTask()).toBe(false);
        expect(listItem.setTaskChecked(true)).toBe(false);

        createDocumentFacade(createTaskDocument());

        const task = document.getParagraphs()[0];
        expect(task.isListItem()).toBe(true);
        expect(task.isTask()).toBe(true);
        expect(task.setTaskChecked(true)).toBe(true);
        expect(document.save().body?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(task.setTaskChecked(false)).toBe(true);
        expect(document.save().body?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST);
    });

    it('applies paragraph text style to the paragraph text range', () => {
        createDocumentFacade(createSimpleDocument());

        const paragraph = document.getParagraphs()[0];

        expect(paragraph.setStyle({
            textStyle: {
                cl: {
                    rgb: '#FF0000',
                },
                fs: 14,
            },
            horizontalAlign: 2,
        })).toBe(true);

        expect(document.save().body?.paragraphs?.[0].paragraphStyle).toMatchObject({
            horizontalAlign: 2,
            textStyle: {
                cl: {
                    rgb: '#FF0000',
                },
                fs: 14,
            },
        });
        expect(document.save().body?.textRuns).toEqual([
            {
                st: 0,
                ed: 5,
                ts: {
                    cl: {
                        rgb: '#FF0000',
                    },
                    fs: 14,
                },
            },
        ]);
    });

    it('updates paragraph and text style as one undoable command and preserves explicit false', () => {
        const testBed = createTestBed(createSimpleDocument());
        univer = testBed.univer;
        testBed.get(IUndoRedoService);
        document = testBed.univerAPI.getActiveDocument()!;
        const paragraph = document.getParagraphs()[0];

        expect(paragraph.setStyle({
            textStyle: {
                bl: BooleanNumber.TRUE,
            },
            keepNext: BooleanNumber.FALSE,
            keepLines: BooleanNumber.TRUE,
            widowControl: BooleanNumber.FALSE,
            pageBreakBefore: BooleanNumber.TRUE,
        })).toBe(true);
        expect(paragraph.getInfo().paragraph.paragraphStyle).toMatchObject({
            keepNext: BooleanNumber.FALSE,
            keepLines: BooleanNumber.TRUE,
            widowControl: BooleanNumber.FALSE,
            pageBreakBefore: BooleanNumber.TRUE,
        });
        expect(document.save().body?.textRuns).toEqual([{
            st: 0,
            ed: 5,
            ts: { bl: BooleanNumber.TRUE },
        }]);

        expect(document.undo()).toBe(true);
        expect(paragraph.getInfo().paragraph.paragraphStyle).toBeUndefined();
        expect(document.save().body?.textRuns).toBeUndefined();

        expect(document.redo()).toBe(true);
        expect(paragraph.getInfo().paragraph.paragraphStyle).toMatchObject({
            keepNext: BooleanNumber.FALSE,
            keepLines: BooleanNumber.TRUE,
            widowControl: BooleanNumber.FALSE,
            pageBreakBefore: BooleanNumber.TRUE,
        });
        const saved = document.save();
        createDocumentFacade(saved);
        expect(document.getParagraphs()[0].getInfo().paragraph.paragraphStyle).toMatchObject({
            keepNext: BooleanNumber.FALSE,
            keepLines: BooleanNumber.TRUE,
            widowControl: BooleanNumber.FALSE,
            pageBreakBefore: BooleanNumber.TRUE,
        });
    });

    it('rejects a stale paragraph range without a partial style update', () => {
        const testBed = createTestBed(createSimpleDocument());
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;
        const paragraph = document.getParagraphs()[0];
        const { startOffset, endOffset } = paragraph.getInfo();

        expect(document.insertParagraph(0, 'Before').getText()).toBe('Before');
        expect(testBed.get(ICommandService).syncExecuteCommand(UpdateDocumentParagraphStyleCommand.id, {
            unitId: document.getId(),
            paragraphId: paragraph.getId(),
            startOffset,
            endOffset,
            style: {
                keepNext: BooleanNumber.TRUE,
            },
        })).toBe(false);
        expect(paragraph.getInfo().paragraph.paragraphStyle?.keepNext).toBeUndefined();
    });

    it('reads and updates a text range across existing style-run boundaries', () => {
        const data = createSimpleDocument();
        data.body!.textRuns = [
            { st: 0, ed: 5, ts: { cl: { rgb: '#FF0000' }, bl: 1 } },
            { st: 5, ed: 10, ts: { cl: { rgb: '#FF0000' }, it: 1 } },
        ];
        createDocumentFacade(data);

        const range = document.getTextRange(2, 8);

        expect(range.getText()).toBe('pha\rBe');
        expect(range.getExplicitTextStyleRuns()).toEqual([
            { startOffset: 2, endOffset: 5, textStyle: { cl: { rgb: '#FF0000' }, bl: 1 } },
            { startOffset: 5, endOffset: 8, textStyle: { cl: { rgb: '#FF0000' }, it: 1 } },
        ]);
        expect(range.getCommonExplicitTextStyle()).toEqual({ cl: { rgb: '#FF0000' } });
        expect(range.describe()).toEqual({
            startOffset: 2,
            endOffset: 8,
            segmentId: '',
            length: 6,
            text: 'pha\rBe',
            explicitTextStyleRuns: range.getExplicitTextStyleRuns(),
            commonExplicitTextStyle: { cl: { rgb: '#FF0000' } },
        });

        expect(range.setTextStyle({ fs: 20 })).toBe(true);
        expect(document.save().body?.textRuns).toEqual([
            { st: 0, ed: 2, ts: { cl: { rgb: '#FF0000' }, bl: 1 } },
            { st: 2, ed: 5, ts: { cl: { rgb: '#FF0000' }, bl: 1, fs: 20 } },
            { st: 5, ed: 8, ts: { cl: { rgb: '#FF0000' }, it: 1, fs: 20 } },
            { st: 8, ed: 10, ts: { cl: { rgb: '#FF0000' }, it: 1 } },
        ]);
        expect(document.getParagraphs()[0].getTextRange().getRange()).toEqual({
            startOffset: 0,
            endOffset: 5,
            segmentId: '',
        });
    });

    it('finds literal text ranges inside a paragraph', () => {
        createDocumentFacade(createSimpleDocument());

        const paragraph = document.getParagraphs()[0];

        expect(paragraph.findText('pha')?.describe()).toMatchObject({
            startOffset: 2,
            endOffset: 5,
            segmentId: '',
            text: 'pha',
        });
        expect(paragraph.findText('PHA')).toBeNull();
        expect(paragraph.findText('PHA', { matchCase: false })?.getText()).toBe('pha');
        expect(paragraph.findAllText('a').map((range) => range.getRange())).toEqual([
            { startOffset: 4, endOffset: 5, segmentId: '' },
        ]);
        expect(paragraph.findText('missing')).toBeNull();
        expect(() => paragraph.findText('', { occurrence: 0 })).toThrow(TypeError);
        expect(() => paragraph.findText('a', { occurrence: -1 })).toThrow(RangeError);
    });

    it('resolves repeated text occurrences and keeps header matches scoped to their segment', () => {
        const headerId = 'header-find';
        createDocumentFacade({
            ...createDocumentData('doc-find-repeated', {
                dataStream: 'x plus x\r\n',
                paragraphs: [{ startIndex: 8, paragraphId: 'para_body_repeated' }],
                sectionBreaks: [{ sectionId: 'section_body_repeated', startIndex: 9 }],
            }),
            headers: {
                [headerId]: {
                    headerId,
                    body: {
                        dataStream: 'X and x\r\n',
                        paragraphs: [{ startIndex: 7, paragraphId: 'para_header_repeated' }],
                        sectionBreaks: [{ sectionId: 'section_header_repeated', startIndex: 8 }],
                    },
                },
            },
        });

        const bodyParagraph = document.getParagraphs()[0];
        const headerParagraph = document.getParagraphs(headerId)[0];

        expect(bodyParagraph.findAllText('x').map((range) => range.getRange())).toEqual([
            { startOffset: 0, endOffset: 1, segmentId: '' },
            { startOffset: 7, endOffset: 8, segmentId: '' },
        ]);
        expect(bodyParagraph.findText('x', { occurrence: 1 })?.getText()).toBe('x');
        expect(headerParagraph.findAllText('x', { matchCase: false }).map((range) => range.getRange())).toEqual([
            { startOffset: 0, endOffset: 1, segmentId: headerId },
            { startOffset: 6, endOffset: 7, segmentId: headerId },
        ]);
    });

    it('keeps original document offsets when case folding changes string length', () => {
        createDocumentFacade(createDocumentData('doc-find-unicode', {
            dataStream: 'İx and a.b\r\n',
            paragraphs: [{ startIndex: 10, paragraphId: 'para_unicode' }],
            sectionBreaks: [{ sectionId: 'section_unicode', startIndex: 11 }],
        }));

        const paragraph = document.getParagraphs()[0];

        expect(paragraph.findText('x', { matchCase: false })?.describe()).toMatchObject({
            startOffset: 1,
            endOffset: 2,
            text: 'x',
        });
        expect(paragraph.findText('A.B', { matchCase: false })?.describe()).toMatchObject({
            startOffset: 7,
            endOffset: 10,
            text: 'a.b',
        });
    });

    it('rejects invalid document text ranges', () => {
        createDocumentFacade(createSimpleDocument());

        expect(() => document.getTextRange(-1, 2)).toThrow(RangeError);
        expect(() => document.getTextRange(4, 2)).toThrow(RangeError);
        expect(() => document.getTextRange(0, 999)).toThrow(RangeError);
    });

    it('keeps a paragraph after a block scoped outside the block end token', () => {
        const T = DataStreamTreeTokenType;
        createDocumentFacade(createDocumentData('doc-after-block', {
            dataStream: `${T.BLOCK_START}Code${T.PARAGRAPH}${T.BLOCK_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 5, paragraphId: 'para_code' },
                { startIndex: 12, paragraphId: 'para_after' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_117', startIndex: 13 }],
            blockRanges: [{
                blockId: 'code-1',
                blockType: DocumentBlockRangeType.CODE,
                startIndex: 0,
                endIndex: 6,
            }],
        }));

        const paragraph = document.getParagraphs()[1];

        expect(paragraph.getInfo()).toMatchObject({ startOffset: 7, endOffset: 12 });
        expect(paragraph.getText()).toBe('After');
        expect(document.insertParagraph(1, 'Between').getText()).toBe('Between');
        expect(document.save().body).toMatchObject({
            dataStream: `${T.BLOCK_START}Code${T.PARAGRAPH}${T.BLOCK_END}Between${T.PARAGRAPH}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            blockRanges: [{ startIndex: 0, endIndex: 6 }],
        });
        const paragraphAfterInsert = document.getParagraphs().find((item) => item.getText() === 'After');
        expect(paragraphAfterInsert?.setText('Changed')).toBe(true);
        expect(document.save().body).toMatchObject({
            dataStream: `${T.BLOCK_START}Code${T.PARAGRAPH}${T.BLOCK_END}Between${T.PARAGRAPH}Changed${T.PARAGRAPH}${T.SECTION_BREAK}`,
            blockRanges: [{ startIndex: 0, endIndex: 6 }],
        });
    });

    it('keeps paragraph edits scoped to their header segment', () => {
        const headerId = 'header-1';
        createDocumentFacade({
            ...createDocumentData('doc-with-header', {
                dataStream: 'Body\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'para_body' }],
                sectionBreaks: [{ sectionId: 'section_fixture_118', startIndex: 5 }],
            }),
            headers: {
                [headerId]: {
                    headerId,
                    body: {
                        dataStream: 'Head\r\n',
                        paragraphs: [{ startIndex: 4, paragraphId: 'para_header' }],
                        sectionBreaks: [{ sectionId: 'section_fixture_119', startIndex: 5 }],
                    },
                },
            },
        });

        const headerParagraph = document.getParagraphs(headerId)[0];

        expect(headerParagraph.getSegmentId()).toBe(headerId);
        expect(headerParagraph.appendText('er')).toBe(true);
        expect(document.appendParagraph('Tail', headerId).getText()).toBe('Tail');

        expect(document.getBody().dataStream).toBe('Body\r\n');
        expect(document.getBody(headerId).dataStream).toBe('Header\rTail\r\n');
        expect(document.getBody(headerId).paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([6, 11]);
    });
});
