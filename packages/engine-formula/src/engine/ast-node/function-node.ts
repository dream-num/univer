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

import type { ICellData, IRange } from '@univerjs/core';

import type { BaseFunction } from '../../functions/base-function';
import type { ArgumentArrayContext } from '../../functions/implicit-intersection-arguments';
import type { LexerNode } from '../analysis/lexer-node';
import type {
    AsyncArrayObject,
    AsyncObject,
    BaseReferenceObject,
    FunctionVariantType,
    NodeValueType,
} from '../reference-object/base-reference-object';
import type { MultiAreaReferenceObject } from '../reference-object/multi-area-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import type { FormulaFunctionResultValueType } from '../value-object/primitive-object';
import { DateSystem, Inject, Injector } from '@univerjs/core';
import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { normalizeFunctionToken } from '../../basics/function';
import { matchToken } from '../../basics/token';
import { COLUMN_LIKE_FUNCTION_NAMES } from '../../functions/column-like-functions';
import { excelArgumentAcceptsRange, getNestedArgumentArrayContext } from '../../functions/implicit-intersection-arguments';
import { If } from '../../functions/logical/if';
import { FUNCTION_NAMES_LOOKUP } from '../../functions/lookup/function-names';
import { Indirect } from '../../functions/lookup/indirect';
import { FUNCTION_NAMES_MATH } from '../../functions/math/function-names';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { FormulaDataModel } from '../../models/formula-data.model';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDefinedNamesService } from '../../services/defined-names.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { ISuperTableService } from '../../services/super-table.service';
import { IFormulaUnitReferenceResolver } from '../../services/unit-reference-resolver.service';
import { getFixedArrayResultRange, isExplicitDynamicArrayFormula } from '../utils/array-object';
import { prefixHandler } from '../utils/prefix-handler';
import { ArrayValueObject, transformToValueObject, ValueObjectFactory } from '../value-object/array-value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class FunctionNode extends BaseAstNode {
    private _addressDependencies?: readonly BaseReferenceObject[];

    constructor(
        token: string,
        private _functionExecutor: BaseFunction,
        private _currentConfigService: IFormulaCurrentConfigService,
        private _runtimeService: IFormulaRuntimeService,
        private _definedNamesService: IDefinedNamesService,
        private _formulaDataModel: FormulaDataModel,
        private _unitReferenceResolver: IFormulaUnitReferenceResolver
    ) {
        super(token);

        if (this._functionExecutor.isAsync()) {
            this.setAsync();
        }

        if (this._functionExecutor.isAddress()) {
            this.setAddress();
        }

        if (this._functionExecutor.needsLocale) {
            this._setLocale();
        }
        this._functionExecutor.bindCalculationRegion?.(() => _currentConfigService.getCalculationRegion());
        this._functionExecutor.bindCalculationTimestamp?.(() => _currentConfigService.getCalculationTimestamp?.() ?? Date.now());
        this._functionExecutor.bindExplicitDynamicArrayFormula?.(() => {
            const { currentUnitId, currentSubUnitId, currentRow, currentColumn } = _runtimeService;
            return isExplicitDynamicArrayFormula(_currentConfigService, currentUnitId, currentSubUnitId, currentRow, currentColumn);
        });

        if (this._functionExecutor.needsFormulaDataModel) {
            this._functionExecutor.setFormulaDataModel(this._formulaDataModel);
        }

        if (this._functionExecutor.needsUnitReferenceResolver) {
            this._functionExecutor.setUnitReferenceResolver(this._unitReferenceResolver);
        }
    }

    override get nodeType() {
        return NodeType.FUNCTION;
    }

    getOmittedIfBranchResult(): BaseValueObject | undefined {
        if (this._functionExecutor instanceof If) return this._functionExecutor.getOmittedBranchResult();
    }

    override isAddress(): boolean {
        return super.isAddress() || this._functionExecutor.needsAddressDependencies?.(this.getChildren()) === true;
    }

    override resolveAddressDependencyReferences(
        argument: (node: BaseAstNode) => Promise<BaseReferenceObject | null>
    ): Promise<readonly BaseReferenceObject[]> | undefined {
        if (!this._functionExecutor.resolveAddressDependencyReferences) {
            return;
        }
        this._setRefInfo();
        const children = this.getChildren();
        return this._functionExecutor.resolveAddressDependencyReferences((index) =>
            children[index] ? argument(children[index]) : Promise.resolve(null));
    }

    override getAddressDependencyReferences(): readonly BaseReferenceObject[] | undefined {
        const value = this.getValue();
        if (value == null) {
            return;
        }
        const dependencies = this._addressDependencies;
        if (!(this._functionExecutor instanceof Indirect)) {
            return dependencies;
        }
        const parent = this.getParent();
        const token = parent?.getToken();
        if (parent?.nodeType === NodeType.FUNCTION &&
            (token === FUNCTION_NAMES_LOOKUP.ROW || token === FUNCTION_NAMES_LOOKUP.ROWS ||
                token === FUNCTION_NAMES_LOOKUP.COLUMN || token === FUNCTION_NAMES_LOOKUP.COLUMNS)) {
            // Only a spill's changing extent makes the address target a value dependency.
            return dependencies ?? [];
        }
        if (dependencies) {
            if (!value.isReferenceObject()) {
                return dependencies;
            }
            if ((value as BaseReferenceObject).isMultiArea()) {
                return [value as BaseReferenceObject, ...dependencies];
            }
        }
    }

    override getImplicitIntersectionReference(child: BaseAstNode, reference: BaseReferenceObject, range: IRange): FunctionVariantType | undefined {
        if (!this._functionExecutor.implicitIntersectionReferenceArguments.includes(this.getChildren().indexOf(child))) {
            return;
        }
        return reference.isCell() ? reference : this._functionExecutor.createReferenceObject(reference, range);
    }

    override needsFilteredOutRows() {
        return this._functionExecutor.needsFilteredOutRows;
    }

    override preservesLazyIfReferenceArray(child: BaseAstNode): boolean {
        const executor = this._functionExecutor;
        if (executor.evaluatesIfArgumentsAsArrays) return true;
        const args = this.getChildren();
        const index = args.indexOf(child);
        const acceptsRange = excelArgumentAcceptsRange(executor.name, index, args.length);
        if (acceptsRange === undefined && !(executor instanceof If)) return true;
        if (!executor.isCustom() && acceptsRange !== undefined) return acceptsRange;
        return executor.lazyIfReferenceArrayArgumentIndexes.includes(index);
    }

    getNestedArgumentArrayContext(child: BaseAstNode): ArgumentArrayContext {
        const children = this.getChildren();
        if (this._functionExecutor.isCustom()) return 'scalar';
        return getNestedArgumentArrayContext(this._functionExecutor.name, children.indexOf(child), children.length);
    }

    override preservesReferenceInRangeEndpoint(child: BaseAstNode): boolean {
        const args = this.getChildren();
        const index = args.indexOf(child);
        return this.getToken() === FUNCTION_NAMES_META.CUBE ||
            this._functionExecutor.preservesReferenceInRangeEndpointArgument?.(index, args.length) === true ||
            (this._functionExecutor instanceof If && index > 0) ||
            this._functionExecutor.evaluatesIfArgumentsAsArrays === true ||
            this._functionExecutor.lazyIfReferenceArrayArgumentIndexes.includes(index);
    }

    override async executeAsync(dateSystem: DateSystem = DateSystem.Date1900) {
        const children = this.getChildren();

        this._compatibility();

        const resultVariant = this._calculateReferenceEndpoint(children) ?? (this._functionExecutor.needsAstChildren
            ? this._calculateAst(children, dateSystem)
            : await this._calculateAsync(this._collectVariants(children, dateSystem), dateSystem));
        let result: FunctionVariantType;

        if (resultVariant.isAsyncObject() || resultVariant.isAsyncArrayObject()) {
            result = await (resultVariant as AsyncObject | AsyncArrayObject).getValue() as FunctionVariantType;
        } else {
            result = resultVariant as FunctionVariantType;
        }

        result = this._normalizeTopLevelLegacyArrayResult(result).withDateSystem(dateSystem) as FunctionVariantType;

        this._setEmbeddedArrayFormulaToResult(result);

        this._setRefData(result);

        this.setValue(result);
        this._captureAddressDependencies();

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    override execute(dateSystem: DateSystem = DateSystem.Date1900) {
        const children = this.getChildren();

        this._compatibility();

        const resultVariant = (this._calculateReferenceEndpoint(children) ?? (this._functionExecutor.needsAstChildren
            ? this._calculateAst(children, dateSystem)
            : this._calculate(this._collectVariants(children, dateSystem), dateSystem))) as FunctionVariantType;

        const result = this._normalizeTopLevelLegacyArrayResult(resultVariant).withDateSystem(dateSystem) as FunctionVariantType;

        this._setEmbeddedArrayFormulaToResult(result);

        this._setRefData(result);

        this.setValue(result as FunctionVariantType);
        this._captureAddressDependencies();
    }

    private _captureAddressDependencies(): void {
        if (this._functionExecutor instanceof Indirect) {
            this._addressDependencies = this._functionExecutor.takeSpillAnchors();
        } else if (this.isAddress()) {
            this._addressDependencies = this._functionExecutor.takeAddressDependencyReferences();
        }
    }

    private _calculateReferenceEndpoint(children: BaseAstNode[]) {
        const calculate = this._functionExecutor.calculateReferenceEndpoint;
        if (!calculate || !this.isUsedAsRangeEndpoint()) {
            return;
        }
        const variants: FunctionVariantType[] = [];
        for (const argument of children) {
            const value = argument.getValue();
            if (value == null) {
                return;
            }
            variants.push(value);
        }
        return calculate.call(this._functionExecutor, variants);
    }

    private _collectVariants(children: BaseAstNode[], dateSystem: DateSystem): BaseValueObject[] {
        const variants: BaseValueObject[] = [];
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            const object = this._getChildVariant(children[i], dateSystem);

            if (object == null) {
                continue;
            }

            variants.push(object as BaseValueObject);
        }

        return variants;
    }

    private _getChildVariant(child: BaseAstNode, dateSystem: DateSystem): FunctionVariantType | undefined {
        const object = child.getValue();

        if (object == null) {
            return;
        }

        if (object.isReferenceObject() && this._functionExecutor.rejectsMultiCellReference) {
            const reference = object as BaseReferenceObject;
            if (reference.getRowCount() > 1 || reference.getColumnCount() > 1) {
                if (reference.getForcedSheetName().length > 0 && !reference.getForcedSheetId()) {
                    return ErrorValueObject.create(ErrorType.REF);
                }
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        if (object.isReferenceObject() && this._functionExecutor.needsFilteredOutRows) {
            this._setFilteredOutRows(object as BaseReferenceObject);
        }

        // In the SUBTOTAL function, we need to get rowData information, we can only use ReferenceObject
        if (object.isReferenceObject() && !this._functionExecutor.needsReferenceObject) {
            // Array converted from reference object needs to be marked
            return (object as BaseReferenceObject).withDateSystem(dateSystem).toArrayValueObject();
        }

        return object.withDateSystem(dateSystem);
    }

    isAffectedBySheetMetadata(sheetOrderChanged: boolean, sheetSizeChanged: boolean): boolean {
        return (sheetOrderChanged && this._functionExecutor.needsSheetsInfo) ||
            (sheetSizeChanged && this._functionExecutor.needsSheetRowColumnCount);
    }

    isFunctionExecutorArgumentsIgnoreNumberPattern() {
        return this._functionExecutor.isArgumentsIgnoreNumberPattern();
    }

    /**
     * If it contains an array formula, set the current cell to the cache and send itself as a ref outward
     */
    private _setEmbeddedArrayFormulaToResult(result: FunctionVariantType) {
        if (!result.isArray()) {
            return;
        }

        const rowCount = (result as ArrayValueObject).getRowCount();
        const colCount = (result as ArrayValueObject).getColumnCount();

        if (rowCount <= 1 && colCount <= 1) {
            return;
        }

        this._runtimeService.setUnitArrayFormulaEmbeddedMap();
    }

    private _normalizeTopLevelLegacyArrayResult(result: FunctionVariantType): FunctionVariantType {
        const parent = this.getParent();
        const isTopLevel = parent == null || parent.nodeType === NodeType.ROOT;
        if (!this._functionExecutor.returnsLegacyArrayAsScalar || !isTopLevel || !result.isArray()) {
            return result;
        }

        const array = result as ArrayValueObject;
        if (array.getRowCount() <= 1 && array.getColumnCount() <= 1) {
            return result;
        }

        if (
            this._runtimeService.hasFunctionRefInfoOverride() &&
            (this._runtimeService.currentRowCount > 1 || this._runtimeService.currentColumnCount > 1)
        ) {
            return result;
        }

        const { currentUnitId, currentSubUnitId, currentRow, currentColumn } = this._runtimeService;
        const anchor = this._currentConfigService.getUnitData()[currentUnitId]?.[currentSubUnitId]?.cellData.getValue(currentRow, currentColumn) as (ICellData & { ref?: string }) | undefined;
        const declaredRange = this._currentConfigService.getArrayFormulaRange()[currentUnitId]?.[currentSubUnitId]?.[currentRow]?.[currentColumn];
        // Older snapshots declare array results with ref before ft/fd metadata existed.
        const hasLegacyArrayRange = anchor?.ft == null && typeof anchor?.ref === 'string' && anchor.ref.length > 0 &&
            declaredRange != null && (declaredRange.endRow > currentRow || declaredRange.endColumn > currentColumn);
        if (
            hasLegacyArrayRange ||
            isExplicitDynamicArrayFormula(this._currentConfigService, currentUnitId, currentSubUnitId, currentRow, currentColumn) ||
            getFixedArrayResultRange(this._currentConfigService, currentUnitId, currentSubUnitId, currentRow, currentColumn)
        ) {
            return result;
        }

        return array.getFirstCell();
    }

    /**
     * Compatibility handling for special functions.
     */
    private _compatibility() {
        this._lookupCompatibility();
    }

    private _lookupCompatibility() {
        const children = this.getChildren();
        const childrenCount = children.length;

        if (!this._functionExecutor.needsExpandParams || childrenCount !== 3) {
            return;
        }

        const lookupVectorOrArray = children[1].getValue();

        const resultVector = children[2].getValue();

        if (!lookupVectorOrArray?.isReferenceObject() && !resultVector?.isReferenceObject()) {
            return;
        }

        let lookupCountRow: number;
        let lookupCountColumn: number;

        if (lookupVectorOrArray?.isReferenceObject()) {
            const lookupVectorOrArrayRange = (lookupVectorOrArray as BaseReferenceObject).getRangeData();
            const { startRow, startColumn, endRow, endColumn } = lookupVectorOrArrayRange;

            lookupCountRow = endRow - startRow + 1;
            lookupCountColumn = endColumn - startColumn + 1;
        } else {
            lookupCountRow = lookupVectorOrArray?.isArray() ? (lookupVectorOrArray as ArrayValueObject).getRowCount() : 1;
            lookupCountColumn = lookupVectorOrArray?.isArray() ? (lookupVectorOrArray as ArrayValueObject).getColumnCount() : 1;
        }

        const resultVectorRange = (resultVector as BaseReferenceObject).getRangeData();

        const { startRow: reStartRow, startColumn: reStartColumn, endRow: reEndRow, endColumn: reEndColumn } = resultVectorRange;

        const resultCountRow = reEndRow - reStartRow + 1;
        const resultCountColumn = reEndColumn - reStartColumn + 1;

        if (lookupCountRow !== resultCountRow) {
            resultVectorRange.endRow += lookupCountRow - resultCountRow;
        }

        if (lookupCountColumn !== resultCountColumn) {
            resultVectorRange.endColumn += lookupCountColumn - resultCountColumn;
        }
    }

    /**
     * Transform the result of a custom function to a NodeValueType.
     */
    private _handleCustomResult(
        resultVariantCustom: FormulaFunctionResultValueType,
        dateSystem: DateSystem
    ): NodeValueType {
        if (typeof resultVariantCustom !== 'object' || resultVariantCustom == null) {
            return ValueObjectFactory.create(resultVariantCustom, false, dateSystem);
        }

        const arrayValues = transformToValueObject(resultVariantCustom, false, dateSystem);
        return ArrayValueObject.create({
            calculateValueList: arrayValues,
            rowCount: arrayValues.length,
            columnCount: arrayValues[0]?.length || 0,
            unitId: '',
            sheetId: '',
            row: -1,
            column: -1,
        });
    }

    private _handleAddressFunction() {
        /**
         * In Excel, to inject a defined name into a function that has positioning capabilities,
         * such as using the INDIRECT function to reference a named range,
         * you can write it as follows:
         * =INDIRECT("DefinedName1")
         */
        if (this._functionExecutor.isAddress()) {
            this._setDefinedNamesForFunction();
        }
    }

    private _mapVariantsToValues(variants: BaseValueObject[]) {
        return variants.map((variant) => {
            if (variant.isArray()) {
                return (variant as ArrayValueObject).toValue();
            }

            if (variant.isLambda()) {
                return variant;
            }

            return variant.getValue();
        });
    }

    private _calculate(variants: BaseValueObject[], dateSystem: DateSystem) {
        // Check the number of parameters
        const { minParams, maxParams } = this._functionExecutor;
        if (minParams !== -1 && maxParams !== -1 && (variants.length < minParams || variants.length > maxParams)) {
            return ErrorValueObject.create(ErrorType.NA);
        }
        let resultVariant: NodeValueType;

        this._setRefInfo();

        if (this._functionExecutor.isCustom()) {
            const resultVariantCustom = this._functionExecutor.calculateCustom(
                ...this._mapVariantsToValues(variants)
            ) as FormulaFunctionResultValueType;

            resultVariant = this._handleCustomResult(resultVariantCustom, dateSystem);
        } else {
            this._handleAddressFunction();
            resultVariant = this._functionExecutor.calculate(...variants);
        }

        return resultVariant;
    }

    private _calculateAst(children: BaseAstNode[], dateSystem: DateSystem) {
        const { minParams, maxParams } = this._functionExecutor;
        if (minParams !== -1 && maxParams !== -1 && (children.length < minParams || children.length > maxParams)) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        this._setRefInfo();
        this._handleAddressFunction();

        return this._functionExecutor.calculateAst(children, (node) => this._getChildVariant(node, dateSystem) ?? null);
    }

    private async _calculateAsync(variants: BaseValueObject[], dateSystem: DateSystem) {
        // Check the number of parameters
        const { minParams, maxParams } = this._functionExecutor;
        if (minParams !== -1 && maxParams !== -1 && (variants.length < minParams || variants.length > maxParams)) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        let resultVariant: NodeValueType;

        this._setRefInfo();

        if (this._functionExecutor.isCustom()) {
            const resultVariantCustom = await this._functionExecutor.calculateCustom(
                ...this._mapVariantsToValues(variants)
            );

            resultVariant = this._handleCustomResult(resultVariantCustom, dateSystem);
        } else {
            this._handleAddressFunction();
            resultVariant = this._functionExecutor.calculate(...variants);
        }

        return resultVariant;
    }

    private _setDefinedNamesForFunction() {
        const editorUnitId = this._runtimeService.currentUnitId;
        if (editorUnitId == null) {
            return;
        }
        const definedNames = this._definedNamesService.getDefinedNameMap(editorUnitId);
        if (definedNames == null) {
            return;
        }

        this._functionExecutor.setDefinedNames(definedNames);
    }

    private _setRefInfo() {
        const { currentUnitId, currentSubUnitId, currentRow, currentColumn, currentRowCount, currentColumnCount } = this._runtimeService;

        const arrayFormulaRange = this._currentConfigService.getArrayFormulaRange()[currentUnitId]?.[currentSubUnitId]?.[currentRow]?.[currentColumn];
        this._functionExecutor.setRefInfo(currentUnitId, currentSubUnitId, currentRow, currentColumn, currentRowCount, currentColumnCount, arrayFormulaRange != null || this._isArrayIfArgument());
        this._functionExecutor.setDateSystem(this._currentConfigService.getDateSystem(currentUnitId));

        if (this._functionExecutor.needsSheetsInfo) {
            this._setSheetsInfo();
        }

        if (this._functionExecutor.needsSheetRowColumnCount) {
            const { rowCount, columnCount } = this._currentConfigService.getSheetRowColumnCount(currentUnitId, currentSubUnitId);

            this._functionExecutor.setSheetRowColumnCount(rowCount, columnCount);
        }
    }

    private _isArrayIfArgument(): boolean {
        if (this.getToken() !== 'IF') {
            return false;
        }
        let parent = this.getParent();
        while (parent != null && parent.nodeType !== NodeType.FUNCTION) {
            parent = parent.getParent();
        }
        return parent instanceof FunctionNode && parent._functionExecutor.evaluatesIfArgumentsAsArrays === true;
    }

    private _setRefData(variant: FunctionVariantType) {
        if (!variant.isReferenceObject()) {
            return;
        }
        const referenceObject = variant as BaseReferenceObject;
        const unitData = this._currentConfigService.getUnitData();
        if (referenceObject.isMultiArea()) {
            for (const row of (referenceObject as MultiAreaReferenceObject).getAreas()) {
                for (const area of row) {
                    if (area.isReferenceObject() && (area as BaseReferenceObject).getUnitData() !== unitData) {
                        this._setRefData(area);
                    }
                }
            }
        }

        initializeReferenceContext(referenceObject, this._currentConfigService, this._runtimeService);
    }

    private _setLocale() {
        this._functionExecutor.setLocale(this._currentConfigService.getLocale());
    }

    private _setSheetsInfo() {
        this._functionExecutor.setSheetsInfo(this._currentConfigService.getSheetsInfo(this._runtimeService.currentUnitId));
    }

    private _setFilteredOutRows(referenceObject: BaseReferenceObject) {
        if (referenceObject.isMultiArea()) {
            for (const row of (referenceObject as MultiAreaReferenceObject).getAreas()) {
                for (const area of row) {
                    if (area.isReferenceObject()) this._setFilteredOutRows(area as BaseReferenceObject);
                }
            }
            return;
        }
        const { startRow, endRow } = referenceObject.getRangePosition();
        const filteredOutRows = this._currentConfigService.getFilteredOutRows(
            referenceObject.getUnitId(),
            referenceObject.getSheetId(),
            startRow,
            endRow,
            this.getToken() === FUNCTION_NAMES_MATH.SUBTOTAL
        );

        referenceObject.setFilteredOutRows(filteredOutRows);
    }
}

export class ErrorFunctionNode extends BaseAstNode {
    constructor(
        token: string = 'Error'
    ) {
        super(token);
    }

    override get nodeType() {
        return NodeType.FUNCTION;
    }

    override async executeAsync() {
        this.setValue(ErrorValueObject.create(ErrorType.NAME) as FunctionVariantType);

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    override execute() {
        this.setValue(ErrorValueObject.create(ErrorType.NAME) as FunctionVariantType);
    }
}

function initializeReferenceContext(
    reference: BaseReferenceObject,
    config: IFormulaCurrentConfigService,
    runtime: IFormulaRuntimeService
): void {
    reference.setForcedSheetId(config.getSheetNameMap());
    reference.setUnitData(config.getUnitData());
    reference.setArrayFormulaCellData(config.getArrayFormulaCellData());
    reference.setArrayFormulaRange(config.getArrayFormulaRange());
    reference.setRuntimeData(runtime.getUnitData());
    reference.setCalculationCache(runtime.getCalculationCache?.());
    reference.setRuntimeArrayFormulaCellData(runtime.getRuntimeArrayFormulaCellData());
    reference.setRuntimeArrayFormulaRange(runtime.getUnitArrayFormula());
    reference.setRuntimeFeatureCellData(runtime.getRuntimeFeatureCellData());
}

export class FunctionNodeFactory extends BaseAstNodeFactory {
    private readonly _initializeReference = (reference: BaseReferenceObject): void => {
        initializeReferenceContext(reference, this._currentConfigService, this._runtimeService);
    };

    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IFormulaUnitReferenceResolver private readonly _unitReferenceResolver: IFormulaUnitReferenceResolver
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.FUNCTION) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(token: string): BaseAstNode {
        const functionExecutor = this._functionService.getExecutor(token);
        if (!functionExecutor) {
            console.error(`No function ${token}`);
            return ErrorNode.create(ErrorType.NAME);
        }

        if (functionExecutor instanceof Indirect) {
            functionExecutor.setReferenceInitializer(this._initializeReference);
            if (this._injector.has(ISuperTableService)) {
                functionExecutor.setSuperTableService(this._injector.get(ISuperTableService));
            }
        }

        return new FunctionNode(
            token,
            functionExecutor,
            this._currentConfigService,
            this._runtimeService,
            this._definedNamesService,
            this._formulaDataModel,
            this._unitReferenceResolver
        );
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (typeof param === 'string') {
            return;
        }
        const token = param.getToken();

        const { tokenTrim, minusPrefixNode, atPrefixNode } = prefixHandler(token.trim(), this._functionService, this._runtimeService);

        const isColon = this._isParentUnionNode(param);

        if (!Number.isNaN(Number(tokenTrim)) && !isColon) {
            return ErrorNode.create(ErrorType.VALUE);
        }

        const tokenTrimUpper = normalizeFunctionToken(tokenTrim.toUpperCase());

        if (isColon && param.getChildren().length === 0 && COLUMN_LIKE_FUNCTION_NAMES.has(tokenTrimUpper)) {
            return;
        }

        if (this._functionService.hasExecutor(tokenTrimUpper)) {
            const functionNode = this.create(tokenTrimUpper);
            if (atPrefixNode) {
                functionNode.setParent(atPrefixNode);
                // return atPrefixNode;
            } else if (minusPrefixNode) {
                functionNode.setParent(minusPrefixNode);
                // return minusPrefixNode;
            }
            return functionNode;
        }
    }

    private _isParentUnionNode(param: LexerNode) {
        return param.getParent()?.getParent()?.getToken() === matchToken.COLON;
    }
}
