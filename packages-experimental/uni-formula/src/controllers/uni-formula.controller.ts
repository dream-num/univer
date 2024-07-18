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

import { IUniverInstanceService } from '@univerjs/core';

/**
 * This controller is responsible for registering formulas into `UniFormulaService`,
 * when a doc is loaded or a new formula is created. It is also responsible for un-registering
 * formula at current time.
 */
export class UniFormulaController {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceSrv: IUniverInstanceService
    ) {

    }
}

