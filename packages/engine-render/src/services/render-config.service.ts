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

/* eslint-disable ts/no-explicit-any */

import type { IRenderConfig } from './render-config';
import { debounceTime, Subject } from 'rxjs';

/**
 * This service carries managers render config that would be passed
 * to every widget, so some rendering could be optimized.
 *
 * @deprecated Will be replaced by ICanvasColorService.
 */
export class UniverRenderConfigService {
    private readonly _renderConfig: IRenderConfig = {
        ok: '111',
    };

    private readonly _updateSignal$ = new Subject<void>();
    readonly updateSignal$ = this._updateSignal$.pipe(debounceTime(4));

    setRenderConfig(key: string, value: any): void {
        if (value == null) {
            delete this._renderConfig[key];
            return;
        }

        this._renderConfig[key] = value;
    };

    getRenderConfig(): Readonly<Record<string, any>> {
        return this._renderConfig;
    }
}
