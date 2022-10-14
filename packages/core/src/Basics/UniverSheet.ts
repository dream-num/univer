import { Workbook } from '../Sheets/Domain';
import { IWorkbookConfig } from '../Interfaces';
import { Inject, IOCAttribute, IOCContainer } from '../IOC';
import { BasePlugin, Plugin } from '../Plugin';
import { IOHttp, IOHttpConfig, Logger } from '../Shared';
import { Bootstrap } from './Bootstrap';
import { Context } from './Context';
import { VersionCode, VersionEnv } from './Version';
import { ColorBuilder } from '../Sheets/Domain/ColorBuilder';

/**
 * Externally provided UniverSheet root instance
 */
export class UniverSheet {
    static newInstance(univerSheetData: Partial<IWorkbookConfig> = {}): UniverSheet {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: universheet :: ');
        const attribute = new IOCAttribute();
        attribute.setValue(univerSheetData);
        const container = new IOCContainer(attribute);
        Bootstrap(container);
        return container.getInstance('UniverSheet');
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
    static load<T extends { workbookConfig: IWorkbookConfig }>(
        sheet: UniverSheet,
        data: T
    ) {
        sheet.getWorkBook().load(data.workbookConfig);
        sheet.context
            .getPluginManager()
            .getPlugins()
            .forEach((plugin: BasePlugin) => {
                plugin.load(data[`${plugin.getPluginName()}Config`]);
            });
    }

    static newColor(): ColorBuilder {
        return new ColorBuilder();
    }

    @Inject('Context')
    private _context: Context;

    /**
     * get Context
     */
    get context() {
        return this._context;
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
     * get WorkBook
     *
     * @returns Workbook
     */
    getWorkBook(): Workbook {
        return this._context.getWorkBook();
    }

    /**
     * Save data
     *
     * @example
     * get all the core and plug-in data
     *
     * @param univerSheet
     */
    static toJson(univerSheet: UniverSheet) {
        const workbookConfig = univerSheet.getWorkBook().save();
        const pluginConfig = {};
        univerSheet.context
            .getPluginManager()
            .getPlugins()
            .forEach((plugin: BasePlugin) => {
                pluginConfig[`${plugin.getPluginName()}Config`] = plugin.save();
            });

        return { workbookConfig, ...pluginConfig };
    }
}
