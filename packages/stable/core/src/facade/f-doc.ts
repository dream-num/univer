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

import type { DocumentDataModel } from '@univerjs/core';
import { Inject, Injector } from '@univerjs/core';
import { FBaseInitialable } from './f-base';

/**
 * @ignore
 * @hideconstructor
 */
export class FDoc extends FBaseInitialable {
    constructor(
        protected doc: DocumentDataModel,
        @Inject(Injector) _injector: Injector
    ) {
        super(_injector);
    }
}
