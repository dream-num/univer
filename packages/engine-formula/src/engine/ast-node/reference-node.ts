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
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { ISuperTableService } from '../../services/super-table.service';
import { LexerNode } from '../analysis/lexer-node';
import { TableReferenceObject } from '../reference-object/table-reference-object';
import { prefixHandler } from '../utils/prefix-handler';
import { getReferenceObjectFromCache, ReferenceObjectType } from '../utils/value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class ReferenceNode extends BaseAstNode {
    private _refOffsetX = 0;
    private _refOffsetY = 0;

    constructor(
        private _currentConfigService: IFormulaCurrentConfigService,
        private _runtimeService: IFormulaRuntimeService,
        operatorString: string,
        private _referenceObjectType: ReferenceObjectType,
        private _isPrepareMerge: boolean = false,
        private _tableReferenceObject?: TableReferenceObject
    ) {
        super(operatorString);
    }

    override get nodeType() {
        return NodeType.REFERENCE;
    }

    override execute() {
        const currentConfigService = this._currentConfigService;
        const runtimeService = this._runtimeService;

        const referenceObject = this._tableReferenceObject || getReferenceObjectFromCache(this.getToken(), this._referenceObjectType);

        referenceObject.setDefaultUnitId(runtimeService.currentUnitId);

        referenceObject.setDefaultSheetId(runtimeService.currentSubUnitId);

        referenceObject.setForcedSheetId(currentConfigService.getSheetNameMap());

        referenceObject.setUnitData(currentConfigService.getUnitData());

        referenceObject.setArrayFormulaCellData(currentConfigService.getArrayFormulaCellData());

        referenceObject.setRuntimeData(runtimeService.getUnitData());

        referenceObject.setUnitStylesData(currentConfigService.getUnitStylesData());

        referenceObject.setRuntimeArrayFormulaCellData(runtimeService.getRuntimeArrayFormulaCellData());

        referenceObject.setRuntimeFeatureCellData(runtimeService.getRuntimeFeatureCellData());

        const currentRow = runtimeService.currentRow;
        const currentCol = runtimeService.currentColumn;
        referenceObject.setCurrentRowAndColumn(currentRow, currentCol);

        const { x, y } = this.getRefOffset();

        referenceObject.setRefOffset(x, y);

        if (!this._isPrepareMerge && referenceObject.isExceedRange()) {
            this.setValue(ErrorValueObject.create(ErrorType.NAME));
        } else {
            this.setValue(referenceObject);
        }
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
        @ISuperTableService private readonly _superTableService: ISuperTableService
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

        const currentConfigService = this._currentConfigService;
        const runtimeService = this._formulaRuntimeService;

        const { tokenTrim, minusPrefixNode, atPrefixNode } = prefixHandler(tokenTrimPre, this._functionService, runtimeService);

        if (!isLexerNode && tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        const tableMap = this._getTableMap();
        const isSuperTableDirectly = tableMap?.has(tokenTrim);

        let node: Nullable<ReferenceNode>;
        if (regexTestSingeRange(tokenTrim) && !isSuperTableDirectly) {
            node = new ReferenceNode(currentConfigService, runtimeService, tokenTrim, ReferenceObjectType.CELL, isPrepareMerge);
        } else if (isLexerNode && this._checkParentIsUnionOperator(param as LexerNode) && !isSuperTableDirectly) {
            if (regexTestSingleRow(tokenTrim)) {
                node = new ReferenceNode(currentConfigService, runtimeService, tokenTrim, ReferenceObjectType.ROW, isPrepareMerge);
            } else if (regexTestSingleColumn(tokenTrim)) {
                node = new ReferenceNode(currentConfigService, runtimeService, tokenTrim, ReferenceObjectType.COLUMN, isPrepareMerge);
            }
        } else {
            if (!this._checkTokenIsTableReference(tokenTrim) && !isSuperTableDirectly) {
                return;
            }

            const tableReferenceNode = this._getTableReferenceNode(tokenTrim, isLexerNode, isPrepareMerge);
            if (tableReferenceNode) {
                node = tableReferenceNode;
            }
        }

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
        const unitId = this._currentConfigService.getExecuteUnitId();
        if (!unitId) {
            return;
        }
        return this._superTableService.getTableMap(unitId);
    }

    private _getTableReferenceNode(tokenTrim: string, isLexerNode: boolean, isPrepareMerge: boolean) {
        const { tableName, columnStruct } = this._splitTableStructuredRef(tokenTrim);
        const tableMap = this._getTableMap();
        if (!isLexerNode && tableMap?.has(tableName)) {
            const columnDataString = columnStruct;
            const tableData = tableMap.get(tableName)!;
            const tableOption = this._superTableService.getTableOptionMap();
            return new ReferenceNode(
                this._currentConfigService,
                this._formulaRuntimeService,
                tokenTrim,
                ReferenceObjectType.COLUMN,
                isPrepareMerge,
                new TableReferenceObject(tokenTrim, tableData, columnDataString, tableOption)
            );
        }
    }

    private _splitTableStructuredRef(ref: string) {
        const idx = ref.indexOf('[');
        if (idx === -1) {
            return { tableName: ref, struct: '' };
        }
        return {
            tableName: ref.slice(0, idx),
            columnStruct: ref.slice(idx), // 包含外层 [[...]]
        };
    }

    private _checkTokenIsTableReference(token: string): boolean {
        return regexTestReferenceTableAllColumn(token) || regexTestReferenceTableSingleColumn(token) || regexTestReferenceTableMultipleColumn(token) || regexTestReferenceTableTitleOnlyAnyHash(token);
    }

    private _checkParentIsUnionOperator(param: LexerNode) {
        return param.getParent()?.getParent()?.getToken().trim() === matchToken.COLON;
    }
}
