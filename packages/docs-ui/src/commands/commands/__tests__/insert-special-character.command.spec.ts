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

import type { DocumentDataModel, ICommand, IDocumentData, Injector, Univer } from '@univerjs/core';
import { awaitTime, BooleanNumber, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    DocSelectionManagerService,
    InsertTextCommand,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InsertSpecialCharacterCommand } from '../insert-special-character.command';
import { createCommandTestBed } from './create-command-test-bed';

function getDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello world\r\n',
            textRuns: [{
                st: 0,
                ed: 11,
                ts: {
                    bl: BooleanNumber.TRUE,
                    fs: 18,
                },
            }],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('InsertSpecialCharacterCommand', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData());
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(InsertTextCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        commandService.registerCommand(InsertSpecialCharacterCommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
    });

    afterEach(() => univer.dispose());

    it('inserts the selected character at the active range with the current text style', async () => {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_add([{
            startOffset: 5,
            endOffset: 5,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        const result = await commandService.executeCommand(InsertSpecialCharacterCommand.id, { value: '😀' });
        await awaitTime(0);

        const body = get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)
            ?.getBody();
        const insertedTextRun = body?.textRuns?.find(({ st, ed }) => st <= 5 && ed >= 7);

        expect(result).toBe(true);
        expect(body?.dataStream).toBe('Hello😀 world\r\n');
        expect(insertedTextRun?.ts).toMatchObject({ bl: BooleanNumber.TRUE, fs: 18 });
    });

    it('does nothing when there is no active text range', async () => {
        const result = await commandService.executeCommand(InsertSpecialCharacterCommand.id, { value: '∞' });

        expect(result).toBe(false);
    });
});
