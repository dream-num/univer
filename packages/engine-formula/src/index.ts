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

export type { BaseAstNode } from './engine/ast-node/base-ast-node.js';
export { generateExecuteAstNodeData } from './engine/utils/ast-node-tool';
export { getObjectValue } from './functions/util';

export type {
    IArrayFormulaRangeType,
    IArrayFormulaUnitCellType,
    IDirtyUnitFeatureMap,
    IDirtyUnitOtherFormulaMap,
    IDirtyUnitSheetDefinedNameMap,
    IDirtyUnitSheetNameMap,
    IFeatureDirtyRangeType,
    IFormulaData,
    IFormulaDataItem,
    IFormulaDatasetConfig,
    IRuntimeUnitDataType,
    ISheetData,
    IUnitData,
    IUnitSheetNameMap,
} from './basics/common';
export { BooleanValue } from './basics/common';
export { isInDirtyRange } from './basics/dirty';
export { ERROR_TYPE_SET, ErrorType } from './basics/error-type';
export { FunctionType, type IFunctionInfo, type IFunctionParam } from './basics/function';
export { type IFunctionNames } from './basics/function';
export { includeFormulaLexerToken, isFormulaLexerToken, normalizeSheetName } from './basics/match-token';
export { convertUnitDataToRuntime } from './basics/runtime';
export { compareToken, matchToken, operatorToken } from './basics/token';
export { matchRefDrawToken } from './basics/match-token';

export { isReferenceString } from './basics/regex';
export { RegisterFunctionMutation } from './commands/mutations/register-function.mutation';
export { type ISetArrayFormulaDataMutationParams, SetArrayFormulaDataMutation } from './commands/mutations/set-array-formula-data.mutation';
export { type ISetDefinedNameMutationParam, type ISetDefinedNameMutationSearchParam, RemoveDefinedNameMutation, SetDefinedNameMutation } from './commands/mutations/set-defined-name.mutation';
export { SetDefinedNameMutationFactory } from './commands/mutations/set-defined-name.mutation';
export { RemoveFeatureCalculationMutation, SetFeatureCalculationMutation } from './commands/mutations/set-feature-calculation.mutation';
export {
    type ISetFormulaCalculationNotificationMutation,
    type ISetFormulaCalculationResultMutation,
    type ISetFormulaCalculationStartMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
} from './commands/mutations/set-formula-calculation.mutation';
export { type ISetFormulaDataMutationParams, SetFormulaDataMutation } from './commands/mutations/set-formula-data.mutation';
export { type IRemoveOtherFormulaMutationParams, type ISetOtherFormulaMutationParams, RemoveOtherFormulaMutation, SetOtherFormulaMutation } from './commands/mutations/set-other-formula.mutation';
export { RemoveSuperTableMutation, SetSuperTableMutation, SetSuperTableOptionMutation } from './commands/mutations/set-super-table.mutation';
export { CalculateController } from './controller/calculate.controller';
export { Lexer } from './engine/analysis/lexer';
export { LexerNode } from './engine/analysis/lexer-node';
export { LexerTreeBuilder } from './engine/analysis/lexer-tree-builder';
export { AstTreeBuilder } from './engine/analysis/parser';
export { AstRootNodeFactory } from './engine/ast-node/ast-root-node';
export { FunctionNodeFactory } from './engine/ast-node/function-node';
export { LambdaNodeFactory } from './engine/ast-node/lambda-node';
export { LambdaParameterNodeFactory } from './engine/ast-node/lambda-parameter-node';
export { OperatorNodeFactory } from './engine/ast-node/operator-node';
export { PrefixNodeFactory } from './engine/ast-node/prefix-node';
export { ReferenceNodeFactory } from './engine/ast-node/reference-node';
export { SuffixNodeFactory } from './engine/ast-node/suffix-node';
export { UnionNodeFactory } from './engine/ast-node/union-node';
export { ValueNodeFactory } from './engine/ast-node/value-node';
export { FormulaDependencyGenerator, IFormulaDependencyGenerator } from './engine/dependency/formula-dependency';
export { Interpreter } from './engine/interpreter/interpreter';
export { BaseReferenceObject, type FunctionVariantType } from './engine/reference-object/base-reference-object';
export { AsyncArrayObject, AsyncObject } from './engine/reference-object/base-reference-object';
export { RangeReferenceObject } from './engine/reference-object/range-reference-object';
export { strip, stripErrorMargin } from './engine/utils/math-kit';
export { handleNumfmtInCell } from './engine/utils/numfmt-kit';
export { deserializeRangeForR1C1 } from './engine/utils/r1c1-reference';
export {
    deserializeRangeWithSheet,
    getAbsoluteRefTypeWithSingleString,
    getAbsoluteRefTypeWitString,
    getRangeWithRefsString,
    type IAbsoluteRefTypeForRange,
    isReferenceStrings,
    isReferenceStringWithEffectiveColumn,
    serializeRange,
    serializeRangeToRefString,
    serializeRangeWithSheet,
    serializeRangeWithSpreadsheet,
    singleReferenceToGrid,
} from './engine/utils/reference';
export { handleRefStringInfo } from './engine/utils/reference';
export { generateStringWithSequence, type ISequenceNode, sequenceNodeType } from './engine/utils/sequence';
export { ArrayValueObject, ValueObjectFactory } from './engine/value-object/array-value-object';
export { BaseValueObject, ErrorValueObject } from './engine/value-object/base-value-object';
export type { FormulaFunctionResultValueType, FormulaFunctionValueType, PrimitiveValueType } from './engine/value-object/primitive-object';
export { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from './engine/value-object/primitive-object';
export { functionArray } from './functions/array/function-map';
export { FUNCTION_NAMES_ARRAY } from './functions/array/function-names';
export { BaseFunction } from './functions/base-function';
export { functionCompatibility } from './functions/compatibility/function-map';
export { FUNCTION_NAMES_COMPATIBILITY } from './functions/compatibility/function-names';
export { functionCube } from './functions/cube/function-map';
export { FUNCTION_NAMES_CUBE } from './functions/cube/function-names';
export { AsyncCustomFunction, CustomFunction } from './functions/custom-function';
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
export type { IRangeChange } from './models/formula-data.model';
export { UniverFormulaEnginePlugin } from './plugin';
export { GlobalComputingStatusService } from './services/global-computing-status.service';
export { ActiveDirtyManagerService, IActiveDirtyManagerService } from './services/active-dirty-manager.service';
export { ISheetRowFilteredService, SheetRowFilteredService } from './services/sheet-row-filtered.service';
export { CalculateFormulaService, ICalculateFormulaService } from './services/calculate-formula.service';
export { FormulaCurrentConfigService, IFormulaCurrentConfigService, type IFormulaDirtyData } from './services/current-data.service';
export { DefinedNamesService, type IDefinedNameMapItem, IDefinedNamesService, type IDefinedNamesServiceParam } from './services/defined-names.service';
export { IDependencyManagerService } from './services/dependency-manager.service';
export { DependencyManagerService } from './services/dependency-manager.service';
export { FeatureCalculationManagerService, IFeatureCalculationManagerService } from './services/feature-calculation-manager.service';
export { FunctionService } from './services/function.service';
export { IFunctionService } from './services/function.service';
export { IOtherFormulaManagerService, OtherFormulaManagerService } from './services/other-formula-manager.service';
export { FormulaExecutedStateType, FormulaExecuteStageType, FormulaRuntimeService, type IAllRuntimeData, type IExecutionInProgressParams, IFormulaRuntimeService } from './services/runtime.service';
export { ISuperTableService } from './services/super-table.service';
export { SuperTableService } from './services/super-table.service';
export { deserializeRangeWithSheetWithCache } from './engine/utils/reference-cache';
export { FormulaDependencyTree, type IFormulaDependencyTree } from './engine/dependency/dependency-tree';
export { type IOtherFormulaData } from './basics/common';
export { FormulaDependencyTreeType } from './engine/dependency/dependency-tree';
export { FormulaDependencyTreeVirtual } from './engine/dependency/dependency-tree';
export { generateAstNode } from './engine/utils/generate-ast-node';
export { type IFeatureCalculationManagerParam } from './services/feature-calculation-manager.service';
export { DEFAULT_INTERVAL_COUNT } from './services/calculate-formula.service';
export { ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, ENGINE_FORMULA_PLUGIN_CONFIG_KEY, type IUniverEngineFormulaConfig } from './controller/config.schema';

export { generateRandomDependencyTreeId } from './engine/dependency/formula-dependency';
export { DependencyManagerBaseService } from './services/dependency-manager.service';
export { LambdaValueObjectObject } from './engine/value-object/lambda-value-object';
export { type IUnitRowData } from './basics/common';
