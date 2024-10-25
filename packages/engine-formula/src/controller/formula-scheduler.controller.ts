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

import type { ISetDefinedNameMutationParam } from '../commands/mutations/set-defined-name.mutation';

/**
 * This controller dispose necessary API to upper layer plugins to call the formula engine, without knowing if the
 * formula engine is running in the same process or in a different process.
 */
export class FormulaSchedulerController {
    constructor() {
    }

    setDefinedName(params: ISetDefinedNameMutationParam): void {

    }
}
