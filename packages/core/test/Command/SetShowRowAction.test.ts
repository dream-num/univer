/**
 * @jest-environment jsdom
 */
import { Workbook1, Worksheet1 } from '../../src/Sheets/Domain';
import { Context } from '../../src/Basics';
import { IOCContainerStartUpReady } from '../ContainerStartUp';
import { CommandManager, SetRowShowAction } from '../../src/Command';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('SetRowShowAction', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook1>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet1(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'SetRowShowAction';
    const configure = { actionName, sheetId, rowIndex: 1, rowCount: 1 };
    new SetRowShowAction(configure, workbook, observers);
});
