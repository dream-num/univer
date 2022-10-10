/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { Context } from '../../src/Basics';
import { AddMergeAction, CommandManager } from '../../src/Command';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test Create MergeCell', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'AddMergeAction';
    const rect = [{ startRow: 1, startColumn: 1, endRow: 5, endColumn: 5 }];

    const configure = { actionName, sheetId, rectangles: rect };
    new AddMergeAction(configure, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(1);
});

test('Test Undo MergeCell', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'AddMergeAction';
    const rect = [{ startRow: 1, startColumn: 1, endRow: 5, endColumn: 5 }];

    const configure = { actionName, sheetId, rectangles: rect };
    const action = new AddMergeAction(configure, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(1);
    action.undo();
    expect(worksheet.getMerges().size()).toEqual(0);
    action.redo();
    expect(worksheet.getMerges().size()).toEqual(1);
});

test('Test Cross MergeCell', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'AddMergeAction';

    const rect1 = [{ startRow: 1, startColumn: 1, endRow: 5, endColumn: 5 }];
    const config1 = { actionName, sheetId, rectangles: rect1 };
    new AddMergeAction(config1, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(1);

    const rect2 = [{ startRow: 2, startColumn: 2, endRow: 5, endColumn: 5 }];
    const config2 = { actionName, sheetId, rectangles: rect2 };
    new AddMergeAction(config2, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(1);
});

test('Test Multiple MergeCell', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'AddMergeAction';

    const rect1 = [{ startRow: 1, startColumn: 1, endRow: 5, endColumn: 5 }];
    const config1 = { actionName, sheetId, rectangles: rect1 };
    new AddMergeAction(config1, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(1);

    const rect2 = [{ startRow: 10, startColumn: 10, endRow: 15, endColumn: 15 }];
    const config2 = { actionName, sheetId, rectangles: rect2 };
    new AddMergeAction(config2, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(2);
});
