import { Disposable } from '@univerjs/core';

import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import type { PreCalculateNodeType } from '../../basics/node-type';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import type { FunctionNode } from '../ast-node';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import { NodeType } from '../ast-node/node-type';
import { ErrorValueObject } from '../other-object/error-value-object';
import type { FunctionVariantType } from '../reference-object/base-reference-object';

export class Interpreter extends Disposable {
    constructor(@IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService) {
        super();
    }

    override dispose(): void {}

    async executeAsync(node: BaseAstNode): Promise<FunctionVariantType> {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        await this._executeAsync(node);

        const value = node.getValue();

        if (value == null) {
            throw new Error('node value is null');
        }

        return Promise.resolve(value);
    }

    execute(node: BaseAstNode): FunctionVariantType {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        this._execute(node);

        const value = node.getValue();

        if (value == null) {
            throw new Error('node value is null');
        }

        return value;
    }

    executePreCalculateNode(node: PreCalculateNodeType) {
        node.execute();
        return node.getValue();
    }

    checkAsyncNode(node: BaseAstNode) {
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

    private async _executeAsync(node: BaseAstNode): Promise<AstNodePromiseType> {
        if (this._runtimeService.isStopExecution()) {
            return Promise.resolve(AstNodePromiseType.ERROR);
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            this._executeAsync(item);
        }

        if (node.nodeType === NodeType.FUNCTION && (node as FunctionNode).isAsync()) {
            await node.executeAsync();
        } else {
            node.execute();
        }

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    private _execute(node: BaseAstNode): AstNodePromiseType {
        if (this._runtimeService.isStopExecution()) {
            return AstNodePromiseType.ERROR;
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            this._execute(item);
        }

        node.execute();

        return AstNodePromiseType.SUCCESS;
    }
}
