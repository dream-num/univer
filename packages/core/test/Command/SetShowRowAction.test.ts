/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import { createCoreTestContainer } from '../ContainerStartUp';
import { CommandManager, SetRowShowAction } from '../../src/Command';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('SetRowShowAction', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetRowShowAction';
    const configure = { actionName, sheetId, rowIndex: 1, rowCount: 1 };
    new SetRowShowAction(configure, workbook, observers);
});
