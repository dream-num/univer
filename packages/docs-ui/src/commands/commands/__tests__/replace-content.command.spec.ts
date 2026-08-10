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
import { DataStreamTreeTokenType, ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocIMEInputManagerService } from '../../../services/doc-ime-input-manager.service';
import { IMEInputCommand } from '../ime-input.command';
import {
    buildReplaceSnapshotActions,
    CoverContentCommand,
    ReplaceSelectionCommand,
    ReplaceSnapshotCommand,
    ReplaceTextRunsCommand,
} from '../replace-content.command';
import { createCommandTestBed } from './create-command-test-bed';

function getDocumentData() {
    const TEST_DOCUMENT_DATA_EN: IDocumentData = {
        id: 'test-doc',
        body: {
            dataStream: '=SUM(A2:B4)\r\n',
            textRuns: [],
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

    return TEST_DOCUMENT_DATA_EN;
}

function getTerminalColumnGroupDocumentData(): IDocumentData {
    const T = DataStreamTreeTokenType;
    const dataStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`;

    return {
        id: 'test-doc',
        body: {
            dataStream,
            paragraphs: [
                { paragraphId: 'terminal-column-first', startIndex: 3 },
                { paragraphId: 'terminal-column-second', startIndex: 7 },
            ],
            sectionBreaks: [{ sectionId: 'terminal-column-section', startIndex: 10 }],
            columnGroups: [{
                columnGroupId: 'terminal-columns',
                startIndex: 0,
                endIndex: 9,
                columns: [
                    { columnId: 'terminal-column-1', widthRatio: 1 },
                    { columnId: 'terminal-column-2', widthRatio: 1 },
                ],
            }],
        },
        documentStyle: {
            pageSize: { width: 540, height: 720 },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('replace or cover content of document', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getDataStream() {
        const univerInstanceService = get(IUniverInstanceService);
        const docsModel = univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);
        const dataStream = docsModel?.getBody()?.dataStream;

        return typeof dataStream === 'string' ? dataStream : '';
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(CoverContentCommand);
        commandService.registerCommand(ReplaceSelectionCommand);
        commandService.registerCommand(ReplaceSnapshotCommand);
        commandService.registerCommand(ReplaceTextRunsCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);

        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: '',
        });

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
            },
        ]);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('cover content of document and clear undo and redo stack', () => {
        it('Should pass the test case when cover content', async () => {
            expect(getDataStream()!.length).toBe(13);
            const commandParams = {
                unitId: 'test-doc',
                body: {
                    dataStream: '=AVERAGE(A4:B8)',
                }, // Do not contain `\r\n` at the end.
                textRanges: [],
                segmentId: '',
            };

            await commandService.executeCommand(CoverContentCommand.id, commandParams);

            expect(getDataStream().length).toBe(17);

            await commandService.executeCommand(UndoCommand.id);

            expect(getDataStream().length).toBe(17);

            await commandService.executeCommand(RedoCommand.id);

            expect(getDataStream().length).toBe(17);
        });
    });

    describe('replace selected document content', () => {
        it('replaces the document snapshot including style and table metadata', async () => {
            const T = DataStreamTreeTokenType;
            const columnDataStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}Left${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}Right${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.PARAGRAPH}${T.SECTION_BREAK}`;
            const tableSource = {
                table_1: {
                    tableId: 'table_1',
                    tableRows: [],
                    tableColumns: [],
                },
            };
            const columnGroups = [{
                startIndex: 0,
                endIndex: 16,
                columnGroupId: 'column_group_1',
                columns: [
                    { columnId: 'column_1', widthRatio: 1 },
                    { columnId: 'column_2', widthRatio: 1 },
                ],
                gap: { v: 12 },
                layout: 'fixed',
                responsive: 'stack',
            }];
            const nextSnapshot = {
                ...getDocumentData(),
                body: {
                    dataStream: columnDataStream,
                    textRuns: [],
                    paragraphs: [
                        { paragraphId: 'para_replace_left', startIndex: 6 },
                        { paragraphId: 'para_replace_right', startIndex: 14 },
                        { paragraphId: 'para_replace_after', startIndex: 17 },
                    ],
                    sectionBreaks: [{ sectionId: 'section_fixture_226', startIndex: 18 }],
                    customBlocks: [],
                    columnGroups,
                },
                documentStyle: {
                    pageSize: {
                        width: 500,
                        height: 700,
                    },
                    marginTop: 20,
                    marginBottom: 20,
                    marginRight: 30,
                    marginLeft: 30,
                },
                tableSource,
                lists: {
                    list_1: {
                        listType: 'BULLET_LIST',
                        nestingLevel: [],
                    },
                },
                drawings: {},
                drawingsOrder: [],
                headers: {},
                footers: {},
            } as never;

            await expect(commandService.executeCommand(ReplaceSnapshotCommand.id, {
                unitId: 'test-doc',
                snapshot: nextSnapshot,
                textRanges: [{
                    startOffset: 17,
                    endOffset: 17,
                    collapsed: true,
                }],
                options: {
                    noHistory: true,
                },
            })).resolves.toBe(true);

            const univerInstanceService = get(IUniverInstanceService);
            const docsModel = univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);
            expect(docsModel?.getBody()?.dataStream).toBe(columnDataStream);
            expect(docsModel?.getDocumentStyle().pageSize).toEqual({ width: 500, height: 700 });
            expect(docsModel?.getSnapshot().tableSource).toEqual(tableSource);
            expect(docsModel?.getBody()?.columnGroups).toEqual(columnGroups);
        });

        it('updates only the selection when the replacement snapshot body is unchanged', async () => {
            await expect(commandService.executeCommand(ReplaceSnapshotCommand.id, {
                unitId: 'test-doc',
                snapshot: getDocumentData(),
                textRanges: [{
                    startOffset: 1,
                    endOffset: 4,
                    collapsed: false,
                }],
                options: {},
            })).resolves.toBe(true);

            expect(getDataStream()).toBe('=SUM(A2:B4)\r\n');
        });

        it('builds replacement snapshot body changes without whole body replace', () => {
            const previousSnapshot = getDocumentData();
            const nextSnapshot = {
                ...previousSnapshot,
                body: {
                    dataStream: 'Snapshot\r\n',
                    paragraphs: [{ paragraphId: 'para_replace_snapshot_shape', startIndex: 8 }],
                    sectionBreaks: [{ sectionId: 'section_fixture_227', startIndex: 9 }],
                    textRuns: [],
                },
            };

            const actions = buildReplaceSnapshotActions(previousSnapshot, nextSnapshot);
            const serializedActions = JSON.stringify(actions);

            expect(actions).not.toBeNull();
            expect(serializedActions).toContain('"et":"text-x"');
            expect(serializedActions).not.toContain('["body",{"r"');
        });

        it('replaces the active selection through the real rich text mutation flow', async () => {
            univer.dispose();
            const testBed = createCommandTestBed(getDocumentData());
            univer = testBed.univer;
            get = testBed.get;
            commandService = get(ICommandService);
            commandService.registerCommand(ReplaceSelectionCommand);
            commandService.registerCommand(SetTextSelectionsOperation);
            commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

            const selectionManager = get(DocSelectionManagerService);
            selectionManager.__TEST_ONLY_setCurrentSelection({
                unitId: 'test-doc',
                subUnitId: '',
            });
            selectionManager.__TEST_ONLY_add([
                {
                    startOffset: 1,
                    endOffset: 4,
                    collapsed: false,
                },
            ]);

            const result = await commandService.executeCommand(ReplaceSelectionCommand.id, {
                unitId: 'test-doc',
                selection: {
                    startOffset: 1,
                    endOffset: 4,
                    collapsed: false,
                },
                body: {
                    dataStream: 'AVG',
                },
                textRanges: [{
                    startOffset: 4,
                    endOffset: 4,
                    collapsed: true,
                }],
            });

            expect(result).toBeTruthy();
            expect(getDataStream()).toBe('=AVG(A2:B4)\r\n');
        });

        it('replaces a fragmented whole-column-group selection once at the document start', async () => {
            univer.dispose();
            const original = getTerminalColumnGroupDocumentData();
            const testBed = createCommandTestBed(original);
            univer = testBed.univer;
            get = testBed.get;
            commandService = get(ICommandService);
            commandService.registerCommand(ReplaceSelectionCommand);
            commandService.registerCommand(SetTextSelectionsOperation);
            commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

            const selectionManager = get(DocSelectionManagerService);
            selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'test-doc', subUnitId: '' });
            selectionManager.__TEST_ONLY_add([{
                startOffset: 2,
                endOffset: 3,
                collapsed: false,
                isActive: true,
                segmentId: '',
            }]);
            const selectionInfo = selectionManager.getSelectionInfo();
            if (!selectionInfo) {
                throw new Error('Selection info not found');
            }
            selectionManager.__replaceTextRangesWithNoRefresh({
                ...selectionInfo,
                textRanges: [
                    { startOffset: 2, endOffset: 3, collapsed: false, isActive: true, segmentId: '' },
                    { startOffset: 6, endOffset: 7, collapsed: false, segmentId: '' },
                ],
                rectRanges: [],
                options: { wholeDocument: true },
            }, { unitId: 'test-doc', subUnitId: '' });

            expect(await commandService.executeCommand(ReplaceSelectionCommand.id, {
                unitId: 'test-doc',
                body: { dataStream: 'x' },
            })).toBeTruthy();

            const replacedSnapshot = get(IUniverInstanceService)
                .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)
                ?.getSnapshot();
            expect(replacedSnapshot?.body?.dataStream).toBe('x\r\n');
            expect(replacedSnapshot?.body?.columnGroups).toEqual([]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(getDataStream()).toBe(original.body?.dataStream);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getDataStream()).toBe('x\r\n');
        });

        it('replaces a fragmented whole-column-group selection once during IME composition', async () => {
            univer.dispose();
            const testBed = createCommandTestBed(getTerminalColumnGroupDocumentData());
            univer = testBed.univer;
            get = testBed.get;
            commandService = get(ICommandService);
            commandService.registerCommand(IMEInputCommand);
            commandService.registerCommand(SetTextSelectionsOperation);
            commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

            const imeManager = get(DocIMEInputManagerService);
            imeManager.setActiveRange({
                startOffset: 2,
                endOffset: 3,
                collapsed: false,
                isActive: true,
                segmentId: '',
            });
            imeManager.setPreviousDocRanges([
                { startOffset: 2, endOffset: 3, collapsed: false, isActive: true, segmentId: '' },
                { startOffset: 6, endOffset: 7, collapsed: false, segmentId: '' },
            ]);
            imeManager.setPreviousSelectionOptions({ wholeDocument: true });

            expect(await commandService.executeCommand(IMEInputCommand.id, {
                unitId: 'test-doc',
                newText: '中',
                oldTextLen: 0,
                isCompositionStart: true,
                isCompositionEnd: true,
            })).toBe(true);

            expect(getDataStream()).toBe('中\r\n');
            expect(imeManager.getCompositionRange()).toMatchObject({
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
            });
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(getDataStream()).toBe(getTerminalColumnGroupDocumentData().body?.dataStream);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getDataStream()).toBe('中\r\n');
        });

        it('replaces text runs without adding undo history', async () => {
            await expect(commandService.executeCommand(ReplaceTextRunsCommand.id, {
                unitId: 'test-doc',
                body: {
                    dataStream: '=COUNT(A1:A2)',
                    textRuns: [{
                        st: 0,
                        ed: 13,
                        ts: {
                            fs: 18,
                        },
                    }],
                },
                textRanges: [{
                    startOffset: 13,
                    endOffset: 13,
                    collapsed: true,
                }],
                segmentId: '',
                options: {},
            })).resolves.toBe(true);

            const univerInstanceService = get(IUniverInstanceService);
            const docsModel = univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);
            const textRuns = docsModel?.getBody()?.textRuns ?? [];
            expect(textRuns[0].st).toBe(0);
            expect(textRuns.at(-1)?.ed).toBe(13);
            expect(textRuns.every((textRun) => textRun.ts?.fs === 18)).toBe(true);
        });
    });
});
