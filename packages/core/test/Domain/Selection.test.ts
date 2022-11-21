/**
 * @jest-environment jsdom
 */
import {
    BooleanNumber,
    CommandManager,
    Direction,
    Environment,
    HooksManager,
    IOCAttribute,
    IOCContainer,
    IWorkbookConfig,
    Locale,
    Nullable,
    ObserverManager,
    PluginManager,
    Range,
    Selection,
    ServerHttp,
    ServerSocket,
    UndoManager,
} from '../../src';
import { SheetContext } from '../../src/Basics/SheetContext';
import { Workbook } from '../../src/Sheets/Domain/Workbook';
import { Worksheet } from '../../src/Sheets/Domain/Worksheet';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

export function IOCContainerStartUpReady(
    workbookConfig?: Partial<IWorkbookConfig>
): IOCContainer {
    const configure = {
        id: '',
        extensions: [],
        sheetOrder: [],
        socketEnable: BooleanNumber.FALSE,
        socketUrl: '',
        name: '',
        timeZone: '',
        appVersion: '',
        theme: '',
        skin: '',
        locale: '',
        creator: '',
        styles: {},
        sheets: [],
        lastModifiedBy: '',
        createdTime: '',
        modifiedTime: '',
        ...workbookConfig,
    };
    const attribute = new IOCAttribute({ value: configure });
    const container = new IOCContainer(attribute);
    container.addSingletonMapping('Environment', Environment);
    container.addSingletonMapping('Server', ServerSocket);
    container.addSingletonMapping('ServerSocket', ServerSocket);
    container.addSingletonMapping('ServerHttp', ServerHttp);
    container.addSingletonMapping('WorkBook', Workbook);
    container.addSingletonMapping('Locale', Locale);
    container.addSingletonMapping('Context', SheetContext);
    container.addSingletonMapping('UndoManager', UndoManager);
    container.addSingletonMapping('CommandManager', CommandManager);
    container.addSingletonMapping('PluginManager', PluginManager);
    container.addSingletonMapping('ObserverManager', ObserverManager);
    container.addSingletonMapping('ObservableHooksManager', HooksManager);
    container.addMapping('WorkSheet', Worksheet);
    return container;
}

function demo() {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: 'a',
                },
                1: {
                    s: '1',
                    v: 1,
                    m: 'ab',
                },
                2: {
                    s: '1',
                    v: 1,
                    m: 'Abc',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: 'c',
                },
                1: {
                    s: '1',
                    v: 1,
                    m: 'cD',
                },
                2: {
                    s: '1',
                    v: 1,
                    m: 'cde',
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

    return { worksheet, workbook };
}

test('Test setSelection', () => {
    const { workbook, worksheet } = demo();
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);
    worksheet.getSelection().setWorkSheet(worksheet);
});

test('Test getSelection', () => {
    const { workbook, worksheet } = demo();
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);
    const rangeData = {
        startRow: 1,
        endRow: 3,
        startColumn: 1,
        endColumn: 3,
    };
    worksheet.getSelection().setSelection({ selection: rangeData });
    const selection = worksheet.getSelection().getSelection();
    expect(selection).toEqual({
        startRow: 1,
        endRow: 3,
        startColumn: 1,
        endColumn: 3,
    });
});

test('Test getActiveSheet', () => {
    const { workbook, worksheet } = demo();
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);
    const sheet = worksheet.getSelection().getActiveSheet();
    if (!sheet) return;
    expect(sheet.getSheetId()).toEqual('sheet');
});

test('Test setSelection', () => {
    const { workbook, worksheet } = demo();
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);

    // set first selection

    const rangeData = {
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const range: Nullable<Range> = worksheet.getSelection().getActiveRange();

    expect(range && range.getRangeData()).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });

    // set second selection
    const nextData = {
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    };
    worksheet.getSelection().setSelection({ selection: nextData });

    const nextRange: Nullable<Range> = worksheet.getSelection().getActiveRange();
    expect(nextRange && nextRange.getRangeData()).toEqual({
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    });

    // undo
    worksheet.getCommandManager().undo();

    const undoRange: Nullable<Range> = worksheet.getSelection().getActiveRange();
    expect(undoRange && undoRange.getRangeData()).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });

    // undo
    worksheet.getCommandManager().redo();

    const redoRange: Nullable<Range> = worksheet.getSelection().getActiveRange();
    expect(redoRange && redoRange.getRangeData()).toEqual({
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    });

    const errorData = {
        startRow: -1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    };

    worksheet.getSelection().setSelection({ selection: errorData });
    // test range type
    const typeData = {
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    };
    worksheet.getSelection().setSelection({ selection: typeData });

    const typeRange: Nullable<Range> = worksheet.getSelection().getActiveRange();
    worksheet.getSelection().setSelection({ selection: typeRange });

    const typeData1 = {
        startRow: -1,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    };
    worksheet.getSelection().setSelection({ selection: typeData1 });

    const typeRange1: Nullable<Range> = worksheet.getSelection().getActiveRange();
    worksheet.getSelection().setSelection({ selection: typeRange1 });

    // range array
    const arrData = [
        {
            startRow: 2,
            endRow: 2,
            startColumn: 2,
            endColumn: 2,
        },
        {
            startRow: 3,
            endRow: 3,
            startColumn: 3,
            endColumn: 3,
        },
    ];
    worksheet.getSelection().setSelection({ selection: arrData });

    const arrRange: Nullable<Range> = worksheet.getSelection().getActiveRange();
    worksheet.getSelection().setSelection({ selection: arrRange });

    const arrData1 = [
        {
            startRow: -1,
            endRow: 2,
            startColumn: 2,
            endColumn: 2,
        },
        {
            startRow: 3,
            endRow: 3,
            startColumn: 3,
            endColumn: 3,
        },
    ];
    worksheet.getSelection().setSelection({ selection: arrData1 });

    const arrRange1: Nullable<Range> = worksheet.getSelection().getActiveRange();
    worksheet.getSelection().setSelection({ selection: arrRange1 });

    // null type
    worksheet.getSelection().setSelection();

    // includes cell
    const cellRangeData = {
        startRow: 3,
        endRow: 5,
        startColumn: 3,
        endColumn: 5,
    };
    worksheet.getSelection().setSelection({
        selection: cellRangeData,
        cell: { startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 },
    });

    worksheet.getSelection().setSelection({
        selection: cellRangeData,
        cell: { startRow: 7, endRow: 7, startColumn: 3, endColumn: 3 },
    });
});

test('Test setCurrentCell', () => {
    const { workbook, worksheet } = demo();
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);

    const prevRangeData = {
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    };

    worksheet.getSelection().setSelection({ selection: prevRangeData });
    worksheet.getSelection().getSelection();
    worksheet.getSelection().getActiveSheet();

    const rangeData = {
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    };

    worksheet.getSelection().setCurrentCell(rangeData);
    const range: Nullable<Range> = worksheet.getSelection().getCurrentCell();

    expect(range && range.getRangeData()).toEqual({
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    });

    // undo
    worksheet.getCommandManager().undo();

    const undoRange: Nullable<Range> = worksheet.getSelection().getCurrentCell();
    expect(undoRange && undoRange.getRangeData()).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });

    // redo
    worksheet.getCommandManager().redo();

    const redoRange: Nullable<Range> = worksheet.getSelection().getCurrentCell();
    expect(redoRange && redoRange.getRangeData()).toEqual({
        startRow: 2,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    });
    // range?.startRow === -1
    const wrongData = {
        startRow: -1,
        endRow: 2,
        startColumn: 2,
        endColumn: 2,
    };
    worksheet.getSelection().setCurrentCell(wrongData);
    // range type
    worksheet.getSelection().setCurrentCell(range);
    // !(range.startRow === range.endRow && range.startColumn === range.endColumn)
    const rangeData1 = {
        startRow: 3,
        endRow: 5,
        startColumn: 3,
        endColumn: 5,
    };
    worksheet.getSelection().setCurrentCell(rangeData1);
    // const rangeData2 = '123';
    // worksheet.getSelection().setCurrentCell(rangeData1);
});

test('Test cellInRange', () => {
    const { workbook, worksheet } = demo();
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);
    const rangeList = [
        {
            startRow: 2,
            endRow: 4,
            startColumn: 3,
            endColumn: 5,
        },
    ];

    Selection.cellInRange(rangeList, {
        startRow: 2,
        endRow: 2,
        startColumn: 3,
        endColumn: 3,
    });
    Selection.cellInRange(rangeList, {
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });
});

test('Test getNextDataRange:top1', () => {
    const { workbook, worksheet } = demo();
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    worksheet.getConfig().cellData = configure.cellData;
    workbook.insertSheet(worksheet);
    const commandManager = workbook.getCommandManager();
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 1,
        endRow: 3,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:top2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 1,
        endRow: 3,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:top2.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 1,
        endRow: 3,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:top2.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 2,
        endRow: 3,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:top2.3', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 2,
        endRow: 2,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 2,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:top2.4', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 1,
        endRow: 5,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({ selection: rangeData });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:top2.5', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 2,
        endRow: 5,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 5,
            endRow: 5,
            startColumn: 1,
            endColumn: 3,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 5,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:top3', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 4,
        endRow: 5,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 5,
            endRow: 5,
            startColumn: 1,
            endColumn: 1,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 2,
            endRow: 5,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:top4', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    v: '1',
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            5: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 4,
        endRow: 5,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 5,
            endRow: 5,
            startColumn: 1,
            endColumn: 3,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.TOP);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 3,
            endRow: 5,
            startColumn: 1,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:bottom1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    v: '1',
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    // worksheet.getConfig().rowCount = 3;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 1,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 2,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom1.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 3;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 1,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom2.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 3;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 1,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 3,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom2.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 4;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 1,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom3.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 4;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 4,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 3,
            endRow: 3,
            startColumn: 1,
            endColumn: 1,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 2,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom3.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 4;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 4,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 3,
            endRow: 3,
            startColumn: 1,
            endColumn: 1,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 3,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom4.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 4;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 4,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 3,
            endRow: 3,
            startColumn: 1,
            endColumn: 1,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 1,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:bottom4.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            1: {
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            2: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    v: 3,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            3: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
            },
            4: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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
    worksheet.getConfig().rowCount = 4;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 4,
        startColumn: 1,
        endColumn: 3,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 3,
            endRow: 3,
            startColumn: 1,
            endColumn: 1,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.BOTTOM);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 3,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:left1.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 4,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 5,
            endColumn: 5,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 5,
        });
    }
});

test('Test getNextDataRange:left1.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: '2',
                },
                2: {
                    s: 1,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 4,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 5,
            endColumn: 5,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 5,
        });
    }
});
test('Test getNextDataRange:left2.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: '2',
                },
                2: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 4,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 5,
            endColumn: 5,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 2,
            endColumn: 5,
        });
    }
});
test('Test getNextDataRange:left2.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: '1',
                    v: 2,
                    m: '2',
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 4,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 5,
            endColumn: 5,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 5,
        });
    }
});
test('Test getNextDataRange:left3.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 2,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 2,
            endColumn: 4,
        });
    }
});

test('Test getNextDataRange:left3.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 2,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 2,
            endColumn: 2,
        });
    }
});

test('Test getNextDataRange:left4.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    v: 2,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 3,
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 2,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 2,
            endColumn: 3,
        });
    }
});

test('Test getNextDataRange:left4.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: 2,
                },
                3: {
                    s: 1,
                    m: '2',
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 3,
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 2,
        endColumn: 5,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.LEFT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 2,
            endColumn: 2,
        });
    }
});

test('Test getNextDataRange:right1.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                },
                4: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 3,
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

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 2,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 4,
        });
    }
});

test('Test getNextDataRange:right1.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 2,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 5,
        });
    }
});
test('Test getNextDataRange:right2.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: '2',
                    v: 2,
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                },
                5: {
                    s: 1,
                    m: '2',
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 2,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 3,
        });
    }
});
test('Test getNextDataRange:right2.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
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
                    s: 1,
                    m: '2',
                    v: 2,
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 2,
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 2,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 5,
        });
    }
});
test('Test getNextDataRange:right3.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
        cellData: {
            0: {
                0: {
                    s: 1,
                    m: '1',
                },
                1: {
                    s: '1',
                    v: 2,
                    m: '2',
                },
                2: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 2,
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 4,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 3,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 4,
        });
    }
});
test('Test getNextDataRange:right3.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
        cellData: {
            0: {
                0: {
                    s: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    m: '2',
                },
                2: {
                    s: 1,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 2,
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 4,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 3,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 4,
        });
    }
});

test('Test getNextDataRange:right4.1', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
        cellData: {
            0: {
                0: {
                    s: 1,
                    m: '1',
                    v: 1,
                },
                1: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                2: {
                    s: 1,
                    m: '2',
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 2,
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 4,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 3,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 4,
        });
    }
});
test('Test getNextDataRange:right4.2', () => {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
        cellData: {
            0: {
                0: {
                    s: 1,
                    m: '1',
                    v: 1,
                },
                1: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                2: {
                    s: 1,
                    m: '2',
                    v: 1,
                },
                3: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                4: {
                    s: 1,
                    m: '2',
                    v: 2,
                },
                5: {
                    s: 1,
                    m: '2',
                    v: 2,
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
    worksheet.getConfig().columnCount = 5;
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeData = {
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 4,
    };

    worksheet.getSelection().setSelection({
        selection: rangeData,
        cell: {
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 3,
        },
    });
    const activeRange = worksheet.getSelection().getNextDataRange(Direction.RIGHT);
    if (activeRange) {
        expect(activeRange.getRangeData()).toEqual({
            startRow: 0,
            endRow: 0,
            startColumn: 3,
            endColumn: 4,
        });
    }
});
