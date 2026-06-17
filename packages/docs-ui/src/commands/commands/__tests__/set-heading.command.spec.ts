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
import { awaitTime, ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import {
    DocContentInsertService,
    DocSelectionManagerService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    H1HeadingCommand,
    H2HeadingCommand,
    H3HeadingCommand,
    H4HeadingCommand,
    H5HeadingCommand,
    NormalTextHeadingCommand,
    QuickHeadingCommand,
    SetParagraphNamedStyleCommand,
    SubtitleHeadingCommand,
    TitleHeadingCommand,
} from '../set-heading.command';
import { createCommandTestBed } from './create-command-test-bed';

function getHeadingDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Heading\r\n',
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_29', startIndex: 7 }],
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
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_30', startIndex: 9 }],
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
        commandService.registerCommand(H2HeadingCommand);
        commandService.registerCommand(H3HeadingCommand);
        commandService.registerCommand(H4HeadingCommand);
        commandService.registerCommand(H5HeadingCommand);
        commandService.registerCommand(NormalTextHeadingCommand);
        commandService.registerCommand(TitleHeadingCommand);
        commandService.registerCommand(SubtitleHeadingCommand);
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

        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.HEADING_1);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.headingId?.length).toBe(6);
    });

    it('applies heading levels and document title styles through public commands', async () => {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_add([{ startOffset: 0, endOffset: 7, collapsed: false, isActive: true, segmentId: '', style: null as never }]);

        const headingCases = [
            { commandId: H2HeadingCommand.id, namedStyleType: NamedStyleType.HEADING_2 },
            { commandId: H3HeadingCommand.id, namedStyleType: NamedStyleType.HEADING_3 },
            { commandId: H4HeadingCommand.id, namedStyleType: NamedStyleType.HEADING_4 },
            { commandId: H5HeadingCommand.id, namedStyleType: NamedStyleType.HEADING_5 },
            { commandId: TitleHeadingCommand.id, namedStyleType: NamedStyleType.TITLE },
            { commandId: SubtitleHeadingCommand.id, namedStyleType: NamedStyleType.SUBTITLE },
        ];

        for (const { commandId, namedStyleType } of headingCases) {
            await commandService.executeCommand(commandId);
            await awaitTime(0);

            expect(getBody()?.paragraphs?.[0].paragraphStyle?.namedStyleType).toBe(namedStyleType);
            expect(getBody()?.paragraphs?.[0].paragraphStyle?.headingId?.length).toBe(6);
        }

        await commandService.executeCommand(NormalTextHeadingCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].paragraphStyle).toMatchObject({
            namedStyleType: NamedStyleType.NORMAL_TEXT,
            headingId: undefined,
            spaceAbove: undefined,
            spaceBelow: undefined,
            lineSpacing: undefined,
        });
    });

    it('inserts a styled paragraph when paragraph menu provides an insert range', async () => {
        univer.dispose();

        const testBed = createCommandTestBed(getHeadingDocumentData(), [[DocContentInsertService]]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetParagraphNamedStyleCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const contentInsertService = get(DocContentInsertService);
        contentInsertService.setInsertRange({
            unitId: 'test-doc',
            startOffset: 7,
            endOffset: 7,
        });

        await commandService.executeCommand(SetParagraphNamedStyleCommand.id, {
            value: NamedStyleType.TITLE,
        });

        await awaitTime(0);

        expect(getBody()?.dataStream).toBe('Heading\r\r\n');
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.namedStyleType).toBe(NamedStyleType.TITLE);
        expect(getBody()?.paragraphs?.[1].paragraphStyle?.headingId?.length).toBe(6);
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

        await awaitTime(0);

        expect(getBody()?.dataStream.startsWith('Heading')).toBe(true);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.HEADING_2);
    });
});
