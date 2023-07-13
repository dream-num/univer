/**
 * @jest-environment jsdom
 */
import {
    CommandManager,
    SheetContext,
    RemoveRowAction,
    Workbook,
    Worksheet,
} from '../../src';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Remove a new column', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const rowData = { 0: { hd: 0, h: 50 } };
    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId, rowData });
    workbook.insertSheet(worksheet);
    expect(worksheet.getRowManager().getSize()).toEqual(1);

    const observers = CommandManager.getActionObservers();
    const actionName = 'RemoveRowAction';
    const configure = {
        actionName,
        sheetId,
        rowIndex: 0,
        rowCount: 1,
    };
    new RemoveRowAction(configure, workbook, observers);
    expect(worksheet.getRowManager().getSize()).toEqual(0);
});

test('Remove Undo column', () => {
    const container = createCoreTestContainer();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const rowData = { 0: { hd: 0, h: 50 } };
    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId, rowData });
    workbook.insertSheet(worksheet);
    expect(worksheet.getRowManager().getSize()).toEqual(1);

    const observers = CommandManager.getActionObservers();
    const actionName = 'RemoveRowAction';
    const configure = {
        actionName,
        sheetId,
        rowIndex: 0,
        rowCount: 1,
    };
    const action = new RemoveRowAction(configure, workbook, observers);
    expect(worksheet.getRowManager().getSize()).toEqual(0);
    action.undo();
    expect(worksheet.getRowManager().getSize()).toEqual(1);
    action.redo();
    expect(worksheet.getRowManager().getSize()).toEqual(0);
});
