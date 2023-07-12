/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import { CommandManager, SetColumnShowAction } from '../../src/Command';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('SetColumnShowAction', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetColumnShowAction';
    const configure = { actionName, sheetId, columnIndex: 1, columnCount: 1 };
    workbook.insertSheet(worksheet);
    new SetColumnShowAction(configure, workbook, observers);
});
