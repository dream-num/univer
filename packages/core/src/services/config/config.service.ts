/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createIdentifier } from '../../common/di';
import { Tools } from '../../shared';

import type { Nullable } from '../../shared/types';

// WARNING!!! Do not set per unit config here! You can definitely find a better place to do that.

/**
 * IConfig provides universal configuration for the whole application.
 */
export const IConfigService = createIdentifier<IConfigService>('univer.config-service');

interface IConfigOptions {
    /**
     * Whether the configuration is read-only.
     * Not implemented yet.
     * @ignore
     */
    readonly?: boolean;

    /**
     * Whether to merge the configuration with the existing one.
     * @default false
     */
    merge?: boolean;
}

export interface IConfigService {
    getConfig<T>(id: string): Nullable<T>;
    setConfig(id: string | symbol, value: unknown, options?: IConfigOptions): void;
    deleteConfig(id: string): boolean;
}

export class ConfigService implements IConfigService {
    private readonly _config: Map<string | symbol, any> = new Map();

    getConfig<T>(id: string | symbol): Nullable<T> {
        return this._config.get(id) as T;
    }

    setConfig(id: string, value: unknown, options?: IConfigOptions): void {
        const { merge = false } = options || {};

        const existingValue = this._config.get(id) ?? {};

        if (merge) {
            this._config.set(id, Tools.deepMerge(existingValue, value));

            return;
        }

        this._config.set(id, value);
    }

    deleteConfig(id: string | symbol): boolean {
        return this._config.delete(id);
    }
}
