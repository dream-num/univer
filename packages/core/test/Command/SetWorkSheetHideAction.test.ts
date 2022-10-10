/**
 * @jest-environment jsdom
 */
import { Context } from '../../src/Basics';
import { CommandManager, SetWorkSheetHideAction } from '../../src/Command';
import { ACTION_NAMES } from '../../src/Const';
import { Workbook1, Worksheet1 } from '../../src/Sheets/Domain';
import { BooleanNumber } from '../../src/Enum';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));
test('Set WorkSheet Hide', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook1>('WorkBook');

    const sheetId = 'sheet-01';
    const worksheet = new Worksheet1(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = ACTION_NAMES.HIDE_SHEET_ACTION;
    const configure = {
        actionName,
        sheetId,
        hidden: BooleanNumber.TRUE,
    };
    const action = new SetWorkSheetHideAction(configure, workbook, observers);
    expect(worksheet.isSheetHidden()).toEqual(1);

    action.undo();
    expect(worksheet.isSheetHidden()).toEqual(0);
    action.redo();
    expect(worksheet.isSheetHidden()).toEqual(1);
});
