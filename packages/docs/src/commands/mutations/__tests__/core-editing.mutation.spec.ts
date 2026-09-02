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

import { ICommandService, JSONX } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createTestBed } from '../../../facade/__tests__/create-test-bed';
import { DocSelectionManagerService } from '../../../services/doc-selection-manager.service';
import { RichTextEditingMutation, transformDocumentTextRanges } from '../core-editing.mutation';

describe('transformDocumentTextRanges', () => {
    it('moves an active body caret through an insertion with right priority', () => {
        expect(transformDocumentTextRanges(['body', {
            et: 'text-x',
            e: [
                { t: 'r', len: 10 },
                { t: 'i', len: 6, body: { dataStream: 'REMOTE' } },
            ],
        }], [{
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }])).toEqual([expect.objectContaining({
            startOffset: 20,
            endOffset: 20,
            collapsed: true,
            isActive: true,
        })]);
    });

    it('treats an omitted segment id as the document body', () => {
        expect(transformDocumentTextRanges(['body', {
            et: 'text-x',
            e: [
                { t: 'i', len: 6, body: { dataStream: 'REMOTE' } },
            ],
        }], [{
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            isActive: true,
        }])).toEqual([expect.objectContaining({
            startOffset: 20,
            endOffset: 20,
            collapsed: true,
            isActive: true,
        })]);
    });

    it('does not move a body selection through a header mutation', () => {
        const range = {
            startOffset: 14,
            endOffset: 18,
            collapsed: false,
            segmentId: '',
        };
        expect(transformDocumentTextRanges(['header-1', 'body', {
            et: 'text-x',
            e: [{ t: 'i', len: 6, body: { dataStream: 'REMOTE' } }],
        }], [range])).toEqual([range]);
    });
});

describe('RichTextEditingMutation selection scheduling', () => {
    it('does not refresh selection for metadata changes without ranges', async () => {
        const testBed = createTestBed();
        const selectionManager = testBed.get(DocSelectionManagerService);
        const refreshSelection = vi.spyOn(selectionManager, 'refreshSelection');
        const documentStyle = testBed.doc.getDocumentStyle();
        const previousMargin = documentStyle.marginTop;
        const actions = JSONX.getInstance().replaceOp(
            ['documentStyle', 'marginTop'],
            previousMargin,
            (previousMargin ?? 0) + 1
        );

        testBed.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: testBed.doc.getUnitId(),
            actions,
            textRanges: [],
            trigger: 'test.metadata-command',
        });
        await Promise.resolve();

        expect(refreshSelection).not.toHaveBeenCalled();
        testBed.univer.dispose();
    });
});
