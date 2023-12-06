import { createIdentifier } from '@wendellhu/redi';

import type { Nullable } from '../../shared/types';

// WARNING!!! Do not set per unit config here! You can definitely find a better place to do that.

/**
 * IConfig provides universal configuration for the whole application.
 */
export const IConfigService = createIdentifier<IConfigService>('univer.config-service');
export interface IConfigService {
    getConfig<T>(id: string, defaultValue: T): T;
    getConfig<T>(id: string): Nullable<T>;
    setConfig(id: string, value: any): void;
    deleteConfig(id: string): void;
}

export class ConfigService implements IConfigService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly _config: Map<string, any> = new Map();

    getConfig<T>(id: string): Nullable<T> {
        return this._config.get(id) as T;
    }

    setConfig(id: string, value: any) {
        this._config.set(id, value);
    }

    deleteConfig(id: string): void {
        this._config.delete(id);
    }
}
