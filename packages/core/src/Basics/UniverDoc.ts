import { IDocumentData } from '../Types/Interfaces';
import { Plugin } from '../Plugin';
import { IOHttp, IOHttpConfig } from '../Shared';
import { DocContext } from './DocContext';
import { CommandManager } from '../Command/CommandManager';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc {
    univerDocConfig: Partial<IDocumentData>;

    private _context: DocContext;

    constructor(univerDocData: Partial<IDocumentData> = {}, private commandManager: CommandManager) {
        this.univerDocConfig = univerDocData;
        this._context = new DocContext(univerDocData, this.commandManager);
    }

    /**
     * get DocContext
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
     * get unit id
     */
    getUnitId(): string {
        return this._context.getDocument().getUnitId();
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
}
