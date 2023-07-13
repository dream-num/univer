/**
 * @jest-environment jsdom
 */
import { SheetContext, Workbook, Worksheet } from '@univerjs/core';
import { createCoreTestContainer } from '@univerjs/core/test/ContainerStartUp';
import { TextFinder } from '../src/Domain/TextFind';

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
                    m: 'a',
                },
                1: {
                    s: 1,
                    v: 1,
                    m: 'ab',
                },
                2: {
                    s: 1,
                    v: 1,
                    m: 'Abc',
                },
            },
            1: {
                0: {
                    s: 1,
                    v: 1,
                    m: 'c',
                },
                1: {
                    s: 1,
                    v: 1,
                    m: 'cD',
                },
                2: {
                    s: 1,
                    v: 1,
                    m: 'cde',
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
    const a = new TextFinder(worksheet, 'text', 'a');
    const range = a.findAll();
});

test('Test findNext', () => {
    let { worksheet, workbook } = demo();
    const a = new TextFinder(worksheet, 'text', 'a');
    const range = a.findNext();
});

test('Test findPrevious', () => {
    let { worksheet, workbook } = demo();
    const a = new TextFinder(worksheet, 'text', 'a');
    const range = a.findPrevious();
});

test('Test matchCase', () => {
    let { worksheet, workbook } = demo();
    const a = new TextFinder(worksheet, 'text', 'a');
    a.matchCase(true);
});

test('Test matchCase', () => {
    let { worksheet, workbook } = demo();
    const a = new TextFinder(worksheet, 'text', 'a');
    a.matchEntireCell(true);
});
