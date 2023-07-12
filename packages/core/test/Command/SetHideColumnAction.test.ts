/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { createCoreTestContainer } from '../ContainerStartUp';
import { SheetContext } from '../../src/Basics';
import {
    CommandManager,
    SetColumnHideAction,
    SetColumnShowAction,
} from '../../src/Command';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Set a hide Column', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetColumnHideAction';
    const configure = { actionName, sheetId, columnIndex: 1, columnCount: 1 };
    const action = new SetColumnHideAction(configure, workbook, observers);

    expect(worksheet.getColumnManager().getColumnOrCreate(1).hd).toEqual(true);

    action.undo();
    expect(worksheet.getColumnManager().getColumnOrCreate(1).hd).toEqual(false);
    action.redo();
    expect(worksheet.getColumnManager().getColumnOrCreate(1).hd).toEqual(true);

    const actionNameShow = 'SetColumnShowAction';
    const configureShow = {
        actionName: actionNameShow,
        sheetId,
        columnIndex: 1,
        columnCount: 1,
    };
    workbook.insertSheet(worksheet);
    const actionShow = new SetColumnShowAction(configureShow, workbook, observers);

    expect(worksheet.getColumnManager().getColumnOrCreate(1).hd).toEqual(false);

    actionShow.undo();
    expect(worksheet.getColumnManager().getColumnOrCreate(1).hd).toEqual(true);
    actionShow.redo();
    expect(worksheet.getColumnManager().getColumnOrCreate(1).hd).toEqual(false);
});
