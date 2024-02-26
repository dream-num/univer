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

import type { IAccessor } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ErrorType } from '../../basics/error-type';
import {
    $SUPER_TABLE_COLUMN_REGEX,
    REFERENCE_REGEX_SINGLE_COLUMN,
    REFERENCE_REGEX_SINGLE_ROW,
    REFERENCE_SINGLE_RANGE_REGEX,
} from '../../basics/regex';
import { matchToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDefinedNamesService } from '../../services/defined-names.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { ISuperTableService } from '../../services/super-table.service';
import { Lexer } from '../analysis/lexer';
import { LexerNode } from '../analysis/lexer-node';
import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import { CellReferenceObject } from '../reference-object/cell-reference-object';
import { ColumnReferenceObject } from '../reference-object/column-reference-object';
import { RowReferenceObject } from '../reference-object/row-reference-object';
import { TableReferenceObject } from '../reference-object/table-reference-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class ReferenceNode extends BaseAstNode {
    constructor(
        private _accessor: IAccessor,
        private _operatorString: string,
        private _referenceObject: BaseReferenceObject,
        private _isPrepareMerge: boolean = false
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.REFERENCE;
    }

    override execute() {
        const currentConfigService = this._accessor.get(IFormulaCurrentConfigService);
        const runtimeService = this._accessor.get(IFormulaRuntimeService);

        this._referenceObject.setDefaultUnitId(runtimeService.currentUnitId);

        this._referenceObject.setDefaultSheetId(runtimeService.currentSubUnitId);

        this._referenceObject.setForcedSheetId(currentConfigService.getSheetNameMap());

        this._referenceObject.setUnitData(currentConfigService.getUnitData());

        this._referenceObject.setArrayFormulaCellData(currentConfigService.getArrayFormulaCellData());

        this._referenceObject.setRuntimeData(runtimeService.getUnitData());

        this._referenceObject.setNumfmtItemData(currentConfigService.getNumfmtItemMap());

        this._referenceObject.setRuntimeArrayFormulaCellData(runtimeService.getRuntimeArrayFormulaCellData());

        this._referenceObject.setRuntimeFeatureCellData(runtimeService.getRuntimeFeatureCellData());

        const { x, y } = this.getRefOffset();

        this._referenceObject.setRefOffset(x, y);

        if (!this._isPrepareMerge && this._referenceObject.isExceedRange()) {
            this.setValue(new ErrorValueObject(ErrorType.NAME));
        } else {
            this.setValue(this._referenceObject);
        }
    }
}

export class ReferenceNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @ISuperTableService private readonly _superTableService: ISuperTableService,
        @IFormulaRuntimeService private readonly _formulaRuntimeService: IFormulaRuntimeService,
        @Inject(Lexer) private readonly _lexer: Lexer,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.REFERENCE) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        let isLexerNode = false;
        let tokenTrim: string;
        let isPrepareMerge = false;
        if (param instanceof LexerNode) {
            isLexerNode = true;
            tokenTrim = param.getToken().trim();

            /**
             * If this node is a reference to a range,
             * it is necessary to determine whether it will be combined into a single range by a union operation.
             */
            if (param.getParent()?.getParent()?.getToken().trim() === matchToken.COLON) {
                isPrepareMerge = true;
            }
        } else {
            tokenTrim = param.trim();
        }

        // const tokenTrim = param.trim();
        // if (new RegExp(REFERENCE_MULTIPLE_RANGE_REGEX).test(tokenTrim)) {
        //     return true;
        // }

        if (!isLexerNode && tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        if (new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(tokenTrim)) {
            return new ReferenceNode(this._injector, tokenTrim, new CellReferenceObject(tokenTrim), isPrepareMerge);
        }

        if (isLexerNode && new RegExp(REFERENCE_REGEX_SINGLE_ROW).test(tokenTrim)) {
            return new ReferenceNode(this._injector, tokenTrim, new RowReferenceObject(tokenTrim), isPrepareMerge);
        }

        if (isLexerNode && new RegExp(REFERENCE_REGEX_SINGLE_COLUMN).test(tokenTrim)) {
            return new ReferenceNode(this._injector, tokenTrim, new ColumnReferenceObject(tokenTrim), isPrepareMerge);
        }

        const unitId = this._formulaRuntimeService.currentUnitId;
        // parserDataLoader.get

        const tableMap = this._superTableService.getTableMap(unitId);
        const $regex = new RegExp($SUPER_TABLE_COLUMN_REGEX, 'g');
        const tableName = tokenTrim.replace($regex, '');
        if (!isLexerNode && tableMap?.has(tableName)) {
            const columnResult = $regex.exec(tokenTrim);
            let columnDataString = '';
            if (columnResult) {
                columnDataString = columnResult[0];
            }
            const tableData = tableMap.get(tableName)!;
            const tableOption = this._superTableService.getTableOptionMap();
            return new ReferenceNode(
                this._injector,
                tokenTrim,
                new TableReferenceObject(tokenTrim, tableData, columnDataString, tableOption)
            );
        }
    }
}
