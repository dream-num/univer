/**
 * @jest-environment jsdom
 */
import { Context } from '../../src/Basics';
import { CommandManager, RemoveRowDataAction } from '../../src/Command';
import { Workbook, Worksheet } from '../../src/Sheets/Domain';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Insert a new Row', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');

    const data = {
        sheetId: 'sheet',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 3,
                    m: '3',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 4,
                    m: '4',
                },
                1: {
                    s: '1',
                    v: 5,
                    m: '5',
                },
                2: {
                    s: '1',
                    v: 6,
                    m: '6',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 7,
                    m: '7',
                },
                1: {
                    s: '1',
                    v: 8,
                    m: '8',
                },
                2: {
                    s: '1',
                    v: 9,
                    m: '9',
                },
            },
        },
        rowData: {
            '0': {
                h: 50,
                hd: 0,
            },
            '1': {
                h: 60,
                hd: 1,
            },
        },
        columnData: {
            '0': {
                w: 100,
                hd: 0,
            },
            '1': {
                w: 200,
                hd: 1,
            },
        },
        status: 1,
        tabColor: 'red',
    };
    const worksheet = new Worksheet(context, data);
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'RemoveRowDataAction';
    const configure = {
        actionName,
        sheetId: data.sheetId,
        rowIndex: 0,
        rowCount: 1,
    };
    const action = new RemoveRowDataAction(configure, workbook, observers);
    expect(worksheet.getRowManager().getSize()).toEqual(2);
    action.undo();
    action.redo();
});
