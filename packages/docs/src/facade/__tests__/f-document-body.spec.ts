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

import type { Univer } from '@univerjs/core';
import type { FDocument } from '../f-document';
import { DocumentBlockType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSimpleDocument, createTestBed } from './create-test-bed';

describe('FDocumentBody', () => {
    let univer: Univer;
    let document: FDocument;

    beforeEach(() => {
        const testBed = createTestBed(createSimpleDocument());
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('reads, inserts, replaces, styles and removes paragraphs by stable paragraph ids', () => {
        const body = document.getBody();
        expect(body.getElements()).toHaveLength(3);

        const first = body.getElement(0)!;
        const second = body.getElement(1)!.asParagraph();
        expect(first.getType()).toBe(DocumentBlockType.PARAGRAPH);
        expect(first.getKey()).toBe('para_alpha');
        expect(first.asParagraph().getParagraphId()).toBe('para_alpha');
        expect(second.getParagraphId()).toBe('para_beta');
        expect(second.getKey()).toBe('para_beta');
        expect(first.getParent()).toBe(body);
        expect(first.getNextSibling()?.asParagraph().getText()).toBe('Beta');
        expect(body.getElement(1)!.getPreviousSibling()?.asParagraph().getText()).toBe('Alpha');
        expect(first.getSibling(1)?.asParagraph().getText()).toBe('Beta');

        expect(body.getElementIndex(second)).toBe(1);
        expect(body.insertText(0, 'Hello ')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello Alpha\rBeta\rGamma\r\n');

        const title = body.insertParagraph(0, 'Title');
        expect(title.getParagraphId()).toMatch(/^para_/);
        expect(title.getKey()).toBe(title.getParagraphId());
        expect(title.getText()).toBe('Title');
        expect(document.save().body?.paragraphs?.[0].paragraphId).toBe(title.getParagraphId());
        expect(document.save().body?.dataStream).toBe('Title\rHello Alpha\rBeta\rGamma\r\n');

        const tail = body.appendParagraph('Tail');
        expect(tail.getText()).toBe('Tail');
        expect(document.save().body?.dataStream).toBe('Title\rHello Alpha\rBeta\rGamma\rTail\r\n');

        expect(body.deleteRange({ startOffset: 0, endOffset: 6 })).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello Alpha\rBeta\rGamma\rTail\r\n');

        expect(body.replaceRange({ startOffset: 0, endOffset: 5 }, 'Hi')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hi Alpha\rBeta\rGamma\rTail\r\n');

        expect(body.setTextStyle({ startOffset: 0, endOffset: 2 }, { bl: 1 })).toBe(true);
        expect(document.save().body?.textRuns).toContainEqual({
            st: 0,
            ed: 2,
            ts: { bl: 1 },
        });

        const paragraph = body.getElement(0)!.asParagraph();
        expect(paragraph.setStyle({ horizontalAlign: 2 })).toBe(true);
        expect(document.save().body?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(2);

        expect(paragraph.getText()).toBe('Hi Alpha');
        expect(paragraph.getRange()).toMatchObject({ startOffset: 0, endOffset: 8 });
        expect(paragraph.getResolvedParagraphInfo().paragraphIndex).toBe(0);
        expect(body.resolveElement(paragraph)).toMatchObject({ type: DocumentBlockType.PARAGRAPH, position: 0 });

        expect(paragraph.setText('Updated')).toBe(true);
        expect(paragraph.getText()).toBe('Updated');
        expect(paragraph.appendText(' suffix')).toBe(true);
        expect(paragraph.getText()).toBe('Updated suffix');
        expect(body.removeParagraph(paragraph)).toBe(true);
        expect(document.save().body?.dataStream).toBe('Beta\rGamma\rTail\r\n');
    });

    it('rejects ambiguous or missing paragraph identities as stale elements', () => {
        const body = document.getBody();
        document.getDocumentDataModel().getBody()!.paragraphs![1].paragraphId = 'para_alpha';
        expect(() => body.getElement(0)!.asParagraph().getResolvedParagraphInfo()).toThrow('Multiple document paragraphs with id para_alpha found');

        document.getDocumentDataModel().getBody()!.paragraphs![1].paragraphId = 'para_beta';
        const invalidParagraph = document.getDocumentDataModel().getBody()!.paragraphs![0] as { paragraphId?: string };
        delete invalidParagraph.paragraphId;

        expect(() => body.getElement(0)).toThrow('Paragraph at index 0 is missing paragraphId.');
    });
});
