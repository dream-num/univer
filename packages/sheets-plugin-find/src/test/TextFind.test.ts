/**
 * @jest-environment jsdom
 */
import {
    BooleanNumber,
    CommandManager,
    SheetContext,
    Environment,
    HooksManager,
    IOCAttribute,
    IOCContainer,
    IWorkbookConfig,
    Locale,
    ObserverManager,
    PluginManager,
    ServerHttp,
    ServerSocket,
    UndoManager,
    Workbook,
    Worksheet,
} from '@univer/core';
import { TextFinder } from '../Domain';

export function IOCContainerStartUpReady(workbookConfig?: Partial<IWorkbookConfig>): IOCContainer {
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
    const worksheet = container.getInstance<Worksheet>('WorkSheet', context, configure);
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
