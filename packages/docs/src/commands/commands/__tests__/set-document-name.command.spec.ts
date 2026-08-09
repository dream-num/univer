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

import { ICommandService, RedoCommand, UndoCommand } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocumentData, createTestBed } from '../../../facade/__tests__/create-test-bed';
import { SetDocumentNameCommand } from '../set-document-name.command';

describe('SetDocumentNameCommand', () => {
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        testBed = createTestBed(createDocumentData('test', { dataStream: '\r\n' }));
        commandService = testBed.get(ICommandService);
    });

    afterEach(() => testBed.univer.dispose());

    it('renames a document and supports undo and redo', () => {
        expect(
            commandService.syncExecuteCommand(SetDocumentNameCommand.id, {
                unitId: 'test',
                name: 'New name',
            })
        ).toBe(true);
        expect(testBed.doc.getTitle()).toBe('New name');

        expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(testBed.doc.getTitle()).toBe('');
        expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(testBed.doc.getTitle()).toBe('New name');
    });
});
