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

import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import { ErrorType } from '../../basics/error-type';
import { matchToken } from '../../basics/token';
import { IFunctionService } from '../../services/function.service';
import { LexerNode } from '../analysis/lexer-node';
import { getRangeReferenceObjectFromCache } from '../utils/value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

// const UNION_EXECUTOR_NAME = 'UNION';

export class UnionNode extends BaseAstNode {
    constructor(operatorString: string) {
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
            throw new Error('leftNode and rightNode');
        }

        let result: FunctionVariantType;
        if (this.getToken() === matchToken.COLON) {
            result = this._unionFunction(leftNode, rightNode) as FunctionVariantType;
        } else {
            result = ErrorValueObject.create(ErrorType.NAME);
        }
        this.setValue(result);
    }

    private _unionFunction(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isError() || variant2.isError()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        if (!variant1.isReferenceObject() || !variant2.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        variant1 = variant1 as BaseReferenceObject;

        variant2 = variant2 as BaseReferenceObject;

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
    constructor(@IFunctionService private readonly _functionService: IFunctionService) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.UNION) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: string): BaseAstNode {
        return new UnionNode(param);
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
