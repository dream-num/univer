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

import { DocumentFlavor, ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocumentData, createTestBed } from '../../../facade/__tests__/create-test-bed';
import { SetSectionHeaderFooterLinkCommand } from '../set-section-header-footer-link.command';

describe('SetSectionHeaderFooterLinkCommand', () => {
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        const data = createDocumentData('section-header-link-doc', {
            dataStream: 'One\r\nTwo\r\nThree\r\n',
            paragraphs: [
                { startIndex: 3, paragraphId: 'para_one' },
                { startIndex: 8, paragraphId: 'para_two' },
                { startIndex: 15, paragraphId: 'para_three' },
            ],
            sectionBreaks: [
                { startIndex: 4, sectionId: 'section_one', defaultHeaderId: 'header-a' },
                { startIndex: 9, sectionId: 'section_two' },
                { startIndex: 16, sectionId: 'section_three', defaultHeaderId: 'header-c' },
            ],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        data.headers = {
            'header-a': {
                headerId: 'header-a',
                body: {
                    dataStream: 'Shared\r\n',
                    paragraphs: [{ startIndex: 6, paragraphId: 'header_para' }],
                    sectionBreaks: [{ startIndex: 7, sectionId: 'header_section' }],
                },
            },
            'header-c': {
                headerId: 'header-c',
                body: {
                    dataStream: 'Third\r\n',
                    paragraphs: [{ startIndex: 5, paragraphId: 'header_c_para' }],
                    sectionBreaks: [{ startIndex: 6, sectionId: 'header_c_section' }],
                },
            },
        };
        testBed = createTestBed(data);
        commandService = testBed.get(ICommandService);
    });

    afterEach(() => testBed.univer.dispose());

    it('unlinks by cloning the inherited resource and links again by removing the explicit reference', () => {
        const bodyBefore = testBed.doc.getBody()?.dataStream;
        expect(commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: 'section-header-link-doc',
            sectionId: 'section_two',
            kind: 'header',
            variant: 'default',
            linkedToPrevious: false,
            segmentId: 'header-b',
        })).toBe(true);

        let snapshot = testBed.doc.getSnapshot();
        expect(snapshot.body?.sectionBreaks?.[1].defaultHeaderId).toBe('header-b');
        expect(snapshot.headers?.['header-b']).toEqual({
            ...snapshot.headers?.['header-a'],
            headerId: 'header-b',
        });

        expect(commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: 'section-header-link-doc',
            sectionId: 'section_two',
            kind: 'header',
            variant: 'default',
            linkedToPrevious: true,
        })).toBe(true);

        snapshot = testBed.doc.getSnapshot();
        expect(snapshot.body?.sectionBreaks?.[1].defaultHeaderId).toBeUndefined();
        expect(snapshot.headers?.['header-b']).toBeUndefined();
        expect(snapshot.body?.dataStream).toBe(bodyBefore);
    });

    it('rejects linking the first section and duplicate unlink operations', () => {
        expect(commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: 'section-header-link-doc',
            sectionId: 'section_one',
            kind: 'header',
            variant: 'default',
            linkedToPrevious: true,
        })).toBe(false);
        expect(commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: 'section-header-link-doc',
            sectionId: 'section_three',
            kind: 'header',
            variant: 'default',
            linkedToPrevious: false,
            segmentId: 'header-d',
        })).toBe(false);
    });

    it('creates an empty independent footer when the previous section has none', () => {
        expect(commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: 'section-header-link-doc',
            sectionId: 'section_two',
            kind: 'footer',
            variant: 'default',
            linkedToPrevious: false,
            segmentId: 'footer-b',
        })).toBe(true);

        const snapshot = testBed.doc.getSnapshot();
        expect(snapshot.body?.sectionBreaks?.[1].defaultFooterId).toBe('footer-b');
        expect(snapshot.footers?.['footer-b'].body?.dataStream).toBe('\r\n');
    });

    it('rejects the operation in modern documents', () => {
        testBed.doc.updateDocumentStyle({
            ...testBed.doc.getDocumentStyle(),
            documentFlavor: DocumentFlavor.MODERN,
        });
        expect(commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: 'section-header-link-doc',
            sectionId: 'section_two',
            kind: 'header',
            variant: 'default',
            linkedToPrevious: false,
            segmentId: 'header-modern',
        })).toBe(false);
        expect(testBed.doc.getSnapshot().headers?.['header-modern']).toBeUndefined();
    });
});
