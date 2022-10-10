/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { Context } from '../../../../src/Basics';
import { ActionObservers } from '../../../../src/Command';
import { Workbook1, Worksheet1 } from '../../../../src/Sheets/Domain';
import {
    AddNamedRangeAction,
    DeleteNamedRangeAction,
} from '../../../../src/Module/NamedRange/Action';
import { INamedRange } from '../../../../src/Module/NamedRange/INamedRange';
import { IOCContainerStartUpReady } from '../../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Delete NamedRange Action Test', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook1>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet1(context, { id: sheetId });
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
