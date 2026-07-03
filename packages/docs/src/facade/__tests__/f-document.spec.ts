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
import { ICommandService, IResourceManagerService, IUndoRedoService, UniverInstanceType } from '@univerjs/core';
import { InsertTextCommand } from '@univerjs/docs';
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

    it('edits document text through body and paragraph operations', () => {
        expect(document.insertText(6, 'Univer')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,Univer\r\n');

        univer.dispose();
        createDocumentFacade();
        expect(document.getParagraphs()[0].setText('HeDocso,')).toBe(true);
        expect(document.save().body?.dataStream).toBe('HeDocso,\r\n');

        univer.dispose();
        createDocumentFacade();
        expect(document.appendParagraph('Line 1').getText()).toBe('Line 1');
        expect(document.appendParagraph('Line 2').getText()).toBe('Line 2');
        expect(document.save().body?.dataStream).toBe('Hello,\rLine 1\rLine 2\r\n');
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

        expect(get(ICommandService).syncExecuteCommand(InsertTextCommand.id, {
            unitId: document.getId(),
            body: { dataStream: 'One' },
            range: { startOffset: 6, endOffset: 6, collapsed: true, segmentId: '' },
            segmentId: '',
        })).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,One\r\n');

        expect(document.undo()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,\r\n');

        expect(document.redo()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,One\r\n');
    });

    it('preserves paragraph ids in saved snapshots and paragraph facades', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());

        const savedParagraphs = document.save().body?.paragraphs;
        const paragraph = document.getParagraphs()[0];

        expect(savedParagraphs?.map((item) => item.paragraphId)).toEqual(['para_alpha', 'para_beta', 'para_gamma']);
        expect(savedParagraphs?.map((item) => item.startIndex)).toEqual([5, 10, 16]);
        expect(paragraph.getId()).toBe('para_alpha');
        expect(paragraph.getText()).toBe('Alpha');
    });

    it('keeps caller-provided paragraph ids when creating paragraph facades', () => {
        univer.dispose();
        createDocumentFacade(createDocumentData('doc-with-ids', {
            dataStream: 'Legacy\r\n',
            paragraphs: [{ startIndex: 6, paragraphId: 'para_fixture_26' }],
            sectionBreaks: [{ startIndex: 7 }],
        }));

        const paragraph = document.getParagraphs()[0];

        expect(paragraph.getId()).toBe('para_fixture_26');
        expect(document.save().body?.paragraphs?.[0].paragraphId).toBe('para_fixture_26');
    });

    it('preserves an editable empty paragraph when deleting past the end of an empty document', () => {
        univer.dispose();
        createDocumentFacade(createDocumentData('empty-doc', {
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'para_empty' }],
            sectionBreaks: [{ startIndex: 1 }],
        }));

        document.deleteRange({ startOffset: 0, endOffset: 5 });
        const paragraph = document.insertParagraph(0, 'Document title');
        expect(paragraph.appendText(' suffix')).toBe(true);

        expect(document.save().body?.dataStream).toBe('Document title suffix\r\r\n');
        expect(document.save().body?.paragraphs?.map((item) => item.startIndex)).toEqual([21, 22]);
        expect(document.getParagraphs()[0].getText()).toBe('Document title suffix');
    });

    it('ensures header and footer segments independently', () => {
        const headerId = document.ensurePageHeader();
        let snapshot = document.save();

        expect(headerId).toEqual(expect.any(String));
        expect(snapshot.documentStyle?.defaultHeaderId).toBe(headerId);
        expect(snapshot.headers?.[headerId].body?.dataStream).toBe('\r\n');
        expect(snapshot.documentStyle?.defaultFooterId).toBeFalsy();
        expect(Object.keys(snapshot.footers ?? {})).toEqual([]);

        const footerId = document.ensurePageFooter();
        snapshot = document.save();

        expect(footerId).toEqual(expect.any(String));
        expect(footerId).not.toBe(headerId);
        expect(snapshot.documentStyle?.defaultHeaderId).toBe(headerId);
        expect(snapshot.documentStyle?.defaultFooterId).toBe(footerId);
        expect(snapshot.footers?.[footerId].body?.dataStream).toBe('\r\n');
    });
});
