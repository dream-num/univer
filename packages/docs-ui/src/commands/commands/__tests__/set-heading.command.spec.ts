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
import { H1HeadingCommand, QuickHeadingCommand, SetParagraphNamedStyleCommand } from '../set-heading.command';
import { createCommandTestBed } from './create-command-test-bed';

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function getHeadingDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Heading\r\n',
            paragraphs: [{
                startIndex: 7,
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

function getQuickHeadingDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: '# Heading\r\n',
            paragraphs: [{
                startIndex: 9,
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

describe('set heading commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getHeadingDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetParagraphNamedStyleCommand);
        commandService.registerCommand(H1HeadingCommand);
        commandService.registerCommand(QuickHeadingCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
    });

    afterEach(() => univer.dispose());

    it('applies a named paragraph style via the public heading command', async () => {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_add([{ startOffset: 0, endOffset: 3, collapsed: false, isActive: true, segmentId: '', style: null as never }]);

        await commandService.executeCommand(H1HeadingCommand.id);

        await waitNextTick();

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.HEADING_1);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.headingId).toBeDefined();
    });

    it('converts markdown-like quick headings through the real command chain', async () => {
        univer.dispose();

        const testBed = createCommandTestBed(getQuickHeadingDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetParagraphNamedStyleCommand);
        commandService.registerCommand(QuickHeadingCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{ startOffset: 2, endOffset: 2, collapsed: true, isActive: true, segmentId: '', style: null as never }]);

        await commandService.executeCommand(QuickHeadingCommand.id, {
            value: NamedStyleType.HEADING_2,
        });

        await waitNextTick();

        expect(getBody()?.dataStream.startsWith('Heading')).toBe(true);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.HEADING_2);
    });
});
