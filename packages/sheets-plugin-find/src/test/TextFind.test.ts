/* eslint-disable max-lines-per-function */
/**
 * @jest-environment jsdom
 */
import { SheetContext, Workbook, Worksheet } from '@univerjs/core';
import { createCoreTestContainer } from '@univerjs/core/test/ContainerStartUp';
import { TextFinder } from '../Domain';

function demo() {
    const container = createCoreTestContainer({
        styles: {
            1: {
                fs: 12,
            },
        },
    });
    const context = container.get<SheetContext>('Context');
    const workbook = container.get<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const configure = {
        sheetId: 'sheet',
        cellData: {
            0: {
                0: {
                    s: 1,
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    v: 1,
                    m: '1',
                },
            },
            1: {
                0: {
                    s: 1,
                    v: 1,
                    m: 'AB',
                    f: '=sum',
                },
                1: {
                    s: 1,
                    v: 1,
                    m: 'ab',
                },
            },
            2: {
                0: {
                    s: 1,
                    v: 1,
                    m: 'test',
                },
                1: {
                    s: 1,
                    v: 1,
                    m: 'ab',
                },
            },
        },
        status: 1,
    };
    const worksheet = container.createInstance(Worksheet, context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    return { worksheet, workbook };
}

test('Test findAll', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'a');
    const a = find.findAll();
    expect(a).toEqual(null);
    const find1 = new TextFinder(worksheet, 'text', '1');
    const b = find1.findAll();
    expect(b?.length).toEqual(2);
});

test('Test findNext', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', '1');
    const b = find.findNext();
    expect(b?.getRangeData()).toEqual({
        startRow: 0,
        endRow: 0,
        startColumn: 0,
        endColumn: 0,
    });
});

test('Test findPrevious', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', '1');
    const b = find.findPrevious();
    expect(b?.getRangeData()).toEqual({
        startRow: 0,
        endRow: 0,
        startColumn: 1,
        endColumn: 1,
    });
});

test('Test matchCase', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'ab');
    const b = find.matchCase(true).findNext();
    expect(b?.getRangeData()).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 1,
        endColumn: 1,
    });
});

test('Test matchEntireCell', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'a');
    const b = find.matchEntireCell(true).findNext();
    expect(b?.getRangeData()).toEqual(null);
});

test('Test matchFormulaText', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'sum');
    const b = find.matchFormulaText(true).findNext();
    expect(b?.getRangeData()).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 0,
        endColumn: 0,
    });
});

test('Test useRegularExpression', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', '/test/');
    const b = find.useRegularExpression(true).findNext();
    expect(b?.getRangeData()).toEqual({
        startRow: 2,
        endRow: 2,
        startColumn: 0,
        endColumn: 0,
    });
});

test('Test replaceWith', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'ab');
    const b = find.replaceWith('cc');
    expect(b).toEqual(1);
});

test('Test replaceWith', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'ab');
    const b = find.replaceAllWith('cc');
    expect(b).toEqual(2);
});

test('Test getCurrentMatch', () => {
    let { worksheet, workbook } = demo();
    const find = new TextFinder(worksheet, 'text', 'ab');
    find.findNext();
    const b = find.getCurrentMatch();
    expect(b?.getRangeData()).toEqual({
        startRow: 1,
        endRow: 1,
        startColumn: 0,
        endColumn: 0,
    });
});
