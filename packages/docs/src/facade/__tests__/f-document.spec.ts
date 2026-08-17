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
import { BlockType, ColumnSeparatorType, DataStreamTreeTokenType, DocumentFlavor, DrawingTypeEnum, ICommandService, IResourceManagerService, IUndoRedoService, PageOrientType, PositionedObjectLayoutType, SectionType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, InsertTextCommand } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

    it('exposes document layout enums through univerAPI', () => {
        expect(univerAPI.Enum.DocumentFlavor).toBe(DocumentFlavor);
        expect(univerAPI.Enum.SectionType).toMatchObject({
            SECTION_TYPE_UNSPECIFIED: 0,
            CONTINUOUS: 1,
            NEXT_COLUMN: 2,
            NEXT_PAGE: 3,
            EVEN_PAGE: 4,
            ODD_PAGE: 5,
        });
        expect(univerAPI.Enum.ColumnSeparatorType.BETWEEN_EACH_COLUMN).toBe(ColumnSeparatorType.BETWEEN_EACH_COLUMN);
    });

    it.each([
        { flavor: DocumentFlavor.TRADITIONAL, traditional: true, modern: false },
        { flavor: DocumentFlavor.MODERN, traditional: false, modern: true },
        { flavor: DocumentFlavor.UNSPECIFIED, traditional: false, modern: false },
    ])('reports the exact $flavor document flavor', ({ flavor, traditional, modern }) => {
        univer.dispose();
        const data = createSimpleDocument(`flavor-${flavor}`);
        data.documentStyle = { ...data.documentStyle, documentFlavor: flavor };
        createDocumentFacade(data);

        expect(document.getDocumentFlavor()).toBe(flavor);
        expect(document.isTraditional()).toBe(traditional);
        expect(document.isModern()).toBe(modern);
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

    it('sets the document name and supports undo and redo', () => {
        expect(document.setName('Renamed document')).toBe(document);
        expect(document.getName()).toBe('Renamed document');

        expect(document.undo()).toBe(true);
        expect(document.getName()).toBe('');

        expect(document.redo()).toBe(true);
        expect(document.getName()).toBe('Renamed document');
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

    it('deletes drawing references atomically without changing the interactive selection', async () => {
        univer.dispose();
        const data = createDocumentData('drawing-delete-doc', {
            dataStream: '\b\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'para-drawing' }],
            customBlocks: [{ blockId: 'drawing-1', blockType: BlockType.DRAWING, startIndex: 0 }],
        });
        data.drawings = { 'drawing-1': createDrawingData('drawing-delete-doc', 'drawing-1') };
        data.drawingsOrder = ['drawing-1'];
        createDocumentFacade(data);
        get(IUndoRedoService);
        const replaceDocRanges = vi.spyOn(get(DocSelectionManagerService), 'replaceDocRanges');

        expect(document.deleteRange({ startOffset: 0, endOffset: 1 })).toBe(true);
        await Promise.resolve();
        expect(replaceDocRanges).not.toHaveBeenCalled();
        expect(document.save()).toMatchObject({
            body: { customBlocks: [] },
            drawings: {},
            drawingsOrder: [],
        });

        expect(document.undo()).toBe(true);
        expect(document.save()).toMatchObject({
            body: { customBlocks: [{ blockId: 'drawing-1', startIndex: 0 }] },
            drawings: { 'drawing-1': { drawingId: 'drawing-1' } },
            drawingsOrder: ['drawing-1'],
        });

        expect(document.redo()).toBe(true);
        expect(document.save()).toMatchObject({
            body: { customBlocks: [] },
            drawings: {},
            drawingsOrder: [],
        });
    });

    it('deletes header drawing references in the header segment history', () => {
        univer.dispose();
        const data = createDocumentData('header-drawing-delete-doc', {
            dataStream: 'Body\r\n',
            paragraphs: [{ startIndex: 4, paragraphId: 'body-paragraph' }],
        });
        data.headers = {
            'header-drawing': {
                headerId: 'header-drawing',
                body: {
                    dataStream: '\b\r\n',
                    paragraphs: [{ startIndex: 1, paragraphId: 'header-paragraph' }],
                    customBlocks: [{ blockId: 'header-shape', blockType: BlockType.DRAWING, startIndex: 0 }],
                },
            },
        };
        data.drawings = { 'header-shape': createDrawingData(data.id, 'header-shape') };
        data.drawingsOrder = ['header-shape'];
        createDocumentFacade(data);
        get(IUndoRedoService);

        expect(document.deleteRange({ startOffset: 0, endOffset: 1, segmentId: 'header-drawing' })).toBe(true);
        expect(document.save()).toMatchObject({
            headers: { 'header-drawing': { body: { customBlocks: [] } } },
            drawings: {},
            drawingsOrder: [],
        });

        expect(document.undo()).toBe(true);
        expect(document.save()).toMatchObject({
            headers: {
                'header-drawing': {
                    body: { customBlocks: [{ blockId: 'header-shape', startIndex: 0 }] },
                },
            },
            drawings: { 'header-shape': { drawingId: 'header-shape' } },
            drawingsOrder: ['header-shape'],
        });

        expect(document.redo()).toBe(true);
        expect(document.save()).toMatchObject({
            headers: { 'header-drawing': { body: { customBlocks: [] } } },
            drawings: {},
            drawingsOrder: [],
        });
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
        expect(document.getSectionAt(4)).toBeNull();
        expect(document.getSectionAt(5)?.getIndex()).toBe(1);
        const first = document.getSection(0)!;
        expect(first.getRange()).toEqual({ startOffset: 0, endOffset: 4, segmentId: '' });
        expect(first.setColumns(2, { gap: 20, separator: true })).toBe(true);
        expect(first.setSectionType(SectionType.CONTINUOUS)).toBe(true);
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
        const body = document.save().body;
        expect(body?.dataStream[2]).toBe(DataStreamTreeTokenType.COLUMN_BREAK);
        expect(body?.customRanges).toContainEqual(expect.objectContaining({
            startIndex: 2,
            endIndex: 2,
            wholeEntity: true,
            properties: { breakType: 'column' },
        }));
    });

    it('rejects explicit columns that overflow the section content width', () => {
        univer.dispose();
        const data = createDocumentData('section-validation-doc', {
            dataStream: 'One\r\n',
            paragraphs: [{ startIndex: 3, paragraphId: 'para-section-validation' }],
            sectionBreaks: [{ sectionId: 'section_validation', startIndex: 4 }],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);
        const section = document.getSection(0)!;

        expect(() => section.setColumns(2, { gap: 20, widths: [300, 300] })).toThrow('exceed the available page content width');
        expect(() => section.setColumnProperties([
            { width: 300, paddingEnd: 20 },
            { width: 300, paddingEnd: 0 },
        ])).toThrow('exceed the available page content width');
    });

    it('updates per-section page setup through commands with undo and redo', () => {
        univer.dispose();
        const data = createDocumentData('section-page-setup-doc', {
            dataStream: 'One\r\n',
            paragraphs: [{ startIndex: 3, paragraphId: 'para-page-setup' }],
            sectionBreaks: [{ sectionId: 'section_page_setup', startIndex: 4 }],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);
        get(IUndoRedoService);

        const section = document.getSection(0)!;
        expect(() => section.setPageSetup({
            pageSize: { width: 100, height: 100 },
            marginLeft: 50,
            marginRight: 50,
        })).toThrow('must leave a positive content area');
        expect(() => section.setPageSetup({ marginTop: Number.NaN })).toThrow('must be finite');
        const pageSetup = {
            pageNumberStart: 3,
            pageSize: { width: 960, height: 720 },
            pageOrient: PageOrientType.LANDSCAPE,
            marginTop: 48,
            marginBottom: 56,
            marginLeft: 64,
            marginRight: 72,
        };

        expect(section.setPageSetup(pageSetup)).toBe(true);
        expect(section.getPageSetup()).toEqual(pageSetup);
        expect(section.getEffectivePageSetup()).toEqual({
            pageNumberStart: 3,
            pageSize: { width: 960, height: 720 },
            pageOrient: PageOrientType.LANDSCAPE,
            margins: {
                top: 48,
                bottom: 56,
                left: 64,
                right: 72,
            },
            contentSize: {
                width: 824,
                height: 616,
            },
        });
        expect(document.undo()).toBe(true);
        expect(section.getPageSetup()).toEqual({
            pageNumberStart: undefined,
            pageSize: undefined,
            pageOrient: undefined,
            marginTop: undefined,
            marginBottom: undefined,
            marginLeft: undefined,
            marginRight: undefined,
        });
        expect(document.redo()).toBe(true);
        expect(section.getPageSetup()).toEqual(pageSetup);
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.UNSPECIFIED])(
        'keeps traditional section mutation unavailable for document flavor %s',
        (documentFlavor) => {
            univer.dispose();
            const data = createSimpleDocument(`unsupported-sections-${documentFlavor}`);
            data.documentStyle = { ...data.documentStyle, documentFlavor };
            createDocumentFacade(data);

            expect(document.getSections()).toEqual([]);
            expect(() => document.insertColumnBreak(0)).toThrow('Section column APIs are supported only in traditional documents');
            expect(() => document.insertSectionBreak(0)).toThrow('Section column APIs are supported only in traditional documents');
        }
    );

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

    it('atomically sets how the following section begins when inserting a section break', () => {
        univer.dispose();
        const data = createDocumentData('section-next-page-doc', {
            dataStream: 'Alpha\r\n',
            paragraphs: [{ startIndex: 5, paragraphId: 'para_alpha_section' }],
            sectionBreaks: [{ startIndex: 6, sectionId: 'section_root' }],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        createDocumentFacade(data);
        get(IUndoRedoService);

        const inserted = document.insertSectionBreak(6, {
            sectionType: SectionType.CONTINUOUS,
            nextSectionType: SectionType.NEXT_PAGE,
        });

        expect(inserted?.getConfig().sectionType).toBe(SectionType.CONTINUOUS);
        expect(document.getSection(1)?.getId()).toBe('section_root');
        expect(document.getSection(1)?.getConfig().sectionType).toBe(SectionType.NEXT_PAGE);

        expect(document.undo()).toBe(true);
        expect(document.getSections().map((section) => section.getId())).toEqual(['section_root']);
        expect(document.getSection(0)?.getConfig().sectionType).toBeUndefined();

        expect(document.redo()).toBe(true);
        expect(document.getSections()).toHaveLength(2);
        expect(document.getSection(1)?.getConfig().sectionType).toBe(SectionType.NEXT_PAGE);
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
        expect(rule?.getInfo().paragraph.paragraphStyle?.spaceBelow).toEqual({ v: 10 });
    });
});

function createDrawingData(unitId: string, drawingId: string) {
    return {
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_SHAPE,
        docTransform: {
            angle: 0,
            positionH: { posOffset: 0, relativeFrom: 0 },
            positionV: { posOffset: 0, relativeFrom: 0 },
            size: { height: 40, width: 80 },
        },
        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
        subUnitId: unitId,
        unitId,
    };
}
