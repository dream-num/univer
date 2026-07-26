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

import type { Nullable } from '@univerjs/core';
import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import {
    regexTestReferenceTableAllColumn,
    regexTestReferenceTableMultipleColumn,
    regexTestReferenceTableSingleColumn,
    regexTestReferenceTableTitleOnlyAnyHash,
    regexTestSingeRange,
    regexTestSingleColumn,
    regexTestSingleRow,
} from '../../basics/regex';
import { matchToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFormulaExternalReferenceDataLoader } from '../../services/external-reference-data-loader.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { ISuperTableService } from '../../services/super-table.service';
import { IFormulaUnitReferenceResolver } from '../../services/unit-reference-resolver.service';
import { LexerNode } from '../analysis/lexer-node';
import { TableReferenceObject } from '../reference-object/table-reference-object';
import { prefixHandler } from '../utils/prefix-handler';
import { splitTableStructuredRef } from '../utils/reference';
import { getReferenceObjectFromCache, ReferenceObjectType } from '../utils/value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

interface ITableReferenceDescriptor {
    unitQualifier: string;
    tableName: string;
    columnStruct: string | undefined;
}

type ReferenceNodeCurrentConfigService = Pick<
    IFormulaCurrentConfigService,
    'getArrayFormulaCellData' | 'getArrayFormulaRange' | 'getSheetNameMap' | 'getUnitData' | 'getUnitStylesData'
>;

type ReferenceNodeRuntimeService = Pick<
    IFormulaRuntimeService,
    | 'currentColumn'
    | 'currentRow'
    | 'currentSubUnitId'
    | 'currentUnitId'
    | 'getRuntimeArrayFormulaCellData'
    | 'getRuntimeFeatureCellData'
    | 'getUnitArrayFormula'
    | 'getUnitData'
>;

type ReferenceNodeSuperTableService = Pick<
    ISuperTableService,
    'getTableMap' | 'getTableOptionMap'
>;

export class ReferenceNode extends BaseAstNode {
    private _refOffsetX = 0;
    private _refOffsetY = 0;

    constructor(
        private _currentConfigService: ReferenceNodeCurrentConfigService,
        private _runtimeService: ReferenceNodeRuntimeService,
        operatorString: string,
        private _referenceObjectType: ReferenceObjectType,
        private _unitReferenceResolver: IFormulaUnitReferenceResolver,
        private _superTableService: ReferenceNodeSuperTableService,
        private _externalReferenceDataLoader: IFormulaExternalReferenceDataLoader,
        private _isPrepareMerge: boolean = false,
        private _tableReference?: ITableReferenceDescriptor
    ) {
        super(operatorString);
        const unitQualifier = _tableReference
            ? _tableReference.unitQualifier
            : getReferenceObjectFromCache(operatorString, _referenceObjectType).getUnitQualifier();
        if (unitQualifier) {
            this.setAsync();
        }
    }

    override get nodeType() {
        return NodeType.REFERENCE;
    }

    override execute() {
        const currentConfigService = this._currentConfigService;
        const runtimeService = this._runtimeService;

        let referenceObject: BaseReferenceObject;
        if (this._tableReference) {
            const { unitQualifier, tableName, columnStruct } = this._tableReference;
            const resolution = this._unitReferenceResolver.resolve({
                hostUnitId: runtimeService.currentUnitId,
                qualifier: unitQualifier,
                referenceKind: 'table',
            });
            if (typeof resolution === 'string') {
                this.setValue(ErrorValueObject.create(resolution));
                return;
            }
            const tableMap = this._superTableService.getTableMap(resolution.unitId);
            const tableData = Array.from(tableMap?.entries() || []).find(([name]) => name.toLocaleLowerCase() === tableName.toLocaleLowerCase())?.[1];
            if (!tableData) {
                this.setValue(ErrorValueObject.create(ErrorType.REF));
                return;
            }
            referenceObject = new TableReferenceObject(
                this.getToken(),
                tableData,
                columnStruct,
                this._superTableService.getTableOptionMap()
            );
            referenceObject.setUnitQualifier(unitQualifier);
            referenceObject.setForcedUnitIdDirect(resolution.unitId);
        } else {
            referenceObject = getReferenceObjectFromCache(this.getToken(), this._referenceObjectType);
            const unitQualifier = referenceObject.getUnitQualifier();
            if (unitQualifier) {
                const resolution = this._unitReferenceResolver.resolve({
                    hostUnitId: runtimeService.currentUnitId,
                    qualifier: unitQualifier,
                    referenceKind: 'a1',
                });
                if (typeof resolution === 'string') {
                    this.setValue(ErrorValueObject.create(resolution));
                    return;
                }
                referenceObject.setForcedUnitIdDirect(resolution.unitId);
            }
        }

        this._configureReferenceObject(referenceObject, currentConfigService, runtimeService);

        if (!this._isPrepareMerge && referenceObject.isExceedRange()) {
            this.setValue(ErrorValueObject.create(ErrorType.NAME));
        } else {
            this.setValue(referenceObject);
        }
    }

    override async executeAsync(): Promise<AstNodePromiseType> {
        const hostUnitId = this._runtimeService.currentUnitId;
        const unitQualifier = this._tableReference
            ? this._tableReference.unitQualifier
            : getReferenceObjectFromCache(this.getToken(), this._referenceObjectType).getUnitQualifier();
        if (!unitQualifier) {
            this.execute();
            return AstNodePromiseType.SUCCESS;
        }

        const referenceKind = this._tableReference ? 'table' : 'a1';
        const resolution = this._unitReferenceResolver.resolve({
            hostUnitId,
            qualifier: unitQualifier,
            referenceKind,
        });
        if (typeof resolution === 'string') {
            this.setValue(ErrorValueObject.create(resolution));
            return AstNodePromiseType.ERROR;
        }

        if (resolution.externalReference) {
            const token = this._getExternalLoadToken();
            const error = await this._externalReferenceDataLoader.load({
                hostUnitId,
                qualifier: unitQualifier,
                referenceKind,
                token,
                tableName: this._tableReference?.tableName,
                columnStruct: this._tableReference?.columnStruct,
                resolution,
            });
            if (error) {
                this.setValue(ErrorValueObject.create(error));
                return AstNodePromiseType.ERROR;
            }
        }

        this.execute();
        return AstNodePromiseType.SUCCESS;
    }

    /**
     * A1 ranges are represented as two ReferenceNodes under a `:` UnionNode.
     * The qualified left node owns the external read, so include the right
     * boundary and materialize the whole rectangular range in one request.
     */
    private _getExternalLoadToken(): string {
        const parent = this.getParent();
        if (parent?.nodeType !== NodeType.UNION || parent.getToken() !== matchToken.COLON) {
            return this.getToken();
        }
        const [left, right] = parent.getChildren();
        if (left !== this || right == null) {
            return this.getToken();
        }
        return `${this.getToken()}${matchToken.COLON}${right.getToken()}`;
    }

    private _configureReferenceObject(
        referenceObject: BaseReferenceObject,
        currentConfigService: ReferenceNodeCurrentConfigService,
        runtimeService: ReferenceNodeRuntimeService
    ): void {
        referenceObject.setDefaultUnitId(runtimeService.currentUnitId);
        referenceObject.setDefaultSheetId(runtimeService.currentSubUnitId);
        referenceObject.setForcedSheetId(currentConfigService.getSheetNameMap());
        referenceObject.setUnitData(currentConfigService.getUnitData());
        referenceObject.setArrayFormulaCellData(currentConfigService.getArrayFormulaCellData());
        referenceObject.setArrayFormulaRange(currentConfigService.getArrayFormulaRange());
        referenceObject.setRuntimeData(runtimeService.getUnitData());
        referenceObject.setUnitStylesData(currentConfigService.getUnitStylesData());
        referenceObject.setRuntimeArrayFormulaCellData(runtimeService.getRuntimeArrayFormulaCellData());
        referenceObject.setRuntimeArrayFormulaRange(runtimeService.getUnitArrayFormula());
        referenceObject.setRuntimeFeatureCellData(runtimeService.getRuntimeFeatureCellData());
        referenceObject.setCurrentRowAndColumn(runtimeService.currentRow, runtimeService.currentColumn);
        const { x, y } = this.getRefOffset();
        referenceObject.setRefOffset(x, y);
    }

    setRefOffset(x: number = 0, y: number = 0) {
        this._refOffsetX = x;
        this._refOffsetY = y;
    }

    getRefOffset() {
        return {
            x: this._refOffsetX,
            y: this._refOffsetY,
        };
    }
}

export class ReferenceNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService private readonly _formulaRuntimeService: IFormulaRuntimeService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @ISuperTableService private readonly _superTableService: ISuperTableService,
        @IFormulaUnitReferenceResolver private readonly _unitReferenceResolver: IFormulaUnitReferenceResolver,
        @IFormulaExternalReferenceDataLoader
        private readonly _externalReferenceDataLoader: IFormulaExternalReferenceDataLoader
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.REFERENCE) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        let isLexerNode = false;
        let tokenTrimPre: string;
        let isPrepareMerge = false;
        if (param instanceof LexerNode) {
            isLexerNode = true;
            tokenTrimPre = param.getToken().trim();

            /**
             * If this node is a reference to a range,
             * it is necessary to determine whether it will be combined into a single range by a union operation.
             */
            if (param.getParent()?.getParent()?.getToken().trim() === matchToken.COLON) {
                isPrepareMerge = true;
            }
        } else {
            tokenTrimPre = param.trim();
        }

        // const tokenTrim = param.trim();
        // if (regexTestSingeRange(tokenTrim)) {
        //     return true;
        // }

        const { tokenTrim, minusPrefixNode, atPrefixNode } = prefixHandler(tokenTrimPre, this._functionService, this._formulaRuntimeService);

        if (!isLexerNode && tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        const node: Nullable<ReferenceNode> = this._getNode(tokenTrim, isLexerNode, isPrepareMerge, param);

        if (node) {
            if (atPrefixNode) {
                node.setParent(atPrefixNode);
            } else if (minusPrefixNode) {
                node.setParent(minusPrefixNode);
            }
            return node;
        }
    }

    private _getTableMap() {
        const unitId = this._formulaRuntimeService.currentUnitId;
        if (!unitId) {
            return;
        }
        return this._superTableService.getTableMap(unitId);
    }

    private _getNode(
        tokenTrim: string,
        isLexerNode: boolean,
        isPrepareMerge: boolean,
        param: LexerNode | string
    ) {
        const currentConfigService = this._currentConfigService;
        const runtimeService = this._formulaRuntimeService;

        const makeRef = (type: ReferenceObjectType) =>
            new ReferenceNode(currentConfigService, runtimeService, tokenTrim, type, this._unitReferenceResolver, this._superTableService, this._externalReferenceDataLoader, isPrepareMerge);

        const tableMap = this._getTableMap();
        const isSuperTableDirect = tableMap?.has(tokenTrim) ?? false;
        if (isSuperTableDirect) {
            return this._getTableReferenceNode(tokenTrim, isPrepareMerge, true);
        }

        const isCellRange = regexTestSingeRange(tokenTrim);
        if (isCellRange) {
            return makeRef(ReferenceObjectType.CELL);
        }
        const parentIsUnion = isLexerNode && this._checkParentIsUnionOperator(param as LexerNode);
        const isRowRef = parentIsUnion && regexTestSingleRow(tokenTrim);

        if (isRowRef) {
            return makeRef(ReferenceObjectType.ROW);
        }
        const isColRef = parentIsUnion && regexTestSingleColumn(tokenTrim);

        if (isColRef) {
            return makeRef(ReferenceObjectType.COLUMN);
        }

        return this._getTableReferenceNode(tokenTrim, isPrepareMerge, false);
    }

    private _getTableReferenceNode(tokenTrim: string, isPrepareMerge: boolean, isSuperTableDirectly: boolean = false) {
        if (!this._checkTokenIsTableReference(tokenTrim) && !isSuperTableDirectly) {
            return;
        }
        const { unitQualifier, tableName, columnStruct } = splitTableStructuredRef(tokenTrim);
        const tableMap = this._getTableMap();
        const hasLocalTable = Array.from(tableMap?.keys() || []).some((name) => name.toLocaleLowerCase() === tableName.toLocaleLowerCase());
        if (unitQualifier || hasLocalTable) {
            return new ReferenceNode(
                this._currentConfigService,
                this._formulaRuntimeService,
                tokenTrim,
                ReferenceObjectType.COLUMN,
                this._unitReferenceResolver,
                this._superTableService,
                this._externalReferenceDataLoader,
                isPrepareMerge,
                { unitQualifier, tableName, columnStruct }
            );
        }
    }

    private _checkTokenIsTableReference(token: string): boolean {
        return regexTestReferenceTableAllColumn(token) || regexTestReferenceTableSingleColumn(token) || regexTestReferenceTableMultipleColumn(token) || regexTestReferenceTableTitleOnlyAnyHash(token);
    }

    private _checkParentIsUnionOperator(param: LexerNode) {
        return param.getParent()?.getParent()?.getToken().trim() === matchToken.COLON;
    }
}
