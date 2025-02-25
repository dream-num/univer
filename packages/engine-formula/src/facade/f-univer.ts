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

import { FUniver } from '@univerjs/core/facade';
import { FFormula } from './f-formula';

/**
 * @ignore
 */
export interface IFUniverEngineFormulaMixin {
    getFormula(): FFormula;
}

export class FUniverEngineFormulaMixin extends FUniver implements IFUniverEngineFormulaMixin {
    override getFormula(): FFormula {
        return this._injector.createInstance(FFormula);
    }
}

FUniver.extend(FUniverEngineFormulaMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverEngineFormulaMixin {}
}
