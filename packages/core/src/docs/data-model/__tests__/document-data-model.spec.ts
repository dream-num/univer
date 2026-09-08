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

import type { IDocumentBody } from '../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { CustomRangeType, DocStyleType } from '../../../types/interfaces/i-document-data';
import { DocumentDataModel } from '../document-data-model';
import { JSONX } from '../json-x/json-x';
import { validateDocumentStructure } from '../text-x/structure-validator';
import { TextX } from '../text-x/text-x';
import { getRichTextEditPath } from '../text-x/utils';

function body(text: string): IDocumentBody {
    return {
        dataStream: `${text}\r\n`,
        customBlocks: [],
        customRanges: [],
        customDecorations: [],
        paragraphs: [{ startIndex: text.length, paragraphId: 'paragraph' }],
        sectionBreaks: [{ startIndex: text.length + 1, sectionId: 'section' }],
    };
}

function createDocument(): DocumentDataModel {
    return new DocumentDataModel({
        id: 'doc',
        body: {
            ...body('A\uFFFCB'),
            customRanges: [{ startIndex: 1, endIndex: 1, rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, wholeEntity: true, properties: { noteId: 'note' } }],
        },
        notes: { note: { type: 'footnote' as const, noteId: 'note', body: body('Explanation') } },
        noteSettings: { footnote: { position: 'pageBottom', restart: 'eachSect', numberFormat: 'lowerRoman', startNumber: 3 } },
    });
}

describe('document footnote segments', () => {
    it('inherits document styles and refreshes them without persisting duplicate styles in each note', () => {
        const document = createDocument();
        const jsonX = JSONX.getInstance();
        try {
            document.apply(jsonX.insertOp(['styles'], { FootnoteText: { name: 'Footnote Text', type: DocStyleType.paragraph, textStyle: { fs: 10 } } }));
            const note = document.noteModelMap.get('note');
            expect(note?.getSnapshot().styles?.FootnoteText.textStyle?.fs).toBe(10);
            document.apply(jsonX.replaceOp(['styles', 'FootnoteText', 'textStyle', 'fs'], 10, 12));
            expect(document.noteModelMap.get('note')).not.toBe(note);
            expect(document.noteModelMap.get('note')?.getSnapshot().styles?.FootnoteText.textStyle?.fs).toBe(12);
            document.updateDocumentStyle({ textStyle: { fs: 14 }, marginLeft: 40 });
            expect(document.noteModelMap.get('note')?.getDocumentStyle()).toMatchObject({
                textStyle: { fs: 14 },
                marginLeft: 40,
            });
            expect(Object.keys(document.getSnapshot().notes!.note)).toEqual(['type', 'noteId', 'body']);
        } finally {
            document.dispose();
        }
    });

    it('edits note text through the rich-text path and restores it through undo', () => {
        const document = createDocument();
        const before = structuredClone(document.getSnapshot());
        const path = getRichTextEditPath(document, 'note');
        const edit = JSONX.getInstance().editOp(new TextX().insert(4, { dataStream: 'New ' }).serialize(), path);
        const undo = JSONX.invertWithDoc(edit, before);
        document.apply(edit);
        expect(document.getSelfOrHeaderFooterModel('note')?.getBody()?.dataStream).toBe('New Explanation\r\n');
        expect(document.getBody()).toEqual(before.body);
        document.apply(undo);
        expect(document.getSnapshot()).toEqual(before);
        expect(document.getSelfOrHeaderFooterModel('note')?.getBody()?.dataStream).toBe('Explanation\r\n');
        document.dispose();
    });

    it('preserves the note identity when text before its reference is edited', () => {
        const document = createDocument();
        const edit = JSONX.getInstance().editOp(new TextX().insert(2, { dataStream: '前文' }).serialize(), ['body']);
        document.apply(edit);
        expect(document.getBody()?.customRanges?.[0]).toMatchObject({ startIndex: 3, endIndex: 3, properties: { noteId: 'note' } });
        const restored = new DocumentDataModel(document.getSnapshot());
        expect(restored.getSelfOrHeaderFooterModel('note')?.getBody()).toEqual(document.getSnapshot().notes?.note.body);
        expect(restored.getSnapshot().noteSettings?.footnote).toEqual(document.getSnapshot().noteSettings?.footnote);
        expect(validateDocumentStructure(restored.getSnapshot())).toEqual([]);
        restored.dispose();
        document.dispose();
    });

    it('keeps unrelated note models when one note is edited', () => {
        const document = createDocument();
        const jsonX = JSONX.getInstance();
        document.apply(jsonX.insertOp(['notes', 'other'], { type: 'footnote' as const, noteId: 'other', body: body('Other explanation') }));
        const other = document.noteModelMap.get('other');
        const edit = jsonX.editOp(new TextX().insert(4, { dataStream: 'New ' }).serialize(), ['notes', 'note', 'body']);
        document.apply(edit);
        expect(document.noteModelMap.get('other')).toBe(other);
        expect(document.noteModelMap.get('note')?.getBody()?.dataStream).toBe('New Explanation\r\n');
        document.dispose();
    });

    it('removes a disposed note segment from the model after a persisted deletion', () => {
        const document = createDocument();
        const edit = JSONX.getInstance().removeOp(['notes', 'note'], document.getSnapshot().notes?.note);
        document.apply(edit);
        expect(document.getSelfOrHeaderFooterModel('note')).toBeNull();
        expect(validateDocumentStructure(document.getSnapshot()).map((issue) => issue.code)).toContain('missing-footnote');
        document.dispose();
    });
});
