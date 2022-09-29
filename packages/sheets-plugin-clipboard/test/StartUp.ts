import {
    BooleanNumber,
    CommandManager,
    Context,
    Environment,
    HooksManager,
    IOCAttribute,
    IOCContainer,
    Locale,
    PluginManager,
    ServerHttp,
    ServerSocket,
    UndoManager,
    WorkBook,
    WorkSheet,
    ObserverManager,
    IWorksheetConfig,
} from "@univer/core";

export function StartUpReady(): IOCContainer {
    const configure = {
        value: {
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
            styles: [],
            sheets: [],
            lastModifiedBy: '',
            createdTime: '',
            modifiedTime: '',
            namedRanges: [],
        },
    };
    const attribute = new IOCAttribute(configure);
    const container = new IOCContainer(attribute);
    container.addSingletonMapping('Environment', Environment);
    container.addSingletonMapping('Server', ServerSocket);
    container.addSingletonMapping('ServerSocket', ServerSocket);
    container.addSingletonMapping('ServerHttp', ServerHttp);
    container.addSingletonMapping('WorkBook', WorkBook);
    container.addSingletonMapping('Locale', Locale);
    container.addSingletonMapping('Context', Context);
    container.addSingletonMapping('UndoManager', UndoManager);
    container.addSingletonMapping('CommandManager', CommandManager);
    container.addSingletonMapping('PluginManager', PluginManager);
    container.addSingletonMapping('ObserverManager', ObserverManager);
    container.addSingletonMapping('ObservableHooksManager', HooksManager);
    container.addMapping('WorkSheet', WorkSheet);
    return container;
}

export function StartUpInit(worksheetConfig?: Partial<IWorksheetConfig>) {
    const configure = Object.assign({
        sheetId: 'sheet-01',
        cellData: {
            0: {
                0: {
                    s: 1,
                    v: 1,
                    m: '1',
                },
                1: {
                    s: 1,
                    v: 2,
                    m: '2',
                },
            },
        },
        defaultColumnWidth: 93,
        defaultRowHeight: 27,
        status: 1,
    }, worksheetConfig);

    const container = StartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<WorkBook>('WorkBook');
    const manager = workbook.getCommandManager();

    const worksheet = container.getInstance<WorkSheet>('WorkSheet', context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(manager);

    return { worksheet, workbook };
}