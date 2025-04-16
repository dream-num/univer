/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisposable } from '../../common/di';
import type { Nullable } from '../../shared/types';
import { merge } from 'lodash-es';
import { filter, Observable, Subject } from 'rxjs';
import { createIdentifier } from '../../common/di';

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
    getConfig<T>(id: string | symbol): Nullable<T>;
    setConfig(id: string | symbol, value: unknown, options?: IConfigOptions): void;
    deleteConfig(id: string): boolean;
    subscribeConfigValue$<T = unknown>(key: string): Observable<T>;

}

export class ConfigService implements IConfigService, IDisposable {
    private _configChanged$ = new Subject<{ [key: string]: unknown }>();
    readonly configChanged$ = this._configChanged$.asObservable();

    private readonly _config: Map<string | symbol, any> = new Map();

    dispose(): void {
        this._configChanged$.complete();
    }

    getConfig<T>(id: string | symbol): Nullable<T> {
        return this._config.get(id) as T;
    }

    setConfig(id: string, value: unknown, options?: IConfigOptions): void {
        const { merge: isMerge = false } = options || {};

        let nextValue = this._config.get(id) ?? {};

        if (isMerge) {
            nextValue = merge(nextValue, value);
        } else {
            nextValue = value;
        }

        this._config.set(id, nextValue);
        this._configChanged$.next({ [id]: nextValue });
    }

    deleteConfig(id: string | symbol): boolean {
        return this._config.delete(id);
    }

    subscribeConfigValue$<T = unknown>(key: string): Observable<T> {
        return new Observable<T>((observer) => {
            if (Object.prototype.hasOwnProperty.call(this._config, key)) {
                observer.next(this._config.get(key) as T);
            }

            const sub = this.configChanged$
                .pipe(filter((c) => Object.prototype.hasOwnProperty.call(c, key)))
                .subscribe((c) => observer.next(c[key] as T));

            return () => sub.unsubscribe();
        });
    }
}
