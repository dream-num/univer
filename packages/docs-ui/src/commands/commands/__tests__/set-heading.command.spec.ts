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
import { awaitTime, DataStreamTreeTokenType, DocumentBlockRangeType, ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType, validateDocBodyStructure } from '@univerjs/core';
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

type BoundaryNodeType = 'blockRange' | 'paragraph' | 'table';

function getBoundaryDocumentData(leftType: BoundaryNodeType, rightType: BoundaryNodeType): { documentData: IDocumentData; insertOffset: number; rightParagraphId: string } {
    const T = DataStreamTreeTokenType;
    const body: NonNullable<IDocumentData['body']> = {
        dataStream: '',
        paragraphs: [],
        sectionBreaks: [],
        blockRanges: [],
        tables: [],
    };
    let nextId = 0;

    const append = (type: BoundaryNodeType, side: 'left' | 'right') => {
        const startIndex = body.dataStream.length;
        const paragraphId = `${side}-${type}-${nextId++}`;
        const paragraphStyle = side === 'right'
            ? { indentStart: { v: 60 }, textStyle: { ff: 'monospace' } }
            : undefined;

        if (type === 'paragraph') {
            body.dataStream += `${side}${T.PARAGRAPH}`;
            body.paragraphs!.push({ paragraphId, paragraphStyle, startIndex: body.dataStream.length - 1 });
        } else if (type === 'blockRange') {
            body.dataStream += `${T.BLOCK_START}${side}${T.PARAGRAPH}${T.BLOCK_END}`;
            body.paragraphs!.push({ paragraphId, paragraphStyle, startIndex: body.dataStream.length - 2 });
            body.blockRanges!.push({
                blockId: `${side}-block`,
                blockType: DocumentBlockRangeType.CALLOUT,
                startIndex,
                endIndex: body.dataStream.length - 1,
            });
        } else {
            body.dataStream += `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${side}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
            body.paragraphs!.push({ paragraphId, paragraphStyle, startIndex: body.dataStream.length - 5 });
            body.sectionBreaks!.push({ sectionId: `section_${side}`, startIndex: body.dataStream.length - 4 });
            body.tables!.push({ tableId: `${side}-table`, startIndex, endIndex: body.dataStream.length });
        }

        return paragraphId;
    };

    append(leftType, 'left');
    const insertOffset = body.dataStream.length;
    const rightParagraphId = append(rightType, 'right');
    body.dataStream += `${T.PARAGRAPH}${T.SECTION_BREAK}`;
    body.paragraphs!.push({ paragraphId: 'trailing', startIndex: body.dataStream.length - 2 });
    body.sectionBreaks!.push({ sectionId: 'section_trailing', startIndex: body.dataStream.length - 1 });

    return {
        documentData: {
            id: 'test-doc',
            body,
            documentStyle: getHeadingDocumentData().documentStyle,
        },
        insertOffset,
        rightParagraphId,
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

    function resetDocument(documentData: IDocumentData) {
        univer.dispose();
        const testBed = createCommandTestBed(documentData, [[DocContentInsertService]]);
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(SetParagraphNamedStyleCommand);
        commandService.registerCommand(H1HeadingCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
        get(DocSelectionManagerService).__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
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

        expect(getBody()?.paragraphs?.[0].paragraphStyle).toEqual({
            namedStyleType: NamedStyleType.NORMAL_TEXT,
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
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.TITLE);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.headingId?.length).toBe(6);
    });

    it.each([
        ['paragraph', 'paragraph'],
        ['paragraph', 'blockRange'],
        ['paragraph', 'table'],
        ['blockRange', 'paragraph'],
        ['blockRange', 'blockRange'],
        ['blockRange', 'table'],
        ['table', 'paragraph'],
        ['table', 'blockRange'],
        ['table', 'table'],
    ] as Array<[BoundaryNodeType, BoundaryNodeType]>)('inserts an isolated H1 at the %s -> %s gap', async (leftType, rightType) => {
        const { documentData, insertOffset, rightParagraphId } = getBoundaryDocumentData(leftType, rightType);
        const rightStyle = documentData.body!.paragraphs!.find((paragraph) => paragraph.paragraphId === rightParagraphId)!.paragraphStyle;
        resetDocument(documentData);
        const selectionManager = get(DocSelectionManagerService);
        let latestSelectionOffset: number | undefined;
        const selectionSubscription = selectionManager.refreshSelection$.subscribe((event) => {
            latestSelectionOffset = event?.docRanges[0]?.startOffset;
        });
        get(DocContentInsertService).setInsertRange({
            unitId: 'test-doc',
            startOffset: insertOffset,
            endOffset: insertOffset,
        });

        expect(await commandService.executeCommand(H1HeadingCommand.id)).toBe(true);
        await awaitTime(0);

        const body = getBody()!;
        const insertedParagraph = body.paragraphs?.find((paragraph) => paragraph.startIndex === insertOffset);
        const rightParagraph = body.paragraphs?.find((paragraph) => paragraph.paragraphId === rightParagraphId);
        expect(insertedParagraph?.paragraphStyle).toMatchObject({ namedStyleType: NamedStyleType.HEADING_1 });
        expect(insertedParagraph?.paragraphStyle?.indentStart).toBeUndefined();
        expect(rightParagraph?.paragraphStyle).toEqual(rightStyle);
        expect(latestSelectionOffset).toBe(insertOffset);
        expect(validateDocBodyStructure(body)).toEqual([]);
        selectionSubscription.unsubscribe();
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
