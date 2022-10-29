/**
 * @jest-environment jsdom
 */
import { BooleanNumber, Range } from '../../src';
import { Context } from '../../src/Basics/Context';
import { Workbook } from '../../src/Sheets/Domain/Workbook';
import { Worksheet } from '../../src/Sheets/Domain/Worksheet';
import { IOCContainerStartUpReady } from './Range.test';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test activate', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
            },
            2: {
                cl: {
                    rgb: 'red',
                },
            },
        },
    });
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet-01',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: 1,
    };
    const test = new Worksheet(context);
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const secondConfigure = {
        id: 'sheet-02',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: 0,
    };
    const secondWorksheet = new Worksheet(context, secondConfigure);
    workbook.insertSheet(secondWorksheet);
    secondWorksheet.setCommandManager(commandManager);
    expect(secondWorksheet.getSheetId()).toEqual('sheet-02');

    // activate sheet
    secondWorksheet.activate();

    // test current sheet status state
    const currentStatus = secondWorksheet.getStatus();
    expect(currentStatus).toEqual(BooleanNumber.TRUE);

    // undo
    secondWorksheet.getCommandManager().undo();

    // test previous sheet status state
    const preStatus = secondWorksheet.getStatus();
    expect(preStatus).toEqual(BooleanNumber.FALSE);

    // redo
    secondWorksheet.getCommandManager().redo();

    // test next sheet status state
    const nextStatus = secondWorksheet.getStatus();
    expect(nextStatus).toEqual(BooleanNumber.TRUE);
    secondWorksheet.activate();
});

test('Test getCellMatrix', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
            3: {},
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.getCellMatrix()).not.toBeUndefined();
});

test('Test clone', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.clone()).not.toBeUndefined();
});

test('Test SetName', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const sheetName = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId, name: sheetName });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.getName()).toEqual('sheet');

    worksheet.setName('luckSheet');
    expect(worksheet.getName()).toEqual('luckSheet');
});

test('Test setStatus', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const sheetName = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId, name: sheetName });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    worksheet.setStatus(BooleanNumber.FALSE);
    expect(worksheet.getStatus()).toEqual(BooleanNumber.FALSE);
});

test('Test Clear', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
            },
            1: {
                0: {
                    s: '1',
                    v: 3,
                    m: '3',
                },
                1: {
                    s: '1',
                    v: 4,
                    m: '4',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    // clear sheet
    worksheet.clear();
    worksheet.clear({
        formatOnly: true,
    });

    // test current sheet
    const currentV = worksheet.getCellMatrix().getData();
    expect(currentV).toEqual({
        0: {
            0: {
                v: '',
                m: '',
            },
            1: {
                v: '',
                m: '',
            },
        },
        1: {
            0: {
                v: '',
                m: '',
            },
            1: {
                v: '',
                m: '',
            },
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous A1 color
    const preV = worksheet.getCellMatrix()?.getData();
    // expect(preV).toEqual({
    //     0: {
    //         0: {
    //             s: '1',
    //             v: 1,
    //             m: '1',
    //         },
    //         1: {
    //             s: '1',
    //             v: 2,
    //             m: '2',
    //         },
    //     },
    //     1: {
    //         0: {
    //             s: '1',
    //             v: 3,
    //             m: '3',
    //         },
    //         1: {
    //             s: '1',
    //             v: 4,
    //             m: '4',
    //         },
    //     },
    // });
});

test('Test SetTabColor', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId, tabColor: 'red' });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    // clear sheet
    worksheet.setTabColor('blue');

    // test current sheet tab color
    const currentTabColor = worksheet.getConfig().tabColor;
    expect(currentTabColor).toEqual('blue');

    // undo
    worksheet.getCommandManager().undo();

    // test previous sheet tab color
    const preTabColor = worksheet.getConfig().tabColor;
    expect(preTabColor).toEqual('red');

    // redo
    worksheet.getCommandManager().redo();

    // test next sheet tab color
    const nextTabColor = worksheet.getConfig().tabColor;
    expect(nextTabColor).toEqual('blue');
});

test('Test ClearContents', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const cellData = { 0: { 0: { v: 'lucksheet', m: 'lucksheet' } } };
    const worksheet = new Worksheet(context, { id: sheetId, cellData });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    const cellMatrix = worksheet.getCellMatrix();
    const cell = cellMatrix.getValue(0, 0);
    if (cell) {
        expect(cell.v).toEqual('lucksheet');
        worksheet.clearContents();
        expect(cell.v).toEqual('');
    }
});

test('Test ClearNotes', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const cellData = { 0: { 0: { v: 'lucksheet', m: 'lucksheet' } } };
    const worksheet = new Worksheet(context, { id: sheetId, cellData });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    const cellMatrix = worksheet.getCellMatrix();
    const cell = cellMatrix.getValue(0, 0);
    if (cell) {
        expect(cell.v).toEqual('lucksheet');
        worksheet.clearNotes();
    }
});

test('Test ClearFormats', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const cellData = { 0: { 0: { v: 'lucksheet', m: 'lucksheet' } } };
    const worksheet = new Worksheet(context, { id: sheetId, cellData });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    const cellMatrix = worksheet.getCellMatrix();
    const cell = cellMatrix.getValue(0, 0);
    if (cell) {
        expect(cell.v).toEqual('lucksheet');
        worksheet.clearFormats();
    }
});

test('Test DeleteRow', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const cellData = {
        0: {
            0: { v: 'lucksheet1', m: 'lucksheet1' },
            1: { v: 'lucksheet1', m: 'lucksheet1' },
            2: { v: 'lucksheet1', m: 'lucksheet1' },
        },
        1: {
            0: { v: 'lucksheet1', m: 'lucksheet1' },
            1: { v: 'lucksheet1', m: 'lucksheet1' },
            2: { v: 'lucksheet1', m: 'lucksheet1' },
        },
        2: {
            0: { v: 'lucksheet1', m: 'lucksheet1' },
            1: { v: 'lucksheet1', m: 'lucksheet1' },
            2: { v: 'lucksheet1', m: 'lucksheet1' },
        },
        3: {
            0: { v: 'lucksheet1', m: 'lucksheet1' },
            1: { v: 'lucksheet1', m: 'lucksheet1' },
            2: { v: 'lucksheet1', m: 'lucksheet1' },
        },
    };
    const rowData = {
        0: { hd: 0, h: 10 },
        1: { hd: 0, h: 10 },
        2: { hd: 0, h: 10 },
        3: { hd: 0, h: 10 },
    };
    const configure = { sheetId, cellData, rowData };
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.deleteRow(1);
    worksheet.deleteRows(1, 1);
});

test('Test SetCurrentCell/getActiveCell/getActiveRangeList', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    worksheet.setCommandManager(commandManager);
    worksheet.setCurrentCell(
        new Range(worksheet, {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        })
    );
    expect(worksheet.getActiveCell().getRangeData()).toEqual({
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 0,
    });
    expect(worksheet.getActiveRangeList().getRangeList().length).toEqual(1);
});

// test('Test BorderStyle', () => {
//     const container = IOCContainerStartUpReady();
//     const context = container.getSingleton<Context>('Context');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         id: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     s: '1',
//                     v: 1,
//                     m: '1',
//                 },
//                 1: {
//                     s: '1',
//                     v: 2,
//                     m: '2',
//                 },
//             },
//             1: {
//                 0: {
//                     s: '1',
//                     v: 3,
//                     m: '3',
//                 },
//                 1: {
//                     s: '1',
//                     v: 4,
//                     m: '4',
//                 },
//             },
//         },
//         status: 1,
//     };
//     const worksheet = new WorkSheet(context, configure);
//     workbook.insertSheet(worksheet);
//     worksheet.setCommandManager(commandManager);
//     const borderStyles = worksheet.getBorderStyles();

//     // console.log(JSON.stringify(workbook.getStyles()));
//     borderStyles.setRStyle(0, 0, {
//         cl: { rgb: 'rgb(0,0,0,)' },
//         s: BorderStyleTypes.DASH_DOT,
//     });
//     // console.log(JSON.stringify(workbook.getStyles()));
//     borderStyles.setLStyle(0, 1, {
//         cl: { rgb: 'rgb(0,0,0,)' },
//         s: BorderStyleTypes.DASH_DOT,
//     });
//     // console.log(JSON.stringify(workbook.getStyles()));
// });

test('Test Copy', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.copy('demo')).not.toBeUndefined();
});

test('Test getRange', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        status: 1,
    };
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const a = worksheet
        .getRange({
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        })
        .getRangeData();

    const b = worksheet.getRange(1, 1).getRangeData();
    const c = worksheet.getRange(1, 1, 2).getRangeData();
    const d = worksheet.getRange('A1:B1').getRangeData();

    expect(a).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });
    expect(b).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });
    expect(c).toEqual({
        startRow: 1,
        endRow: 2,
        startColumn: 1,
        endColumn: 1,
    });
    expect(d).toEqual({
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 1,
    });
});

test('Test getRangeList', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const a = worksheet.getRangeList(['A1:B1', 'A2:B2']).getRangeList();
    // console.log(a);
});

test('Test getStatus/setStatus', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const sheetName = 'sheet';
    const worksheet = container.getInstance<Worksheet>('WorkSheet', context, {
        sheetId,
        name: sheetName,
    });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.getStatus()).toEqual(BooleanNumber.FALSE);
    worksheet.setStatus(BooleanNumber.TRUE);
    expect(worksheet.getStatus()).toEqual(BooleanNumber.TRUE);
});

test('Test hideSheet/showSheet', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    // hide sheet
    worksheet.hideSheet();

    // test current sheet hidden state
    const currentHidden = worksheet.getConfig().hidden;
    expect(currentHidden).toEqual(1);

    worksheet.showSheet();
    const currentHidden1 = worksheet.getConfig().hidden;
    expect(currentHidden1).toEqual(0);
    const sheetId1 = 'sheet1';
    const worksheet1 = new Worksheet(context, { id: sheetId1, hidden: 1 });
    worksheet1.setCommandManager(commandManager);
    workbook.insertSheet(worksheet1);
    worksheet1.hideSheet();
    const sheetId2 = 'sheet2';
    const worksheet2 = new Worksheet(context, { id: sheetId2, hidden: 0 });
    worksheet2.setCommandManager(commandManager);
    workbook.insertSheet(worksheet2);
    worksheet2.showSheet();
});

test('Test hideRow/hideRows', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);
    worksheet.hideRows(2, 1);
    worksheet.hideRow(
        new Range(worksheet, {
            startRow: 0,
            startColumn: 0,
            endRow: 0,
            endColumn: 0,
        })
    );
});

test('Test showColumns/hideColumns', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        columnData: {
            '0': {
                w: 100,
                hd: 0,
            },
            '1': {
                w: 200,
                hd: 1,
            },
            '2': {
                w: 200,
                hd: 1,
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);
    worksheet.hideColumn(
        new Range(worksheet, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        })
    );
    expect(worksheet.getConfig().columnData['0'].hd).toEqual(true);
    worksheet.hideColumns(0, 1);
    expect(worksheet.getConfig().columnData['0'].hd).toEqual(true);
    worksheet.showColumns(0, 1);
    expect(worksheet.getConfig().columnData['0'].hd).toEqual(false);
});

test('Test showRows/hideRows', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);
    worksheet.hideRows(1, 1);
    worksheet.showRows(1, 1);
});

test('Test unhideRow/unhideColumn', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);
    worksheet.hideRows(1, 1);
    const range = worksheet.getRange('A1:A2');
    worksheet.unhideRow(range);
    worksheet.hideColumns(1, 1);
    const range1 = worksheet.getRange('A1:B1');
    worksheet.unhideColumn(range1);
});

test('Test hasHiddenGridlines/setHiddenGridlines', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    // hide sheet
    worksheet.setHiddenGridlines(true);
    expect(worksheet.hasHiddenGridlines()).toEqual(true);
    worksheet.getCommandManager().undo();
    expect(worksheet.hasHiddenGridlines()).toEqual(false);
    worksheet.getCommandManager().redo();
    expect(worksheet.hasHiddenGridlines()).toEqual(true);
});

test('Test getTabColor', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
        status: 1,
        tabColor: 'red',
    };
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    // hide sheet
    expect(worksheet.getTabColor()).toEqual('red');
});

test('Test setColumnWidth/getColumnWidth', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.setColumnWidth(0, 1, 50);
    expect(worksheet.getColumnWidth(0)).toEqual(50);
    expect(worksheet.getColumnManager().getColumnWidth(0, 2)).toEqual(250);
    expect(worksheet.getColumnManager().getSize()).toEqual(2);
    expect(worksheet.getColumnManager().getColumnData().getSizeOf()).toEqual(2);
    worksheet.getCommandManager().undo();
    expect(worksheet.getColumnWidth(0)).toEqual(100);
    worksheet.getCommandManager().redo();
    expect(worksheet.getColumnWidth(0)).toEqual(50);
    worksheet.setColumnWidth(0, 30);
    expect(worksheet.getColumnWidth(0)).toEqual(30);
});

test('Test setRowHeights/getRowHeight', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.setRowHeights(0, 2, 30);
    expect(worksheet.getRowHeight(0)).toEqual(30);
    expect(worksheet.getRowHeight(1)).toEqual(30);
    expect(worksheet.getRowManager().getRowHeight(0, 2)).toEqual(60);
    worksheet.getCommandManager().undo();
    expect(worksheet.getRowHeight(0)).toEqual(50);
    expect(worksheet.getRowHeight(1)).toEqual(60);
    worksheet.getCommandManager().redo();
    expect(worksheet.getRowHeight(0)).toEqual(30);
    expect(worksheet.getRowHeight(1)).toEqual(30);
    worksheet.setRowHeight(0, 10);
    expect(worksheet.getRowHeight(0)).toEqual(10);
});

test('Test setActiveSelection', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    worksheet.setActiveSelection('A1:B1');
});

test('Test getFrozenRows/getFrozenColumns/getMaxColumns/getMaxRows/getType/getRowCount/getColumnCount', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.getFrozenColumns()).toEqual(-1);
    expect(worksheet.getFrozenRows()).toEqual(-1);
    expect(worksheet.getMaxColumns()).toEqual(100);
    expect(worksheet.getMaxRows()).toEqual(1000);
    expect(worksheet.getType()).toEqual(0);
    expect(worksheet.getRowCount()).toEqual(1000);
    expect(worksheet.getColumnCount()).toEqual(100);
});

// test('Test getBorderStyles/setBorderStyles', () => {
//     const container = IOCContainerStartUpReady();
//     const context = container.getSingleton<Context>('Context');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         id: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     s: '1',
//                     v: 1,
//                     m: '1',
//                 },
//                 1: {
//                     s: '1',
//                     v: 2,
//                     m: '2',
//                 },
//                 2: {
//                     s: '1',
//                     v: 3,
//                     m: '3',
//                 },
//             },
//             1: {
//                 0: {
//                     s: '1',
//                     v: 4,
//                     m: '4',
//                 },
//                 1: {
//                     s: '1',
//                     v: 5,
//                     m: '5',
//                 },
//                 2: {
//                     s: '1',
//                     v: 6,
//                     m: '6',
//                 },
//             },
//             2: {
//                 0: {
//                     s: '1',
//                     v: 7,
//                     m: '7',
//                 },
//                 1: {
//                     s: '1',
//                     v: 8,
//                     m: '8',
//                 },
//                 2: {
//                     s: '1',
//                     v: 9,
//                     m: '9',
//                 },
//             },
//         },
//         rowData: {
//             '0': {
//                 h: 50,
//                 hd: 0,
//             },
//             '1': {
//                 h: 60,
//                 hd: 1,
//             },
//         },
//         columnData: {
//             '0': {
//                 w: 100,
//                 hd: 0,
//             },
//             '1': {
//                 w: 200,
//                 hd: 1,
//             },
//         },
//         status: 1,
//         tabColor: 'red',
//     };
//     const worksheet = new WorkSheet(context, configure);
//     worksheet.setCommandManager(commandManager);
//     workbook.insertSheet(worksheet);
//     worksheet.setBorderStyle(
//         { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
//         { s: 0, cl: { rgb: 'red' } },
//         [1]
//     );
//     worksheet.getBorderStyles();
// });

test('Test getIndex/getParent', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.getIndex()).toEqual(1);
    worksheet.getParent();
});

test('Test isSheetHidden', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    expect(worksheet.isSheetHidden()).toEqual(0);
});

test('Test isRightToLeft/setRightToLeft', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    worksheet.setRightToLeft(BooleanNumber.TRUE);
    expect(worksheet.isRightToLeft()).toEqual(BooleanNumber.TRUE);
    worksheet.getCommandManager().undo();
    expect(worksheet.isRightToLeft()).toEqual(BooleanNumber.FALSE);
    worksheet.getCommandManager().redo();
    expect(worksheet.isRightToLeft()).toEqual(BooleanNumber.TRUE);
});

test('Test getPluginMeta/setPluginMeta', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetId = 'sheet';
    const worksheet = new Worksheet(context, { id: sheetId });
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    worksheet.setPluginMeta('name', 'univer');
    expect(worksheet.getPluginMeta('name')).toEqual('univer');
});

test('Test getLastRow/getLastColumn', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    worksheet.insertRows(3, 100);
    expect(worksheet.getLastRow()).toEqual(103);
});

test('Test copyTo', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet-01',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const secondConfigure = {
        id: 'sheet-02',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: 0,
    };
    const secondWorksheet = new Worksheet(context, secondConfigure);
    workbook.insertSheet(secondWorksheet);
    secondWorksheet.setCommandManager(commandManager);
    worksheet.copyTo(5);
    worksheet.copyTo(1);
    expect(secondWorksheet.getStatus()).toEqual(1);
});

test('Test getSheetValues', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    const values = worksheet.getSheetValues(1, 1, 2, 2);
});

test('Test getSheetValues', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);

    const values = worksheet.getDataRange();
});

test('Test InsertRows', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.insertRows(1);
    worksheet.insertRows(1, 1);
    worksheet.getCommandManager().undo();
    worksheet.getCommandManager().redo();
});

test('Test insertrowsafter/insertrowsbefore', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.insertRowAfter(1);
    worksheet.insertRowAfter(1, 1);
});

test('Test insertrowsbefore', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.insertRowBefore(1);
    worksheet.insertRowBefore(1, 1);
    worksheet.insertRowBefore(0);
});

test('Test moveRows', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    const range = worksheet.getRange('A1:B1');
    worksheet.moveRows(range, 2);
});

test('Test insertColumns', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.insertColumns(1);
    expect(worksheet.getLastColumn()).toEqual(3);
    worksheet.getCommandManager().undo();
    worksheet.getCommandManager().redo();
    worksheet.insertColumns(1, 1);
    expect(worksheet.getLastColumn()).toEqual(4);
});
test('Test insertColumnsBefore', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.insertColumnBefore(0);
    expect(worksheet.getLastColumn()).toEqual(3);
    worksheet.insertColumnBefore(1, 1);
    expect(worksheet.getLastColumn()).toEqual(4);
});

test('Test insertColumnsAfter', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.insertColumnAfter(0);
    expect(worksheet.getLastColumn()).toEqual(3);
    worksheet.insertColumnAfter(1, 1);
    expect(worksheet.getLastColumn()).toEqual(4);
});

test('Test moveColumns', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    const range = worksheet.getRange('A1');
    worksheet.moveColumns(range, 2);
});

test('Test deleteColumns/deleteColumn', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    worksheet.deleteColumn(1);
    const range = worksheet.getRange('A1');
    worksheet.deleteColumns(1, 1);
    const data = worksheet.getConfig().cellData;
    worksheet.getCommandManager().undo();
    worksheet.getCommandManager().redo();
});

test('Test getContext', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);

    expect(worksheet.getContext()).toEqual(context);
});

test('Test getMerges', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);

    expect(worksheet.getMerges()).not.toBeUndefined();
});

test('Test getSheetData', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = new Worksheet(context, configure);
    worksheet.setCommandManager(commandManager);

    expect(worksheet.getSheetData()).not.toBeUndefined();
});

test('Test getSelection', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    worksheet.setCommandManager(commandManager);

    expect(worksheet.getSelection()).not.toBeUndefined();
});

test('Test setActiveRange', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);
    const range = worksheet.getRange({
        startRow: 0,
        endRow: 1,
        startColumn: 0,
        endColumn: 1,
    });
    worksheet.setActiveRange({
        selection: range,
    });
    expect(worksheet.getActiveRange().getRangeData()).toEqual({
        startRow: 0,
        endRow: 1,
        startColumn: 0,
        endColumn: 1,
    });
});

test('Test setActiveRangeList', () => {
    const container = IOCContainerStartUpReady();
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    worksheet.setActiveRangeList({
        selection: [
            {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3,
            },
            {
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            },
        ],
    });

    expect(worksheet.getActiveRangeList().getRangeList().length).toEqual(2);
});
