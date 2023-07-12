/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import {
    SetRangeFormattedValueAction,
    CommandManager,
    ISetRangeFormattedValueActionData,
} from '../../src/Command';
import { ICellV, ObjectMatrixPrimitiveType } from '../../src';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test SetRangeFormattedValueAction', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetRangeFormattedValueAction';

    //  mock data
    const cellValue: ObjectMatrixPrimitiveType<ICellV> = {
        0: {
            0: 1,
        },
    };

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 0,
    };
    const configure: ISetRangeFormattedValueActionData = {
        actionName,
        sheetId,
        cellValue,
        rangeData,
    };

    const action = new SetRangeFormattedValueAction(configure, workbook, observers);

    const value = worksheet.getCellMatrix().getValue(0, 0);
    expect(value && value.v).toEqual(1);

    action.undo();

    const preValue = worksheet.getCellMatrix().getValue(0, 0);

    expect(preValue && preValue.v).toEqual('');

    action.redo();

    const nextValue = worksheet.getCellMatrix().getValue(0, 0);
    expect(nextValue && nextValue.v).toEqual(1);
});
