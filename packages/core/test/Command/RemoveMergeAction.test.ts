/**
 * @jest-environment jsdom
 */
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { SheetContext } from '../../src/Basics';
import {
    AddMergeAction,
    CommandManager,
    RemoveMergeAction,
} from '../../src/Command';
import { IOCContainerStartUpReady } from '../ContainerStartUp';
import { IRangeData } from '../../src/Interfaces';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Remove a new merge', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new Worksheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);
    const observers = CommandManager.getActionObservers();

    // add merge
    const actionNameAdd = 'AddMergeAction';
    const rect: IRangeData[] = [
        { startRow: 1, startColumn: 1, endRow: 5, endColumn: 5 },
    ];

    const configureAdd = { actionName: actionNameAdd, sheetId, rectangles: rect };
    const mergeAction = new AddMergeAction(configureAdd, workbook, observers);

    // remove merge
    const actionNameRemove = 'RemoveMergeAction';
    const rectangles: IRangeData[] = [
        { startRow: 1, startColumn: 1, endRow: 5, endColumn: 5 },
    ];
    const configureRemove = {
        actionName: actionNameRemove,
        sheetId,
        rectangles,
    };
    const action = new RemoveMergeAction(configureRemove, workbook, observers);
    expect(worksheet.getMerges().size()).toEqual(0);

    action.undo();
    expect(worksheet.getMerges().size()).toEqual(1);
    action.redo();
    expect(worksheet.getMerges().size()).toEqual(0);
});
