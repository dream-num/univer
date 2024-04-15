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

import type { Nullable } from '@univerjs/core';
import { Disposable, sortRules } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { ErrorType } from '../../basics/error-type';
import {
    DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME,
    DEFAULT_TOKEN_LET_FUNCTION_NAME,
    DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER,
    DEFAULT_TOKEN_TYPE_PARAMETER,
    DEFAULT_TOKEN_TYPE_ROOT,
} from '../../basics/token-type';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { AstRootNode, AstRootNodeFactory } from '../ast-node/ast-root-node';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import { ErrorNode } from '../ast-node/base-ast-node';
import { FunctionNodeFactory } from '../ast-node/function-node';
import type { LambdaNode } from '../ast-node/lambda-node';
import { LambdaNodeFactory } from '../ast-node/lambda-node';
import { LambdaParameterNodeFactory } from '../ast-node/lambda-parameter-node';
import { NodeType } from '../ast-node/node-type';
import { NullNode } from '../ast-node/null-node';
import { OperatorNodeFactory } from '../ast-node/operator-node';
import { PrefixNodeFactory } from '../ast-node/prefix-node';
import { ReferenceNodeFactory } from '../ast-node/reference-node';
import { SuffixNodeFactory } from '../ast-node/suffix-node';
import { UnionNodeFactory } from '../ast-node/union-node';
import { ValueNodeFactory } from '../ast-node/value-node';
import { isChildRunTimeParameter, isFirstChildParameter } from '../utils/function-definition';
import { getAstNodeTopParent } from '../utils/ast-node-tool';
import { LexerNode } from './lexer-node';

export class AstTreeBuilder extends Disposable {
    private _astNodeFactoryList: AstRootNodeFactory[] = [];

    private _refOffsetX = 0;

    private _refOffsetY = 0;

    constructor(
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @Inject(AstRootNodeFactory) private readonly _astRootNodeFactory: AstRootNodeFactory,
        @Inject(FunctionNodeFactory) private readonly _functionNodeFactory: FunctionNodeFactory,
        @Inject(LambdaNodeFactory) private readonly _lambdaNodeFactory: LambdaNodeFactory,
        @Inject(LambdaParameterNodeFactory) private readonly _lambdaParameterNodeFactory: LambdaParameterNodeFactory,
        @Inject(OperatorNodeFactory) private readonly _operatorNodeFactory: OperatorNodeFactory,
        @Inject(PrefixNodeFactory) private readonly _prefixNodeFactory: PrefixNodeFactory,
        @Inject(ReferenceNodeFactory) private readonly _referenceNodeFactory: ReferenceNodeFactory,
        @Inject(SuffixNodeFactory) private readonly _suffixNodeFactory: SuffixNodeFactory,
        @Inject(UnionNodeFactory) private readonly _unionNodeFactory: UnionNodeFactory,
        @Inject(ValueNodeFactory) private readonly _valueNodeFactory: ValueNodeFactory
    ) {
        super();

        this._initializeAstNode();
    }

    override dispose(): void {
        this._astNodeFactoryList.forEach((nodeFactory) => {
            nodeFactory.dispose();
        });

        this._astNodeFactoryList = [];
    }

    parse(lexerNode: LexerNode, refOffsetX: number = 0, refOffsetY: number = 0) {
        const astNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);

        this._refOffsetX = refOffsetX;

        this._refOffsetY = refOffsetY;

        const node = this._parse(lexerNode, astNode);

        /**
         * If the lexer node has defined names,
         * it means that the current formula contains a reference to the defined name.
         */
        if (lexerNode.hasDefinedNames()) {
            node?.setDefinedNames(lexerNode.getDefinedNames());
        }
        return node;
    }

    private _lambdaParameterHandler(lexerNode: LexerNode, parent: LambdaNode) {
        if (parent.getLambdaId == null) {
            return ErrorNode.create(ErrorType.VALUE);
        }
        const lambdaId = parent.getLambdaId();

        const parentAstNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);

        // const lambdaRuntime = this._parserDataLoader.getLambdaRuntime();
        const currentLambdaPrivacyVar = this._runtimeService.getFunctionDefinitionPrivacyVar(lambdaId);

        if (!currentLambdaPrivacyVar) {
            return false;
        }

        const currentLambdaPrivacyVarKeys = [...currentLambdaPrivacyVar.keys()];

        const children = lexerNode.getChildren();
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];

            if (item instanceof LexerNode) {
                this._parse(item, parentAstNode);
            } else {
                return false;
            }

            // astNode?.setParent(parentAstNode);
        }

        const parentChildren = parentAstNode.getChildren();
        const parentChildrenCount = parentChildren.length;

        for (let i = 0; i < parentChildrenCount; i++) {
            const item = parentChildren[i];
            currentLambdaPrivacyVar.set(currentLambdaPrivacyVarKeys[i], item);
        }

        parentAstNode.setParent(parent);

        return parent;
    }

    private _changeLetToLambda(letLexerNode: LexerNode) {
        const letChildren = letLexerNode.getChildren();

        const letChildrenCount = letChildren.length;
        if (letChildrenCount % 2 !== 1 || letChildrenCount === 0) {
            return;
        }

        const newLambdaNode = new LexerNode();
        newLambdaNode.setToken(DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME);

        const newLambdaParameterNode = new LexerNode();
        newLambdaParameterNode.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER);

        // const lastLetChild = letChildren[letChildrenCount - 1];

        const copyChildren = [...letChildren];

        for (let i = 0; i < letChildrenCount; i++) {
            const child = copyChildren[i];
            if (!(child instanceof LexerNode)) {
                return;
            }

            if (i % 2 === 0) {
                child.changeToParent(newLambdaNode);
            } else {
                child.changeToParent(newLambdaParameterNode);
            }
        }

        newLambdaNode.addChildrenFirst(newLambdaParameterNode);

        newLambdaParameterNode.setParent(newLambdaNode);

        const parent = letLexerNode.getParent();

        parent?.replaceChild(letLexerNode, newLambdaNode);

        return newLambdaNode;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _parse(lexerNode: LexerNode, parent: BaseAstNode): Nullable<BaseAstNode> {
        const children = lexerNode.getChildren();
        const childrenCount = children.length;
        const calculateStack: BaseAstNode[] = [];
        let currentAstNode: Nullable<BaseAstNode> = null;
        // console.log('lexerNode', lexerNode, children);
        const token = lexerNode.getToken().trim().toUpperCase();
        if (token === DEFAULT_TOKEN_LET_FUNCTION_NAME) {
            /**
             * Since the let function performs the same as lambda expressions,
             * here we make a conversion to use only lambda expressions for calculations.
             */
            const resultNode: Nullable<LexerNode> = this._changeLetToLambda(lexerNode);
            if (resultNode != null) {
                return this._parse(resultNode, parent);
            }

            // console.log('errorLet', resultNode, currentAstNode, lexerNode);
            return ErrorNode.create(ErrorType.ERROR);
        }
        if (token === DEFAULT_TOKEN_TYPE_PARAMETER) {
            currentAstNode = parent;

            if (childrenCount === 0) {
                const nullNode = new NullNode(DEFAULT_TOKEN_TYPE_ROOT);

                nullNode.setParent(parent);

                return currentAstNode;
            }
        } else {
            /**
             * Process the parameters of the lambda expression, create an execution environment,
             * allowing parameters to correspond to variables.
             */
            if (token === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
                let resultNode: BaseAstNode | false = this._lambdaParameterHandler(lexerNode, parent as LambdaNode);
                if (resultNode === false) {
                    // console.log('error1', resultNode, currentAstNode, lexerNode);
                    resultNode = ErrorNode.create(ErrorType.ERROR);
                }

                return resultNode;
            }

            currentAstNode = this._checkAstNode(lexerNode);
            if (currentAstNode == null) {
                // console.log('error2', currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.NAME);
            }

            // currentAstNode.setParent(parent);
            // parent.addChildren(currentAstNode);
        }
        // console.log('currentAstNode', currentAstNode.nodeType, currentAstNode, lexerNode);
        const firstChild = children[0];
        // let isSkipFirstInLambda = false;
        // if (
        //     currentAstNode.getToken().trim().toUpperCase() === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME &&
        //     !isFirstChildParameter(firstChild)
        // ) {
        //     isSkipFirstInLambda = true;
        // }
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            /**
             *  If it is a lambda expression, by default, only the first and last child nodes are valid.
             * The intermediate nodes have already been processed during the conversion of lambda parameters,
             * so they need to be skipped here.
             */
            if (isFirstChildParameter(firstChild)) {
                if (i !== 0 && i !== childrenCount - 1) {
                    continue;
                }
            } else if (isChildRunTimeParameter(item)) {
                if (i !== childrenCount - 1) {
                    continue;
                }
            }

            let astNode: Nullable<BaseAstNode> = null;
            if (item instanceof LexerNode) {
                astNode = this._parse(item, currentAstNode);
                if (astNode === currentAstNode) {
                    continue;
                }
            } else {
                astNode = this._checkAstNode(item);
            }

            if (astNode == null) {
                // console.log('error3', astNode, currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.NAME);
            }

            astNode = getAstNodeTopParent(astNode);
            if (astNode == null) {
                return;
            }
            // console.log('bugfix1', astNode, astNode.nodeType, currentAstNode, lexerNode);
            switch (astNode.nodeType) {
                case NodeType.ERROR:
                    return astNode;
                case NodeType.FUNCTION:
                    calculateStack.push(astNode);
                    break;
                case NodeType.LAMBDA:
                    calculateStack.push(astNode);
                    break;
                case NodeType.LAMBDA_PARAMETER:
                    calculateStack.push(astNode);
                    break;
                case NodeType.OPERATOR: {
                    const parameterNode1 = calculateStack.pop();
                    const parameterNode2 = calculateStack.pop();

                    if (parameterNode2) {
                        parameterNode2.setParent(astNode);
                    }

                    if (parameterNode1) {
                        parameterNode1.setParent(astNode);
                    }

                    calculateStack.push(astNode);
                    break;
                }
                case NodeType.REFERENCE:
                    astNode.setRefOffset(this._refOffsetX, this._refOffsetY);
                    calculateStack.push(astNode);
                    break;
                case NodeType.ROOT:
                    calculateStack.push(astNode);
                    break;
                case NodeType.UNION:
                    calculateStack.push(astNode);
                    break;
                case NodeType.VALUE:
                    calculateStack.push(astNode);
                    break;
                case NodeType.PREFIX:
                    calculateStack.push(astNode);
                    break;
                case NodeType.SUFFIX:
                    calculateStack.push(astNode);
                    break;
            }
        }

        const calculateStackCount = calculateStack.length;

        for (let i = 0; i < calculateStackCount; i++) {
            const item = calculateStack[i];
            item.setParent(currentAstNode);
        }

        return currentAstNode;
    }

    private _checkAstNode(item: LexerNode | string) {
        let astNode: Nullable<BaseAstNode> = null;
        const astNodeFactoryListCount = this._astNodeFactoryList.length;
        for (let x = 0; x < astNodeFactoryListCount; x++) {
            const astNodeFactory = this._astNodeFactoryList[x];
            astNode = astNodeFactory.checkAndCreateNodeType(item);
            if (astNode != null) {
                break;
            }
        }
        // console.log('astNode111', astNode, item);
        return astNode;
    }

    private _initializeAstNode() {
        this._astNodeFactoryList = [
            this._astRootNodeFactory,
            this._functionNodeFactory,
            this._lambdaNodeFactory,
            this._lambdaParameterNodeFactory,
            this._operatorNodeFactory,
            this._prefixNodeFactory,
            this._referenceNodeFactory,
            this._suffixNodeFactory,
            this._unionNodeFactory,
            this._valueNodeFactory,
        ].sort(sortRules);
    }
}
