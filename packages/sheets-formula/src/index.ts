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

export { UniverSheetsFormulaPlugin } from './formula-ui-plugin';
export { IDescriptionService } from './services/description.service';
export { DescriptionService } from './services/description.service';
export {
    FormulaCustomFunctionService,
    IFormulaCustomFunctionService,
} from './services/formula-custom-function.service';
export type { IRegisterFunctionParams, IUnregisterFunctionParams } from './services/register-function.service';
export { RegisterFunctionService } from './services/register-function.service';
export { IRegisterFunctionService } from './services/register-function.service';
export { FormulaRefRangeService } from './services/formula-ref-range.service';
export { SPECIAL_PASTE_FORMULA } from './commands/commands/formula-clipboard.command';
export { RegisterOtherFormulaService } from './services/register-other-formula.service';
export type { IFormulaInfo, IOtherFormulaResult } from './services/formula-common';
