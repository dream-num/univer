import { Nullable, Tools } from '@univerjs/core';

import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER, DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../Basics/TokenType';
import { BaseAstNode, ErrorNode, LambdaPrivacyVarType } from './BaseAstNode';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

export const LAMBDA_TOKEN: string = 'LAMBDA';

export class LambdaNode extends BaseAstNode {
    constructor(
        token: string,
        private _lambdaId: string
    ) {
        super(token);
    }

    override get nodeType() {
        return NodeType.LAMBDA;
    }

    getLambdaId() {
        return this._lambdaId;
    }

    override execute() {
        const children = this.getChildren();
        const childrenCount = children.length;
        this.setValue(children[childrenCount - 1].getValue());
    }
}

export class LambdaNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.LAMBDA) || 100;
    }

    override create(param: LexerNode, parserDataLoader: ParserDataLoader): BaseAstNode {
        const children = param.getChildren();
        const lambdaVar = children[0];
        const parameterArray = children.slice(1, -1);
        const functionStatementNode = children[children.length - 1];
        if (!(lambdaVar instanceof LexerNode && functionStatementNode instanceof LexerNode)) {
            return ErrorNode.create(ErrorType.NAME);
        }

        if (lambdaVar.getToken() !== DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
            return ErrorNode.create(ErrorType.NAME);
        }

        const lambdaVarChildren = lambdaVar.getChildren();

        if (parameterArray.length !== lambdaVarChildren.length) {
            return ErrorNode.create(ErrorType.VALUE);
        }

        // const lambdaId = nanoid(8);
        const lambdaId = Tools.generateRandomId(8);

        const lambdaRuntime = parserDataLoader.getLambdaRuntime();
        const currentLambdaPrivacyVar = new Map<string, Nullable<BaseAstNode>>();

        for (let i = 0; i < parameterArray.length; i++) {
            const parameter = parameterArray[i];
            if (parameter instanceof LexerNode) {
                const variant = parameter.getChildren()[0] as string;
                currentLambdaPrivacyVar.set(variant, null);
            } else {
                return ErrorNode.create(ErrorType.VALUE);
            }
        }

        lambdaRuntime?.registerLambdaPrivacyVar(lambdaId, currentLambdaPrivacyVar);

        this._updateLambdaStatement(functionStatementNode, lambdaId, currentLambdaPrivacyVar);

        return new LambdaNode(param.getToken(), lambdaId);
    }

    override checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken().trim().toUpperCase();
        if (token !== LAMBDA_TOKEN) {
            return;
        }

        return this.create(param, parserDataLoader);
    }

    private _updateLambdaStatement(
        functionStatementNode: LexerNode,
        lambdaId: string,
        currentLambdaPrivacyVar: LambdaPrivacyVarType
    ) {
        this._updateTree(functionStatementNode, lambdaId, currentLambdaPrivacyVar);
    }

    private _updateTree(
        functionStatementNode: LexerNode,
        lambdaId: string,
        currentLambdaPrivacyVar: LambdaPrivacyVarType
    ) {
        const children = functionStatementNode.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const node = children[i];
            if (node instanceof LexerNode) {
                this._updateTree(node, lambdaId, currentLambdaPrivacyVar);
            } else {
                const token = node.trim();
                if (currentLambdaPrivacyVar.has(token)) {
                    const newNode = new LexerNode();
                    newNode.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER);
                    newNode.setLambdaId(lambdaId);
                    newNode.setLambdaPrivacyVar(currentLambdaPrivacyVar);
                    newNode.setLambdaParameter(token);
                    children[i] = newNode;
                }
            }
        }
    }
}

FORMULA_AST_NODE_REGISTRY.add(new LambdaNodeFactory());
