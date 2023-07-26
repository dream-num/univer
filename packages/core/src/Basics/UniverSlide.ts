import { ISlideData } from '../Types/Interfaces';
import { Plugin } from '../Plugin';
import { IOHttp, IOHttpConfig } from '../Shared';
import { SlideContext } from './SlideContext';
import { CommandManager } from '../Command/CommandManager';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide {
    private _context: SlideContext;

    constructor(univerSlideData: Partial<ISlideData> = {}, private commandManager: CommandManager) {
        this._context = new SlideContext(univerSlideData, this.commandManager);
    }

    /**
     * get SlideContext
     */
    get context() {
        return this._context;
    }

    /**
     * get universlide id
     * @returns
     */
    getUnitId(): string {
        return this._context.getSlide().getModel().getUnitId();
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
