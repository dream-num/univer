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

import { DeleteDirection, ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from '../../../__tests__/create-test-bed';
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
