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

export { UniverDocUniFormulaPlugin } from './plugin';
export { DumbUniFormulaService, IUniFormulaService } from './services/uni-formula.service';
export { UNI_FORMULA_PLUGIN_NAME as DOC_FORMULA_PLUGIN_NAME } from './const';
export type { IDocFormulaCache, IDocFormulaData, IDocFormulaReference } from './models/doc-formula';
export type { ISlideFormulaCache, ISlideFormulaData, ISlideFormulaReference } from './models/slide-formula';

// #region - all commands

export {
    AddDocUniFormulaMutation,
    type IAddDocUniFormulaMutationParams,
    type IRemoveDocUniFormulaMutationParams,
    type IUpdateDocUniFormulaMutationParams,
    RemoveDocUniFormulaMutation,
    UpdateDocUniFormulaMutation,
} from './commands/mutations/doc-formula.mutation';

// #endregion
