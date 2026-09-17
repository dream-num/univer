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

import { CustomRangeType, ICommandService, Tools } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { describe, expect, it } from 'vitest';
import { DocIMEInputManagerService } from '../../../services/doc-ime-input-manager.service';
import { IMEInputCommand } from '../ime-input.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('IME composition range preservation', () => {
    it.each([CustomRangeType.SDT, CustomRangeType.HYPERLINK].flatMap((rangeType) =>
        ['中', '中文'].flatMap((previous) => ['你', '中文测试'].flatMap((next) =>
            [false, true].map((nested) => ({ rangeType, previous, next, nested }))))
    ))('retains range $rangeType when replacing $previous with $next (nested $nested)', async ({ rangeType, previous, next, nested }) => {
        const properties = rangeType === CustomRangeType.SDT
            ? { kind: 'text', showingPlaceholder: false }
            : { url: 'https://example.com' };
        const bed = createCommandTestBed({
            id: 'ime-range',
            body: {
                dataStream: `A${previous}B\r\n`,
                paragraphs: [{ startIndex: previous.length + 2, paragraphId: 'paragraph' }],
                customRanges: [...(nested
                    ? [{
                        rangeId: 'outer-control',
                        rangeType: CustomRangeType.SDT,
                        startIndex: 0,
                        endIndex: previous.length + 1,
                        wholeEntity: false,
                        properties: { kind: 'richText', showingPlaceholder: false },
                    }]
                    : []), {
                    rangeId: 'preceding-link',
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 0,
                    endIndex: 0,
                    properties: { url: 'https://example.org' },
                }, {
                    rangeId: 'composition',
                    rangeType,
                    startIndex: 1,
                    endIndex: previous.length,
                    wholeEntity: false,
                    properties,
                }],
            },
            documentStyle: {},
        });
        try {
            const commands = bed.get(ICommandService);
            commands.registerCommand(IMEInputCommand);
            commands.registerCommand(RichTextEditingMutation);
            const ime = bed.get(DocIMEInputManagerService);
            ime.setActiveRange({ startOffset: 1, endOffset: 1, collapsed: true, segmentId: '' });
            const before = Tools.deepClone(bed.doc.getBody());

            expect(await commands.executeCommand(IMEInputCommand.id, {
                unitId: bed.doc.getUnitId(),
                newText: next,
                oldTextLen: previous.length,
                isCompositionStart: false,
                isCompositionEnd: true,
            })).toBe(true);
            expect(bed.doc.getBody()?.dataStream).toBe(`A${next}B\r\n`);
            expect(bed.doc.getBody()?.customRanges).toEqual(before!.customRanges!.map((range) => ({
                ...range,
                endIndex: range.rangeId === 'preceding-link' ? range.endIndex : range.endIndex + next.length - previous.length,
            })));

            const undo = ime.getUndoRedoMutationParamsCache().undoCache[0];
            commands.syncExecuteCommand(RichTextEditingMutation.id, { ...undo, noHistory: true });
            expect(bed.doc.getBody()?.dataStream).toBe(before!.dataStream);
            expect(bed.doc.getBody()?.customRanges).toEqual(before!.customRanges);
        } finally {
            bed.univer.dispose();
        }
    });
});
