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
import type { LambdaParameterNode } from '../ast-node/lambda-parameter-node';
import type { Interpreter } from '../interpreter/interpreter';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { PrimitiveValueType } from './primitive-object';
import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../../basics/token-type';
import { AsyncObject } from '../reference-object/base-reference-object';
import { generateExecuteAstNodeData } from '../utils/ast-node-tool';
import { ValueObjectFactory } from './array-value-object';
import { BaseValueObject, ErrorValueObject } from './base-value-object';

function getRootLexerHasValueNode(node: Nullable<BaseAstNode>): Nullable<BaseAstNode> {
    if (!node) {
        return;
    }
    if (node.getToken() !== DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
        return node;
    }

    const parameterNode = node as LambdaParameterNode;
    const currentLambdaPrivacyVar = parameterNode.getCurrentLambdaPrivacyVar();
    const lambdaParameter = parameterNode.getLambdaParameter();

    if (!currentLambdaPrivacyVar) {
        return;
    }

    const chainNode = currentLambdaPrivacyVar.get(lambdaParameter);

    if (chainNode == null && node.getValue()) {
        return node;
    }

    return getRootLexerHasValueNode(chainNode);
}

export class LambdaValueObjectObject extends BaseValueObject {
    static create(lambdaNode: BaseAstNode, interpreter: Interpreter, lambdaPrivacyVarKeys: string[]) {
        return new LambdaValueObjectObject(lambdaNode, interpreter, lambdaPrivacyVarKeys);
    }

    private _lambdaPrivacyValueMap = new Map<string, FunctionVariantType>();

    constructor(
        private _lambdaNode: Nullable<BaseAstNode>,

        private _interpreter: Nullable<Interpreter>,

        private _lambdaPrivacyVarKeys: string[]
    ) {
        super(0);
        this._lambdaPrivacyValueMap.clear();
    }

    override dispose(): void {
        this._lambdaPrivacyValueMap.clear();
        this._lambdaPrivacyValueMap = new Map();
        this._lambdaNode = null;
        this._interpreter = null;
        this._lambdaPrivacyVarKeys = [];
    }

    override isLambda() {
        return true;
    }

    execute(...variants: FunctionVariantType[]) {
        const paramCount = this._lambdaPrivacyVarKeys.length;
        if (variants.length !== paramCount || !this._interpreter || !this._lambdaNode) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        this._setLambdaPrivacyValueMap(variants);

        this._setLambdaNodeValue(this._lambdaNode);

        this._lambdaNode.setNotEmpty(false);

        let value: AsyncObject | BaseValueObject;
        if (this._interpreter.checkAsyncNode(this._lambdaNode)) {
            value = new AsyncObject(this._interpreter.executeAsync(generateExecuteAstNodeData(this._lambdaNode)) as Promise<BaseValueObject>);
        } else {
            const o = this._interpreter.execute(generateExecuteAstNodeData(this._lambdaNode));
            if (o.isReferenceObject()) {
                value = (o as BaseReferenceObject).toArrayValueObject();
            } else {
                value = o as BaseValueObject;
            }
        }

        this._lambdaNode.setNotEmpty(true);

        return value;
    }

    /**
     * Execute custom lambda function, handle basic types
     * @param variants
     */
    executeCustom(...variants: PrimitiveValueType[]) {
        // Create base value object from primitive value, then execute
        const baseValueObjects = variants.map((variant) => ValueObjectFactory.create(variant));
        return this.execute(...baseValueObjects);
    }

    private _setLambdaNodeValue(node: Nullable<BaseAstNode>) {
        if (!node) {
            return;
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            const token = item.getToken();

            if (token === DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
                const lambdaParameter = (item as LambdaParameterNode).getLambdaParameter();
                const value = this._lambdaPrivacyValueMap.get(lambdaParameter);
                if (value) {
                    (item as LambdaParameterNode).setValue(value);
                } else {
                    const currentLambdaPrivacyVar = (item as LambdaParameterNode).getCurrentLambdaPrivacyVar();
                    const node = getRootLexerHasValueNode(currentLambdaPrivacyVar.get(lambdaParameter));
                    if (node != null) {
                        (item as LambdaParameterNode).setValue(node.getValue());
                    }
                }
                continue;
            }

            this._setLambdaNodeValue(item);
        }
    }

    private _setLambdaPrivacyValueMap(variants: FunctionVariantType[]) {
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            const key = this._lambdaPrivacyVarKeys[i];

            this._lambdaPrivacyValueMap.set(key, variant);
        }
    }

    getLambdaPrivacyVarKeys() {
        return this._lambdaPrivacyVarKeys;
    }
}
