/**
 * @jest-environment jsdom
 */
import {
    ActionObservers,
    ACTION_NAMES,
    AddNamedRangeAction,
    DeleteNamedRangeAction,
} from '../../../../src';
import { SheetContext } from '../../../../src/Basics';
import { Workbook, Worksheet } from '../../../../src/Sheets/Domain';
import { INamedRange } from '../../../../src/Types/Interfaces/INamedRange';
import { createCoreTestContainer } from '../../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Delete NamedRange Action Test', () => {
    const container = createCoreTestContainer();
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

    // add
    new AddNamedRangeAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            namedRange,
        },
        workbook,
        new ActionObservers()
    );

    // remove
    new DeleteNamedRangeAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
            namedRangeId: 'named-range-1',
        },
        workbook,
        new ActionObservers()
    );
});
