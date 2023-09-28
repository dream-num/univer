import { Direction, ICommandService, RANGE_TYPE, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import {
    ChangeSelectionCommand,
    IChangeSelectionCommandParams,
    ISelectAllCommandParams,
    SelectAllCommand,
} from '../set-selections.command';
import { createSelectionCommandTestBed } from './create-selection-command-test-bed';

describe('Test commands used for change selections', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManagerService: SelectionManagerService;

    beforeEach(() => {
        const testBed = createSelectionCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        selectionManagerService = get(SelectionManagerService);
    });

    function select00() {
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        selectionManagerService.add([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                    actualRow: 0,
                    actualColumn: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function select(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });

        selectionManagerService.add([
            {
                range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    actualRow: startRow,
                    actualColumn: startColumn,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function expectSelectionToBe(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        expect(selectionManagerService.getLast()!.range).toEqual({
            startRow,
            startColumn,
            endRow,
            endColumn,
            rangeType: RANGE_TYPE.NORMAL,
        });
    }

    afterEach(() => {
        univer.dispose();
    });

    describe('Simple movement', () => {
        it('Should move selection with command', async () => {
            select00();

            await commandService.executeCommand<IChangeSelectionCommandParams>(ChangeSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 0, 0);

            await commandService.executeCommand<IChangeSelectionCommandParams>(ChangeSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 1, 0, 1);

            await commandService.executeCommand<IChangeSelectionCommandParams>(ChangeSelectionCommand.id, {
                direction: Direction.DOWN,
            });
            expectSelectionToBe(1, 1, 1, 1);

            await commandService.executeCommand<IChangeSelectionCommandParams>(ChangeSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(1, 0, 1, 0);

            await commandService.executeCommand<IChangeSelectionCommandParams>(ChangeSelectionCommand.id, {
                direction: Direction.UP,
            });
            expectSelectionToBe(0, 0, 0, 0);
        });

        describe('With merged cells', () => {
            it('Should select merged cell and move to next cell', async () => {
                // FIXME: 在跨越选区的时候，需要考虑选区的合并单元格，特别是这样的情形
                // D4 | E4 | F4
                // ---|    |---
                // D5 | E5 | F5
                // 从 F5 向左移动两次，应该选中 D5 而非 D4
                // 所以一个选区信息可能有三个部分，选区的范围，选区的单元格范围，选区的合并单元格范围
                // Google Sheet 和腾讯文档 Sheet 的行为都是这样
                expect(true).toBeTruthy();
            });
        });
    });

    describe('Move to next gap cell', () => {
        it('placeholder', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('Expand to next selection or shrink', () => {
        it('placeholder', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('Expand to next gap position or shrink', () => {
        it('placeholder', () => {
            expect(true).toBeTruthy();
        });
    });

    describe('Expand selection', () => {
        it('Should first select all neighbor cells, and then the whole sheet', async () => {
            select00();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('Should directly select all if `expandToGapFirst` is false', async () => {
            select00();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('Should not loop selection when `loop` is false', async () => {
            select00();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getLast()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });
    });
});
