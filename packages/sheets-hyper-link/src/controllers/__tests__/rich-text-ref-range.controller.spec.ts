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

import type { ICellData, IMutationInfo, IRange, IWorkbookData, Workbook } from '@univerjs/core';
import {
    cellToRange,
    CellValueType,
    CustomRangeType,
    Direction,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    sequenceExecute,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    InsertRowMutation,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColByRangeCommand,
    RemoveRowByRangeCommand,
    ReorderRangeCommand,
} from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, describe, expect, it } from 'vitest';
import { UniverSheetsHyperLinkPlugin } from '../../plugin';

const target = { unitId: 'workbook', subUnitId: 'items' };

function link(rangeId: string, range: string): ICellData {
    return {
        t: CellValueType.STRING,
        p: {
            id: rangeId,
            documentStyle: { pageSize: { width: 100, height: 40 } },
            body: {
                dataStream: 'Go\r\n',
                customRanges: [{
                    rangeId,
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 0,
                    endIndex: 1,
                    properties: { url: `#gid=items&range=${range}` },
                }],
            },
        },
    };
}

function rowRange(row: number): IRange {
    return { startRow: row, endRow: row, startColumn: 0, endColumn: 25, rangeType: RANGE_TYPE.ROW };
}

function colRange(col: number): IRange {
    return { startRow: 0, endRow: 19, startColumn: col, endColumn: col, rangeType: RANGE_TYPE.COLUMN };
}

describe('SheetsHyperLinkRichTextRefRangeController', () => {
    const instances: Univer[] = [];

    function createEditor(sameSheetColumn = 0) {
        const univer = new Univer();
        instances.push(univer);
        univer.registerPlugin(UniverSheetsHyperLinkPlugin);
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: target.unitId,
            name: 'Hyperlink workbook',
            appVersion: '1.6.2',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['items', 'summary'],
            sheets: {
                items: {
                    id: 'items',
                    name: 'Items',
                    rowCount: 20,
                    columnCount: 26,
                    cellData: {
                        9: { [sameSheetColumn]: link('same-sheet', 'D12') },
                        10: { 0: link('next-row', 'D15') },
                        11: { 3: { v: 'target' } },
                    },
                },
                summary: {
                    id: 'summary',
                    name: 'Summary',
                    rowCount: 20,
                    columnCount: 26,
                    cellData: { 1: { 0: link('cross-sheet', 'D4') } },
                },
            },
        });
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        const commands = injector.get(ICommandService);
        const outgoing: IMutationInfo[] = [];
        commands.onMutationExecutedForCollab((mutation, options) => {
            if (!options?.fromCollab && !options?.onlyLocal) {
                outgoing.push(Tools.deepClone(mutation as IMutationInfo));
            }
        });

        return {
            commands,
            outgoing,
            insert: (row: number) => commands.executeCommand(InsertRowCommand.id, {
                ...target,
                direction: Direction.UP,
                range: rowRange(row),
            }),
            url: (sheet: string, row: number, col = 0) =>
                workbook.getSheetBySheetId(sheet)?.getCellRaw(row, col)?.p?.body?.customRanges?.[0]?.properties?.url,
            value: (row: number, col: number) => workbook.getSheetBySheetId(target.subUnitId)?.getCellRaw(row, col)?.v,
        };
    }

    afterEach(() => {
        instances.splice(0).forEach((univer) => univer.dispose());
    });

    it('keeps cross-sheet and adjacent same-sheet links through alternating inserts, undo and redo', async () => {
        const first = createEditor();
        const second = createEditor();
        const sync = (sender: typeof first, receiver: typeof first) => {
            expect(sequenceExecute(sender.outgoing.splice(0), receiver.commands, { fromCollab: true }).result).toBe(true);
        };
        const expectTargets = (insertions: number) => {
            for (const editor of [first, second]) {
                expect(editor.url('summary', 1)).toBe(`#gid=items&range=D${4 + insertions}`);
                expect(editor.url('items', 9 + insertions)).toBe(`#gid=items&range=D${12 + insertions}`);
                expect(editor.url('items', 10 + insertions)).toBe(`#gid=items&range=D${15 + insertions}`);
            }
        };

        expect(await first.insert(0)).toBe(true);
        sync(first, second);
        expectTargets(1);

        expect(await second.insert(0)).toBe(true);
        sync(second, first);
        expectTargets(2);

        expect(await second.commands.executeCommand(UndoCommand.id)).toBe(true);
        sync(second, first);
        expectTargets(1);

        expect(await second.commands.executeCommand(RedoCommand.id)).toBe(true);
        sync(second, first);
        expectTargets(2);
    });

    it('keeps a link tracked after a rejected insertion and a later insertion below its source', async () => {
        const editor = createEditor();
        expect(editor.commands.syncExecuteCommand(InsertRowMutation.id, {
            ...target,
            range: rowRange(0),
            rowInfo: { 0: { h: 50, ah: Number.NaN } },
        })).toBe(false);

        expect(await editor.insert(11)).toBe(true);
        expect(editor.url('items', 9)).toBe('#gid=items&range=D13');
        expect(await editor.insert(0)).toBe(true);
        expect(editor.url('items', 10)).toBe('#gid=items&range=D14');
        expect(await editor.insert(0)).toBe(true);
        expect(editor.url('items', 11)).toBe('#gid=items&range=D15');
    });

    it.each([
        { title: 'insert', command: InsertColCommand.id, column: 4, address: 'F12' },
        { title: 'delete', command: RemoveColByRangeCommand.id, column: 0, address: 'B12' },
    ])('keeps a link tracked through two column $title operations', async ({ command, column, address }) => {
        const editor = createEditor(2);
        const change = () => editor.commands.executeCommand(command, { ...target, range: colRange(0), direction: Direction.LEFT });
        expect(await change()).toBe(true);
        expect(await editor.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(editor.url('items', 9, 2)).toBe('#gid=items&range=D12');
        expect(await editor.commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(await change()).toBe(true);
        expect(editor.url('items', 9, column)).toBe(`#gid=items&range=${address}`);
    });

    it.each([
        { title: 'row', command: MoveRowsCommand.id, range: rowRange(9), nextRow: 6, nextCol: 2 },
        { title: 'column', command: MoveColsCommand.id, range: colRange(2), nextRow: 9, nextCol: 0 },
    ])('tracks later target shifts after moving the source $title', async ({ command, range, nextRow, nextCol }) => {
        const editor = createEditor(2);
        expect(await editor.commands.executeCommand(command, {
            ...target,
            range,
            fromRange: cellToRange(9, 2),
            toRange: cellToRange(nextRow, nextCol),
        })).toBe(true);
        expect(editor.url('items', nextRow, nextCol)).toBe('#gid=items&range=D12');
        expect(await editor.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(editor.url('items', 9, 2)).toBe('#gid=items&range=D12');
        expect(await editor.commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(await editor.insert(0)).toBe(true);
        expect(editor.url('items', nextRow + 1, nextCol)).toBe('#gid=items&range=D13');
    });

    it.each([
        {
            title: 'rows',
            command: MoveRowsCommand.id,
            fromRange: { ...rowRange(9), endRow: 11 },
            range: { ...rowRange(9), endRow: 11, endColumn: 0 },
            toRange: cellToRange(16, 0),
            position: { row: 13, col: 0 },
            destination: { row: 15, col: 3, address: 'D16' },
        },
        {
            title: 'columns',
            command: MoveColsCommand.id,
            fromRange: { ...colRange(0), endColumn: 3 },
            range: { ...colRange(0), endColumn: 3, endRow: 0 },
            toRange: cellToRange(0, 7),
            position: { row: 9, col: 3 },
            destination: { row: 11, col: 6, address: 'G12' },
        },
    ])('moves both ends of a link forward with a narrow $title selection', async ({ command, range, fromRange, toRange, position, destination }) => {
        const editor = createEditor();
        const expectMoved = () => {
            expect(editor.value(destination.row, destination.col)).toBe('target');
            expect(editor.url('items', position.row, position.col)).toBe(`#gid=items&range=${destination.address}`);
        };

        expect(await editor.commands.executeCommand(command, { ...target, range, fromRange, toRange })).toBe(true);
        expectMoved();
        expect(await editor.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(editor.value(11, 3)).toBe('target');
        expect(editor.url('items', 9)).toBe('#gid=items&range=D12');
        expect(await editor.commands.executeCommand(RedoCommand.id)).toBe(true);
        expectMoved();
    });

    it('re-registers an invalidated link when undo restores its deleted target row', async () => {
        const editor = createEditor();
        expect(await editor.commands.executeCommand(RemoveRowByRangeCommand.id, { ...target, range: rowRange(11) })).toBe(true);
        expect(editor.url('items', 9)).toBe('#gid=items&range=err');

        expect(await editor.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(editor.value(11, 3)).toBe('target');
        expect(editor.url('items', 9)).toBe('#gid=items&range=D12');
        expect(await editor.commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(editor.url('items', 9)).toBe('#gid=items&range=err');

        expect(await editor.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(await editor.insert(0)).toBe(true);
        expect(editor.value(12, 3)).toBe('target');
        expect(editor.url('items', 10)).toBe('#gid=items&range=D13');
    });

    it.each([
        { command: InsertRangeMoveDownCommand.id, range: cellToRange(8, 2), row: 10, col: 2 },
        { command: DeleteRangeMoveUpCommand.id, range: cellToRange(8, 2), row: 8, col: 2 },
        { command: InsertRangeMoveRightCommand.id, range: cellToRange(9, 1), row: 9, col: 3 },
        { command: DeleteRangeMoveLeftCommand.id, range: cellToRange(9, 1), row: 9, col: 1 },
        {
            command: ReorderRangeCommand.id,
            range: { ...cellToRange(8, 2), endRow: 10 },
            order: { 8: 9, 9: 10, 10: 8 },
            row: 8,
            col: 2,
        },
    ])('tracks the moved link through $command, undo, redo and replay', async ({ command, range, order, row, col }) => {
        const first = createEditor(2);
        const second = createEditor(2);
        const sync = () => {
            expect(sequenceExecute(first.outgoing.splice(0), second.commands, { fromCollab: true }).result).toBe(true);
        };
        expect(await first.commands.executeCommand(command, { ...target, range, order })).toBe(true);
        sync();
        expect(await first.commands.executeCommand(UndoCommand.id)).toBe(true);
        sync();
        expect(second.url('items', 9, 2)).toBe('#gid=items&range=D12');
        expect(await first.commands.executeCommand(RedoCommand.id)).toBe(true);
        sync();

        expect(await second.insert(11)).toBe(true);
        expect(second.url('items', row, col)).toBe('#gid=items&range=D13');
    });

    it.each(['items', 'summary'])('moves both ends of a link to %s and tracks its new target', async (toSubUnitId) => {
        const first = createEditor();
        const second = createEditor();
        const sync = () => {
            expect(sequenceExecute(first.outgoing.splice(0), second.commands, { fromCollab: true }).result).toBe(true);
        };
        expect(await first.commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: target.unitId,
            fromSubUnitId: 'items',
            fromRange: { ...cellToRange(9, 0), endRow: 11, endColumn: 3 },
            toUnitId: target.unitId,
            toSubUnitId,
            toRange: { ...cellToRange(5, 0), endRow: 7, endColumn: 3 },
        })).toBe(true);
        sync();
        expect(second.url(toSubUnitId, 5)).toBe(`#gid=${toSubUnitId}&range=D8`);
        expect(await first.commands.executeCommand(UndoCommand.id)).toBe(true);
        sync();
        expect(second.url('items', 9)).toBe('#gid=items&range=D12');
        expect(await first.commands.executeCommand(RedoCommand.id)).toBe(true);
        sync();
        expect(await second.commands.executeCommand(InsertRowCommand.id, {
            ...target,
            subUnitId: toSubUnitId,
            direction: Direction.UP,
            range: rowRange(7),
        })).toBe(true);
        expect(second.url(toSubUnitId, 5)).toBe(`#gid=${toSubUnitId}&range=D9`);
    });

    it('updates the URL after the same cell shift moves both the link and its target', async () => {
        const editor = createEditor(3);
        expect(await editor.commands.executeCommand(InsertRangeMoveDownCommand.id, {
            ...target,
            range: cellToRange(8, 3),
        })).toBe(true);
        expect(editor.value(12, 3)).toBe('target');
        expect(editor.url('items', 10, 3)).toBe('#gid=items&range=D13');

        expect(await editor.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(editor.value(11, 3)).toBe('target');
        expect(editor.url('items', 9, 3)).toBe('#gid=items&range=D12');
    });
});
