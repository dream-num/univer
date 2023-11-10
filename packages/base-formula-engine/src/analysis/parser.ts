import { Disposable, Nullable, sortRules } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { AstRootNode, AstRootNodeFactory } from '../ast-node/ast-root-node';
import { BaseAstNode, ErrorNode } from '../ast-node/base-ast-node';
import { FunctionNodeFactory } from '../ast-node/function-node';
import { LambdaNode, LambdaNodeFactory } from '../ast-node/lambda-node';
import { LambdaParameterNodeFactory } from '../ast-node/lambda-parameter-node';
import { NodeType } from '../ast-node/node-type';
import { OperatorNodeFactory } from '../ast-node/operator-node';
import { PrefixNodeFactory } from '../ast-node/prefix-node';
import { ReferenceNodeFactory } from '../ast-node/reference-node';
import { SuffixNodeFactory } from '../ast-node/suffix-node';
import { UnionNodeFactory } from '../ast-node/union-node';
import { ValueNodeFactory } from '../ast-node/value-node';
import { ErrorType } from '../basics/error-type';
import {
    DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER,
    DEFAULT_TOKEN_TYPE_PARAMETER,
    DEFAULT_TOKEN_TYPE_ROOT,
} from '../basics/token-type';
import { IFormulaRuntimeService } from '../services/runtime.service';
import { LexerNode } from './lexer-node';

export class AstTreeBuilder extends Disposable {
    private _astNodeFactoryList: AstRootNodeFactory[] = [];

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

    parse(lexerNode: LexerNode) {
        const astNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);

        const node = this._parse(lexerNode, astNode);
        return node;
    }

    private _lambdaParameterHandler(lexerNode: LexerNode, parent: LambdaNode) {
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

    private _getTopParent(node: BaseAstNode) {
        let parent: Nullable<BaseAstNode> = node;
        while (parent?.getParent()) {
            parent = parent.getParent();
            // console.log(parent);
        }
        return parent;
    }

    private _parse(lexerNode: LexerNode, parent: BaseAstNode): Nullable<BaseAstNode> {
        const children = lexerNode.getChildren();
        const childrenCount = children.length;
        const calculateStack: BaseAstNode[] = [];
        let currentAstNode: Nullable<BaseAstNode> = null;
        // console.log('lexerNode', lexerNode, children);
        if (lexerNode.getToken() === DEFAULT_TOKEN_TYPE_PARAMETER) {
            currentAstNode = parent;
        } else {
            if (lexerNode.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
                let resultNode: BaseAstNode | false = this._lambdaParameterHandler(lexerNode, parent as LambdaNode);
                if (resultNode === false) {
                    console.log('error1', resultNode, currentAstNode, lexerNode);
                    resultNode = ErrorNode.create(ErrorType.ERROR);
                }

                return resultNode;
            }

            currentAstNode = this._checkAstNode(lexerNode);
            if (currentAstNode == null) {
                console.log('error2', currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.ERROR);
            }

            // currentAstNode.setParent(parent);
            // parent.addChildren(currentAstNode);
        }
        console.log('currentAstNode', currentAstNode.nodeType, currentAstNode, lexerNode);
        for (let i = 0; i < childrenCount; i++) {
            if (
                currentAstNode.nodeType === NodeType.LAMBDA &&
                parent.nodeType !== NodeType.LAMBDA &&
                i !== 0 &&
                i !== childrenCount - 1
            ) {
                continue;
            }

            const item = children[i];
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
                console.log('error3', astNode, currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.ERROR);
            }

            astNode = this._getTopParent(astNode);
            if (astNode == null) {
                return;
            }
            console.log('bugfix1', astNode, astNode.nodeType, currentAstNode, lexerNode);
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
                    } else {
                        console.log('error4', currentAstNode, lexerNode, children, i);
                        return ErrorNode.create(ErrorType.ERROR);
                    }

                    if (parameterNode1) {
                        parameterNode1.setParent(astNode);
                    } else {
                        console.log('error5', currentAstNode, lexerNode, children, i);
                        return ErrorNode.create(ErrorType.ERROR);
                    }

                    calculateStack.push(astNode);
                    break;
                }
                case NodeType.REFERENCE:
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
