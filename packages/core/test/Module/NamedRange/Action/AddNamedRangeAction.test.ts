/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { SheetContext } from '../../../../src/Basics';
import { ActionObservers, AddNamedRangeAction } from '../../../../src/Command';
import { Workbook, Worksheet } from '../../../../src/Sheets/Domain';
import { INamedRange } from '../../../../src/Interfaces/INamedRange';
import { IOCContainerStartUpReady } from '../../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Add NamedRange Action Test', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const rangeData = {
        startRow: 0,
        endRow: 10,
        startColumn: 0,
        endColumn: 10,
    };
    const namedRange: INamedRange = {
        name: 'named range 1',
        namedRangeId: 'named-range-1',
        range: {
            sheetId: 'sheet1',
            rangeData,
        },
    };
    new AddNamedRangeAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            namedRange,
        },
        workbook,
        new ActionObservers()
    );
});
