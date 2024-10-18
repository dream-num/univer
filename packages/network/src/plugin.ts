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

import { Inject, Injector, Plugin, registerDependencies } from '@univerjs/core';
import { HTTPService } from './services/http/http.service';
import { IHTTPImplementation } from './services/http/implementations/implementation';
import { XHRHTTPImplementation } from './services/http/implementations/xhr';

/**
 * This plugin add network services to the Univer instance.
 */
export class UniverNetworkPlugin extends Plugin {
    static override pluginName = 'UNIVER_NETWORK_PLUGIN';

    constructor(
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [HTTPService],
            [IHTTPImplementation, { useClass: XHRHTTPImplementation }],
        ]);
    }
}
