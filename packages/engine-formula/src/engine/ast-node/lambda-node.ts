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
import type { LambdaPrivacyVarType } from './base-ast-node';
import { generateRandomId, Inject } from '@univerjs/core';
import { ErrorType } from '../../basics/error-type';
import {
    DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME,
    DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER,
    DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER,
} from '../../basics/token-type';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { LexerNode } from '../analysis/lexer-node';
import { Interpreter } from '../interpreter/interpreter';
import { getLambdaParameterDeclaration, isFirstChildParameter, normalizeLambdaVariable } from '../utils/function-definition';
import { updateLambdaStatement } from '../utils/update-lambda-statement';
import { LambdaValueObjectObject } from '../value-object/lambda-value-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class LambdaNode extends BaseAstNode {
    private _isNotEmpty = true;

    constructor(
        token: string,
        private _lambdaId: string,
        private _interpreter: Interpreter,
        private _scope: LambdaPrivacyVarType,
        private _optionalParameters: ReadonlySet<string>,
        private _runtimeService: IFormulaRuntimeService
    ) {
        super(token);
    }

    override get nodeType() {
        return NodeType.LAMBDA;
    }

    override setNotEmpty(state = false) {
        this._isNotEmpty = state;
    }

    isEmptyParamFunction() {
        return this.getChildren().length < 2 && this._isNotEmpty;
    }

    isFunctionParameter() {
        return this._lambdaId === null;
    }

    getLambdaId() {
        return this._lambdaId;
    }

    getScope(): LambdaPrivacyVarType {
        return this._scope;
    }

    override execute() {
        if (this.isEmptyParamFunction()) {
            this.setValue(LambdaValueObjectObject.create(this, this._interpreter, this._optionalParameters));
        } else {
            const children = this.getChildren();
            const childrenCount = children.length;
            this.setValue(children[childrenCount - 1].getValue());
        }

        this._runtimeService.setUnitArrayFormulaEmbeddedMap();
    }

    // override async executeAsync() {
    //     if (this.isEmptyParamFunction()) {
    //         await this.setValue(LambdaValueObjectObject.create(this, this._interpreter, this._lambdaPrivacyVarKeys));
    //     } else {
    //         const children = this.getChildren();
    //         const childrenCount = children.length;
    //         await this.setValue(children[childrenCount - 1].getValue());
    //     }

    //     return Promise.resolve(AstNodePromiseType.SUCCESS);
    // }
}

export class LambdaNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @Inject(Interpreter) private readonly _interpreter: Interpreter
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.LAMBDA) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: LexerNode): BaseAstNode {
        const children = param.getChildren();
        const lambdaVar = children[0];
        let parameterArray = children.slice(1, -1);
        let argumentCount: number | undefined;
        const functionStatementNode = children[children.length - 1];
        if (!(lambdaVar instanceof LexerNode && functionStatementNode instanceof LexerNode)) {
            return ErrorNode.create(ErrorType.NAME);
        }

        if (lambdaVar.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
            const argumentsAndCall = lambdaVar.getChildren();
            argumentCount = argumentsAndCall.length - Number(isFirstChildParameter(argumentsAndCall[0]));
            if (argumentCount > parameterArray.length) {
                return ErrorNode.create(ErrorType.VALUE);
            }
        } else {
            parameterArray = children.slice(0, -1);
        }

        // const lambdaId = nanoid(8);
        const lambdaId = generateRandomId(8);

        // const lambdaRuntime = parserDataLoader.getLambdaRuntime();
        const currentLambdaPrivacyVar = new Map<string, Nullable<BaseAstNode>>();
        const optionalParameters = new Set<string>();

        for (let i = 0; i < parameterArray.length; i++) {
            const parameter = parameterArray[i];
            if (parameter instanceof LexerNode) {
                const declaration = getLambdaParameterDeclaration(parameter);
                if (declaration == null) {
                    return ErrorNode.create(ErrorType.VALUE);
                }
                const variant = normalizeLambdaVariable(declaration);
                const optional = /^_xlop\./i.test(declaration) || (declaration.startsWith('[') && declaration.endsWith(']'));
                if (optional) optionalParameters.add(variant);
                if (argumentCount != null && i >= argumentCount && !optional) {
                    return ErrorNode.create(ErrorType.VALUE);
                }
                parameter.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER);
                currentLambdaPrivacyVar.set(variant, undefined);
            } else {
                return ErrorNode.create(ErrorType.VALUE);
            }
        }

        this._runtimeService.registerFunctionDefinitionPrivacyVar(lambdaId, currentLambdaPrivacyVar);

        this._updateLambdaStatement(functionStatementNode, lambdaId, currentLambdaPrivacyVar);

        return new LambdaNode(param.getToken(), lambdaId, this._interpreter, currentLambdaPrivacyVar, optionalParameters, this._runtimeService);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken().trim().toUpperCase();
        if (token !== DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME) {
            return;
        }

        return this.create(param);
    }

    private _updateLambdaStatement(
        functionStatementNode: LexerNode,
        lambdaId: string,
        currentLambdaPrivacyVar: LambdaPrivacyVarType
    ) {
        updateLambdaStatement(functionStatementNode, lambdaId, currentLambdaPrivacyVar);
    }
}
