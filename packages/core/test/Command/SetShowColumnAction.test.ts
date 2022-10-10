/**
 * @jest-environment jsdom
 */
import { Workbook1, Worksheet1 } from '../../src/Sheets/Domain';
import { Context } from '../../src/Basics';
import { CommandManager, SetColumnShowAction } from '../../src/Command';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('SetColumnShowAction', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook1>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet1(context, { id: sheetId });

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetColumnShowAction';
    const configure = { actionName, sheetId, columnIndex: 1, columnCount: 1 };
    workbook.insertSheet(worksheet);
    new SetColumnShowAction(configure, workbook, observers);
});
