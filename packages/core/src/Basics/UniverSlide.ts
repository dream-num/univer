import { ISlideData } from '../Types/Interfaces';
import { IOHttp, IOHttpConfig, Logger } from '../Shared';
import { VersionCode, VersionEnv } from './Version';
import { ColorBuilder } from '../Sheets/Domain/ColorBuilder';

/**
 * Externally provided UniverSlide root instance
 */
export class UniverSlide {
    UniverSlideConfig: Partial<ISlideData>;

    constructor(UniverSlideData: Partial<ISlideData> = {}) {
        this.UniverSlideConfig = UniverSlideData;
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
}