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
    regexTestSingeRange,
    regexTestSingleColumn,
    regexTestSingleRow,
} from '../../basics/regex';
import { matchToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { LexerNode } from '../analysis/lexer-node';
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
        private _isPrepareMerge: boolean = false
    ) {
        super(operatorString);
    }

    override get nodeType() {
        return NodeType.REFERENCE;
    }

    override execute() {
        const currentConfigService = this._currentConfigService;
        const runtimeService = this._runtimeService;

        const referenceObject = getReferenceObjectFromCache(this.getToken(), this._referenceObjectType);

        referenceObject.setDefaultUnitId(runtimeService.currentUnitId);

        referenceObject.setDefaultSheetId(runtimeService.currentSubUnitId);

        referenceObject.setForcedSheetId(currentConfigService.getSheetNameMap());

        referenceObject.setUnitData(currentConfigService.getUnitData());

        referenceObject.setArrayFormulaCellData(currentConfigService.getArrayFormulaCellData());

        referenceObject.setRuntimeData(runtimeService.getUnitData());

        referenceObject.setUnitStylesData(currentConfigService.getUnitStylesData());

        referenceObject.setRuntimeArrayFormulaCellData(runtimeService.getRuntimeArrayFormulaCellData());

        referenceObject.setRuntimeFeatureCellData(runtimeService.getRuntimeFeatureCellData());

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
        @IFunctionService private readonly _functionService: IFunctionService
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

        let node: Nullable<ReferenceNode>;
        if (regexTestSingeRange(tokenTrim)) {
            node = new ReferenceNode(currentConfigService, runtimeService, tokenTrim, ReferenceObjectType.CELL, isPrepareMerge);
        } else if (isLexerNode && this._checkParentIsUnionOperator(param as LexerNode)) {
            if (regexTestSingleRow(tokenTrim)) {
                node = new ReferenceNode(currentConfigService, runtimeService, tokenTrim, ReferenceObjectType.ROW, isPrepareMerge);
            } else if (regexTestSingleColumn(tokenTrim)) {
                node = new ReferenceNode(currentConfigService, runtimeService, tokenTrim, ReferenceObjectType.COLUMN, isPrepareMerge);
            }
        }
        // else {
        //     const unitId = this._formulaRuntimeService.currentUnitId;
        //     // parserDataLoader.get

        //     const tableMap = this._superTableService.getTableMap(unitId);
        //     const $regex = $SUPER_TABLE_COLUMN_REGEX_PRECOMPILING;
        //     const tableName = tokenTrim.replace($regex, '');
        //     if (!isLexerNode && tableMap?.has(tableName)) {
        //         const columnResult = $regex.exec(tokenTrim);
        //         let columnDataString = '';
        //         if (columnResult) {
        //             columnDataString = columnResult[0];
        //         }
        //         const tableData = tableMap.get(tableName)!;
        //         const tableOption = this._superTableService.getTableOptionMap();
        //         node = new ReferenceNode(
        //             this._injector,
        //             tokenTrim,
        //             new TableReferenceObject(tokenTrim, tableData, columnDataString, tableOption)
        //         );
        //     }
        // }

        if (node) {
            if (atPrefixNode) {
                node.setParent(atPrefixNode);
            } else if (minusPrefixNode) {
                node.setParent(minusPrefixNode);
            }
            return node;
        }
    }

    private _checkParentIsUnionOperator(param: LexerNode) {
        return param.getParent()?.getParent()?.getToken().trim() === matchToken.COLON;
    }
}
