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

import { DeleteDirection, getRichTextEditPath, ICommandService, JSONX, TextXActionType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from '../../../facade/__tests__/create-test-bed';
import { RichTextEditingMutation } from '../../mutations/core-editing.mutation';
import { DeleteTextCommand, InsertTextCommand, UpdateTextCommand } from '../core-editing.command';

describe('core editing commands', () => {
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        testBed = createTestBed();
        commandService = testBed.get(ICommandService);
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('deletes text to the left of the collapsed range in the active document', () => {
        const result = commandService.syncExecuteCommand(DeleteTextCommand.id, {
            unitId: 'test',
            range: {
                startOffset: 6,
                endOffset: 6,
                collapsed: true,
            },
            direction: DeleteDirection.LEFT,
        });

        expect(result).toBe(true);
        expect(testBed.univerAPI.getActiveDocument()?.save().body?.dataStream).toBe('Hello\r\n');
    });

    it('does not delete the document minimum paragraph sentinel', () => {
        const result = commandService.syncExecuteCommand(DeleteTextCommand.id, {
            unitId: 'test',
            range: {
                startOffset: 6,
                endOffset: 6,
                collapsed: true,
            },
            direction: DeleteDirection.RIGHT,
        });

        expect(result).toBe(true);
        expect(testBed.univerAPI.getActiveDocument()?.save().body?.dataStream).toBe('Hello,\r\n');
    });

    it('does not delete the minimum paragraph sentinel in a header segment', () => {
        testBed.univer.dispose();
        testBed = createTestBed({
            id: 'test',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'body' }],
                sectionBreaks: [{ sectionId: 'section_fixture_101', startIndex: 5 }],
            },
            headers: {
                'header-1': {
                    headerId: 'header-1',
                    body: {
                        dataStream: 'Head\r\n',
                        paragraphs: [{ startIndex: 4, paragraphId: 'header' }],
                        sectionBreaks: [{ sectionId: 'section_fixture_102', startIndex: 5 }],
                    },
                },
            },
            documentStyle: {},
        });
        commandService = testBed.get(ICommandService);

        const result = commandService.syncExecuteCommand(DeleteTextCommand.id, {
            unitId: 'test',
            segmentId: 'header-1',
            range: {
                startOffset: 4,
                endOffset: 4,
                collapsed: true,
            },
            direction: DeleteDirection.RIGHT,
        });

        expect(result).toBe(true);
        expect(testBed.doc.getSnapshot().headers?.['header-1'].body.dataStream).toBe('Head\r\n');
    });

    it('keeps a header segment structurally valid when replacing all text', () => {
        testBed.univer.dispose();
        testBed = createTestBed({
            id: 'test',
            body: {
                dataStream: 'B\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'body' }],
                sectionBreaks: [{ sectionId: 'section_fixture_103', startIndex: 2 }],
            },
            headers: {
                'header-1': {
                    headerId: 'header-1',
                    body: {
                        dataStream: 'LongHead\r\n',
                        paragraphs: [{ startIndex: 8, paragraphId: 'header' }],
                        sectionBreaks: [{ sectionId: 'section_fixture_104', startIndex: 9 }],
                    },
                },
            },
            documentStyle: {},
        });
        commandService = testBed.get(ICommandService);

        const result = commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: 'test',
            segmentId: 'header-1',
            body: { dataStream: 'X' },
            range: {
                startOffset: 0,
                endOffset: 10,
                collapsed: false,
                segmentId: 'header-1',
            },
        });

        expect(result).toBe(true);
        expect(testBed.doc.getSnapshot().headers?.['header-1'].body.dataStream).toBe('X\r\n');
    });

    it('keeps a footer segment structurally valid when replacing all text', () => {
        testBed.univer.dispose();
        testBed = createTestBed({
            id: 'test',
            body: {
                dataStream: 'B\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'body' }],
                sectionBreaks: [{ sectionId: 'section_fixture_105', startIndex: 2 }],
            },
            footers: {
                'footer-1': {
                    footerId: 'footer-1',
                    body: {
                        dataStream: 'LongFooter\r\n',
                        paragraphs: [{ startIndex: 10, paragraphId: 'footer' }],
                        sectionBreaks: [{ sectionId: 'section_fixture_106', startIndex: 11 }],
                    },
                },
            },
            documentStyle: {},
        });
        commandService = testBed.get(ICommandService);

        const result = commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: 'test',
            segmentId: 'footer-1',
            body: { dataStream: 'Y' },
            range: {
                startOffset: 0,
                endOffset: 12,
                collapsed: false,
                segmentId: 'footer-1',
            },
        });

        expect(result).toBe(true);
        expect(testBed.doc.getSnapshot().footers?.['footer-1'].body.dataStream).toBe('Y\r\n');
    });

    it('rejects invalid rich text mutations in header segments and rolls them back', () => {
        testBed.univer.dispose();
        testBed = createTestBed({
            id: 'test',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'body' }],
                sectionBreaks: [{ sectionId: 'section_fixture_107', startIndex: 5 }],
            },
            headers: {
                'header-1': {
                    headerId: 'header-1',
                    body: {
                        dataStream: 'Head\r\n',
                        paragraphs: [{ startIndex: 4, paragraphId: 'header' }],
                        sectionBreaks: [{ sectionId: 'section_fixture_108', startIndex: 5 }],
                    },
                },
            },
            documentStyle: {},
        });
        commandService = testBed.get(ICommandService);

        const actions = JSONX.getInstance().editOp([
            { t: TextXActionType.RETAIN, len: 4 },
            { t: TextXActionType.DELETE, len: 2 },
        ], getRichTextEditPath(testBed.doc, 'header-1'));

        expect(() => commandService.syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: 'test',
            segmentId: 'header-1',
            actions,
            textRanges: null,
        })).toThrow('[DocStructure] header header-1');
        expect(testBed.doc.getSnapshot().headers?.['header-1'].body.dataStream).toBe('Head\r\n');
    });

    it('expands deletion to whole custom entities', () => {
        testBed.univer.dispose();
        testBed = createTestBed({
            id: 'test',
            body: {
                dataStream: 'A@B\r\n',
                paragraphs: [{ startIndex: 3, paragraphId: 'para_entity' }],
                customRanges: [{
                    startIndex: 1,
                    endIndex: 2,
                    rangeId: 'mention-1',
                    rangeType: 0,
                    wholeEntity: true,
                }],
            },
            documentStyle: {},
        });
        commandService = testBed.get(ICommandService);

        const result = commandService.syncExecuteCommand(DeleteTextCommand.id, {
            unitId: 'test',
            range: {
                startOffset: 2,
                endOffset: 2,
                collapsed: true,
            },
            direction: DeleteDirection.RIGHT,
            len: 1,
        });

        expect(result).toBe(true);
        expect(testBed.univerAPI.getActiveDocument()?.save().body?.dataStream).toBe('A\r\n');
    });

    it('updates text style over a range without changing the document text', () => {
        const result = commandService.syncExecuteCommand(UpdateTextCommand.id, {
            unitId: 'test',
            range: {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            },
            updateBody: {
                textRuns: [{
                    st: 0,
                    ed: 5,
                    ts: { bl: 1 },
                }],
            },
            coverType: 0,
            textRanges: [{
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
            }],
        });

        const body = testBed.univerAPI.getActiveDocument()?.save().body;
        expect(result).toBe(true);
        expect(body?.dataStream).toBe('Hello,\r\n');
    });

    it('returns false when the target document or body cannot be resolved', () => {
        expect(commandService.syncExecuteCommand(DeleteTextCommand.id, {
            unitId: 'missing-doc',
            range: {
                startOffset: 1,
                endOffset: 1,
                collapsed: true,
            },
            direction: DeleteDirection.LEFT,
        })).toBe(false);

        expect(commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: 'missing-doc',
            body: { dataStream: 'X' },
            range: {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
            },
        })).toBe(false);
    });
});
