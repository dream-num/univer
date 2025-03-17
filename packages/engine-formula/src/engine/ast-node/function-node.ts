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

import type { BaseFunction } from '../../functions/base-function';

import type { LexerNode } from '../analysis/lexer-node';
import type {
    AsyncArrayObject,
    AsyncObject,
    BaseReferenceObject,
    FunctionVariantType,
    NodeValueType,
} from '../reference-object/base-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import type { FormulaFunctionResultValueType } from '../value-object/primitive-object';
import { Inject, Injector } from '@univerjs/core';
import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { matchToken } from '../../basics/token';
import { FormulaDataModel } from '../../models/formula-data.model';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDefinedNamesService } from '../../services/defined-names.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { prefixHandler } from '../utils/prefix-handler';
import { ArrayValueObject, transformToValueObject, ValueObjectFactory } from '../value-object/array-value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class FunctionNode extends BaseAstNode {
    constructor(
        token: string,
        private _functionExecutor: BaseFunction,
        private _currentConfigService: IFormulaCurrentConfigService,
        private _runtimeService: IFormulaRuntimeService,
        private _definedNamesService: IDefinedNamesService,
        private _formulaDataModel: FormulaDataModel
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

        if (this._functionExecutor.needsSheetsInfo) {
            this._setSheetsInfo();
        }

        if (this._functionExecutor.needsFormulaDataModel) {
            this._functionExecutor.setFormulaDataModel(this._formulaDataModel);
        }
    }

    override get nodeType() {
        return NodeType.FUNCTION;
    }

    override async executeAsync() {
        const variants: BaseValueObject[] = [];
        const children = this.getChildren();
        const childrenCount = children.length;

        this._compatibility();

        for (let i = 0; i < childrenCount; i++) {
            const child = children[i];
            const object = child.getValue();
            if (object == null) {
                continue;
            }
            if (object.isReferenceObject() && !this._functionExecutor.needsReferenceObject) {
                variants.push((object as BaseReferenceObject).toArrayValueObject());
            } else {
                variants.push(object as BaseValueObject);
            }
        }

        const resultVariant = await this._calculateAsync(variants);
        let result: FunctionVariantType;
        if (resultVariant.isAsyncObject() || resultVariant.isAsyncArrayObject()) {
            result = await (resultVariant as AsyncObject | AsyncArrayObject).getValue();
        } else {
            result = resultVariant as FunctionVariantType;
        }

        this._setRefData(result);

        this.setValue(result);

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    override execute() {
        const variants: BaseValueObject[] = [];
        const children = this.getChildren();
        const childrenCount = children.length;

        this._compatibility();

        for (let i = 0; i < childrenCount; i++) {
            const child = children[i];
            const object = child.getValue();

            if (object == null) {
                continue;
            }

            if (object.isReferenceObject() && this._functionExecutor.needsFilteredOutRows) {
                this._setFilteredOutRows(object as BaseReferenceObject);
            }

            // In the SUBTOTAL function, we need to get rowData information, we can only use ReferenceObject
            if (object.isReferenceObject() && !this._functionExecutor.needsReferenceObject) {
                // Array converted from reference object needs to be marked
                variants.push((object as BaseReferenceObject).toArrayValueObject());
            } else {
                variants.push(object as BaseValueObject);
            }
        }

        const resultVariant = this._calculate(variants) as FunctionVariantType;

        this._setRefData(resultVariant);

        this.setValue(resultVariant as FunctionVariantType);
    }

     /**
      * Compatibility handling for special functions.
      */
    private _compatibility() {
        this._lookupCompatibility();
    }

    /**
     * The LOOKUP function follows the following rules when dealing with vectors of different sizes:
     *    If the lookup_vector is larger than the result_vector,
     *    the LOOKUP function will ignore the extra portion of the lookup_vector and only use the portion of the result_vector that is the same size as the lookup_vector for lookup and returning results.
     *    If the lookup_vector is smaller than the result_vector,
     *    the LOOKUP function will continue using the last value of the result_vector for lookup and returning results after the last value of the lookup_vector.
     */
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
    private _handleCustomResult(resultVariantCustom: FormulaFunctionResultValueType): NodeValueType {
        if (typeof resultVariantCustom !== 'object' || resultVariantCustom == null) {
            return ValueObjectFactory.create(resultVariantCustom);
        }

        const arrayValues = transformToValueObject(resultVariantCustom);
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

    private _calculate(variants: BaseValueObject[]) {
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

            resultVariant = this._handleCustomResult(resultVariantCustom);
        } else {
            this._handleAddressFunction();
            resultVariant = this._functionExecutor.calculate(...variants);
        }

        return resultVariant;
    }

    private async _calculateAsync(variants: BaseValueObject[]) {
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

            resultVariant = this._handleCustomResult(resultVariantCustom);
        } else {
            this._handleAddressFunction();
            resultVariant = this._functionExecutor.calculate(...variants);
        }

        return resultVariant;
    }

    private _setDefinedNamesForFunction() {
        const editorUnitId = this._currentConfigService.getExecuteUnitId();
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
        const { currentUnitId, currentSubUnitId, currentRow, currentColumn } = this._runtimeService;

        this._functionExecutor.setRefInfo(currentUnitId, currentSubUnitId, currentRow, currentColumn);

        if (this._functionExecutor.needsSheetRowColumnCount) {
            const { rowCount, columnCount } = this._currentConfigService.getSheetRowColumnCount(currentUnitId, currentSubUnitId);

            this._functionExecutor.setSheetRowColumnCount(rowCount, columnCount);
        }
    }

    private _setRefData(variant: FunctionVariantType) {
        if (!variant.isReferenceObject()) {
            return;
        }
        const referenceObject = variant as BaseReferenceObject;

        referenceObject.setForcedSheetId(this._currentConfigService.getSheetNameMap());

        referenceObject.setUnitData(this._currentConfigService.getUnitData());

        referenceObject.setArrayFormulaCellData(this._currentConfigService.getArrayFormulaCellData());

        referenceObject.setRuntimeData(this._runtimeService.getUnitData());

        referenceObject.setRuntimeArrayFormulaCellData(this._runtimeService.getRuntimeArrayFormulaCellData());

        referenceObject.setRuntimeFeatureCellData(this._runtimeService.getRuntimeFeatureCellData());
    }

    private _setLocale() {
        this._functionExecutor.setLocale(this._currentConfigService.getLocale());
    }

    private _setSheetsInfo() {
        this._functionExecutor.setSheetsInfo(this._currentConfigService.getSheetsInfo());
    }

    private _setFilteredOutRows(referenceObject: BaseReferenceObject) {
        const { startRow, endRow } = referenceObject.getRangePosition();
        const filteredOutRows = this._currentConfigService.getFilteredOutRows(
            referenceObject.getUnitId(),
            referenceObject.getSheetId(),
            startRow,
            endRow
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

export class FunctionNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
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

        return new FunctionNode(
            token,
            functionExecutor,
            this._currentConfigService,
            this._runtimeService,
            this._definedNamesService,
            this._formulaDataModel
        );
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (typeof param === 'string') {
            return;
        }
        const token = param.getToken();

        const { tokenTrim, minusPrefixNode, atPrefixNode } = prefixHandler(token.trim(), this._functionService, this._runtimeService);

        if (!Number.isNaN(Number(tokenTrim)) && !this._isParentUnionNode(param)) {
            return ErrorNode.create(ErrorType.VALUE);
        }

        const tokenTrimUpper = tokenTrim.toUpperCase();

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
