import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService, SetRangeValuesMutation } from '@univerjs/base-sheets';
import { IClipboardInterfaceService } from '@univerjs/base-ui';
import { ICellData, ICommandService, IUniverInstanceService, Nullable, RANGE_TYPE, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ISheetClipboardService } from '../clipboard.service';
import { clipboardTestBed } from './clipboard-test-bed';
import { MockClipboard } from './mock-clipboard';

const read = vi.fn(() => {
    const mockClipboard = new MockClipboard();
    return mockClipboard.read;
});

Object.assign(navigator, {
    clipboard: {
        read,
    },
});

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let clipboardInterfaceService: IClipboardInterfaceService;

    beforeEach(() => {
        const testBed = clipboardTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        sheetClipboardService = get(ISheetClipboardService);
        clipboardInterfaceService = get(IClipboardInterfaceService);
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('clear selection contents', () => {
        it('will clear selection content when there is a selected range', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });
            selectionManager.add([
                {
                    range: { startRow: 0, startColumn: 1, endColumn: 1, endRow: 0, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            function getValueByPosition(
                startRow: number,
                startColumn: number,
                endRow: number,
                endColumn: number
            ): Nullable<ICellData> {
                return get(IUniverInstanceService)
                    .getUniverSheetInstance('test')
                    ?.getSheetBySheetId('sheet1')
                    ?.getRange(startRow, startColumn, endRow, endColumn)
                    .getValue();
            }

            console.info('value A1===', getValueByPosition(0, 0, 0, 0));

            expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                v: 'A1',
            });

            // copy TODO@Dushusir test copy
            // await sheetClipboardService.copy();

            // paste
            // const clipboardItems = await clipboardInterfaceService.read();
            // use mock
            const mockClipboard = new MockClipboard();
            const clipboardItems = await mockClipboard.read();

            if (clipboardItems.length !== 0) {
                const result = await sheetClipboardService.paste(clipboardItems[0]);
                console.info('value B1===', getValueByPosition(0, 1, 0, 1));
            }
        });
    });
});
