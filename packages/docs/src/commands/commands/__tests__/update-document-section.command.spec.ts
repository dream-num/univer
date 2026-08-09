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

import { ColumnSeparatorType, DataStreamTreeTokenType, DocumentFlavor, ICommandService, IUndoRedoService, PageOrientType, RedoCommand, SectionType, UndoCommand } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocumentData, createTestBed } from '../../../facade/__tests__/create-test-bed';
import { InsertDocumentColumnBreakCommand, InsertDocumentSectionBreakCommand, UpdateDocumentSectionCommand } from '../update-document-section.command';

describe('UpdateDocumentSectionCommand', () => {
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        const data = createDocumentData('section-command-doc', {
            dataStream: 'One\r\nTwo\r\n',
            paragraphs: [
                { startIndex: 3, paragraphId: 'para_one' },
                { startIndex: 8, paragraphId: 'para_two' },
            ],
            sectionBreaks: [
                { startIndex: 4, sectionId: 'section_one' },
                { startIndex: 9, sectionId: 'section_two' },
            ],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        testBed = createTestBed(data);
        commandService = testBed.get(ICommandService);
    });

    afterEach(() => testBed.univer.dispose());

    it('updates selected sections by id through one rich-text command', () => {
        expect(commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: 'section-command-doc',
            updates: [
                {
                    sectionId: 'section_one',
                    config: {
                        columnProperties: [
                            { width: 190, paddingEnd: 18 },
                            { width: 190, paddingEnd: 0 },
                        ],
                        columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
                        sectionType: SectionType.CONTINUOUS,
                    },
                },
                {
                    sectionId: 'section_two',
                    config: {
                        columnProperties: [
                            { width: 120, paddingEnd: 12 },
                            { width: 120, paddingEnd: 12 },
                            { width: 120, paddingEnd: 0 },
                        ],
                        columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
                        sectionType: SectionType.NEXT_PAGE,
                    },
                },
            ],
        })).toBe(true);

        expect(testBed.doc.getBody()?.sectionBreaks).toEqual([
            expect.objectContaining({ sectionId: 'section_one', sectionType: SectionType.CONTINUOUS, columnProperties: expect.arrayContaining([expect.objectContaining({ width: 190 })]) }),
            expect.objectContaining({ sectionId: 'section_two', sectionType: SectionType.NEXT_PAGE, columnProperties: expect.arrayContaining([expect.objectContaining({ width: 120 })]) }),
        ]);
    });

    it('rejects unknown ids and modern documents without partial updates', () => {
        expect(commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: 'section-command-doc',
            updates: [
                { sectionId: 'section_one', config: { sectionType: SectionType.NEXT_PAGE } },
                { sectionId: 'missing', config: { sectionType: SectionType.NEXT_PAGE } },
            ],
        })).toBe(false);
        expect(testBed.doc.getBody()?.sectionBreaks?.[0].sectionType).toBeUndefined();

        testBed.doc.updateDocumentStyle({
            ...testBed.doc.getDocumentStyle(),
            documentFlavor: DocumentFlavor.MODERN,
        });
        expect(commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: 'section-command-doc',
            updates: [{ sectionId: 'section_one', config: { sectionType: SectionType.NEXT_PAGE } }],
        })).toBe(false);
    });

    it('rejects invalid page geometry without mutating the section', () => {
        expect(commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: 'section-command-doc',
            updates: [{ sectionId: 'section_one', config: { marginLeft: -1 } }],
        })).toBe(false);
        expect(commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: 'section-command-doc',
            updates: [{
                sectionId: 'section_one',
                config: {
                    pageSize: { width: 100, height: 100 },
                    marginLeft: 50,
                    marginRight: 50,
                },
            }],
        })).toBe(false);
        expect(testBed.doc.getBody()?.sectionBreaks?.[0].marginLeft).toBeUndefined();
    });

    it('updates section page geometry and numbering through one rich-text mutation', () => {
        expect(commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: 'section-command-doc',
            updates: [{
                sectionId: 'section_one',
                config: {
                    pageNumberStart: 5,
                    pageSize: { width: 960, height: 720 },
                    pageOrient: PageOrientType.LANDSCAPE,
                    marginTop: 48,
                    marginBottom: 56,
                    marginLeft: 64,
                    marginRight: 72,
                },
            }],
        })).toBe(true);

        expect(testBed.doc.getBody()?.sectionBreaks?.[0]).toMatchObject({
            pageNumberStart: 5,
            pageSize: { width: 960, height: 720 },
            pageOrient: PageOrientType.LANDSCAPE,
            marginTop: 48,
            marginBottom: 56,
            marginLeft: 64,
            marginRight: 72,
        });
    });

    it('inserts a top-level column break with OOXML round-trip metadata', () => {
        expect(commandService.syncExecuteCommand(InsertDocumentColumnBreakCommand.id, {
            unitId: 'section-command-doc',
            offset: 2,
        })).toBe(true);

        const body = testBed.doc.getBody()!;
        expect(body.dataStream[2]).toBe(DataStreamTreeTokenType.COLUMN_BREAK);
        expect(body.customRanges).toContainEqual(expect.objectContaining({
            startIndex: 2,
            endIndex: 2,
            wholeEntity: true,
            properties: { breakType: 'column' },
        }));
    });

    it('inserts a boundary and configures the following section as one undoable mutation', () => {
        testBed.get(IUndoRedoService);
        const originalBody = structuredClone(testBed.doc.getBody())!;

        expect(commandService.syncExecuteCommand(InsertDocumentSectionBreakCommand.id, {
            unitId: 'section-command-doc',
            offset: 5,
            sectionId: 'section_inserted',
            nextSectionType: SectionType.ODD_PAGE,
        })).toBe(true);
        expect(testBed.doc.getBody()?.sectionBreaks).toEqual([
            expect.objectContaining({ sectionId: 'section_one', startIndex: 4 }),
            expect.objectContaining({ sectionId: 'section_inserted', startIndex: 5 }),
            expect.objectContaining({ sectionId: 'section_two', startIndex: 10, sectionType: SectionType.ODD_PAGE }),
        ]);

        expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(testBed.doc.getBody()?.dataStream).toBe(originalBody.dataStream);
        expect(testBed.doc.getBody()?.sectionBreaks).toEqual(originalBody.sectionBreaks);
        expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(testBed.doc.getBody()?.sectionBreaks).toEqual([
            expect.objectContaining({ sectionId: 'section_one', startIndex: 4 }),
            expect.objectContaining({ sectionId: 'section_inserted', startIndex: 5 }),
            expect.objectContaining({ sectionId: 'section_two', startIndex: 10, sectionType: SectionType.ODD_PAGE }),
        ]);
    });

    it('rejects invalid section insertion inputs without partial changes', () => {
        const originalBody = structuredClone(testBed.doc.getBody())!;

        expect(commandService.syncExecuteCommand(InsertDocumentSectionBreakCommand.id, {
            unitId: 'section-command-doc',
            offset: 5,
            sectionId: 'section_one',
        })).toBe(false);
        expect(commandService.syncExecuteCommand(InsertDocumentSectionBreakCommand.id, {
            unitId: 'section-command-doc',
            offset: 5,
            sectionId: 'section_bad_geometry',
            config: {
                pageSize: { width: 100, height: 100 },
                marginLeft: 50,
                marginRight: 50,
            },
        })).toBe(false);
        expect(commandService.syncExecuteCommand(InsertDocumentSectionBreakCommand.id, {
            unitId: 'section-command-doc',
            offset: 10,
            sectionId: 'section_without_following_section',
            nextSectionType: SectionType.NEXT_PAGE,
        })).toBe(false);

        expect(testBed.doc.getBody()).toEqual(originalBody);
    });
});
