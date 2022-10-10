/**
 * @jest-environment jsdom
 */
import { CommandManager, ServerHttp } from '../../src';
import { Context } from '../../src/Basics/Context';
import { Range } from '../../src/Sheets/Domain/Range';
import { Workbook } from '../../src/Sheets/Domain/Workbook';
import { Worksheet } from '../../src/Sheets/Domain/Worksheet';
import { BooleanNumber } from '../../src/Enum';
import { IOCContainerStartUpReady } from './Range.test';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test _getDefaultWorkSheet', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    expect(workbook.getSheets().length).toEqual(2);
});

test('Test _setServerBase', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    workbook.setServerBase(new ServerHttp());
    expect(workbook.getServer()).not.toBeUndefined();
});

test('Test setDefaultActiveSheet', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    workbook.setDefaultActiveSheet();
    expect(workbook.getSheets()[0].getStatus()).toEqual(BooleanNumber.TRUE);
});

test('Test setContext', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);
    expect(workbook.getContext()).toBe(context);
});

test('Test setCommandManager', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const manager = container.getSingleton<CommandManager>('CommandManager');
    workbook.setCommandManager(manager);
    expect(workbook.getCommandManager()).toBe(manager);
});

test('Test flush', () => {
    const container = IOCContainerStartUpReady({});
    const workbook = container.getSingleton<Workbook>('WorkBook');
    workbook.flush();
});

test('Test activateSheet', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();

    const configure = {
        sheetId: 'sheet-01',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: BooleanNumber.TRUE,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const secondConfigure = {
        sheetId: 'sheet-02',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        status: BooleanNumber.FALSE,
    };
    const secondWorksheet = new Worksheet(context, secondConfigure);
    workbook.insertSheet(secondWorksheet);
    secondWorksheet.setCommandManager(commandManager);

    // activate sheet
    workbook.setActiveSheet(secondWorksheet);

    // test current sheet status state
    const currentStatus = secondWorksheet.getStatus();
    expect(currentStatus).toEqual(BooleanNumber.TRUE);

    // undo
    secondWorksheet.getCommandManager().undo();

    // test previous sheet status state
    const preStatus = secondWorksheet.getStatus();
    expect(preStatus).toEqual(BooleanNumber.FALSE);
});

test('Test setActiveRange', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
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
    const oneWorksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    oneWorksheet.setCommandManager(commandManager);
    workbook.insertSheet(oneWorksheet);

    const range = oneWorksheet.getRange({
        startRow: 0,
        startColumn: 0,
        endRow: 10,
        endColumn: 10,
    });

    workbook.setActiveRange(range);
    const activeRange1 = workbook.getActiveRange();
    expect(activeRange1 as Range).toEqual(null);

    workbook.setActiveSheet(oneWorksheet);
    workbook.setActiveRange(range);
    const activeRange2 = workbook.getActiveRange();
    expect((activeRange2 as Range).getRangeData()).toEqual(range.getRangeData());
});

test('Test getIndexBySheetId', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
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
    const oneWorksheet = new Worksheet(context, secondConfigure);
    oneWorksheet.setCommandManager(commandManager);
    workbook.insertSheet(oneWorksheet);

    expect(workbook.getIndexBySheetId('sheet-02')).toEqual(0);
});

test('Test insertSheet', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();
    workbook.setContext(context);

    const oneConfigure = {
        sheetId: 'sheet-02',
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
    const oneWorksheet = new Worksheet(context, oneConfigure);
    oneWorksheet.setCommandManager(commandManager);
    workbook.insertSheet(oneWorksheet);

    expect(workbook.getCommandManager()).not.toEqual(null);
    expect(workbook.getContext()).not.toEqual(null);
    expect(workbook.getSheets().length).toEqual(1);
    expect(workbook.getActiveSpreadsheet()).toEqual(workbook);

    workbook.create('Test1');
    expect(workbook.getSheets().length).toEqual(2);

    workbook.insertSheet(1);
    expect(workbook.getSheets().length).toEqual(3);

    workbook.insertSheet('sheet2');
    expect(workbook.getSheets().length).toEqual(4);

    workbook.insertSheet({ name: 'sheet3' });
    expect(workbook.getSheets().length).toEqual(5);

    workbook.insertSheet('sheet4', 1);
    expect(workbook.getSheets().length).toEqual(6);

    workbook.insertSheet(1, { name: 'sheet5' });
    expect(workbook.getSheets().length).toEqual(7);

    const towConfigure = {
        sheetId: 'sheet6',
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
    const towWorksheet = new Worksheet(context, towConfigure);
    oneWorksheet.setCommandManager(commandManager);

    workbook.insertSheet(1, towWorksheet);
    expect(workbook.getSheets().length).toEqual(8);
});

test('Test create', () => {
    const container = IOCContainerStartUpReady({});
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const worksheet = workbook.create('sheet1', 100, 100);
    expect(worksheet).not.toBeUndefined();
});

test('Test getActiveRangeList', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    const commandManager = workbook.getCommandManager();
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
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
    const oneWorksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    oneWorksheet.setCommandManager(commandManager);
    workbook.insertSheet(oneWorksheet);

    expect(workbook.getActiveRangeList()).toBe(null);
    workbook.setDefaultActiveSheet();
    expect(workbook.getActiveRangeList()).toBe(
        oneWorksheet.getSelection().getActiveRangeList()
    );
});

test('Test getSelection', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);
    expect(workbook.getSelection()).not.toEqual(null);
});

test('Test getCurrentCell', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);

    const cell = worksheet.getRange({
        startRow: 10,
        startColumn: 10,
        endRow: 10,
        endColumn: 10,
    });
    workbook.setCurrentCell(cell);

    expect((workbook.getCurrentCell() as Range).getRangeData()).toEqual(
        cell.getRangeData()
    );
});

test('Test setSheetOrder', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);
    workbook.setSheetOrder('sheet-02', 3);

    expect(workbook.getSheets()[3]).toEqual(worksheet);
});

test('Test removeSheetBySheetId', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);

    expect(workbook.getSheets().length).toEqual(1);
    workbook.removeSheetBySheetId('sheet-02');
    expect(workbook.getSheets().length).toEqual(0);
});

test('Test getSheetBySheetName', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
        name: 'sheet-luck',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);

    const find = workbook.getSheetBySheetName('sheet-luck');
    expect(worksheet).toEqual(find);
});

// test('Test newFilterCriteria', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {
//             1: {
//                 cl: {
//                     rgb: 'blue',
//                 },
//             },
//             2: {
//                 cl: {
//                     rgb: 'red',
//                 },
//             },
//         },
//     });
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();
//     const context = container.getSingleton<Context>('Context');
//     workbook.setContext(context);

//     const secondConfigure = {
//         sheetId: 'sheet-02',
//         name: 'sheet-luck',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                 },
//             },
//         },
//         status: 0,
//     };
//     const worksheet = container.getInstance<WorkSheet>(
//         'WorkSheet',
//         context,
//         secondConfigure
//     );
//     worksheet.setCommandManager(commandManager);
//     workbook.insertSheet(worksheet);
//     workbook.setActiveSheet(worksheet);

//     const filterCriteria = workbook.newFilterCriteria();
//     expect(filterCriteria).not.toBeNull();
// });

test('Test setActiveRangeList', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    workbook.setActiveRangeList([
        { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 },
        { startRow: 3, startColumn: 3, endRow: 4, endColumn: 4 },
    ]);
    workbook.setDefaultActiveSheet();
    workbook.setActiveRangeList([
        { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 },
        { startRow: 3, startColumn: 3, endRow: 4, endColumn: 4 },
    ]);
});

test('Test getSheetBySheetId', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
        name: 'sheet-luck',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);

    const find = workbook.getSheetBySheetId('sheet-02');
    expect(worksheet).toEqual(find);
});

test('Test setActiveSheet', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
        name: 'sheet-luck',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);

    expect(workbook.getActiveSheet()).toEqual(worksheet);
});

// test('Test getFormatManager', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {
//             1: {
//                 cl: {
//                     rgb: 'blue',
//                 },
//             },
//             2: {
//                 cl: {
//                     rgb: 'red',
//                 },
//             },
//         },
//     });
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();
//     const context = container.getSingleton<Context>('Context');
//     workbook.setContext(context);

//     const secondConfigure = {
//         sheetId: 'sheet-02',
//         name: 'sheet-luck',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                 },
//             },
//         },
//         status: 0,
//     };
//     const worksheet = container.getInstance<WorkSheet>(
//         'WorkSheet',
//         context,
//         secondConfigure
//     );
//     worksheet.setCommandManager(commandManager);
//     workbook.insertSheet(worksheet);
//     workbook.setActiveSheet(worksheet);

//     const formatManager = workbook.getFormatManager();
//     expect(formatManager).not.toBeNull();
// });

// test('Test newConditionalFormatRule', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {
//             1: {
//                 cl: {
//                     rgb: 'blue',
//                 },
//             },
//             2: {
//                 cl: {
//                     rgb: 'red',
//                 },
//             },
//         },
//     });
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();
//     const context = container.getSingleton<Context>('Context');
//     workbook.setContext(context);

//     const secondConfigure = {
//         sheetId: 'sheet-02',
//         name: 'sheet-luck',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                 },
//             },
//         },
//         status: 0,
//     };
//     const worksheet = container.getInstance<WorkSheet>(
//         'WorkSheet',
//         context,
//         secondConfigure
//     );
//     worksheet.setCommandManager(commandManager);
//     workbook.insertSheet(worksheet);
//     workbook.setActiveSheet(worksheet);

//     const conditionalFormatRule = workbook.newConditionalFormatRule();
//     expect(conditionalFormatRule).not.toBeNull();
// });

test('Test getCommandManager', () => {
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
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');
    workbook.setContext(context);

    const secondConfigure = {
        sheetId: 'sheet-02',
        name: 'sheet-luck',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet);

    expect(workbook.getCommandManager()).not.toBeNull();
});

// test('Test newFilterCriteria', () => {
//     const container = IOCContainerStartUpReady({
//         sheets: [{ sheetId: 'sheet1' }, { sheetId: 'sheet2' }],
//     });
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     workbook.setPluginMeta('test', {});
//     expect(workbook.newFilterCriteria()).not.toBeUndefined();
// });

test('Test getPluginMeta/setPluginMeta', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    workbook.setPluginMeta('test', {});
    expect(workbook.getPluginMeta('test')).not.toBeUndefined();
});

// test('Test newConditionalFormatRule', () => {
//     const container = IOCContainerStartUpReady({
//         sheets: [{ sheetId: 'sheet1' }, { sheetId: 'sheet2' }],
//     });
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     workbook.setPluginMeta('test', {});
//     expect(workbook.newConditionalFormatRule()).not.toBeUndefined();
// });

test('Test getConfig', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    expect(workbook.getConfig()).not.toBeUndefined();
});

test('Test setActiveSheet', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const context = container.getSingleton<Context>('Context');

    const secondConfigure = {
        sheetId: 'sheet-02',
        name: 'sheet-luck',
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
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        secondConfigure
    );
    worksheet.setCommandManager(commandManager);
    workbook.insertSheet(worksheet);
    workbook.setActiveSheet(worksheet, true);
});

test('Test setSheetOrder', () => {
    const container = IOCContainerStartUpReady({
        sheets: { sheet1: { id: 'sheet1' }, sheet2: { id: 'sheet2' } },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    workbook.setSheetOrder('sheet1', 1);
});

test('Test isIRangeType', () => {
    const rangeData = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
    expect(Workbook.isIRangeType(rangeData)).toEqual(true);
});

test('Test rangeDataToRangeStringData', () => {
    const rangeData = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
    expect(Workbook.rangeDataToRangeStringData(rangeData)).toEqual('B2:B2');
});

test('Test rangeDataToRangeStringData', () => {
    const container = IOCContainerStartUpReady({
        sheets: {
            sheet1: {
                id: 'sheet1',
                status: BooleanNumber.TRUE,
                rowCount: 30,
                columnCount: 10,
            },
        },
    });
    const workbook = container.getSingleton<Workbook>('WorkBook');
    expect(workbook.transformRangeType('A1:B1').rangeData).toEqual({
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 1,
    });
    expect(workbook.transformRangeType('Sheet2!A1:B1').sheetId).toEqual('Sheet2');
    expect(workbook.transformRangeType('A:A').rangeData).toEqual({
        startRow: 0,
        endRow: 30,
        startColumn: 0,
        endColumn: 0,
    });
    expect(workbook.transformRangeType('1:1').rangeData).toEqual({
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 10,
    });
});
