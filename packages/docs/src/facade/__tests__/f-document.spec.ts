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
import { ColumnSeparatorType, DataStreamTreeTokenType, DocumentFlavor, ICommandService, IResourceManagerService, IUndoRedoService, SectionType, UniverInstanceType } from '@univerjs/core';
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

    it('exposes section enums through univerAPI', () => {
        expect(univerAPI.Enum.SectionType.NEXT_PAGE).toBe(SectionType.NEXT_PAGE);
        expect(univerAPI.Enum.ColumnSeparatorType.BETWEEN_EACH_COLUMN).toBe(ColumnSeparatorType.BETWEEN_EACH_COLUMN);
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
            sectionBreaks: [{ sectionId: 'section_fixture_120', startIndex: 7 }],
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
            sectionBreaks: [{ sectionId: 'section_fixture_121', startIndex: 1 }],
        }));

        document.deleteRange({ startOffset: 0, endOffset: 5 });
        const paragraph = document.insertParagraph(0, 'Document title');
        expect(paragraph.appendText(' suffix')).toBe(true);

        expect(document.save().body?.dataStream).toBe('Document title suffix\r\r\n');
        expect(document.save().body?.paragraphs?.map((item) => item.startIndex)).toEqual([21, 22]);
        expect(document.getParagraphs()[0].getText()).toBe('Document title suffix');
    });

    it('ensures header and footer segments independently', () => {
        univer.dispose();
        const documentData = createDocumentData('classic-doc', {
            dataStream: 'Hello,\r\n',
            paragraphs: [{ startIndex: 6, paragraphId: 'para_header_footer' }],
        });
        documentData.documentStyle = {
            ...documentData.documentStyle,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        };
        createDocumentFacade(documentData);

        expect(document.setHeaderFooterOptions({ marginHeader: 36, marginFooter: 40 })).toBe(true);
        expect(document.getHeaderFooterOptions()).toMatchObject({ marginHeader: 36, marginFooter: 40 });

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

    it('reads and updates OOXML-compatible columns on traditional document sections', () => {
        univer.dispose();
        const data = createDocumentData('section-doc', {
            dataStream: 'One\r\nTwo\r\n',
            paragraphs: [
                { startIndex: 3, paragraphId: 'para-one' },
                { startIndex: 8, paragraphId: 'para-two' },
            ],
            sectionBreaks: [
                { sectionId: 'section_fixture_122', startIndex: 4, sectionType: SectionType.CONTINUOUS },
                { sectionId: 'section_fixture_123', startIndex: 9 },
            ],
        });
        data.documentStyle = {
            ...data.documentStyle,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        };
        createDocumentFacade(data);

        expect(document.getSections()).toHaveLength(2);
        expect(document.getSectionAt(6)?.getIndex()).toBe(1);
        const first = document.getSection(0)!;
        expect(first.getRange()).toEqual({ startOffset: 0, endOffset: 4, segmentId: '' });
        expect(first.setColumns(2, { gap: 20, separator: true, sectionType: SectionType.CONTINUOUS })).toBe(true);
        expect(first.describe()).toMatchObject({
            columnCount: 2,
            columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
            sectionType: SectionType.CONTINUOUS,
        });
        expect(first.getColumns()[0].paddingEnd).toBe(20);
        const headerId = first.ensureHeader();
        expect(document.save().body?.sectionBreaks?.[0].defaultHeaderId).toBe(headerId);
        expect(document.save().documentStyle.defaultHeaderId).toBeFalsy();
        expect(document.insertColumnBreak(2)).toBe(true);
        expect(document.save().body?.dataStream[2]).toBe(DataStreamTreeTokenType.COLUMN_BREAK);
    });

    it('keeps traditional section mutation unavailable in modern documents', () => {
        expect(document.getSections()).toEqual([]);
        expect(() => document.insertColumnBreak(0)).toThrow('Section column APIs are supported only in traditional documents');
    });

    it('keeps section facade identity stable when section order changes', () => {
        univer.dispose();
        const data = createDocumentData('stable-section-doc', {
            dataStream: 'One\r\nTwo\r\n',
            paragraphs: [
                { startIndex: 3, paragraphId: 'para-one' },
                { startIndex: 8, paragraphId: 'para-two' },
            ],
            sectionBreaks: [
                { sectionId: 'section_stable_one', startIndex: 4 },
                { sectionId: 'section_stable_two', startIndex: 9 },
            ],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);

        const originalFirst = document.getSection(0)!;
        const originalId = originalFirst.getId();
        const inserted = document.insertSectionBreak(0);

        expect(inserted).not.toBeNull();
        expect(originalFirst.getId()).toBe(originalId);
        expect(originalFirst.getIndex()).toBe(1);
        expect(originalFirst.getConfig().sectionId).toBe(originalId);
    });

    it('reads and changes header links through stable section ids', () => {
        univer.dispose();
        const data = createDocumentData('section-header-facade-doc', {
            dataStream: 'One\r\nTwo\r\n',
            paragraphs: [
                { startIndex: 3, paragraphId: 'para_header_one' },
                { startIndex: 8, paragraphId: 'para_header_two' },
            ],
            sectionBreaks: [
                { sectionId: 'section_header_one', startIndex: 4, defaultHeaderId: 'header-one' },
                { sectionId: 'section_header_two', startIndex: 9 },
            ],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        data.headers = {
            'header-one': {
                headerId: 'header-one',
                body: {
                    dataStream: 'Shared\r\n',
                    paragraphs: [{ startIndex: 6, paragraphId: 'header_facade_para' }],
                    sectionBreaks: [{ startIndex: 7, sectionId: 'header_facade_section' }],
                },
            },
        };
        createDocumentFacade(data);
        const second = document.getSection(1)!;
        get(IUndoRedoService);

        expect(second.isHeaderLinkedToPrevious()).toBe(true);
        expect(second.getHeaderId()).toBe('header-one');
        expect(second.describe().headerFooter.defaultHeader).toEqual({
            segmentId: 'header-one',
            linkedToPrevious: true,
        });
        expect(second.setHeaderLinkedToPrevious(false)).toBe(true);
        expect(second.isHeaderLinkedToPrevious()).toBe(false);
        expect(second.getHeaderId()).not.toBe('header-one');
        expect(document.save().headers?.[second.getHeaderId()!].body?.dataStream).toBe('Shared\r\n');
        expect(document.undo()).toBe(true);
        expect(second.isHeaderLinkedToPrevious()).toBe(true);
        expect(second.getHeaderId()).toBe('header-one');
        expect(document.redo()).toBe(true);
        expect(second.isHeaderLinkedToPrevious()).toBe(false);
        expect(second.setHeaderLinkedToPrevious(true)).toBe(true);
        expect(second.isHeaderLinkedToPrevious()).toBe(true);
        expect(second.getHeaderId()).toBe('header-one');
    });

    it('rejects reads from a retained section facade after switching to modern mode', () => {
        univer.dispose();
        const data = createDocumentData('retained-section-doc', {
            dataStream: 'Alpha\r\n',
            paragraphs: [{ startIndex: 5, paragraphId: 'para_retained_section' }],
            sectionBreaks: [{ startIndex: 6, sectionId: 'section_retained' }],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);
        const section = document.getSection(0)!;

        document.getDocumentDataModel().updateDocumentStyle({
            ...document.getDocumentDataModel().getDocumentStyle(),
            documentFlavor: DocumentFlavor.MODERN,
        });

        expect(section.getId()).toBe('section_retained');
        expect(() => section.getConfig()).toThrow('Section column APIs are supported only in traditional documents');
        expect(() => section.getRange()).toThrow('Section column APIs are supported only in traditional documents');
    });

    it('does not expose table-cell section sentinels as document sections', () => {
        univer.dispose();
        const T = DataStreamTreeTokenType;
        const dataStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const data = createDocumentData('top-level-section-doc', {
            dataStream,
            paragraphs: [
                { startIndex: 3, paragraphId: 'para_cell' },
                { startIndex: 8, paragraphId: 'para_root' },
            ],
            sectionBreaks: [
                { startIndex: 4, sectionId: 'section_cell' },
                { startIndex: 9, sectionId: 'section_root' },
            ],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);

        expect(document.getSections().map((section) => section.getId())).toEqual(['section_root']);
        expect(document.getSection(0)?.getRange()).toEqual({ startOffset: 0, endOffset: 9, segmentId: '' });
    });

    it('inserts and removes traditional sections through stable ids', () => {
        univer.dispose();
        const data = createDocumentData('section-lifecycle-doc', {
            dataStream: 'Alpha\r\n',
            paragraphs: [{ startIndex: 5, paragraphId: 'para_alpha_section' }],
            sectionBreaks: [{ startIndex: 6, sectionId: 'section_root' }],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);

        const inserted = document.insertSectionBreak(6, { sectionType: SectionType.CONTINUOUS });
        expect(inserted?.getId()).toMatch(/^section_/u);
        expect(inserted?.getConfig().sectionType).toBe(SectionType.CONTINUOUS);
        expect(document.getSections()).toHaveLength(2);

        expect(inserted?.remove()).toBe(true);
        expect(document.getSections().map((section) => section.getId())).toEqual(['section_root']);
        expect(document.getSection(0)?.remove()).toBe(false);
    });

    it('inserts a horizontal rule as a bordered paragraph', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());
        const offset = document.getBody().sectionBreaks![0].startIndex;

        const rule = document.insertHorizontalRule(offset);

        expect(rule).not.toBeNull();
        expect(rule?.getText()).toBe('');
        expect(rule?.getInfo().paragraph.paragraphStyle?.borderBottom).toMatchObject({
            padding: 5,
            width: 1,
            color: { rgb: '#CDD0D8' },
        });
    });
});
