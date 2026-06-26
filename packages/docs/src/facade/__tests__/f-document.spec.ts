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
import { IResourceManagerService, IUndoRedoService, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocumentData, createSimpleDocument, createTestBed } from './create-test-bed';

describe('FDocument', () => {
    let univer: Univer;
    let document: FDocument;
    let get: ReturnType<typeof createTestBed>['get'];
    let univerAPI: ReturnType<typeof createTestBed>['univerAPI'];

    function createDocumentFacade(docData?: IDocumentData) {
        const testBed = createTestBed(docData);
        univer = testBed.univer;
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        document = univerAPI.getActiveDocument()!;
    }

    beforeEach(() => {
        createDocumentFacade();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('edits document text through append, insert and paragraph operations', () => {
        expect(document.appendText('Univer')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,Univer\r\n');

        univer.dispose();
        createDocumentFacade();
        expect(document.insertText('Docs', {
            endOffset: 4,
            segmentId: '',
            startOffset: 2,
        })).toBe(true);
        expect(document.save().body?.dataStream).toBe('HeDocso,\r\n');

        univer.dispose();
        createDocumentFacade();
        expect(document.insertParagraph('Line 1\nLine 2', {
            endOffset: 6,
            segmentId: '',
            startOffset: 6,
        })).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,Line 1\rLine 2\r\r\n');
    });

    it('includes current document resources in saved snapshots', () => {
        const resourceManagerService = get(IResourceManagerService);

        resourceManagerService.registerPluginResource({
            pluginName: 'DOC_TEST_RESOURCE_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: () => undefined,
            onUnLoad: () => undefined,
            toJson: () => '{"value":1}',
            parseJson: (bytes: string) => JSON.parse(bytes),
        });

        expect(document.save().resources).toEqual([
            {
                name: 'DOC_TEST_RESOURCE_PLUGIN',
                data: '{"value":1}',
            },
        ]);
    });

    it('exposes document identity and snapshot data from the active model', () => {
        expect(document.getId()).toBe('test');
        expect(document.getName()).toBe('');
        expect(document.getDocumentDataModel().getUnitId()).toBe('test');
        expect(document.save().body?.dataStream).toBe('Hello,\r\n');
    });

    it('runs undo and redo against the active document', () => {
        get(IUndoRedoService);

        expect(document.appendText('One')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,One\r\n');

        expect(document.undo()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,\r\n');

        expect(document.redo()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,One\r\n');
    });

    it('preserves paragraph ids in saved snapshots and body wrappers', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());

        const savedParagraphs = document.save().body?.paragraphs;
        const body = document.getBody();
        const paragraph = body.getElement(0)!.asParagraph();

        expect(savedParagraphs?.map((item) => item.paragraphId)).toEqual(['para_alpha', 'para_beta', 'para_gamma']);
        expect(savedParagraphs?.map((item) => item.startIndex)).toEqual([5, 10, 16]);
        expect(paragraph.getParagraphId()).toBe('para_alpha');
        expect(paragraph.getText()).toBe('Alpha');
    });

    it('keeps caller-provided paragraph ids when creating a body facade', () => {
        univer.dispose();
        createDocumentFacade(createDocumentData('doc-with-ids', {
            dataStream: 'Legacy\r\n',
            paragraphs: [{ startIndex: 6, paragraphId: 'para_fixture_26' }],
            sectionBreaks: [{ startIndex: 7 }],
        }));

        const paragraph = document.getBody().getElement(0)!.asParagraph();

        expect(paragraph.getParagraphId()).toBe('para_fixture_26');
        expect(document.save().body?.paragraphs?.[0].paragraphId).toBe('para_fixture_26');
    });
});
