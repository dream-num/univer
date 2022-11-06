import { ISlideData } from '../Interfaces';
import { Plugin } from '../Plugin';
import { IOHttp, IOHttpConfig, Logger } from '../Shared';
import { SlideContext } from './SlideContext';
import { VersionCode, VersionEnv } from './Version';
import { ColorBuilder } from '../Sheets/Domain/ColorBuilder';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide {
    UniverSlideConfig: Partial<ISlideData>;

    constructor(UniverSlideData: Partial<ISlideData> = {}) {
        this.UniverSlideConfig = UniverSlideData;
        this._context = new SlideContext(UniverSlideData);
    }

    static newInstance(UniverSlideData: Partial<ISlideData> = {}): UniverSlide {
        Logger.capsule(VersionEnv, VersionCode, 'powered by :: UniverSlide :: ');
        return new UniverSlide(UniverSlideData);
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

    static newColor(): ColorBuilder {
        return new ColorBuilder();
    }

    private _context: SlideContext;

    /**
     * get SlideContext
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
}
