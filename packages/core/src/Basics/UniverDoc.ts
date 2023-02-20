import { IDocumentData } from '../Interfaces';
import { Plugin } from '../Plugin';
import { IOHttp, IOHttpConfig, Logger } from '../Shared';
import { DocContext } from './DocContext';
import { VersionCode, VersionEnv } from './Version';

/**
 * Externally provided UniverDoc root instance
 */
export class UniverDoc {
    univerDocConfig: Partial<IDocumentData>;

    private _context: DocContext;

    constructor(UniverDocData: Partial<IDocumentData> = {}) {
        this.univerDocConfig = UniverDocData;
        this._context = new DocContext(UniverDocData);
    }

    /**
     * get DocContext
     */
    get context() {
        return this._context;
    }

    static newInstance(UniverDocData: Partial<IDocumentData> = {}): UniverDoc {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: UniverDoc :: ');
        return new UniverDoc(UniverDocData);
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
