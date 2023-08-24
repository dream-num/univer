import { Environment } from '../src/Basics';
import { CommandManager, UndoManager } from '../src/Command';
import { Workbook, Worksheet } from '../src/Sheets/Domain';
import { BooleanNumber } from '../src/Types/Enum';
import { IWorkbookConfig, IWorksheetConfig } from '../src/Types/Interfaces';
import { HooksManager } from '../src/Observer/HooksManager';
import { ObserverManager } from '../src/Observer/ObserverManager';
import { PluginManager } from '../src/Plugin';
import {
    IServerSocketWorkbookConfig,
    ServerHttp,
    ServerSocket,
} from '../src/Server';
import { Locale } from '../src/Shared';
export function createCoreTestContainer(
    workbookConfig?: Partial<IWorkbookConfig>
): Injector {
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
            styles: {},
            theme: '',
            timeZone: '',
            ...workbookConfig,
        },
    };

    const container = new Injector([
        [IServerSocketWorkbookConfig, { useValue: configure }],
        ['Environment', { useClass: Environment }],
        ['Server', { useClass: ServerSocket }],
        ['ServerSocket', { useClass: ServerSocket }],
        ['ServerHttp', { useClass: ServerHttp }],
        ['WorkBook', { useClass: Workbook }],
        ['Locale', { useClass: Locale }],
        ['Context', { useClass: SheetContext }],
        ['UndoManager', { useClass: UndoManager }],
        ['CommandManager', { useClass: CommandManager }],
        ['PluginManager', { useClass: PluginManager }],
        ['ObserverManager', { useClass: ObserverManager }],
        ['ObservableHooksManager', { useClass: HooksManager }],
        ['WorkSheet', { useClass: Worksheet }],
    ]);

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

    const container = createCoreTestContainer();
    const context = container.get<SheetContext>('Context');
    const workbook = container.get<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();

    // const worksheet = new WorkSheet(context, configure);
    const worksheet = container.createInstance(Worksheet, context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    return { worksheet, workbook };
}

// eslint-disable-next-line max-lines-per-function
export function TestInitTwoSheet() {
    const container = createCoreTestContainer();
    const context = container.get<SheetContext>('Context');
    const workbook = container.get<Workbook>('WorkBook');
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

    const worksheetOne = container.createInstance(
        Worksheet,
        context,
        sheetOneConfigure
    );
    workbook.insertSheet(worksheetOne);
    worksheetOne.setCommandManager(commandManager);

    const worksheetTwo = container.createInstance(
        Worksheet,
        context,
        sheetTwoConfigure
    );
    workbook.insertSheet(worksheetTwo);
    worksheetTwo.setCommandManager(commandManager);

    return { worksheetOne, worksheetTwo, workbook };
}

export function TestInitSheetInstance(worksheetConfig?: Partial<IWorksheetConfig>) {
    const configure = Object.assign(defaultWorksheetConfigure, worksheetConfig);
    const container = createCoreTestContainer();
    const context = container.get<SheetContext>('Context');
    const workbook = container.get<Workbook>('WorkBook');
    const commandManager = workbook.getCommandManager();
    const worksheet = new Worksheet(context, configure);
    workbook.insertSheet(worksheet);
    worksheet.setCommandManager(commandManager);

    return { workbook, worksheet };
}
