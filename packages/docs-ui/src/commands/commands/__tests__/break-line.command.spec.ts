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
import { awaitTime, DataStreamTreeTokenType, DocumentBlockRangeType, DocumentFlavor, ICommandService, IUniverInstanceService, NamedStyleType, PresetListType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BreakLineCommand, BreakLineInsertionMode } from '../break-line.command';
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
            documentFlavor: DocumentFlavor.MODERN,
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

function getStyledListDocumentData(documentFlavor: DocumentFlavor): IDocumentData {
    const T = DataStreamTreeTokenType;

    return {
        id: 'test-doc',
        body: {
            dataStream: `A${T.PARAGRAPH}${T.SECTION_BREAK}`,
            textRuns: [{
                st: 0,
                ed: 1,
                ts: { fs: 24, cl: { rgb: '#00FF00' } },
            }],
            paragraphs: [{
                paragraphId: 'styled-list',
                startIndex: 1,
                bullet: {
                    listId: 'list-1',
                    listType: PresetListType.BULLET_LIST,
                    nestingLevel: 0,
                },
            }],
            sectionBreaks: [{ sectionId: 'section_fixture_204', startIndex: 2 }],
        },
        documentStyle: {
            documentFlavor,
            pageSize: { width: 594.3, height: 840.51 },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function getDocumentDataWithTable(documentFlavor: DocumentFlavor): IDocumentData {
    const T = DataStreamTreeTokenType;
    const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}A${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;

    return {
        id: 'test-doc',
        body: {
            dataStream: `${tableStream}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { paragraphId: 'cell', startIndex: 4 },
                { paragraphId: 'after', startIndex: tableStream.length },
            ],
            sectionBreaks: [
                { sectionId: 'cell-section', startIndex: 5 },
                { sectionId: 'section_fixture_203', startIndex: tableStream.length + 1 },
            ],
            tables: [{ tableId: 'table-1', startIndex: 0, endIndex: tableStream.length }],
        },
        documentStyle: {
            documentFlavor,
            pageSize: { width: 594.3, height: 840.51 },
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

    function setupWithTable(documentFlavor: DocumentFlavor) {
        univer.dispose();
        const testBed = createCommandTestBed(getDocumentDataWithTable(documentFlavor));
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

    async function executeBreakLineAndApplyRenderedSelection(selectionManager: DocSelectionManagerService) {
        const replaceDocRanges = vi.spyOn(selectionManager, 'replaceDocRanges');

        await commandService.executeCommand(BreakLineCommand.id);
        await awaitTime(0);
        const refreshedRanges = replaceDocRanges.mock.calls.at(-1)?.[0];
        replaceDocRanges.mockRestore();
        if (!refreshedRanges?.length) {
            throw new Error('BreakLineCommand did not request a rendered selection refresh');
        }

        selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: refreshedRanges.map((range, index) => ({
                ...range,
                collapsed: range.startOffset === range.endOffset,
                isActive: index === refreshedRanges.length - 1,
            })),
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            isEditing: true,
        }, { unitId: 'test-doc', subUnitId: 'test-doc' });
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

    it.each([
        DocumentFlavor.MODERN,
        DocumentFlavor.TRADITIONAL,
    ])('keeps the current text style on an empty list paragraph in %s docs', async (documentFlavor) => {
        univer.dispose();
        const testBed = createCommandTestBed(getStyledListDocumentData(documentFlavor));
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
        selectionManager.__TEST_ONLY_add([{ startOffset: 1, endOffset: 1, collapsed: true, isActive: true, segmentId: '' }]);

        await commandService.executeCommand(BreakLineCommand.id);
        await awaitTime(0);

        const body = getBody();
        const emptyParagraph = body?.paragraphs?.[1];
        const emptyParagraphTextRun = body?.textRuns?.find(({ st, ed }) =>
            emptyParagraph != null && st <= emptyParagraph.startIndex && ed > emptyParagraph.startIndex
        );

        expect(emptyParagraph?.bullet?.listType).toBe(PresetListType.BULLET_LIST);
        expect(emptyParagraphTextRun?.ts).toEqual({ fs: 24, cl: { rgb: '#00FF00' } });
    });

    it('keeps the cursor fixed for explicit gap insertion mode', async () => {
        const selectionManager = get(DocSelectionManagerService);
        const replaceDocRanges = vi.spyOn(selectionManager, 'replaceDocRanges');

        await commandService.executeCommand(BreakLineCommand.id, { insertionMode: BreakLineInsertionMode.InsertGap });
        await awaitTime(0);

        expect(replaceDocRanges).toHaveBeenCalledWith([
            expect.objectContaining({ startOffset: 5, endOffset: 5 }),
        ], { unitId: 'test-doc', subUnitId: 'test-doc' }, true, undefined);
    });

    it('keeps column groups when breaking a blank paragraph below a column group', async () => {
        const selectionManager = setupWithColumnGroup();
        selectionManager.__TEST_ONLY_add([{ startOffset: 17, endOffset: 17, collapsed: true, isActive: true, segmentId: '', style: null as never }]);

        await executeBreakLineAndApplyRenderedSelection(selectionManager);

        expect(getBody()?.columnGroups).toEqual([{ columnGroupId: 'cg-1', startIndex: 7, endIndex: 16 }]);
        expect(getBody()?.dataStream).toContain(DataStreamTreeTokenType.COLUMN_GROUP_END);
        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(18);

        await executeBreakLineAndApplyRenderedSelection(selectionManager);

        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(19);
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

        await executeBreakLineAndApplyRenderedSelection(selectionManager);

        const T = DataStreamTreeTokenType;
        expect(getBody()?.dataStream).toBe(`${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.BLOCK_START}B${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(getBody()?.blockRanges).toEqual([
            { blockId: 'code-1', blockType: DocumentBlockRangeType.CODE, startIndex: 0, endIndex: 3 },
            { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 5, endIndex: 8 },
        ]);
        expect(getBody()?.paragraphs?.find((paragraph) => paragraph.startIndex === 4)?.paragraphStyle).toBeUndefined();
        expect(getBody()?.paragraphs?.find((paragraph) => paragraph.paragraphId === 'callout-paragraph')?.paragraphStyle).toEqual({ indentStart: { v: 60 } });
        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(4);

        await executeBreakLineAndApplyRenderedSelection(selectionManager);

        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(5);
    });

    it.each<{ name: string; documentFlavor: DocumentFlavor }>([
        { name: 'modern', documentFlavor: DocumentFlavor.MODERN },
        { name: 'traditional', documentFlavor: DocumentFlavor.TRADITIONAL },
    ])('moves the cursor after repeated Enter below a table in $name docs', async ({ documentFlavor }) => {
        const selectionManager = setupWithTable(documentFlavor);
        const tableEnd = getBody()?.tables?.[0].endIndex ?? 0;
        selectionManager.__TEST_ONLY_add([{ startOffset: tableEnd, endOffset: tableEnd, collapsed: true, isActive: true, segmentId: '' }]);

        await executeBreakLineAndApplyRenderedSelection(selectionManager);
        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(tableEnd + 1);

        await executeBreakLineAndApplyRenderedSelection(selectionManager);
        expect(selectionManager.getActiveTextRange()?.startOffset).toBe(tableEnd + 2);
    });
});
