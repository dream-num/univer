import { createIdentifier } from '@wendellhu/redi';

import { IKeyValue, Nullable } from '../../shared/types';

export const IConfigService = createIdentifier<IConfigService>('univer.config-service');

export interface IConfigService {
    getConfig<T>(unitId: string, id: string): Nullable<T>;
    setConfig(unitId: string, id: string, value: any): void;
    batchSettings(unitId: string, config: { [key: string]: any }): void;
}

const BUILT_IN_CONFIG: IKeyValue = {
    maxCellsPerSheet: 1_000_000,
};

export class ConfigService implements IConfigService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly _config: Map<string, Map<string, any>> = new Map();

    constructor() {
        this._initBuiltInConfig();
    }

    getConfig<T>(unitId: string, id: string): Nullable<T> {
        return this._config.get(unitId)?.get(id) as T;
    }

    setConfig(unitId: string, id: string, value: any) {
        let unit = this._config.get(unitId);
        if (unit == null) {
            this._config.set(unitId, new Map());
            unit = this._config.get(unitId);
        }

        unit!.set(id, value);
    }

    batchSettings(unitId: string, config: { [key: string]: any }) {
        const keys = Object.keys(config);
        keys.forEach((key: string) => {
            this.setConfig(unitId, key, config[key]);
        });
    }

    private _initBuiltInConfig(): void {
        Object.keys(BUILT_IN_CONFIG).forEach((key) => {
            this._config.set(key, BUILT_IN_CONFIG[key]);
        });
    }
}
