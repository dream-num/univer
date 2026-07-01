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
import { PresetListType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
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

    it('keeps paragraph edits scoped to their header segment', () => {
        const headerId = 'header-1';
        createDocumentFacade({
            ...createDocumentData('doc-with-header', {
                dataStream: 'Body\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'para_body' }],
                sectionBreaks: [{ startIndex: 5 }],
            }),
            headers: {
                [headerId]: {
                    headerId,
                    body: {
                        dataStream: 'Head\r\n',
                        paragraphs: [{ startIndex: 4, paragraphId: 'para_header' }],
                        sectionBreaks: [{ startIndex: 5 }],
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
