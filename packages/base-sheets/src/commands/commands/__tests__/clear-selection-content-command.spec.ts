// 编写ClearSelectionContentCommand测试用例
import {
    ICellData,
    ICommandService,
    ICurrentUniverService,
    Nullable,
    SELECTION_TYPE,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { ClearSelectionContentCommand } from '../clear-selection-content.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test clear selection content commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let currentUniverService: ICurrentUniverService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ClearSelectionContentCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        currentUniverService = get(ICurrentUniverService);
        currentUniverService.focusUniverInstance('test'); // used in undo
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('clear selection content', () => {
        describe('correct situations', () => {
            it('will clear selection content when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                expect(await commandService.executeCommand(ClearSelectionContentCommand.id)).toBeTruthy();
                expect(getValue()?.v).toBe(null);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()?.v).toBe('A1');
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(ClearSelectionContentCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
