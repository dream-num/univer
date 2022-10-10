/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { Context } from '../../../../src/Basics';
import { ActionObservers } from '../../../../src/Command';
import { Workbook, Worksheet } from '../../../../src/Sheets/Domain';
import {
    AddNamedRangeAction,
    SetNamedRangeAction,
} from '../../../../src/Module/NamedRange/Action';
import { INamedRange } from '../../../../src/Module/NamedRange/INamedRange';
import { IOCContainerStartUpReady } from '../../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Set NamedRange Action Test', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
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

    const newNamedRange: INamedRange = {
        name: 'new named range 1',
        namedRangeId: 'named-range-1',
        range: {
            sheetId: 'sheet1',
            rangeData,
        },
    };

    new SetNamedRangeAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            namedRange: newNamedRange,
        },
        workbook,
        new ActionObservers()
    );
});
