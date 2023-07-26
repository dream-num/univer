/**
 * @jest-environment jsdom
 */
import { SheetContext } from '../../src/Basics';
import { CommandManager, SetWorkSheetStatusAction } from '../../src/Command';
import { SHEET_ACTION_NAMES } from '../../src/Types/Const';
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Set WorkSheet Status', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const status = 1;
    const worksheet = new Worksheet(context, { id: sheetId, status });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = SHEET_ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION;
    const newStatus = 0;
    const configure = {
        actionName,
        sheetId,
        sheetStatus: newStatus,
    };
    const action = new SetWorkSheetStatusAction(configure, workbook, observers);
    expect(worksheet.getStatus()).toEqual(0);

    action.undo();
    expect(worksheet.getStatus()).toEqual(1);
    action.redo();
    expect(worksheet.getStatus()).toEqual(0);
});
