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

import { ColumnSeparatorType, DocumentFlavor, ICommandService, SectionType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocumentData, createTestBed } from '../../../facade/__tests__/create-test-bed';
import { UpdateDocumentSectionCommand } from '../update-document-section.command';

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
});
