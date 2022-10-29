/**
 * @jest-environment jsdom
 */
import { Context } from '../../src/Basics/Context';
import { Workbook } from '../../src/Sheets/Domain/Workbook';
import { Worksheet } from '../../src/Sheets/Domain/Worksheet';
import { BooleanNumber, WrapStrategy } from '../../src/Enum';
import { TestInit } from '../ContainerStartUp';
import { IOCContainerStartUpReady } from './Range.test';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

// TODO performance test, 1000 times
// TODO 修复RangeList单元测试报错

test('Test RangeList setValue', () => {
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
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    // set new value
    rangeList.setValue(3);

    const currentCell = worksheet.getCellMatrix().getValue(0, 0);

    expect(currentCell).toEqual({ v: 3, m: '3' });

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = worksheet.getCellMatrix().getValue(0, 0);
    expect(preCell).toEqual({ s: 1, v: 1, m: '1' });
});

test('Test RangeList clear', () => {
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
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    // clear
    rangeList.clear({ formatOnly: true, contentsOnly: true });

    // test current A1 B1
    const currentA = worksheet?.getCellMatrix()?.getValue(0, 0);
    const currentB = worksheet?.getCellMatrix()?.getValue(0, 1);

    expect(currentA).toEqual({ v: '', m: '' });
    expect(currentB).toEqual({ v: '', m: '' });

    // undo
    worksheet.getCommandManager().undo();

    // test previous A1 B1
    const preA = worksheet?.getCellMatrix()?.getValue(0, 0);
    const preB = worksheet?.getCellMatrix()?.getValue(0, 1);

    expect(preA).toEqual({ s: 1, v: 1, m: '1' });
    expect(preB).toEqual({ s: 1, v: 2, m: '2' });
});

function demo() {
    const container = IOCContainerStartUpReady({
        styles: {
            1: {
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
                    v: 111,
                    m: '1   11',
                },
                1: {
                    s: '1',
                    v: 222,
                    m: '2   22',
                },
            },
        },
        status: 1,
    };
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);
    return worksheet;
}

test('Test RangeList setFontSize', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setFontSize(20);

    const cell = range.getFontSizes();

    expect(cell).toEqual([[20, 20]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getFontSizes();
    expect(preCell).toEqual([[12, 12]]);
});

test('Test RangeList setFontFamily', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setFontFamily('宋体');

    const cell = range.getFontFamilies();

    expect(cell).toEqual([['宋体', '宋体']]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getFontFamilies();
    expect(preCell).toEqual([['', '']]);
});

test('Test RangeList setUnderline', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setUnderline(BooleanNumber.TRUE);

    const cell = range.getUnderlines();

    expect(cell).toEqual([[{ s: BooleanNumber.TRUE }, { s: BooleanNumber.TRUE }]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getUnderlines();
    expect(preCell).toEqual([
        [{ s: BooleanNumber.FALSE }, { s: BooleanNumber.FALSE }],
    ]);
});

test('Test RangeList setOverline', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setOverline(BooleanNumber.TRUE);

    const cell = range.getOverlines();

    expect(cell).toEqual([[{ s: BooleanNumber.TRUE }, { s: BooleanNumber.TRUE }]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getOverlines();
    expect(preCell).toEqual([
        [{ s: BooleanNumber.FALSE }, { s: BooleanNumber.FALSE }],
    ]);
});

test('Test RangeList setStrikeThrough', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setStrikeThrough(BooleanNumber.TRUE);

    const cell = range.getStrikeThroughs();

    expect(cell).toEqual([[{ s: BooleanNumber.TRUE }, { s: BooleanNumber.TRUE }]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getStrikeThroughs();
    expect(preCell).toEqual([
        [{ s: BooleanNumber.FALSE }, { s: BooleanNumber.FALSE }],
    ]);
});

test('Test RangeList setFontStyle', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setFontStyle(1);

    const cell = range.getFontStyles();

    expect(cell).toEqual([[1, 1]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getFontStyles();
    expect(preCell).toEqual([[0, 0]]);
});

test('Test RangeList setFontWeight', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setFontWeight(1);

    const cell = range.getFontWeights();

    expect(cell).toEqual([[1, 1]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getFontWeights();
    expect(preCell).toEqual([[0, 0]]);
});

test('Test RangeList setHorizontalAlignment', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setHorizontalAlignment(1);

    const cell = range.getHorizontalAlignments();

    expect(cell).toEqual([[1, 1]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getHorizontalAlignments();
    expect(preCell).toEqual([[0, 0]]);
});

test('Test RangeList setTextDirection', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setTextDirection(1);

    const cell = range.getTextDirections();

    expect(cell).toEqual([[1, 1]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getTextDirections();
    expect(preCell).toEqual([[0, 0]]);
});

test('Test RangeList setTextRotation', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setTextRotation(90);

    const cell = range.getTextRotations();

    expect(cell).toEqual([
        [
            {
                a: 90,
                v: 0,
            },
            {
                a: 90,
                v: 0,
            },
        ],
    ]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getTextRotations();
    expect(preCell).toEqual([
        [
            {
                a: 0,
                v: 0,
            },
            {
                a: 0,
                v: 0,
            },
        ],
    ]);
});

test('Test RangeList setVerticalAlignment', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setVerticalAlignment(1);

    const cell = range.getVerticalAlignments();

    expect(cell).toEqual([[1, 1]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getVerticalAlignments();
    expect(preCell).toEqual([[0, 0]]);
});

test('Test RangeList setWrapStrategy', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setWrapStrategy(WrapStrategy.CLIP);

    const cell = range.getWrapStrategies();

    expect(cell).toEqual([[WrapStrategy.CLIP, WrapStrategy.CLIP]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getWrapStrategies();
    expect(preCell).toEqual([[WrapStrategy.UNSPECIFIED, WrapStrategy.UNSPECIFIED]]);
});

test('Test activate RangeList', () => {
    const { workbook, worksheet } = TestInit();

    const rangeList = worksheet.getRangeList(['A1:B1', 'A3:B4']);

    const rangeData = rangeList.activate();

    const activeRange = worksheet.getSelection().getActiveRangeList();

    expect(rangeData).toEqual(activeRange);
});

test('Test RangeList setFontColor', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setFontColor('#FFF');

    const cell = range.getFontColors();

    expect(cell).toEqual([['#FFF', '#FFF']]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getFontColors();
    expect(preCell).toEqual([['#000', '#000']]);
});

test('Test RangeList setWrap', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setWrap(1);

    const cell = range.getWraps();

    expect(cell).toEqual([[1, 1]]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getWraps();
    expect(preCell).toEqual([[0, 0]]);
});

test('Test RangeList setVerticalText', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    const range = worksheet.getRange('A1:B1');

    rangeList.setVerticalText(1);

    const cell = range.getTextRotations();

    expect(cell).toEqual([
        [
            {
                a: 90,
                v: 1,
            },
            {
                a: 90,
                v: 1,
            },
        ],
    ]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    const preCell = range.getTextRotations();
    expect(preCell).toEqual([
        [
            {
                a: 0,
                v: 0,
            },
            {
                a: 0,
                v: 0,
            },
        ],
    ]);
});

// test('Test RangeList setFormula', () => {
//     const worksheet = demo();

//     const rangeList = worksheet.getRangeList(['A1', 'B1']);

//     const range = worksheet.getRange('A1:B1');

//     rangeList.setFormula('=SUM(1,2)');

//     const cell = range.getFormula();

//     expect(cell).toEqual('=SUM(1,2)');

//     // undo
//     worksheet.getCommandManager().undo();

//     // test previous value
//     const preCell = range.getFormula();
//     expect(preCell).toEqual('');
// });

// test('Test RangeList setNote', () => {
//     const worksheet = demo();

//     const rangeList = worksheet.getRangeList(['A1', 'B1']);

//     const range = worksheet.getRange('A1:B1');

//     rangeList.setNote('1');

//     const cell = range.getNote();

//     expect(cell).toEqual('1');

//     // undo
//     worksheet.getCommandManager().undo();

//     // test previous value
//     const preCell = range.getNote();
//     expect(preCell).toEqual('');
// });

// test('Test RangeList setNumberFormat', () => {
//     const worksheet = demo();

//     const rangeList = worksheet.getRangeList(['A1', 'B1']);

//     const range = worksheet.getRange('A1:B1');

//     rangeList.setNumberFormat('#.##');

//     const cell = range.getNumberFormat();

//     expect(cell).toEqual('#.##');

//     // undo
//     worksheet.getCommandManager().undo();

//     // test previous value
//     const preCell = range.getNumberFormat();
//     expect(preCell).toEqual('');
// });

test('Test RangeList setBackground', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    rangeList.setBackground('red');

    const range = worksheet.getRange('A1:B1');
    const bg = range.getBackgrounds();
    expect(bg).toEqual([['red', 'red']]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    // defined background : #fff
    const preRange = worksheet.getRange('A1:B1');
    const preBg = preRange.getBackgrounds();
    expect(preBg).toEqual([[undefined, undefined]]);
});

test('Test RangeList setBackgroundRGB', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    rangeList.setBackgroundRGB(0, 0, 0);

    const range = worksheet.getRange('A1:B1');
    const bg = range.getBackgrounds();
    expect(bg).toEqual([['RGB(0,0,0)', 'RGB(0,0,0)']]);

    // undo
    worksheet.getCommandManager().undo();

    // test previous value
    // defined background : #fff
    const preRange = worksheet.getRange('A1:B1');
    const preBg = preRange.getBackgrounds();
    expect(preBg).toEqual([[undefined, undefined]]);
});

test('Test RangeList trimWhitespace', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    rangeList.trimWhitespace();
    const range = worksheet.getRange('A1:B1');
    const value = range.getValues();
    expect(value).toEqual([
        [
            { s: 1, m: '111', v: '111' },
            { s: 1, m: '222', v: '222' },
        ],
    ]);
});

test('Test RangeList clearFormat', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    rangeList.clearFormat();

    // TODO
});
test('Test RangeList clearContent', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    rangeList.clearContent();

    // TODO
});
test('Test RangeList clearNote', () => {
    const worksheet = demo();

    const rangeList = worksheet.getRangeList(['A1', 'B1']);

    rangeList.clearNote();

    // TODO
});
