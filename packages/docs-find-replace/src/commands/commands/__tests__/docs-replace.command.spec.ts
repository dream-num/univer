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

import type { ICommand, IDocumentData } from '@univerjs/core';
import type { IFindQuery } from '@univerjs/find-replace';
import { BooleanNumber, CustomRangeType, ICommandService, UndoCommandId } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { createCommandTestBed } from '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { describe, expect, it } from 'vitest';
import { DocsReplaceCommand } from '../docs-replace.command';

function docsQuery(findString: string, overrides: Partial<IFindQuery> = {}): IFindQuery {
    return {
        findString,
        replaceRevealed: true,
        caseSensitive: false,
        matchesTheWholeWord: false,
        matchesTheWholeCell: false,
        findDirection: FindDirection.ROW,
        findScope: FindScope.SUBUNIT,
        findBy: FindBy.VALUE,
        ...overrides,
    };
}

function styledDocument(dataStream: string): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{ st: 0, ed: dataStream.length - 2, ts: { bl: BooleanNumber.TRUE } }],
        },
        documentStyle: {},
    };
}

function registerCommands(commandService: ICommandService): void {
    commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    commandService.registerCommand(DocsReplaceCommand);
}

describe('DocsReplaceCommand', () => {
    it('replaces all matches in one undoable mutation and keeps the first style', async () => {
        const testBed = createCommandTestBed(styledDocument('cat cat\r\n'));
        const commandService = testBed.get(ICommandService);
        registerCommands(commandService);

        await expect(commandService.executeCommand(DocsReplaceCommand.id, {
            unitId: 'test-doc',
            query: docsQuery('cat'),
            replaceString: 'dog',
        })).resolves.toEqual({ success: 2, failure: 0 });
        expect(testBed.doc.getBody()?.dataStream).toBe('dog dog\r\n');
        expect(testBed.doc.getBody()?.textRuns?.[0].ts?.bl).toBe(BooleanNumber.TRUE);

        await commandService.executeCommand(UndoCommandId);
        expect(testBed.doc.getBody()?.dataStream).toBe('cat cat\r\n');
        testBed.univer.dispose();
    });

    it('skips whole entities and rejects a stale current range', async () => {
        const testBed = createCommandTestBed({
            id: 'test-doc',
            body: {
                dataStream: 'cat @cat\r\n',
                customRanges: [{
                    startIndex: 4,
                    endIndex: 7,
                    rangeId: 'mention-1',
                    rangeType: CustomRangeType.MENTION,
                    wholeEntity: true,
                }],
            },
            documentStyle: {},
        });
        const commandService = testBed.get(ICommandService);
        registerCommands(commandService);

        await expect(commandService.executeCommand(DocsReplaceCommand.id, {
            unitId: 'test-doc',
            query: docsQuery('cat'),
            replaceString: 'dog',
        })).resolves.toEqual({ success: 1, failure: 1 });
        await expect(commandService.executeCommand(DocsReplaceCommand.id, {
            unitId: 'test-doc',
            query: docsQuery('cat'),
            replaceString: 'dog',
            range: { startOffset: 20, endOffset: 23, collapsed: false },
        })).resolves.toEqual({ success: 0, failure: 1 });
        testBed.univer.dispose();
    });

    it('supports deletion', async () => {
        const testBed = createCommandTestBed(styledDocument('cat dog\r\n'));
        const commandService = testBed.get(ICommandService);
        registerCommands(commandService);

        await expect(commandService.executeCommand(DocsReplaceCommand.id, {
            unitId: 'test-doc',
            query: docsQuery('cat'),
            replaceString: '',
        })).resolves.toEqual({ success: 1, failure: 0 });
        expect(testBed.doc.getBody()?.dataStream).toBe(' dog\r\n');
        testBed.univer.dispose();
    });

    it('does not replace text in a disabled document', async () => {
        const snapshot = styledDocument('cat\r\n');
        snapshot.disabled = true;
        const testBed = createCommandTestBed(snapshot);
        const commandService = testBed.get(ICommandService);
        registerCommands(commandService);

        await expect(commandService.executeCommand(DocsReplaceCommand.id, {
            unitId: 'test-doc',
            query: docsQuery('cat'),
            replaceString: 'dog',
        })).resolves.toEqual({ success: 0, failure: 1 });
        expect(testBed.doc.getBody()?.dataStream).toBe('cat\r\n');
        testBed.univer.dispose();
    });
});
