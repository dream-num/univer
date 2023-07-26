import { ISpreadsheetConfig } from '../Types/Interfaces';
import { Plugin } from '../Plugin';
import { IOHttp, IOHttpConfig } from '../Shared';
import { SheetContext } from './SheetContext';
import { ColorBuilder } from '../Shared/Color';
import { CommandManager } from '../Command/CommandManager';
import { Spreadsheet } from '../Sheets/Domain/Spreadsheet';

interface IComposedConfig {
    [key: string]: any;

    SpreadsheetConfig: ISpreadsheetConfig;
}

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet {
    private _context: SheetContext;

    constructor(univerSheetData: Partial<ISpreadsheetConfig> = {}, private commandManager: CommandManager) {
        this._context = new SheetContext(univerSheetData, this.commandManager);
    }

    /**
     * get SheetContext
     */
    get context() {
        return this._context;
    }

    /**
     *
     * Request data
     *
     * @example
     * Get data for all tables, including core and plugin data
     *
     * @param config
     */
    static get<T = void>(config: Omit<IOHttpConfig, 'type'>): Promise<T> {
        return IOHttp({ ...config, type: 'GET' });
    }

    /**
     * Submit data
     * @param config
     */
    static post<T = void>(config: Omit<IOHttpConfig, 'type'>): Promise<T> {
        return IOHttp({ ...config, type: 'POST' });
    }

    /**
     * Load data
     *
     * @example
     * UniverSheet.get gets all the core and plug-in data, UniverSheet.load(univerSheetInstance,data) internally calls the load API of each plug-in to centrally load the core and plug-in data
     *
     * @param sheet
     * @param data
     */
    // static load<T extends IComposedConfig>(sheet: UniverSheet, data: T) {
    //     sheet.getSpreadsheet().load(data.SpreadsheetConfig);
    //     sheet.context
    //         .getPluginManager()
    //         .getPlugins()
    //         .forEach((plugin: BasePlugin) => {
    //             plugin.load(data[`${plugin.getPluginName()}Config`]);
    //         });
    // }

    static newColor(): ColorBuilder {
        return new ColorBuilder();
    }

    /**
     * Save data
     *
     * @example
     * get all the core and plug-in data
     *
     * @param univerSheet
     */
    // static toJson(univerSheet: UniverSheet): IComposedConfig {
    //     const SpreadsheetConfig = univerSheet.getSpreadsheet().save();
    //     const pluginConfig: Partial<IComposedConfig> = {};
    //     univerSheet.context
    //         .getPluginManager()
    //         .getPlugins()
    //         .forEach((plugin: BasePlugin) => {
    //             pluginConfig[`${plugin.getPluginName()}Config`] = plugin.save();
    //         });

    //     return { SpreadsheetConfig, ...pluginConfig };
    // }
    getUnitId(): string {
        return this._context.getSpreadsheet().getModel().getUnitId();
    }

    /**
     * install plugin
     *
     * @param plugin - install plugin
     */
    installPlugin(plugin: Plugin): void {
        this._context.getPluginManager().install(plugin);
    }

    /**
     * uninstall plugin
     *
     * @param name - plugin name
     */
    uninstallPlugin(name: string): void {
        this._context.getPluginManager().uninstall(name);
    }

    /**
     * get Spreadsheet
     *
     * @returns Spreadsheet
     */
    getSpreadsheet(): Spreadsheet {
        return this._context.getSpreadsheet();
    }

    refreshSpreadsheet(univerSheetData: Partial<ISpreadsheetConfig> = {}) {
        this._context.refreshSpreadsheet(univerSheetData);
    }
}
