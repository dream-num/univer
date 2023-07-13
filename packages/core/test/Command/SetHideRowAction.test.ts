/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import {
    CommandManager,
    SetRowHideAction,
    SetRowShowAction,
} from '../../src/Command';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('SetRowHideAction', () => {
    const observers = CommandManager.getActionObservers();
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const actionName = 'SetRowHideAction';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const configure = { actionName, sheetId, rowIndex: 1, rowCount: 1 };
    const action = new SetRowHideAction(configure, workbook, observers);

    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(true);

    action.undo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(false);
    action.redo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(true);

    const actionNameShow = 'SetRowShowAction';
    const configureShow = {
        actionName: actionNameShow,
        sheetId,
        rowIndex: 1,
        rowCount: 1,
    };
    const actionShow = new SetRowShowAction(configureShow, workbook, observers);

    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(false);

    actionShow.undo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(true);
    actionShow.redo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(false);
});
