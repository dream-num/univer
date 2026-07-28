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

import type { FunctionVariantType } from '../reference-object/base-reference-object';
import { ErrorType } from '../../basics/error-type';
import { matchToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { LexerNode } from '../analysis/lexer-node';
import { BaseReferenceObject } from '../reference-object/base-reference-object';
import { MultiAreaArrayMode, MultiAreaReferenceObject } from '../reference-object/multi-area-reference-object';
import { RangeReferenceObject } from '../reference-object/range-reference-object';
import { getRangeReferenceObjectFromCache } from '../utils/value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

// const UNION_EXECUTOR_NAME = 'UNION';

export class UnionNode extends BaseAstNode {
    constructor(
        operatorString: string,
        private readonly _currentConfigService: Pick<IFormulaCurrentConfigService, 'getSheetsInfo'>
    ) {
        super(operatorString);
    }

    override get nodeType() {
        return NodeType.UNION;
    }

    override execute() {
        const children = this.getChildren();
        const leftChild = children[0];
        const rightChild = children[1];
        const leftNode = leftChild.getValue();
        const rightNode = rightChild.getValue();

        if (leftNode == null || rightNode == null) {
            console.error('UnionNode execute leftNode or rightNode is null');
            this.setValue(ErrorValueObject.create(ErrorType.VALUE));
            return;
        }

        let result: FunctionVariantType;
        if (this.getToken() === matchToken.COLON) {
            result = this._createThreeDimensionalReference(leftChild.getToken(), rightNode)
                ?? this._unionFunction(leftNode, rightNode);
        } else {
            result = ErrorValueObject.create(ErrorType.NAME);
        }
        this.setValue(result);
    }

    private _createThreeDimensionalReference(
        firstSheetToken: string,
        rightNode: FunctionVariantType
    ): MultiAreaReferenceObject | undefined {
        if (!(rightNode instanceof BaseReferenceObject)) {
            return;
        }

        const source = rightNode;
        const firstSheetName = this._normalizeSheetName(firstSheetToken);
        const lastSheetName = this._normalizeSheetName(source.getForcedSheetName());
        if (!firstSheetName || !lastSheetName) {
            return;
        }

        const { sheetOrder, sheetNameMap } = this._currentConfigService.getSheetsInfo();
        const sheetIdsByName = new Map(
            Object.entries(sheetNameMap).map(([sheetId, sheetName]) => [sheetName.toLocaleLowerCase(), sheetId])
        );
        const firstSheetId = sheetIdsByName.get(firstSheetName.toLocaleLowerCase());
        const lastSheetId = sheetIdsByName.get(lastSheetName.toLocaleLowerCase());
        const firstIndex = firstSheetId == null ? -1 : sheetOrder.indexOf(firstSheetId);
        const lastIndex = lastSheetId == null ? -1 : sheetOrder.indexOf(lastSheetId);
        if (firstIndex < 0 || lastIndex < 0) {
            return;
        }

        const startIndex = Math.min(firstIndex, lastIndex);
        const endIndex = Math.max(firstIndex, lastIndex);
        const areas = sheetOrder.slice(startIndex, endIndex + 1).map((sheetId) => {
            const reference = new RangeReferenceObject(source.getRangeData(), sheetId, source.getUnitId());
            this._copyReferenceContext(source, reference);
            reference.setForcedSheetIdDirect(sheetId);
            reference.setForcedSheetName(sheetNameMap[sheetId] ?? '');
            return [reference];
        });

        return new MultiAreaReferenceObject(
            `${firstSheetToken}:${source.getToken()}`,
            areas,
            MultiAreaArrayMode.STACK_AREAS
        );
    }

    private _normalizeSheetName(token: string): string {
        const trimmed = token.trim();
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.slice(1, -1).replace(/''/g, "'");
        }
        return trimmed;
    }

    private _copyReferenceContext(source: BaseReferenceObject, target: BaseReferenceObject): void {
        target.setDefaultUnitId(source.getDefaultUnitId());
        target.setDefaultSheetId(source.getDefaultSheetId());
        target.setUnitData(source.getUnitData());
        target.setUnitStylesData(source.getUnitStylesData());
        target.setFilteredOutRows(source.getFilteredOutRows());
        target.setRuntimeData(source.getRuntimeData());
        target.setArrayFormulaCellData(source.getArrayFormulaCellData());
        target.setArrayFormulaRange(source.getArrayFormulaRange());
        target.setRuntimeArrayFormulaCellData(source.getRuntimeArrayFormulaCellData());
        target.setRuntimeArrayFormulaRange(source.getRuntimeArrayFormulaRange());
        target.setRuntimeFeatureCellData(source.getRuntimeFeatureCellData());

        const currentRow = source.getCurrentRow();
        const currentColumn = source.getCurrentColumn();
        if (currentRow != null && currentColumn != null) {
            target.setCurrentRowAndColumn(currentRow, currentColumn);
        }

        const { x, y } = source.getRefOffset();
        target.setRefOffset(x, y);
    }

    private _unionFunction(
        variant1: FunctionVariantType,
        variant2: FunctionVariantType
    ): FunctionVariantType {
        if (variant1.isError() || variant2.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!(variant1 instanceof BaseReferenceObject) || !(variant2 instanceof BaseReferenceObject)) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        return getRangeReferenceObjectFromCache(variant1, variant2);

        // if (variant1.isCell() && variant2.isCell()) {

        //     return variant1.unionBy(variant2);
        // }
        // if (variant1.isRow() && variant2.isRow()) {
        //     return variant1.unionBy(variant2);
        // }
        // if (variant1.isColumn() && variant2.isColumn()) {
        //     return variant1.unionBy(variant2);
        // }

        // // =A1:A gets #NAME?
        // return ErrorValueObject.create(ErrorType.NAME);
    }
}

export class UnionNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.UNION) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: string): BaseAstNode {
        return new UnionNode(param, this._currentConfigService);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken();

        const tokenTrim = token.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        if (tokenTrim !== matchToken.COLON) {
            return;
        }

        return this.create(tokenTrim);
    }
}
