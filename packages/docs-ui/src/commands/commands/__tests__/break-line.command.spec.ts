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
import { awaitTime, DataStreamTreeTokenType, DocumentBlockRangeType, ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BreakLineCommand } from '../break-line.command';
import { createCommandTestBed } from './create-command-test-bed';

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
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_1', startIndex: 5, paragraphStyle: {
                headingId: 'heading-1',
                namedStyleType: NamedStyleType.HEADING_1,
            } }],
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

function getDocumentDataWithColumnGroup(): IDocumentData {
    const T = DataStreamTreeTokenType;
    const columnGroupStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}`;

    return {
        id: 'test-doc',
        body: {
            dataStream: `Before${T.PARAGRAPH}${columnGroupStream}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            textRuns: [],
            paragraphs: [
                { paragraphId: 'before', startIndex: 6 },
                { paragraphId: 'left', startIndex: 10 },
                { paragraphId: 'right', startIndex: 14 },
                { paragraphId: 'after', startIndex: 17 },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_201', startIndex: 18 }],
            columnGroups: [{ columnGroupId: 'cg-1', startIndex: 7, endIndex: 16 }],
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

function getDocumentDataWithAdjacentBlocks(): IDocumentData {
    const T = DataStreamTreeTokenType;

    return {
        id: 'test-doc',
        body: {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.BLOCK_START}B${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { paragraphId: 'code-paragraph', startIndex: 2 },
                { paragraphId: 'callout-paragraph', startIndex: 6, paragraphStyle: { indentStart: { v: 60 } } },
                { paragraphId: 'trailing-paragraph', startIndex: 8 },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_202', startIndex: 9 }],
            blockRanges: [
                { blockId: 'code-1', blockType: DocumentBlockRangeType.CODE, startIndex: 0, endIndex: 3 },
                { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 4, endIndex: 7 },
            ],
        },
        documentStyle: {
            pageSize: { width: 594.3, height: 840.51 },
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

    function getBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    function setupWithColumnGroup() {
        univer.dispose();
        const testBed = createCommandTestBed(getDocumentDataWithColumnGroup());
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

        return selectionManager;
    }

    function setupWithAdjacentBlocks() {
        univer.dispose();
        const testBed = createCommandTestBed(getDocumentDataWithAdjacentBlocks());
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

        return selectionManager;
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

        await awaitTime(0);

        expect(getParagraphs()).toHaveLength(2);
        expect(getParagraphs()[0].paragraphStyle?.namedStyleType).toBe(NamedStyleType.HEADING_1);
        expect(getParagraphs()[1].paragraphStyle?.namedStyleType).toBeUndefined();
        expect(getParagraphs()[1].paragraphStyle?.headingId).toBeUndefined();
    });

    it('keeps column groups when breaking a blank paragraph below a column group', async () => {
        const selectionManager = setupWithColumnGroup();
        selectionManager.__TEST_ONLY_add([{ startOffset: 17, endOffset: 17, collapsed: true, isActive: true, segmentId: '', style: null as never }]);

        await commandService.executeCommand(BreakLineCommand.id);
        await awaitTime(0);

        expect(getBody()?.columnGroups).toEqual([{ columnGroupId: 'cg-1', startIndex: 7, endIndex: 16 }]);
        expect(getBody()?.dataStream).toContain(DataStreamTreeTokenType.COLUMN_GROUP_END);
    });

    it('keeps column groups wrapped when breaking at the closing column boundary', async () => {
        const selectionManager = setupWithColumnGroup();
        selectionManager.__TEST_ONLY_add([{ startOffset: 16, endOffset: 16, collapsed: true, isActive: true, segmentId: '', style: null as never }]);

        await commandService.executeCommand(BreakLineCommand.id);
        await awaitTime(0);

        expect(getBody()?.columnGroups).toEqual([{ columnGroupId: 'cg-1', startIndex: 7, endIndex: 17 }]);
        expect(getBody()?.dataStream[17]).toBe(DataStreamTreeTokenType.COLUMN_GROUP_END);
    });

    it('inserts a paragraph between adjacent block ranges without corrupting either range', async () => {
        const selectionManager = setupWithAdjacentBlocks();
        selectionManager.__TEST_ONLY_add([{ startOffset: 4, endOffset: 4, collapsed: true, isActive: true, segmentId: '', style: null as never }]);

        await commandService.executeCommand(BreakLineCommand.id, {
            textRange: { startOffset: 4, endOffset: 4, collapsed: true, segmentId: '' },
        });
        await awaitTime(0);

        const T = DataStreamTreeTokenType;
        expect(getBody()?.dataStream).toBe(`${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.BLOCK_START}B${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(getBody()?.blockRanges).toEqual([
            { blockId: 'code-1', blockType: DocumentBlockRangeType.CODE, startIndex: 0, endIndex: 3 },
            { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 5, endIndex: 8 },
        ]);
        expect(getBody()?.paragraphs?.find((paragraph) => paragraph.startIndex === 4)?.paragraphStyle).toBeUndefined();
        expect(getBody()?.paragraphs?.find((paragraph) => paragraph.paragraphId === 'callout-paragraph')?.paragraphStyle).toEqual({ indentStart: { v: 60 } });
        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(4);
    });
});
