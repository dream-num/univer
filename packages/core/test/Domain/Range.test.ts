/**
 * @jest-environment jsdom
 */
import { ObjectMatrix } from '../../src';
import { SheetContext } from '../../src/Basics/SheetContext';
import { Workbook } from '../../src/Sheets/Domain/Workbook';
import { Worksheet } from '../../src/Sheets/Domain/Worksheet';
import {
    BooleanNumber,
    BorderStyleTypes,
    CopyPasteType,
    Dimension,
    Direction,
    HorizontalAlign,
    TextDirection,
    ThemeColorType,
    VerticalAlign,
    WrapStrategy,
} from '../../src/Types/Enum';
import { ICellData, ICellV } from '../../src/Types/Interfaces';
import { createCoreTestContainer } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

// TODO performance test, 1000 times
// TODO 修复Range单元测试报错
// TODO 补充Range API单元格测试
// TODO 优化：每一个测试用例都会重新初始化一个universheet实例，有的测试case是否可以合并到一个实例，减少测试执行时间

/**
 *
    Tips: The test debugger with the same name will always execute. Please keep a unique name when testing, such as'Test setFontColor'
 */

export function demo() {
    const container = createCoreTestContainer({
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
                    v: '1',
                    m: '1',
                },
                1: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
            },
        },
        mergeData: [
            {
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
            },
        ],
        rowCount: 30,
        columnCount: 10,
        defaultColumnWidth: 93,
        defaultRowHeight: 27,
        status: 1,
    };
    // const worksheet = new WorkSheet(context, configure);
    const worksheet = container.getInstance<Worksheet>('WorkSheet', context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    return { worksheet, workbook };
}

test('Test setFontColor', () => {
    const container = createCoreTestContainer({
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set new color
    range.setFontColor('red');

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);
    const currentColor = currentStyle && currentStyle.cl?.rgb;

    expect(currentColor).toEqual('red');

    // undo
    worksheet.getCommandManager().undo();

    // test previous color
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    const preColor = preStyle && preStyle.cl?.rgb;
    expect(preColor).toEqual('blue');
});

test('Test setFontFamily', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    // const range = worksheet.getRangeData('B1:A10');
    const range = worksheet.getRange('A1');

    // set A1 fontFamily
    range.setFontFamily('Helvetica');

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ff: 'Helvetica',
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ff: 'Arial',
    });
});

test('Test setFontFamilies', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    // const range = worksheet.getRangeData('B1:A10');
    const range = worksheet.getRange('A1');

    // set A1 fontFamily
    range.setFontFamilies([['Helvetica', 'Helvetica']]);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ff: 'Helvetica',
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ff: 'Arial',
    });
});

test('Test setUnderline', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    // const range = worksheet.getRangeData('B1:A10');
    const range = worksheet.getRange('A1');

    // set A1 fontFamily
    range.setUnderline({ s: BooleanNumber.TRUE });

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        ff: 'Arial',
        ul: { s: BooleanNumber.TRUE },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        ff: 'Arial',
    });
});
test('Test setOverline', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    // const range = worksheet.getRangeData('B1:A10');
    const range = worksheet.getRange('A1');

    // set A1 fontFamily
    range.setOverline({ s: BooleanNumber.TRUE });

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        ff: 'Arial',
        ol: { s: BooleanNumber.TRUE },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        ff: 'Arial',
    });
});
test('Test setStrikeThrough', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    // const range = worksheet.getRangeData('B1:A10');
    const range = worksheet.getRange('A1');

    // set A1 fontFamily
    range.setStrikeThrough({ s: BooleanNumber.TRUE });

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        ff: 'Arial',
        st: { s: BooleanNumber.TRUE },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        ff: 'Arial',
    });
});
test('Test setFontSize', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set A1 fontSize
    range.setFontSize(18);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ff: 'Arial',
        fs: 18,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ff: 'Arial',
        fs: 12,
    });
});

test('Test setHorizontalAlignment', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                ht: HorizontalAlign.CENTER,
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set A1 horizontalAlignment
    range.setHorizontalAlignment(HorizontalAlign.LEFT);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ht: HorizontalAlign.LEFT,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        ht: HorizontalAlign.CENTER,
    });
});

test('Test setVerticalAlignment', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                vt: VerticalAlign.MIDDLE,
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set A1 verticalAlignment
    range.setVerticalAlignment(VerticalAlign.TOP);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        vt: VerticalAlign.TOP,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        vt: VerticalAlign.MIDDLE,
    });
});

test('Test setTextDirection', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                td: TextDirection.LEFT_TO_RIGHT,
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set A1 textDirection
    range.setTextDirection(TextDirection.RIGHT_TO_LEFT);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        td: TextDirection.RIGHT_TO_LEFT,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        td: TextDirection.LEFT_TO_RIGHT,
    });
});

test('Test setWrapStrategy', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set A1 wrapStrategy
    range.setWrapStrategy(WrapStrategy.OVERFLOW);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        tb: WrapStrategy.OVERFLOW,
    });

    // set A1 wrapStrategy
    range.setWrapStrategy(WrapStrategy.WRAP);

    const nextCell = worksheet.getCellMatrix().getValue(0, 0);
    const nextStyle = workbook.getStyles().get(nextCell && nextCell.s);

    expect(nextStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        tb: WrapStrategy.WRAP,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        tb: WrapStrategy.OVERFLOW,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test init style
    const initValue = worksheet.getCellMatrix().getValue(0, 0);
    const initStyle = workbook.getStyles().get(initValue && initValue.s);
    expect(initStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
    });
});

test('Test setWrapStrategies', () => {
    const container = createCoreTestContainer({
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // set A1 wrapStrategy
    range.setWrapStrategies([[WrapStrategy.WRAP, WrapStrategy.WRAP]]);

    const nextCell = worksheet.getCellMatrix().getValue(0, 0);
    const nextStyle = workbook.getStyles().get(nextCell && nextCell.s);

    expect(nextStyle).toEqual({
        fs: 12,
        tb: WrapStrategy.WRAP,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        fs: 12,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test init style
    const initValue = worksheet.getCellMatrix().getValue(0, 0);
    const initStyle = workbook.getStyles().get(initValue && initValue.s);
    expect(initStyle).toEqual({
        fs: 12,
    });
});

test('Test setBorder', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bd: {
                    l: {
                        s: BorderStyleTypes.DOTTED,
                        cl: {
                            th: ThemeColorType.DARK1,
                        },
                    },
                    b: {
                        s: BorderStyleTypes.DOTTED,
                        cl: {
                            th: ThemeColorType.DARK1,
                        },
                    },
                },
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
            },
        },
        status: 1,
    };

    const worksheet = container.getInstance<Worksheet>('WorkSheet', context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set border
    range.setBorder(true, true, true, true, false, false, 'red', BorderStyleTypes.DASH_DOT);
    // dashDot
    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
        bd: {
            t: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
            b: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
            l: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
            r: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test init style
    const initValue = worksheet.getCellMatrix().getValue(0, 0);
    const initStyle = workbook.getStyles().get(initValue && initValue.s);
    expect(initStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
        bd: {
            l: {
                s: BorderStyleTypes.DOTTED,
                cl: {
                    th: ThemeColorType.DARK1,
                },
            },
            b: {
                s: BorderStyleTypes.DOTTED,
                cl: {
                    th: ThemeColorType.DARK1,
                },
            },
        },
    });

    worksheet.getCommandManager().redo();
    const redoCell = worksheet.getCellMatrix().getValue(0, 0);
    const redoStyle = workbook.getStyles().get(redoCell && redoCell.s);

    expect(redoStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
        bd: {
            t: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
            b: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
            l: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
            r: {
                s: BorderStyleTypes.DASH_DOT,
                cl: {
                    rgb: 'red',
                },
            },
        },
    });
});

test('Test copyTo formatOnly', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // copy A1  to B1:D3
    range.copyTo(worksheet.getRange('B1:D3'), { formatOnly: true });

    const currentCell = worksheet.getCellMatrix().getValue(0, 1);

    expect(currentCell).toEqual({ s: 1, v: 1, m: '1' });

    // undo
    worksheet.getCommandManager().undo();

    // test previous
    const preCell = worksheet.getCellMatrix().getValue(0, 1);
    expect(preCell).toEqual({ v: 2, m: '2' });
});

test('Test copyTo contentsOnly', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // copy A1 style to B1:D3
    range.copyTo(worksheet.getRange('B1:D3'), { contentsOnly: true });

    const currentCell = worksheet.getCellMatrix().getValue(0, 1);

    expect(currentCell).toEqual({
        v: 1,
        s: 1,
        m: '1',
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = worksheet.getCellMatrix().getValue(0, 1);

    expect(preCell).toEqual({
        v: 2,
        m: '2',
    });

    // redo
    worksheet.getCommandManager().redo();

    // test next value
    const nextCell = worksheet.getCellMatrix().getValue(0, 1);
    expect(nextCell).toEqual({
        v: 1,
        s: 1,
        m: '1',
    });
});

test('Test copyTo CopyPasteType', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        columnData: {
            0: {
                w: 30,
                hd: 1,
            },
            1: {
                w: 50,
                hd: 1,
            },
        },

        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:A3');

    const destination = worksheet.getRange('B1:B3');

    // copy A1 style to B1:B3
    range.copyTo(destination, CopyPasteType.PASTE_COLUMN_WIDTHS, false);

    const width = worksheet.getColumnWidth(0);

    expect(width).toEqual(30);
});

test('Test copyFormatToRange by sheet', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // copy A1 style to B1:D3
    range.copyFormatToRange(worksheet, 0, 2, 1, 3);

    const currentCell = worksheet.getCellMatrix().getValue(0, 1);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 1);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'green',
        },
        fs: 14,
    });
});
test('Test copyFormatToRange by sheetId', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // copy A1 style to B1:D3
    range.copyFormatToRange(worksheet.getSheetId(), 0, 2, 1, 3);

    const currentCell = worksheet.getCellMatrix().getValue(0, 1);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 1);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        cl: {
            rgb: 'green',
        },
        fs: 14,
    });
});

test('Test copyValuesToRange by sheet', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // copy A1 values to B2:C3
    range.copyValuesToRange(worksheet, 1, 2, 1, 2);

    const currentCell = worksheet.getCellMatrix().getFragments(1, 2, 1, 2).getData();

    expect(currentCell).toEqual({
        0: {
            0: {
                v: 1,
                m: '1',
            },
            1: {
                v: 1,
                m: '1',
            },
        },
        1: {
            0: {
                v: 1,
                m: '1',
            },
            1: {
                v: 1,
                m: '1',
            },
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous B2:C3 values
    const preCell = worksheet.getCellMatrix().getFragments(1, 2, 1, 2).getData();
    expect(preCell).toEqual({
        0: {
            0: { m: '', v: '' },
            1: { m: '', v: '' },
        },
        1: {
            0: { m: '', v: '' },
            1: { m: '', v: '' },
        },
    });
});

test('Test copyValuesToRange by sheetId', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // copy A1 values to B2:C3
    range.copyValuesToRange(worksheet.getSheetId(), 1, 2, 1, 2);

    const currentCell = worksheet.getCellMatrix().getFragments(1, 2, 1, 2).getData();

    expect(currentCell).toEqual({
        0: {
            0: {
                v: 1,
                m: '1',
            },
            1: {
                v: 1,
                m: '1',
            },
        },
        1: {
            0: {
                v: 1,
                m: '1',
            },
            1: {
                v: 1,
                m: '1',
            },
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous B2:C3 values
    const preCell = worksheet.getCellMatrix().getFragments(1, 2, 1, 2).getData();
    expect(preCell).toEqual({
        0: {
            0: { m: '', v: '' },
            1: { m: '', v: '' },
        },
        1: {
            0: { m: '', v: '' },
            1: { m: '', v: '' },
        },
    });
});
test('Test moveTo', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeA = worksheet.getRange('A1:B1');
    const rangeB = worksheet.getRange('A2:B2');

    // copy A1:B1 move to A2:B2
    rangeA.moveTo(rangeB);

    // current A2:B2 values
    const currentAValue = rangeA.getObjectValues();
    const currentBValue = rangeB.getObjectValues({ isIncludeStyle: true });

    expect(currentAValue).toEqual({
        0: {
            0: { m: '', v: '' },
            1: { m: '', v: '' },
        },
    });
    expect(currentBValue).toEqual({
        0: {
            0: {
                s: {
                    cl: {
                        rgb: 'blue',
                    },
                    fs: 12,
                },
                v: 1,
                m: '1',
            },
            1: {
                s: {
                    cl: {
                        rgb: 'green',
                    },
                    fs: 14,
                },
                v: 2,
                m: '2',
            },
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // previous A2:B2 values
    const preAValue = rangeA.getObjectValues();
    const preBValue = rangeB.getObjectValues();

    expect(preAValue).toEqual({
        0: {
            0: {
                s: 1,
                v: 1,
                m: '1',
            },
            1: {
                s: 2,
                v: 2,
                m: '2',
            },
        },
    });

    expect(preBValue).toEqual({
        0: {
            0: {},
            1: {},
        },
    });

    // redo
    worksheet.getCommandManager().redo();

    // next A2:B2 values
    const nextAValue = rangeA.getObjectValues();
    const nextBValue = rangeB.getObjectValues();

    expect(nextAValue).toEqual({
        0: {
            0: { m: '', v: '' },
            1: { m: '', v: '' },
        },
    });
    expect(nextBValue).toEqual({
        0: {
            0: {
                s: 1,
                v: 1,
                m: '1',
            },
            1: {
                s: 2,
                v: 2,
                m: '2',
            },
        },
    });
});
test('Test offset', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeA = worksheet.getRange('A1');

    // A1 offset to B2:C3
    const rangeB = rangeA.offset(1, 1, 2, 2);

    expect(rangeB.getRangeData()).toEqual({
        startRow: 1,
        endRow: 2,
        startColumn: 1,
        endColumn: 2,
    });
});

test('Test setValue', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set new value
    range.setValue(3);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);

    expect(currentCell).toEqual({ s: 1, v: 3, m: '3' });

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    expect(preCell).toEqual({ s: 1, v: 1, m: '1' });
});

test('Test setValues ICellV', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // set new value
    range.setValues([[5, 6]]);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);

    expect(currentCell).toEqual({ s: 1, v: 5, m: '5' });

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    expect(preCell).toEqual({ s: 1, v: 1, m: '1' });
});

test('Test setValues ObjectMatrix', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    const matrix = new ObjectMatrix<ICellV>();

    matrix.setValue(0, 0, 5);
    matrix.setValue(0, 1, 6);

    // set new value
    range.setValues(matrix);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);

    expect(currentCell).toEqual({ s: 1, v: 5, m: '5' });

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    expect(preCell).toEqual({ s: 1, v: 1, m: '1' });
});

test('Test clear', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // clear
    range.clear({ formatOnly: true, contentsOnly: true });

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    expect(currentCell && currentCell.s).toEqual(undefined);
    expect(currentCell && currentCell.v).toEqual('');

    // undo
    worksheet.getCommandManager().undo();

    // test init style
    const initValue = worksheet.getCellMatrix().getValue(0, 0);
    const initStyle = workbook.getStyles().get(initValue && initValue.s);
    expect(initStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
    });

    expect(initValue && initValue.v).toEqual(1);
});
test('Test clearFormat', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // clear style
    range.clearFormat();

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    expect(currentCell && currentCell.s).toEqual(undefined);
    expect(currentCell && currentCell.v).toEqual(1);

    // undo
    worksheet.getCommandManager().undo();

    // test init style
    const initValue = worksheet.getCellMatrix().getValue(0, 0);
    const initStyle = workbook.getStyles().get(initValue && initValue.s);
    expect(initStyle).toEqual({
        cl: {
            rgb: 'blue',
        },
        fs: 12,
    });

    expect(initValue && initValue.v).toEqual(1);
});
test('Test deleteCells', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            1: {
                0: {
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            2: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
            3: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B2');

    // Delete cells and shift up
    range.deleteCells(Dimension.ROWS);

    // test current A1:B4 values
    const currentCells = worksheet.getRange('A1:B4').getValues();

    expect(currentCells).toEqual([
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
        [{}, {}],
        [{}, {}],
    ]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous A1:B4 value
    const preCells = worksheet.getRange('A1:B4').getValues();

    expect(preCells).toEqual([
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
    ]);
    // redo
    worksheet.getCommandManager().redo();

    // test next A1:B4 value
    const nextCells = worksheet.getRange('A1:B4').getValues();
    expect(nextCells).toEqual([
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
        [{}, {}],
        [{}, {}],
    ]);
});

test('Test insertCells', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            1: {
                0: {
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            2: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
            3: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B2');

    // insert blank cells and shift down
    range.insertCells(Dimension.ROWS);

    // test current A1:B4 values
    const currentCells = worksheet.getRange('A1:B4').getValues();

    expect(currentCells).toEqual([
        [
            { v: '', m: '' },
            { v: '', m: '' },
        ],
        [
            { v: '', m: '' },
            { v: '', m: '' },
        ],
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
    ]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous A1:B4 value
    const preCells = worksheet.getRange('A1:B4').getValues();

    expect(preCells).toEqual([
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
        ],
    ]);
    // redo
    worksheet.getCommandManager().redo();

    // test next A1:B4 value
    const nextCells = worksheet.getRange('A1:B4').getValues();

    expect(nextCells).toEqual([
        [
            { v: '', m: '' },
            { v: '', m: '' },
        ],
        [
            { v: '', m: '' },
            { v: '', m: '' },
        ],
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
    ]);
});

test('Test insertCells COLUMNS', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
            },
            1: {
                0: {
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
            },
            2: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
            3: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B2');
    const destination = worksheet.getRange('A3:B4');

    range.insertCells(Dimension.COLUMNS, destination);
    const columnCells = worksheet.getRange('A1:D2').getValues();

    expect(columnCells).toEqual([
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
        [
            { v: 1111, m: '1111' },
            { v: 1111, m: '1111' },
            { v: 1, m: '1' },
            { v: 1, m: '1' },
        ],
    ]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous A1:B4 value
    const preCells = worksheet.getRange('A1:D2').getValues();

    expect(preCells).toEqual([
        [{ v: 1, m: '1' }, { v: 1, m: '1' }, {}, {}],
        [{ v: 1, m: '1' }, { v: 1, m: '1' }, {}, {}],
    ]);
});

test('Create a Merge', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
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
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            1: {
                0: {
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            2: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
            3: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B2');

    // merge range
    range.merge();

    // test current A1:B4 values
    const merges = worksheet.getMerges();
    expect(merges.size() === 1);
});

test('Test getBackground', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
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
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            1: {
                0: {
                    v: 1,
                    m: '1',
                },
                1: {
                    v: 1,
                    m: '1',
                },
                2: {
                    v: 8,
                    m: '8',
                },
                3: {
                    v: 8,
                    m: '8',
                },
            },
            2: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
            3: {
                0: {
                    v: 1111,
                    m: '1111',
                },
                1: {
                    v: 1111,
                    m: '1111',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // get A1 background
    const background = range.getBackground();

    expect(background).toEqual('#ff0000');
});
test('Test getBackgrounds', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 backgrounds
    const backgrounds = range.getBackgrounds();

    expect(backgrounds).toEqual([['#ff0000', '#0000ff']]);
});

test('Test getCell', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get B1 Range instance
    const cellValue = range.getCell(0, 1).getValue()?.m;

    expect(cellValue).toEqual('2');
});

test('Test getColumn', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get the starting column position for this range.
    const columnNumber = range.getColumn();

    expect(columnNumber).toEqual(0);
});

test('Test getDisplayValue', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get the displayed value of the top-left cell in the range
    const cellValue = range.getDisplayValue();

    expect(cellValue).toEqual('1');
});

test('Test getDisplayValues', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get the rectangular grid of values for this range.
    const cellValue = range.getDisplayValues();

    expect(cellValue).toEqual([['1', '2']]);
});

test('Test getFontColor', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 backgrounds
    const backgrounds = range.getFontColor();

    expect(backgrounds).toEqual('blue');
});

test('Test getFontColors', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 backgrounds
    const backgrounds = range.getFontColors();

    expect(backgrounds).toEqual([['blue', 'green']]);
});

test('Test getFontFamily', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 backgrounds
    const backgrounds = range.getFontFamily();

    expect(backgrounds).toEqual('微软雅黑');
});

test('Test getFontFamilies', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 backgrounds
    const backgrounds = range.getFontFamilies();

    expect(backgrounds).toEqual([['微软雅黑', 'Roboto']]);
});

test('Test getFontLines', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ul: { s: BooleanNumber.TRUE },
                ol: { s: BooleanNumber.TRUE },
                st: { s: BooleanNumber.TRUE },
            },
            2: {
                ul: { s: BooleanNumber.TRUE },
                ol: { s: BooleanNumber.TRUE },
                st: { s: BooleanNumber.TRUE },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 FontLines
    const underlines = range.getUnderlines();
    const overline = range.getOverlines();
    const strikethroughs = range.getStrikeThroughs();

    expect(underlines).toEqual([[{ s: BooleanNumber.TRUE }, { s: BooleanNumber.TRUE }]]);
    expect(overline).toEqual([[{ s: BooleanNumber.TRUE }, { s: BooleanNumber.TRUE }]]);
    expect(strikethroughs).toEqual([[{ s: BooleanNumber.TRUE }, { s: BooleanNumber.TRUE }]]);
});

test('Test getFontLine', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ul: { s: BooleanNumber.TRUE },
                ol: { s: BooleanNumber.TRUE },
                st: { s: BooleanNumber.TRUE },
            },
            2: {
                ul: { s: BooleanNumber.TRUE },
                ol: { s: BooleanNumber.TRUE },
                st: { s: BooleanNumber.TRUE },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // get A1 getFontLine
    const underlines = range.getUnderline();
    const overline = range.getOverline();
    const strikethroughs = range.getStrikeThrough();

    expect(underlines).toEqual({ s: BooleanNumber.TRUE });
    expect(overline).toEqual({ s: BooleanNumber.TRUE });
    expect(strikethroughs).toEqual({ s: BooleanNumber.TRUE });
});

test('Test getFontSize', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 backgrounds
    const backgrounds = range.getFontSize();

    expect(backgrounds).toEqual(12);
});

test('Test getFontSizes', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
                    v: 2,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getFontSizes
    const fs = range.getFontSizes();

    expect(fs).toEqual([[12, 14]]);
});

test('Test getFontWeight', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                bl: 1,
            },
            2: {
                bl: 0,
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
                    s: '2',
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

    const range = worksheet.getRange('A1');

    // get A1:B1 getFontWeights
    const A1 = range.getFontWeight();

    expect(A1).toEqual(1);

    const range2 = worksheet.getRange('B1');

    // get A1:B1 getFontWeight
    const B1 = range2.getFontWeight();

    expect(B1).toEqual(0);
});
test('Test getFontWeights', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                bl: 1,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                bl: 0,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getFontWeights
    const A1 = range.getFontWeights();

    expect(A1).toEqual([[1, 0]]);
});

test('Test getHorizontalAlignment', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ht: HorizontalAlign.LEFT,
            },
            2: {
                ht: HorizontalAlign.CENTER,
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
                    s: '2',
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

    const range = worksheet.getRange('A1');

    // get A1:B1 getHorizontalAlignments
    const A1 = range.getHorizontalAlignment();

    expect(A1).toEqual(HorizontalAlign.LEFT);
});

test('Test getHorizontalAlignments', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                ht: HorizontalAlign.LEFT,
            },
            2: {
                ht: HorizontalAlign.CENTER,
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getHorizontalAlignments
    const A1 = range.getHorizontalAlignments();

    expect(A1).toEqual([[HorizontalAlign.LEFT, HorizontalAlign.CENTER]]);
});

test('Test getVerticalAlignments', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                vt: VerticalAlign.TOP,
            },
            2: {
                vt: VerticalAlign.MIDDLE,
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getVerticalAlignments
    const A1 = range.getVerticalAlignments();

    expect(A1).toEqual([[VerticalAlign.TOP, VerticalAlign.MIDDLE]]);
});

test('Test getVerticalAlignment', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                vt: VerticalAlign.TOP,
            },
            2: {
                vt: VerticalAlign.MIDDLE,
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getVerticalAlignments
    const A1 = range.getVerticalAlignment();

    expect(A1).toEqual(VerticalAlign.TOP);
});

test('Test getFontStyles', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                it: 1,
            },
            2: {
                it: 0,
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getFontStyles
    const A1 = range.getFontStyles();

    expect(A1).toEqual([[1, 0]]);
});

test('Test getFontStyle', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                it: 1,
            },
            2: {
                it: 0,
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getFontStyles
    const A1 = range.getFontStyle();

    expect(A1).toEqual(1);
});

test('Test getTextDirections', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                td: 1,
            },
            2: {
                td: 2,
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 getTextDirections
    const A1 = range.getTextDirections();

    expect(A1).toEqual([[1, 2]]);
});

test('Test getTextDirection', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                td: 1,
            },
            2: {
                td: 2,
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
                    s: '2',
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

    const range = worksheet.getRange('A1');

    // get A1 getTextDirection
    const A1 = range.getTextDirection();

    expect(A1).toEqual(1);
});

test('Test getTextRotations', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                tr: {
                    a: 90,
                },
            },
            2: {
                tr: {
                    a: -90,
                },
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1 getTextRotations
    const A1 = range.getTextRotations();

    expect(A1).toEqual([
        [
            {
                a: 90,
            },
            {
                a: -90,
            },
        ],
    ]);
});

test('Test getTextRotation', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                tr: {
                    a: 90,
                },
            },
            2: {
                tr: {
                    a: -90,
                },
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
                    s: '2',
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

    const range = worksheet.getRange('A1');

    // get A1 getTextRotation
    const A1 = range.getTextRotation();

    expect(A1).toEqual({ a: 90 });
});

test('Test getTextStyles', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                fs: 12,
                ff: '微软雅黑',
            },
            2: {
                fs: 14,
                ff: '宋体',
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1 getTextStyles
    const A1 = range.getTextStyles();

    expect(A1).toEqual([
        [
            {
                fs: 12,
                ff: '微软雅黑',
            },
            {
                fs: 14,
                ff: '宋体',
            },
        ],
    ]);
});

test('Test getTextStyle', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                fs: 12,
                ff: '微软雅黑',
            },
            2: {
                fs: 14,
                ff: '宋体',
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // get A1 getTextStyle
    const A1 = range.getTextStyle();

    expect(A1).toEqual({
        fs: 12,
        ff: '微软雅黑',
    });
});

test('Test getSheet', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // get A1:B1 sheetId
    const sheetId = range.getSheet().getSheetId();

    expect(sheetId).toEqual('sheet');
});

test('Test getNumColumns', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
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

    const range = worksheet.getRange('A1:C1');

    // get A1:B1 sheetId
    const column = range.getNumColumns();

    expect(column).toEqual(3);
});

test('Test getNumRows', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B5');

    // get A1:B1 sheetId
    const rows = range.getNumRows();

    expect(rows).toEqual(5);
});

test('Test getRowIndex', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                cl: {
                    rgb: 'blue',
                },
                fs: 12,
                ff: '微软雅黑',
                bg: {
                    rgb: '#ff0000',
                },
            },
            2: {
                cl: {
                    rgb: 'green',
                },
                fs: 14,
                ff: 'Roboto',
                bg: {
                    rgb: '#0000ff',
                },
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A5');

    // get A1:B1 sheetId
    const row = range.getRowIndex();

    expect(row).toEqual(4);
});

test('Test getLastColumn', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                fs: 12,
                ff: '微软雅黑',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('C5');

    // get LastColumn
    const LastColumn = range.getLastColumn();

    expect(LastColumn).toEqual(2);
});

test('Test getWrapStrategies', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                tb: WrapStrategy.OVERFLOW,
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

    const range = worksheet.getRange('A1:B1');

    const wrapStrategies = range.getWrapStrategies();
    expect(wrapStrategies).toEqual([[1, 1]]);

    const wrapStrategy = range.getWrapStrategy();
    expect(wrapStrategy).toEqual(1);
});

test('Test getWraps/getWrap', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                tb: WrapStrategy.OVERFLOW,
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

    const range = worksheet.getRange('A1:B1');
    // get LastColumn
    const wraps = range.getWraps();
    expect(wraps).toEqual([[1, 1]]);

    const wrap = range.getWrap();
    expect(wrap).toEqual(1);
});

test('Test setFontColors', () => {
    const container = createCoreTestContainer({
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
                    s: '2',
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

    const range = worksheet.getRange('A1:B1');

    // set new color
    range.setFontColors([['green', 'yellow']]);

    const currentCell1 = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle1 = workbook.getStyles().get(currentCell1 && currentCell1.s);
    const currentColor1 = currentStyle1 && currentStyle1.cl?.rgb;

    expect(currentColor1).toEqual('green');

    const currentCell2 = worksheet.getCellMatrix().getValue(0, 1);
    const currentStyle2 = workbook.getStyles().get(currentCell2 && currentCell2.s);
    const currentColor2 = currentStyle2 && currentStyle2.cl?.rgb;

    expect(currentColor2).toEqual('yellow');

    // undo
    worksheet.getCommandManager().undo();

    // test previous color
    const preCell1 = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle1 = workbook.getStyles().get(preCell1 && preCell1.s);
    const preColor1 = preStyle1 && preStyle1.cl?.rgb;
    expect(preColor1).toEqual('blue');

    const preCell2 = worksheet.getCellMatrix().getValue(0, 1);
    const preStyle2 = workbook.getStyles().get(preCell2 && preCell2.s);
    const preColor2 = preStyle2 && preStyle2.cl?.rgb;
    expect(preColor2).toEqual('red');
});

test('Test setBackground', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                bg: {
                    rgb: 'blue',
                },
                ff: 'Arial',
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    // set A1 fontSize
    range.setBackground('red');

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        bg: {
            rgb: 'red',
        },
        ff: 'Arial',
        fs: 12,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        bg: {
            rgb: 'blue',
        },
        ff: 'Arial',
        fs: 12,
    });
    // redo
    worksheet.getCommandManager().redo();

    // test next style
    const nextCell = worksheet.getCellMatrix().getValue(0, 0);
    const nextStyle = workbook.getStyles().get(nextCell && nextCell.s);
    expect(nextStyle).toEqual({
        bg: {
            rgb: 'red',
        },
        ff: 'Arial',
        fs: 12,
    });
});

test('Test setBackgrounds', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                bg: {
                    rgb: 'blue',
                },
                ff: 'Arial',
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

    const range = worksheet.getRange('A1:B1');

    // set A1 fontSize
    range.setBackgrounds([['red', 'green']]);

    const currentCell = worksheet.getCellMatrix().getValue(0, 1);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        bg: {
            rgb: 'green',
        },
        ff: 'Arial',
        fs: 12,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 1);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        bg: {
            rgb: 'blue',
        },
        ff: 'Arial',
        fs: 12,
    });
    // redo
    worksheet.getCommandManager().redo();

    // test next style
    const nextCell = worksheet.getCellMatrix().getValue(0, 1);
    const nextStyle = workbook.getStyles().get(nextCell && nextCell.s);
    expect(nextStyle).toEqual({
        bg: {
            rgb: 'green',
        },
        ff: 'Arial',
        fs: 12,
    });
});

test('Test setBackgroundRGB', () => {
    const container = createCoreTestContainer({
        styles: {
            1: {
                bg: {
                    rgb: 'blue',
                },
                ff: 'Arial',
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

    const range = worksheet.getRange('A1:B1');

    // set A1 fontSize
    range.setBackgroundRGB(0, 0, 0);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        bg: {
            rgb: 'RGB(0,0,0)',
        },
        ff: 'Arial',
        fs: 12,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        bg: {
            rgb: 'blue',
        },
        ff: 'Arial',
        fs: 12,
    });
    // redo
    worksheet.getCommandManager().redo();

    // test next style
    const nextCell = worksheet.getCellMatrix().getValue(0, 0);
    const nextStyle = workbook.getStyles().get(nextCell && nextCell.s);
    expect(nextStyle).toEqual({
        bg: {
            rgb: 'RGB(0,0,0)',
        },
        ff: 'Arial',
        fs: 12,
    });
});

test('Test setUnderline', () => {
    const container = createCoreTestContainer({
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // set A1 fontSize
    range.setUnderlines([[{ s: BooleanNumber.TRUE }]]);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        fs: 12,
        ul: { s: BooleanNumber.TRUE },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        fs: 12,
    });
});

test('Test setOverline', () => {
    const container = createCoreTestContainer({
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // set A1 fontSize
    range.setOverlines([[{ s: BooleanNumber.TRUE }]]);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        fs: 12,
        ol: { s: BooleanNumber.TRUE },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        fs: 12,
    });
});

test('Test setStrikeThrough', () => {
    const container = createCoreTestContainer({
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // set A1 fontSize
    range.setStrikeThroughs([[{ s: BooleanNumber.TRUE }]]);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);
    const currentStyle = workbook.getStyles().get(currentCell && currentCell.s);

    expect(currentStyle).toEqual({
        fs: 12,
        st: { s: BooleanNumber.TRUE },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        fs: 12,
    });
});

test('Test setHorizontalAlignments', () => {
    const container = createCoreTestContainer({
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B1');

    // set A1 setHorizontalAlignments
    range.setHorizontalAlignments([[HorizontalAlign.CENTER, HorizontalAlign.LEFT]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(A1Style).toEqual({
        fs: 12,
        ht: HorizontalAlign.CENTER,
    });

    expect(B1Style).toEqual({
        ht: HorizontalAlign.LEFT,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    const preStyle = workbook.getStyles().get(preCell && preCell.s);
    expect(preStyle).toEqual({
        fs: 12,
    });

    /**
     * TODO :优化数据
     * 撤销后B1单元格为空
     * cellData: {
     *      0: {
     *          0: {
     *              s: 1,
     *              v: 1,
     *              m: '1',
     *          },
     *          1: {}
     *      },
     *  },
     */
    const preB1 = worksheet.getCellMatrix().getValue(0, 1);
    expect(preB1).toEqual({});
});

test('Test isPartOfMerge', () => {
    const container = createCoreTestContainer({
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
        mergeData: [
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 1,
            },
        ],
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: 1,
                    m: '1',
                },
                1: {
                    s: '1',
                    v: 1,
                    m: '2',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeA = worksheet.getRange('A1:C3');

    const isMergeA = rangeA.isPartOfMerge();

    expect(isMergeA).toEqual(true);

    const rangeB = worksheet.getRange('A4:C6');

    const isMergeB = rangeB.isPartOfMerge();

    expect(isMergeB).toEqual(false);
});

test('Test getLastRow', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:C5');

    const lastRow = range.getLastRow();

    expect(lastRow).toEqual(4);
});

test('Test setFontSizes', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setFontSizes
    range.setFontSizes([[16, 18]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(A1Style).toEqual({
        fs: 16,
    });

    expect(B1Style).toEqual({
        fs: 18,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setTextDirections', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setTextDirections
    range.setTextDirections([[0, 1]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(A1Style).toEqual({
        fs: 12,
        td: 0,
    });

    expect(B1Style).toEqual({
        fs: 12,
        td: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setFontWeights', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setFontWeights
    range.setFontWeights([[0, 1]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(A1Style).toEqual({
        fs: 12,
        bl: 0,
    });

    expect(B1Style).toEqual({
        fs: 12,
        bl: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setFontWeight', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1');

    // set A1 setFontWeights
    range.setFontWeight(1);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        bl: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setFontStyles', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setFontStyles
    range.setFontStyles([[0, 1]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        it: 0,
    });

    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(B1Style).toEqual({
        fs: 12,
        it: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
    const preB1 = worksheet.getCellMatrix().getValue(0, 1);
    const preB1Style = workbook.getStyles().get(preB1 && preB1.s);
    expect(preB1Style).toEqual({
        fs: 12,
    });
});
test('Test setFontStyle', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1');

    // set A1 setFontStyles
    range.setFontStyle(1);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        it: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});
test('Test setVerticalAlignments', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setVerticalAlignments
    range.setVerticalAlignments([[0, 1]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        vt: 0,
    });
    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(B1Style).toEqual({
        fs: 12,
        vt: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });

    const preB1 = worksheet.getCellMatrix().getValue(0, 0);
    const preB1Style = workbook.getStyles().get(preB1 && preB1.s);
    expect(preB1Style).toEqual({
        fs: 12,
    });
});

test('Test setTextRotations', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setTextRotations
    range.setTextRotations([[0, 1]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    const B1 = worksheet.getCellMatrix().getValue(0, 1);
    const B1Style = workbook.getStyles().get(B1 && B1.s);

    expect(A1Style).toEqual({
        fs: 12,
        tr: { v: 0, a: 0 },
    });

    expect(B1Style).toEqual({
        fs: 12,
        tr: { v: 0, a: 1 },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setTextRotation', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setTextRotation
    range.setTextRotation(1);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        tr: {
            v: 0,
            a: 1,
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setTextStyle', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1');

    // set A1 setTextStyle
    range.setTextStyle({
        ff: '黑体',
        fs: 18,
        bl: 1,
    });

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        ff: '黑体',
        fs: 18,
        bl: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setTextStyles', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    // set A1 setTextStyle
    range.setTextStyles([
        [
            {
                ff: '黑体',
                fs: 18,
                bl: 1,
            },
            {
                ff: '宋体',
                fs: 24,
                bl: 0,
            },
        ],
    ]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        ff: '黑体',
        fs: 18,
        bl: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setVerticalText', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1');

    // set A1 setVerticalText
    range.setVerticalText(1);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        tr: {
            a: 90,
            v: 1,
        },
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setWrap', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1');

    // set A1 setWrap
    range.setWrap(1);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        tb: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test setWraps', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1');

    // set A1 setWraps
    range.setWraps([[1, 1]]);

    const A1 = worksheet.getCellMatrix().getValue(0, 0);
    const A1Style = workbook.getStyles().get(A1 && A1.s);

    expect(A1Style).toEqual({
        fs: 12,
        tb: 1,
    });

    // undo
    worksheet.getCommandManager().undo();

    // test previous style
    const preA1 = worksheet.getCellMatrix().getValue(0, 0);
    const preA1Style = workbook.getStyles().get(preA1 && preA1.s);
    expect(preA1Style).toEqual({
        fs: 12,
    });
});

test('Test activate Range', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    const rangeData = range.activate().getRangeData();

    const activeRange = worksheet.getSelection().getActiveRange().getRangeData();

    expect(rangeData).toEqual(activeRange);
});

test('Test activateAsCurrentCell', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('B1');

    const activeCurrentCell = range.activateAsCurrentCell().getRangeData();

    const CurrentCell = worksheet.getSelection().getCurrentCell().getRangeData();

    expect(activeCurrentCell).toEqual(CurrentCell);
});

test('Test isIntersection', () => {
    const { worksheet, workbook } = demo();

    const currentRange = worksheet.getRange('A1:C5');

    const range = worksheet.getRange('B1:D3');

    const isInter = currentRange.isIntersection(range);

    expect(isInter).toEqual(true);
});
test('Test clearContent', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');
    range.clearContent();
    const data = range.getObjectValues();

    expect(data).toEqual({
        0: {
            0: {
                s: 1,
                v: '',
                m: '',
            },
            1: {
                s: 1,
                v: '',
                m: '',
            },
        },
    });
});

test('Test clearNote', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');
    range.clearNote();
    const data = range.getObjectValues();

    expect(data).toEqual({
        0: {
            0: {
                s: 1,
                v: '1',
                m: '1',
            },
            1: {
                s: 1,
                v: 1,
                m: '1',
            },
        },
    });
});

test('Test removeDuplicates', () => {
    const container = createCoreTestContainer({
        styles: {},
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
            2: {
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
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1:B4');

    range.removeDuplicates();
    const data = range.getObjectValues();
    expect(data).toEqual({
        0: {
            0: { s: 1, v: 1, m: '1' },
            1: { s: 1, v: 2, m: '2' },
        },
        1: {
            0: { s: 1, v: 3, m: '3' },
            1: { s: 1, v: 4, m: '4' },
        },
        2: { 0: {}, 1: {} },
        3: { 0: {}, 1: {} },
    });
});

test('Test getColumnMatrix', () => {
    const container = createCoreTestContainer({
        styles: {},
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

    const range = worksheet.getRange('A1:B2');

    const A = range.getColumnMatrix(0).getData();
    const B = range.getRowMatrix(1).getData();

    expect(A).toEqual({
        0: {
            0: { s: 1, v: 1, m: '1' },
        },
        1: {
            0: { s: 1, v: 3, m: '3' },
        },
    });

    expect(B).toEqual({
        1: {
            0: { s: 1, v: 3, m: '3' },
            1: { s: 1, v: 4, m: '4' },
        },
    });
});

test('Test isBlank', () => {
    const container = createCoreTestContainer({
        styles: {},
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

    const range = worksheet.getRange('A1:B2');

    const A = range.isBlank();

    expect(A).toEqual(false);
});

test('Test getA1Notation', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange(0, 0, 1, 4);

    const A1 = range.getA1Notation();

    expect(A1).toEqual('A1:E2');
});

// test('Test getFormulas/getFormual', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {},
//     });
//     const context = container.getSingleton<SheetContext>('SheetContext');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         sheetId: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                     f: 'SUM(1,2)',
//                 },
//                 1: {
//                     s: 1,
//                     v: 2,
//                     m: '2',
//                     f: 'SUM(3,4)',
//                 },
//             },
//         },
//         status: 1,
//     };
//     const worksheet = new WorkSheet(context, configure);
//     workbook.insertSheet(worksheet);
//     worksheet.setCommandManager(commandManager);

//     const range1 = worksheet.getRange('A1');

//     const formula = range1.getFormula();

//     expect(formula).toEqual('SUM(1,2)');

//     const range2 = worksheet.getRange('A1:B1');

//     const formulas = range2.getFormulas();

//     expect(formulas).toEqual([['SUM(1,2)', 'SUM(3,4)']]);
// });

// test('Test autoFill bottom', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {},
//     });
//     const context = container.getSingleton<SheetContext>('SheetContext');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         sheetId: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                     fm: {
//                         f: 'g',
//                         t: FormatType.NUMBER,
//                     },
//                 },
//                 1: {
//                     s: 1,
//                     v: 2,
//                     m: '2',
//                 },
//             },
//         },
//         status: 1,
//     };
//     const worksheet = new WorkSheet(context, configure);
//     workbook.insertSheet(worksheet);
//     worksheet.setCommandManager(commandManager);

//     const range = worksheet.getRange('A1');
//     const sourceRange = worksheet.getRange('A1:A5');
//     range.autoFill(sourceRange, AutoFillSeries.DEFAULT_SERIES);

//     const A5 = worksheet.getCellMatrix().getValue(4, 0);

//     expect(A5).toEqual({
//         0: {
//             s: 1,
//             v: 1,
//             m: '1',
//             fm: {
//                 f: 'g',
//                 t: FormatType.NUMBER,
//             },
//         },
//     });
// });

// test('Test autoFill right', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {},
//     });
//     const context = container.getSingleton<SheetContext>('SheetContext');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         sheetId: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     v: 1,
//                     m: '1',
//                     fm: {
//                         f: 'g',
//                         t: FormatType.NUMBER,
//                     },
//                 },
//                 1: {
//                     v: 2,
//                     m: '2',
//                     fm: {
//                         f: 'g',
//                         t: FormatType.NUMBER,
//                     },
//                 },
//             },
//             1: {
//                 0: {
//                     v: 2,
//                     m: '2',
//                     fm: {
//                         f: 'g',
//                         t: FormatType.NUMBER,
//                     },
//                 },
//             },
//         },
//         status: 1,
//     };
//     const worksheet = new WorkSheet(context, configure);
//     workbook.insertSheet(worksheet);
//     worksheet.setCommandManager(commandManager);

//     const range = worksheet.getRange('A1:B1');
//     const sourceRange = worksheet.getRange('A1:D1');
//     range.autoFill(sourceRange, AutoFillSeries.DEFAULT_SERIES);

//     const a = worksheet.getCellMatrix().getMatrix();
//     const D1 = worksheet.getCellMatrix().getValue(0, 3);

//     expect(D1).toEqual({
//         3: {
//             0: {
//                 s: 1,
//                 v: 1,
//                 m: '1',
//                 fm: {
//                     f: 'g',
//                     t: FormatType.NUMBER,
//                 },
//             },
//         },
//     });
// });

test('Test getGridId', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange(1, 1, 2, 5);

    const A1 = range.getGridId();

    expect(A1).toEqual('sheet');
});

// test('Test getFormulas/getFormual', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {},
//     });
//     const context = container.getSingleton<SheetContext>('SheetContext');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         sheetId: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                     n: '111',
//                 },
//                 1: {
//                     s: 1,
//                     v: 2,
//                     m: '2',
//                     n: '222',
//                 },
//             },
//         },
//         status: 1,
//     };
//     const worksheet = new WorkSheet(context, configure);
//     workbook.insertSheet(worksheet);
//     worksheet.setCommandManager(commandManager);

//     const range1 = worksheet.getRange('A1');

//     const note = range1.getNote();

//     expect(note).toEqual('111');

//     const range2 = worksheet.getRange('A1:B1');

//     const notes = range2.getNotes();

//     expect(notes).toEqual([['111', '222']]);
// });

// test('Test getNumberFormat/getNumberFormats', () => {
//     const container = IOCContainerStartUpReady({
//         styles: {},
//     });
//     const context = container.getSingleton<SheetContext>('SheetContext');
//     const workbook = container.getSingleton<WorkBook>('WorkBook');
//     const commandManager = workbook.getCommandManager();

//     const configure = {
//         sheetId: 'sheet',
//         cellData: {
//             0: {
//                 0: {
//                     s: 1,
//                     v: 1,
//                     m: '1',
//                     fm: {
//                         f: 'g',
//                         t: FormatType.NUMBER,
//                     },
//                 },
//                 1: {
//                     s: 1,
//                     v: 2,
//                     m: '2',
//                     fm: {
//                         f: 'g',
//                         t: FormatType.TEXT,
//                     },
//                 },
//             },
//         },
//         status: 1,
//     };
//     const worksheet = new WorkSheet(context, configure);
//     workbook.insertSheet(worksheet);
//     worksheet.setCommandManager(commandManager);

//     const range1 = worksheet.getRange('A1:B1');
//     const formats = range1.getNumberFormats();

//     const range2 = worksheet.getRange('A1');
//     const format = range2.getNumberFormat();

//     expect(formats).toEqual([['g', 'g']]);
//     expect(format).toEqual('g');
// });

test('Test getHeight', () => {
    const { worksheet } = demo();

    const range = worksheet.getRange('A1:B2');

    const h = range.getHeight();

    // defaultRowHeight: 27,
    expect(h).toEqual(27 * 2);
});

test('Test getWidth', () => {
    const { worksheet } = demo();

    const range = worksheet.getRange('A1:B2');

    const w = range.getWidth();

    // defaultColumnWidth: 93,
    expect(w).toEqual(93 * 2);
});

test('Test trimWhitespace', () => {
    const container = createCoreTestContainer({
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
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        id: 'sheet',
        cellData: {
            0: {
                0: {
                    s: '1',
                    v: '1  1',
                    m: '1  1',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const range = worksheet.getRange('A1');

    range.trimWhitespace();

    const A1 = worksheet.getRange('A1').getValue()?.m;
    expect(A1).toEqual('11');
});

test('Test getNextDataCell', () => {
    const { worksheet } = demo();

    const range = worksheet.getRange('C3:D3');

    const cellTop = range.getNextDataCell(Direction.TOP).getA1Notation();
    expect(cellTop).toEqual('C1');

    const cellBottom = range.getNextDataCell(Direction.BOTTOM).getA1Notation();
    expect(cellBottom).toEqual('C31');

    const cellLeft = range.getNextDataCell(Direction.LEFT).getA1Notation();
    expect(cellLeft).toEqual('A3');

    const cellRight = range.getNextDataCell(Direction.RIGHT).getA1Notation();
    expect(cellRight).toEqual('K3');
});

test('Test getDataRegion', () => {
    const { worksheet } = demo();

    const range = worksheet.getRange('C3:D3');

    const cellColumns = range.getDataRegion(Dimension.COLUMNS).getA1Notation();
    expect(cellColumns).toEqual('B1:C3');

    const cellRows = range.getDataRegion(Dimension.ROWS).getA1Notation();
    expect(cellRows).toEqual('A2:C3');

    const cell = range.getDataRegion().getA1Notation();
    expect(cell).toEqual('B3:C3');
});

test('Test getRichTextValues/getRichTextValue', () => {
    const { worksheet } = demo();

    const ranges = worksheet.getRange('A1:B1');
    const cells = ranges.getRichTextValues();
    expect(cells).toEqual([['', '']]);

    const range = worksheet.getRange('A1');
    const cell = range.getRichTextValue();
    expect(cell).toEqual('');
});

test('Test setRangeData', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B1');

    const newData: ICellData = {
        s: {
            bg: {
                rgb: 'red',
            },
        },
        v: 11,
        m: '11',
    };

    range.setRangeData(newData);
    const currentRangeValues = range.getValues();
    expect(currentRangeValues).toEqual([
        [
            {
                v: 11,
                m: '11',
                s: '12345678',
            },
            {
                v: 11,
                m: '11',
                s: '12345678',
            },
        ],
    ]);

    // undo
    worksheet.getCommandManager().undo();
    const preRangeValues = range.getValues();

    expect(preRangeValues).toEqual([
        [
            {
                s: '1',
                v: '1',
                m: '1',
            },
            {
                s: '1',
                v: 1,
                m: '1',
            },
        ],
    ]);

    // redo
    worksheet.getCommandManager().redo();
    const nextRangeValues = range.getValues();

    expect(nextRangeValues).toEqual([
        [
            {
                v: 11,
                m: '11',
                s: '12345678',
            },
            {
                v: 11,
                m: '11',
                s: '12345678',
            },
        ],
    ]);
});

// test('Test setNumberFormat', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1');

//     range.setNumberFormat('0.000');
//     const cell = range.getNumberFormat();
//     expect(cell).toEqual('0.000');

//     // undo
//     worksheet.getCommandManager().undo();
//     const uncell = range.getNumberFormat();
//     expect(uncell).toEqual('');

//     // redo
//     worksheet.getCommandManager().redo();
//     const recell = range.getNumberFormat();
//     expect(recell).toEqual('0.000');
// });

// test('Test setNumberFormats', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1:B1');

//     range.setNumberFormats([['0.000', '0.000']]);
//     const cell = range.getNumberFormats();
//     expect(cell).toEqual([['0.000', '0.000']]);

//     // undo
//     worksheet.getCommandManager().undo();
//     const undoValue = worksheet.getCellMatrix().getValue(0, 0);
//     const uncell = range.getNumberFormats();
//     expect(uncell).toEqual([['', '']]);

//     // redo
//     worksheet.getCommandManager().redo();
//     // const redoValue = worksheet.getCellMatrix().getValue(0, 0);
//     const recell = range.getNumberFormats();
//     expect(recell).toEqual([['0.000', '0.000']]);
// });

// test('Test setFormulas', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1:B1');

//     range.setFormulas([['=SUM(1,2)', '=SUM(1,2)']]);
//     const cell = range.getFormulas();
//     expect(cell).toEqual([['=SUM(1,2)', '=SUM(1,2)']]);

//     // undo
//     worksheet.getCommandManager().undo();
//     const uncell = range.getFormulas();
//     expect(uncell).toEqual([['', '']]);

//     // redo
//     worksheet.getCommandManager().redo();
//     const recell = range.getFormulas();
//     expect(recell).toEqual([['=SUM(1,2)', '=SUM(1,2)']]);
// });

// test('Test setFormula', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1:B1');

//     range.setFormula('=SUM(1,2)');

//     const cell = range.getFormula();
//     expect(cell).toEqual('=SUM(1,2)');

//     // undo
//     worksheet.getCommandManager().undo();
//     const uncell = range.getFormula();
//     expect(uncell).toEqual('');

//     // redo
//     worksheet.getCommandManager().redo();
//     const recell = range.getFormula();
//     expect(recell).toEqual('=SUM(1,2)');
// });
// test('Test setNotes', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1:B1');

//     range.setNotes([['note1', 'note2']]);

//     const cell = range.getNotes();
//     expect(cell).toEqual([['note1', 'note2']]);

//     // undo
//     worksheet.getCommandManager().undo();
//     const uncell = range.getNotes();
//     expect(uncell).toEqual([['', '']]);

//     // redo
//     worksheet.getCommandManager().redo();
//     const recell = range.getNotes();
//     expect(recell).toEqual([['note1', 'note2']]);
// });
// test('Test setNote', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1:B1');

//     range.setNote('note');

//     const cell = range.getNote();
//     expect(cell).toEqual('note');

//     // undo
//     worksheet.getCommandManager().undo();
//     const uncell = range.getNote();
//     expect(uncell).toEqual('');

//     // redo
//     worksheet.getCommandManager().redo();
//     const recell = range.getNote();
//     expect(recell).toEqual('note');
// });

test('Test randomize', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B5');

    range.randomize();
    // TODO
});

test('Test getMergedRanges', () => {
    const { worksheet } = demo();

    const range = worksheet.getRange('A1:B3');

    const merge = range.getMergedRanges();
    expect(merge).toEqual({
        endColumn: 2,
        endRow: 2,
        startColumn: 1,
        startRow: 1,
    });
});

test('Test mergeAcross', () => {
    const { worksheet } = demo();

    const range = worksheet.getRange('A1:B3');

    range.mergeAcross();

    const merge = worksheet.getMerges();

    expect(merge.getByRowColumn(1, 1)).not.toBeUndefined();
});

test('Test mergeVertically', () => {
    const { worksheet, workbook } = demo();

    const range = worksheet.getRange('A1:B3');

    range.mergeVertically();
    const merge = worksheet.getMerges();
    expect(merge.getByRowColumn(1, 1)).not.toBeUndefined();
});

// test('Test createFilter', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1:B3');

//     range.createFilter();
//     // TODO
// });
// test('Test setCellId', () => {
//     let { worksheet, workbook } = demo();

//     const range = worksheet.getRange('A1');

//     range.setCellId();

//     let currentCell = worksheet.getCellMatrix().getValue(0, 0);

//     // use mock data
//     expect(currentCell?.id).toHaveLength(8);

//     range.setCellId('cell-01');

//     currentCell = worksheet.getCellMatrix().getValue(0, 0);

//     expect(currentCell).toEqual({ s: 1, v: '1', m: '1', id: 'cell-01' });
// });
