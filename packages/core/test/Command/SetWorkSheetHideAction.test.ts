/**
 * @jest-environment jsdom
 */
import { SheetContext } from '../../src/Basics';
import { CommandManager, SetWorkSheetHideAction } from '../../src/Command';
import { SHEET_ACTION_NAMES } from '../../src/Types/Const';
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { BooleanNumber } from '../../src/Types/Enum';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));
test('Set WorkSheet Hide', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet-01';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = SHEET_ACTION_NAMES.HIDE_SHEET_ACTION;
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
