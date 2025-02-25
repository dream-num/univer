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

import { createIdentifier, Disposable, ILogService, Inject, Injector } from '@univerjs/core';
// eslint-disable-next-line univer/no-facade-imports-outside-facade
import { FUniver } from '@univerjs/core/facade';

export const IUniscriptExecutionService = createIdentifier<IUniscriptExecutionService>('univer.uniscript.execution-service');

export interface IUniscriptExecutionService {
    execute(code: string): Promise<boolean>;
}
/**
 * This service is to execute Uniscript code.
 */
export class UniscriptExecutionService extends Disposable implements IUniscriptExecutionService {
    constructor(
        @ILogService private readonly _logService: ILogService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    async execute(code: string): Promise<boolean> {
        this._logService.log('[UniscriptExecutionService]', 'executing Uniscript...');

        const apiInstance = FUniver.newAPI(this._injector);
        // eslint-disable-next-line no-new-func
        const scriptFunction = new Function('univerAPI', `(() => {${code}})()`);

        try {
            scriptFunction(apiInstance);
            return true;
        } catch (e) {
            this._logService.error(e);
            return false;
        }
    }
}
