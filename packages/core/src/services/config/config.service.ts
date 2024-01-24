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
    setConfig(id: string, value: unknown): void;
    deleteConfig(id: string): void;
}

export class ConfigService implements IConfigService {
    private readonly _config: Map<string, any> = new Map();

    getConfig<T>(id: string): Nullable<T> {
        return this._config.get(id) as T;
    }

    setConfig(id: string, value: unknown) {
        this._config.set(id, value);
    }

    deleteConfig(id: string): void {
        this._config.delete(id);
    }
}
