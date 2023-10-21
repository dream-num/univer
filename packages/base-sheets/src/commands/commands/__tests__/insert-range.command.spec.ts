import {
    ICellData,
    ICommandService,
    IStyleData,
    IUniverInstanceService,
    IWorkbookConfig,
    LocaleType,
    Nullable,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { DeleteRangeMutation } from '../../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../../mutations/insert-range.mutation';
import { InsertRangeMoveDownCommand } from '../insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../insert-range-move-right.command';
import { createCommandTestBed } from './create-command-test-bed';

const WORKBOOK_DATA_DEMO: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                    '1': {
                        v: 'B1',
                    },
                },
                '1': {
                    '0': {
                        v: 'A2',
                    },
                    '1': {
                        v: 'B2',
                    },
                },
            },
        },
    },
    createdTime: '',
    creator: '',
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

describe('Test insert range commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SelectionManagerService;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;

    beforeEach(() => {
        const testBed = createCommandTestBed(WORKBOOK_DATA_DEMO);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertRangeMoveDownCommand);
        commandService.registerCommand(InsertRangeMoveRightCommand);
        commandService.registerCommand(InsertRangeMutation);
        commandService.registerCommand(DeleteRangeMutation);

        selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
        selectionManager.add([
            {
                range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };
    });

    afterEach(() => {
        univer.dispose();
    });
    describe('Insert range move right', () => {
        describe('correct situations', () => {
            it('will insert range when there is a selected range', async () => {
                expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: '',
                    m: '',
                });
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'A1',
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A1',
                });
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'B1',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: '',
                    m: '',
                });
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'A1',
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clear();
                const result = await commandService.executeCommand(InsertRangeMoveRightCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('Insert range move down', () => {
        describe('correct situations', () => {
            it('will insert range when there is a selected range', async () => {
                expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: '',
                    m: '',
                });
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A1',
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A1',
                });
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A2',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: '',
                    m: '',
                });
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A1',
                });
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clear();
                const result = await commandService.executeCommand(InsertRangeMoveDownCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
