import { SheetContext, Environment } from '../src/Basics';
import { CommandManager, UndoManager } from '../src/Command';
import { Workbook, Worksheet } from '../src/Sheets/Domain';
import { BooleanNumber } from '../src/Enum';
import { IWorksheetConfig } from '../src/Interfaces';
import { IOCAttribute, IOCContainer } from '../src/DI';
import { HooksManager } from '../src/Observer/HooksManager';
import { ObserverManager } from '../src/Observer/ObserverManager';
import { PluginManager } from '../src/Plugin';
import { ServerHttp, ServerSocket } from '../src/Server';
import { Locale } from '../src/Shared';

export function IOCContainerStartUpReady(): IOCContainer {
    const configure = {
        value: {
            appVersion: '',
            createdTime: '',
            creator: '',
            extensions: [],
            id: '',
            lastModifiedBy: '',
            locale: '',
            modifiedTime: '',
            name: '',
            namedRanges: [],
            sheetOrder: [],
            sheets: [],
            skin: '',
            socketEnable: BooleanNumber.FALSE,
            socketUrl: '',
            styles: [],
            theme: '',
            timeZone: '',
        },
    };
    const attribute = new IOCAttribute(configure);
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

const defaultWorksheetConfigure = {
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
};

export function TestInit(worksheetConfig?: Partial<IWorksheetConfig>) {
    const configure = Object.assign(defaultWorksheetConfigure, worksheetConfig);

    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    // const worksheet = new WorkSheet(context, configure);
    const worksheet = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        configure
    );
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    return { worksheet, workbook };
}
export function TestInitTwoSheet() {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    const sheetOneConfigure = {
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
    };

    const sheetTwoConfigure = {
        sheetId: 'sheet-02',
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
        status: 0,
    };

    const worksheetOne = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        sheetOneConfigure
    );
    workbook.insertSheet(worksheetOne);
    worksheetOne.setCommandManager(commandManager);

    const worksheetTwo = container.getInstance<Worksheet>(
        'WorkSheet',
        context,
        sheetTwoConfigure
    );
    workbook.insertSheet(worksheetTwo);
    worksheetTwo.setCommandManager(commandManager);

    return { worksheetOne, worksheetTwo, workbook };
}

export function TestInitSheetInstance(worksheetConfig?: Partial<IWorksheetConfig>) {
    const configure = Object.assign(defaultWorksheetConfigure, worksheetConfig);
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<SheetContext>('Context');
    const workbook = container.getSingleton<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    return { workbook, worksheet };
}
