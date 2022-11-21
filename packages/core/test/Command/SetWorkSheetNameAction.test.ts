/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import { IOCContainerStartUpReady } from '../ContainerStartUp';
import { CommandManager, SetWorkSheetNameAction } from '../../src/Command';
import { ACTION_NAMES } from '../../src/Const';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Set WorkSheet Name', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const name = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId, name });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = ACTION_NAMES.SET_WORKSHEET_NAME_ACTION;
    const sheetName = 'test';
    const configure = {
        actionName,
        sheetId,
        sheetName,
    };
    const action = new SetWorkSheetNameAction(configure, workbook, observers);
    expect(worksheet.getName()).toEqual('test');

    action.undo();
    expect(worksheet.getName()).toEqual('sheet1');
    action.redo();
    expect(worksheet.getName()).toEqual('test');
});
