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
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { FunctionNode } from '../ast-node/function-node';
import type { LambdaNode } from '../ast-node/lambda-node';
import type { ReferenceNode } from '../ast-node/reference-node';
import type { FunctionVariantType } from '../reference-object/base-reference-object';
import type { IExecuteAstNodeData } from '../utils/ast-node-tool';
import type { PreCalculateNodeType } from '../utils/node-type';
import { Disposable } from '@univerjs/core';
import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME } from '../../basics/token-type';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { NodeType } from '../ast-node/node-type';
import { ErrorValueObject } from '../value-object/base-value-object';

export class Interpreter extends Disposable {
    constructor(@IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService) {
        super();
    }

    async executeAsync(nodeData: IExecuteAstNodeData): Promise<FunctionVariantType> {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!nodeData || !nodeData.node) {
            return Promise.resolve(ErrorValueObject.create(ErrorType.VALUE));
        }

        const node = nodeData.node;
        const refOffsetX = nodeData.refOffsetX;
        const refOffsetY = nodeData.refOffsetY;

        await this._executeAsync(node, refOffsetX, refOffsetY);

        const value = node.getValue();

        if (value == null) {
            return Promise.resolve(ErrorValueObject.create(ErrorType.VALUE));
        }

        return Promise.resolve(value);
    }

    execute(nodeData: IExecuteAstNodeData): FunctionVariantType {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!nodeData || !nodeData.node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const node = nodeData.node;
        const refOffsetX = nodeData.refOffsetX;
        const refOffsetY = nodeData.refOffsetY;

        this._execute(node, refOffsetX, refOffsetY);

        const value = node.getValue();

        if (value == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return value;
    }

    executePreCalculateNode(node: PreCalculateNodeType) {
        node.execute();
        return node.getValue();
    }

    checkAsyncNode(node: Nullable<BaseAstNode>) {
        if (node == null) {
            return false;
        }
        const result: boolean[] = [];
        this._checkAsyncNode(node, result);

        for (let i = 0, len = result.length; i < len; i++) {
            const item = result[i];
            if (item === true) {
                return true;
            }
        }

        return false;
    }

    private _checkAsyncNode(node: BaseAstNode, resultList: boolean[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            resultList.push(item.isAsync());
            this._checkAsyncNode(item, resultList);
        }
    }

    private async _executeAsync(node: BaseAstNode, refOffsetX = 0, refOffsetY = 0): Promise<AstNodePromiseType> {
        if (this._runtimeService.isStopExecution()) {
            return Promise.resolve(AstNodePromiseType.ERROR);
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            const token = item.getToken();
            /**
             * If the lambda expression has no parameters, then do not execute further.
             */
            if (
                token.toUpperCase() === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME &&
                (item as LambdaNode).isEmptyParamFunction()
            ) {
                item.execute();
                continue;
            }
            await this._executeAsync(item, refOffsetX, refOffsetY);
        }

        if (node.nodeType === NodeType.REFERENCE) {
            (node as ReferenceNode).setRefOffset(refOffsetX, refOffsetY);
        }

        if (node.nodeType === NodeType.FUNCTION && (node as FunctionNode).isAsync()) {
            await node.executeAsync();
        } else {
            node.execute();
        }

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    private _execute(node: BaseAstNode, refOffsetX = 0, refOffsetY = 0): AstNodePromiseType {
        if (this._runtimeService.isStopExecution()) {
            return AstNodePromiseType.ERROR;
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            const token = item.getToken();
            /**
             * If the lambda expression has no parameters, then do not execute further.
             */
            if (
                token.toUpperCase() === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME &&
                (item as LambdaNode).isEmptyParamFunction()
            ) {
                item.execute();
                continue;
            }
            this._execute(item, refOffsetX, refOffsetY);
        }

        if (node.nodeType === NodeType.REFERENCE) {
            (node as ReferenceNode).setRefOffset(refOffsetX, refOffsetY);
        }

        node.execute();

        return AstNodePromiseType.SUCCESS;
    }
}
