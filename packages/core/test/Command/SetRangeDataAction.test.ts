/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import {
    SetRangeDataAction,
    CommandManager,
    ISetRangeDataActionData,
} from '../../src/Command';
import { ICellData, ObjectMatrixPrimitiveType } from '../../src';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test SetRangeDataAction', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetRangeDataAction';

    //  mock data
    const cellValue: ObjectMatrixPrimitiveType<ICellData> = {
        0: {
            0: {
                v: 1,
                m: '1',
            },
        },
    };

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 0,
    };
    const configure: ISetRangeDataActionData = {
        actionName,
        sheetId,
        cellValue,
    };

    const action = new SetRangeDataAction(configure, workbook, observers);

    const value = worksheet.getCellMatrix().getValue(0, 0);
    expect(value && value.v).toEqual(1);

    action.undo();

    const preValue = worksheet.getCellMatrix().getValue(0, 0);

    expect(preValue && preValue.v).toEqual(undefined);

    action.redo();

    const nextValue = worksheet.getCellMatrix().getValue(0, 0);
    expect(nextValue && nextValue.v).toEqual(1);
});
