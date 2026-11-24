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
import type { BaseAstNode, LambdaPrivacyVarType } from '../ast-node/base-ast-node';
import type { LambdaNode } from '../ast-node/lambda-node';
import type { Interpreter } from '../interpreter/interpreter';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { PrimitiveValueType } from './primitive-object';
import { ErrorType } from '../../basics/error-type';
import { LambdaParameterNode } from '../ast-node/lambda-parameter-node';
import { NodeType } from '../ast-node/node-type';
import { AsyncObject } from '../reference-object/base-reference-object';
import { generateExecuteAstNodeData } from '../utils/ast-node-tool';
import { ValueObjectFactory } from './array-value-object';
import { BaseValueObject, ErrorValueObject } from './base-value-object';
import { NullValueObject } from './primitive-object';

const MAX_LAMBDA_CALL_DEPTH = 64;

function visitLambdaTree(node: BaseAstNode, visit: (child: BaseAstNode) => void): void {
    visit(node);
    for (const child of node.getChildren()) {
        visitLambdaTree(child, visit);
    }
}

export class LambdaValueObjectObject extends BaseValueObject {
    private static readonly _callDepth = new WeakMap<LambdaNode, number>();

    static create(lambdaNode: LambdaNode, interpreter: Interpreter, optionalParameters: ReadonlySet<string>) {
        return new LambdaValueObjectObject(lambdaNode, interpreter, optionalParameters);
    }

    private readonly _captured = new Map<LambdaPrivacyVarType, Map<string, FunctionVariantType>>();
    private _lambdaPrivacyVarKeys: string[] = [];

    constructor(
        private _lambdaNode: Nullable<LambdaNode>,
        private _interpreter: Nullable<Interpreter>,
        private readonly _optionalParameters: ReadonlySet<string>
    ) {
        super();
        if (_lambdaNode) {
            this._lambdaPrivacyVarKeys = Array.from(_lambdaNode.getScope().keys());
            this._captureBindings(_lambdaNode);
        }
    }

    override dispose(): void {
        this._captured.clear();
        this._lambdaNode = null;
        this._interpreter = null;
        this._lambdaPrivacyVarKeys = [];
    }

    override isLambda() {
        return true;
    }

    execute(...variants: FunctionVariantType[]) {
        const node = this._lambdaNode;
        const interpreter = this._interpreter;
        const keys = this._lambdaPrivacyVarKeys;
        if (!node || !interpreter || variants.length > keys.length ||
            keys.slice(variants.length).some((key) => !this._optionalParameters.has(key))) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const depths = LambdaValueObjectObject._callDepth;
        const depth = depths.get(node) ?? 0;
        if (depth >= MAX_LAMBDA_CALL_DEPTH) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const previousValues = new Map<BaseAstNode, Nullable<FunctionVariantType>>();
        if (depth > 0) {
            // The recursive call shares this AST, including already evaluated sibling nodes.
            visitLambdaTree(node, (child) => previousValues.set(child, child.getValue()));
        } else {
            // A LET binding can still point to this node after the invocation.
            previousValues.set(node, node.getValue());
        }
        const values = new Map(keys.map((key, index) => [key, variants[index] ?? NullValueObject.create(true)]));
        const restoreBindings = [LambdaParameterNode.bindValues(node.getScope(), values)];
        for (const [scope, bindings] of this._captured) {
            restoreBindings.push(LambdaParameterNode.bindValues(scope, bindings));
        }
        node.setNotEmpty(false);
        depths.set(node, depth + 1);
        const restoreInvocation = () => {
            for (const [child, value] of previousValues) {
                child.setValue(value);
            }
            for (const restore of restoreBindings) {
                restore();
            }
            node.setNotEmpty(depth === 0);
            if (depth === 0) {
                depths.delete(node);
            } else {
                depths.set(node, depth);
            }
        };

        const data = generateExecuteAstNodeData(node);
        let asynchronous = false;
        try {
            if (interpreter.checkAsyncNode(node)) {
                const result = interpreter.executeAsync(data) as Promise<BaseValueObject>;
                asynchronous = true;
                return new AsyncObject(result.finally(restoreInvocation));
            }
            const value = interpreter.execute(data);
            return value.isReferenceObject() ? (value as BaseReferenceObject).toArrayValueObject() : value as BaseValueObject;
        } finally {
            if (!asynchronous) {
                restoreInvocation();
            }
        }
    }

    executeCustom(...variants: PrimitiveValueType[]) {
        const dateSystem = this._interpreter?.getDateSystem();
        // Primitive arguments must be converted before nested execution, using the same workbook context.
        const baseValueObjects = variants.map((variant) => ValueObjectFactory.create(variant, false, dateSystem));
        return this.execute(...baseValueObjects);
    }

    private _captureBindings(node: LambdaNode): void {
        const localScopes = new Set<LambdaPrivacyVarType>();
        const references: LambdaParameterNode[] = [];
        visitLambdaTree(node, (child) => {
            if (child.nodeType === NodeType.LAMBDA) {
                localScopes.add((child as LambdaNode).getScope());
            } else if (child.nodeType === NodeType.LAMBDA_PARAMETER) {
                references.push(child as LambdaParameterNode);
            }
        });
        for (const reference of references) {
            const scope = reference.getCurrentLambdaPrivacyVar();
            if (localScopes.has(scope)) {
                continue;
            }
            const name = reference.getLambdaParameter();
            const value = LambdaParameterNode.getBinding(scope, name);
            if (value == null) {
                continue;
            }
            const bindings = this._captured.get(scope) ?? new Map<string, FunctionVariantType>();
            bindings.set(name, value);
            this._captured.set(scope, bindings);
        }
    }

    acceptsArity(count: number): boolean {
        return this._lambdaPrivacyVarKeys.length === count;
    }

    getLambdaPrivacyVarKeys() {
        return this._lambdaPrivacyVarKeys;
    }
}
