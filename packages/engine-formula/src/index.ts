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

export type {
    IArrayFormulaRangeType,
    IArrayFormulaUnitCellType,
    IDirtyUnitFeatureMap,
    IDirtyUnitSheetNameMap,
    IFormulaData,
    IFormulaDataItem,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitSheetNameMap,
} from './basics/common';
export { isInDirtyRange } from './basics/dirty';
export { ErrorType } from './basics/error-type';
export { FunctionType, type IFunctionInfo, type IFunctionParam } from './basics/function';
export { type IFunctionNames } from './basics/function';
export { includeFormulaLexerToken, isFormulaLexerToken, normalizeSheetName } from './basics/match-token';
export { matchToken } from './basics/token';
export { compareToken } from './basics/token';
export {
    type ISetArrayFormulaDataMutationParams,
    SetArrayFormulaDataMutation,
    SetArrayFormulaDataUndoMutationFactory,
} from './commands/mutations/set-array-formula-data.mutation';
export { RemoveDefinedNameMutation, SetDefinedNameMutation } from './commands/mutations/set-defined-name.mutation';
export {
    RemoveFeatureCalculationMutation,
    SetFeatureCalculationMutation,
} from './commands/mutations/set-feature-calculation.mutation';
export {
    type ISetFormulaCalculationNotificationMutation,
    type ISetFormulaCalculationResultMutation,
    type ISetFormulaCalculationStartMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from './commands/mutations/set-formula-calculation.mutation';
export {
    type ISetFormulaDataMutationParams,
    SetFormulaDataMutation,
} from './commands/mutations/set-formula-data.mutation';
export { RemoveOtherFormulaMutation, SetOtherFormulaMutation } from './commands/mutations/set-other-formula.mutation';
export {
    RemoveSuperTableMutation,
    SetSuperTableMutation,
    SetSuperTableOptionMutation,
} from './commands/mutations/set-super-table.mutation';
export { LexerNode } from './engine/analysis/lexer-node';
export { LexerTreeBuilder } from './engine/analysis/lexer-tree-builder';
export { ErrorValueObject } from './engine/other-object/error-value-object';
export { BaseReferenceObject, type FunctionVariantType } from './engine/reference-object/base-reference-object';
export { RangeReferenceObject } from './engine/reference-object/range-reference-object';
export { generateStringWithSequence, type ISequenceNode, sequenceNodeType } from './engine/utils/sequence';
export { ArrayValueObject, ValueObjectFactory } from './engine/value-object/array-value-object';
export { BaseValueObject } from './engine/value-object/base-value-object';
export { NumberValueObject } from './engine/value-object/primitive-object';
export { BooleanValueObject } from './engine/value-object/primitive-object';
export { StringValueObject } from './engine/value-object/primitive-object';
export { FUNCTION_NAMES_ARRAY } from './functions/array/function-names';
export { BaseFunction } from './functions/base-function';
export { FUNCTION_NAMES_COMPATIBILITY } from './functions/compatibility/function-names';
export { FUNCTION_NAMES_CUBE } from './functions/cube/function-names';
export { FUNCTION_NAMES_DATABASE } from './functions/database/function-names';
export { FUNCTION_NAMES_DATE } from './functions/date/function-names';
export { FUNCTION_NAMES_ENGINEERING } from './functions/engineering/function-names';
export { FUNCTION_NAMES_FINANCIAL } from './functions/financial/function-names';
export { FUNCTION_NAMES_INFORMATION } from './functions/information/function-names';
export { FUNCTION_NAMES_LOGICAL } from './functions/logical/function-names';
export { FUNCTION_NAMES_LOOKUP } from './functions/lookup/function-names';
export { FUNCTION_NAMES_MATH } from './functions/math/function-names';
export { FUNCTION_NAMES_STATISTICAL } from './functions/statistical/function-names';
export { FUNCTION_NAMES_TEXT } from './functions/text/function-names';
export { FUNCTION_NAMES_UNIVER } from './functions/univer/function-names';
export { FUNCTION_NAMES_WEB } from './functions/web/function-names';
export { FormulaDataModel } from './models/formula-data.model';
export { initSheetFormulaData } from './models/formula-data.model';
export { UniverFormulaEngine } from './plugin';
export { CalculateFormulaService } from './services/calculate-formula.service';
export {
    FeatureCalculationManagerService,
    IFeatureCalculationManagerService,
} from './services/feature-calculation-manager.service';
export { FunctionService } from './services/function.service';
export { IFunctionService } from './services/function.service';
export { type IOtherFormulaManagerService, OtherFormulaManagerService } from './services/other-formula-manager.service';
export { FormulaExecuteStageType, type IExecutionInProgressParams } from './services/runtime.service';
export { FormulaExecutedStateType, type IAllRuntimeData } from './services/runtime.service';
