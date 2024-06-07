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
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetDefinedNameMap,
} from './basics/common';
export { isInDirtyRange } from './basics/dirty';
export { ErrorType, ERROR_TYPE_SET } from './basics/error-type';
export { FunctionType, type IFunctionInfo, type IFunctionParam } from './basics/function';
export { type IFunctionNames } from './basics/function';
export { includeFormulaLexerToken, isFormulaLexerToken, normalizeSheetName } from './basics/match-token';
export { convertUnitDataToRuntime } from './basics/runtime';
export { matchToken, compareToken, operatorToken } from './basics/token';
export { RegisterFunctionMutation } from './commands/mutations/register-function.mutation';
export {
    type ISetArrayFormulaDataMutationParams,
    SetArrayFormulaDataMutation,
} from './commands/mutations/set-array-formula-data.mutation';

export { RemoveDefinedNameMutation, SetDefinedNameMutation, type ISetDefinedNameMutationSearchParam, type ISetDefinedNameMutationParam } from './commands/mutations/set-defined-name.mutation';
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
export { RemoveOtherFormulaMutation, SetOtherFormulaMutation, type ISetOtherFormulaMutationParams, type IRemoveOtherFormulaMutationParams } from './commands/mutations/set-other-formula.mutation';
export {
    RemoveSuperTableMutation,
    SetSuperTableMutation,
    SetSuperTableOptionMutation,
} from './commands/mutations/set-super-table.mutation';
export { UnregisterFunctionMutation } from './commands/mutations/unregister-function.mutation';
export { LexerNode } from './engine/analysis/lexer-node';
export { LexerTreeBuilder } from './engine/analysis/lexer-tree-builder';
export { BaseReferenceObject, type FunctionVariantType } from './engine/reference-object/base-reference-object';
export { RangeReferenceObject } from './engine/reference-object/range-reference-object';
export { deserializeRangeForR1C1 } from './engine/utils/r1c1-reference';
export {
    deserializeRangeWithSheet,
    getAbsoluteRefTypeWithSingleString,
    getAbsoluteRefTypeWitString,
    type IAbsoluteRefTypeForRange,
    serializeRange,
    serializeRangeToRefString,
    serializeRangeWithSheet,
    serializeRangeWithSpreadsheet,
    isReferenceStringWithEffectiveColumn,
    getRangeWithRefsString,
    isReferenceStrings,
    singleReferenceToGrid,
} from './engine/utils/reference';
export { generateStringWithSequence, type ISequenceNode, sequenceNodeType } from './engine/utils/sequence';
export { ArrayValueObject, ValueObjectFactory } from './engine/value-object/array-value-object';
export { BaseValueObject, ErrorValueObject } from './engine/value-object/base-value-object';
export { BooleanValue } from './basics/common';
export type { PrimitiveValueType } from './engine/value-object/primitive-object';
export { NumberValueObject } from './engine/value-object/primitive-object';
export { BooleanValueObject } from './engine/value-object/primitive-object';
export { StringValueObject, NullValueObject } from './engine/value-object/primitive-object';
export { functionArray } from './functions/array/function-map';
export { FUNCTION_NAMES_ARRAY } from './functions/array/function-names';
export { BaseFunction } from './functions/base-function';
export { functionCompatibility } from './functions/compatibility/function-map';
export { FUNCTION_NAMES_COMPATIBILITY } from './functions/compatibility/function-names';
export { functionCube } from './functions/cube/function-map';
export { FUNCTION_NAMES_CUBE } from './functions/cube/function-names';
export { functionDatabase } from './functions/database/function-map';
export { FUNCTION_NAMES_DATABASE } from './functions/database/function-names';
export { functionDate } from './functions/date/function-map';
export { FUNCTION_NAMES_DATE } from './functions/date/function-names';
export { functionEngineering } from './functions/engineering/function-map';
export { FUNCTION_NAMES_ENGINEERING } from './functions/engineering/function-names';
export { functionFinancial } from './functions/financial/function-map';
export { FUNCTION_NAMES_FINANCIAL } from './functions/financial/function-names';
export { functionInformation } from './functions/information/function-map';
export { FUNCTION_NAMES_INFORMATION } from './functions/information/function-names';
export { functionLogical } from './functions/logical/function-map';
export { FUNCTION_NAMES_LOGICAL } from './functions/logical/function-names';
export { functionLookup } from './functions/lookup/function-map';
export { FUNCTION_NAMES_LOOKUP } from './functions/lookup/function-names';
export { functionMath } from './functions/math/function-map';
export { FUNCTION_NAMES_MATH } from './functions/math/function-names';
export { functionMeta } from './functions/meta/function-map';
export { functionStatistical } from './functions/statistical/function-map';
export { FUNCTION_NAMES_STATISTICAL } from './functions/statistical/function-names';
export { functionText } from './functions/text/function-map';
export { FUNCTION_NAMES_TEXT } from './functions/text/function-names';
export { functionUniver } from './functions/univer/function-map';
export { FUNCTION_NAMES_UNIVER } from './functions/univer/function-names';
export { functionWeb } from './functions/web/function-map';
export { FUNCTION_NAMES_WEB } from './functions/web/function-names';
export { FormulaDataModel } from './models/formula-data.model';
export { initSheetFormulaData } from './models/formula-data.model';
export { UniverFormulaEnginePlugin } from './plugin';
export { CalculateFormulaService } from './services/calculate-formula.service';
export {
    FeatureCalculationManagerService,
    IFeatureCalculationManagerService,
} from './services/feature-calculation-manager.service';
export { FunctionService } from './services/function.service';
export { IFunctionService } from './services/function.service';
export { IOtherFormulaManagerService, OtherFormulaManagerService } from './services/other-formula-manager.service';
export { FormulaExecuteStageType, type IExecutionInProgressParams } from './services/runtime.service';
export { FormulaExecutedStateType, type IAllRuntimeData } from './services/runtime.service';
export { isReferenceString } from './basics/regex';
export { matchRefDrawToken } from './basics/match-token';
export { IDefinedNamesService, DefinedNamesService, type IDefinedNamesServiceParam, type IDefinedNameMapItem } from './services/defined-names.service';
export { isFormulaTransformable, transformFormula } from './engine/utils/relative-formula';
export { IFormulaRuntimeService, FormulaRuntimeService } from './services/runtime.service';
export { IFormulaCurrentConfigService, FormulaCurrentConfigService } from './services/current-data.service';

export { IActiveDirtyManagerService } from './services/active-dirty-manager.service';

export type { IRangeChange } from './models/formula-data.model';
export { handleNumfmtInCell } from './engine/utils/numfmt-kit';
export { AsyncArrayObject } from './engine/reference-object/base-reference-object';
export { strip, stripErrorMargin } from './engine/utils/math-kit';
export { AsyncObject } from './engine/reference-object/base-reference-object';
