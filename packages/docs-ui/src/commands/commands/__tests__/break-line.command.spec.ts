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
import { ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BreakLineCommand } from '../break-line.command';
import { createCommandTestBed } from './create-command-test-bed';

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function getDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Title\r\n',
            textRuns: [{
                st: 0,
                ed: 5,
                ts: {},
            }],
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    headingId: 'heading-1',
                    namedStyleType: NamedStyleType.HEADING_1,
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

describe('break line command', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getParagraphs() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody()?.paragraphs ?? [];
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(BreakLineCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{ startOffset: 5, endOffset: 5, collapsed: true, isActive: true, segmentId: '', style: null as never }]);
    });

    afterEach(() => univer.dispose());

    it('splits a heading paragraph and resets heading style for the new paragraph', async () => {
        await commandService.executeCommand(BreakLineCommand.id);

        await waitNextTick();

        expect(getParagraphs()).toHaveLength(2);
        expect(getParagraphs()[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.HEADING_1);
        expect(getParagraphs()[1].paragraphStyle?.namedStyleType).toBeUndefined();
        expect(getParagraphs()[1].paragraphStyle?.headingId).toBeUndefined();
    });
});
