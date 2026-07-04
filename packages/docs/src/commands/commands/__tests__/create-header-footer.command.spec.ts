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
import { CreateHeaderFooterCommand, HeaderFooterType } from '../create-header-footer.command';

describe('CreateHeaderFooterCommand', () => {
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        const documentData = createDocumentData('test', {
            dataStream: 'Hello,\r\n',
            paragraphs: [{ startIndex: 6, paragraphId: 'para_fixture_19' }],
        });
        documentData.documentStyle = {
            ...documentData.documentStyle,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        };
        testBed = createTestBed(documentData);
        commandService = testBed.get(ICommandService);
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('creates only the requested header segment by default', () => {
        expect(commandService.syncExecuteCommand(CreateHeaderFooterCommand.id, {
            unitId: 'test',
            segmentId: 'header-segment-1',
            createType: HeaderFooterType.DEFAULT_HEADER,
        })).toBe(true);

        const snapshot = testBed.doc.getSnapshot();
        expect(snapshot.documentStyle.defaultHeaderId).toBe('header-segment-1');
        expect(snapshot.headers?.['header-segment-1'].body?.dataStream).toBe('\r\n');
        expect(snapshot.documentStyle.defaultFooterId).toBeFalsy();
        expect(Object.keys(snapshot.footers ?? {})).toEqual([]);
    });

    it('can create a paired footer for UI compatibility', () => {
        expect(commandService.syncExecuteCommand(CreateHeaderFooterCommand.id, {
            unitId: 'test',
            segmentId: 'header-segment-1',
            createType: HeaderFooterType.DEFAULT_HEADER,
            createMode: 'pair',
        })).toBe(true);

        const snapshot = testBed.doc.getSnapshot();
        expect(snapshot.documentStyle.defaultHeaderId).toBe('header-segment-1');
        expect(snapshot.documentStyle.defaultFooterId).toEqual(expect.any(String));
        expect(snapshot.footers?.[snapshot.documentStyle.defaultFooterId!].body?.dataStream).toBe('\r\n');
    });
});
