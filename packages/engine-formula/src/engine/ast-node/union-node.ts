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
import type { MultiAreaReferenceObject } from '../reference-object/multi-area-reference-object';
import { ErrorType } from '../../basics/error-type';
import { matchToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IFunctionService } from '../../services/function.service';
import { LexerNode } from '../analysis/lexer-node';
import { BaseReferenceObject } from '../reference-object/base-reference-object';
import { createThreeDimensionalReference, expandSheetSpan } from '../utils/three-dimensional-reference';
import { getRangeReferenceObjectFromCache } from '../utils/value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

// const UNION_EXECUTOR_NAME = 'UNION';

export class UnionNode extends BaseAstNode {
    constructor(
        operatorString: string,
        private readonly _currentConfigService: IFormulaCurrentConfigService
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
            result = this._createThreeDimensionalReference(leftChild.getToken(), rightChild)
                ?? this._unionFunction(leftNode, rightNode);
        } else {
            result = ErrorValueObject.create(ErrorType.NAME);
        }
        if (result instanceof BaseReferenceObject) {
            result = expandSheetSpan(result, this._currentConfigService) ?? result;
        }
        this.setValue(result);
    }

    private _createThreeDimensionalReference(
        firstSheetToken: string,
        rightChild: BaseAstNode
    ): MultiAreaReferenceObject | ErrorValueObject | undefined {
        const rightNode = rightChild.getValue();
        if (!(rightNode instanceof BaseReferenceObject)) {
            return;
        }

        const source = rightNode;
        // Merged rectangular references lose their tokens; inspect the original endpoint.
        let lastSheetNode = rightChild;
        while (lastSheetNode.getToken() === matchToken.COLON) {
            lastSheetNode = lastSheetNode.getChildren()[0];
        }
        if (firstSheetToken.trim().startsWith("'") && firstSheetToken.trim().endsWith("'")) {
            return ErrorValueObject.create(ErrorType.NAME);
        }
        const firstSheetName = firstSheetToken.trim();
        const lastSheetName = source.getForcedSheetName();
        if (!firstSheetName || !lastSheetName) {
            return;
        }

        const sheetsInfo = this._currentConfigService.getSheetsInfo(source.getUnitId());
        if (
            lastSheetNode.getToken().trim().startsWith("'") &&
            Object.values(sheetsInfo.sheetNameMap).some((name) => name.toLocaleLowerCase() === firstSheetName.toLocaleLowerCase())
        ) {
            return ErrorValueObject.create(ErrorType.NAME);
        }
        return createThreeDimensionalReference(firstSheetName, lastSheetName, source, sheetsInfo);
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
