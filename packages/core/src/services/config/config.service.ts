import { createIdentifier } from '@wendellhu/redi';

import { IKeyValue } from '../../Shared/Types';

export const IConfigService = createIdentifier<IConfigService>('univer.config-service');

export interface IConfigService {
    getConfig<T>(id: string): T | undefined;
}

const BUILT_IN_CONFIG: IKeyValue = {
    maxCellsPerSheet: 1_000_000,
};

export class ConfigService implements IConfigService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly _config = new Map<string, any>();

    constructor() {
        this._initBuiltInConfig();
    }

    getConfig<T>(id: string): T | undefined {
        return this._config.get(id) as T;
    }

    private _initBuiltInConfig(): void {
        Object.keys(BUILT_IN_CONFIG).forEach((key) => {
            this._config.set(key, BUILT_IN_CONFIG[key]);
        });
    }
}
