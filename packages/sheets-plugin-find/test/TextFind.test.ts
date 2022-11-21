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
import { TextFinder } from '../src/Domain/TextFind';

export function IOCContainerStartUpReady(workbookConfig?: Partial<IWorkbookConfig>): IOCContainer {
    const configure = Object.assign(
        {
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
        },
        workbookConfig
    );
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
    const worksheet = container.getInstance<Worksheet>('WorkSheet', context, configure);
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
