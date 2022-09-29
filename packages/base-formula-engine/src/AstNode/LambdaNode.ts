import { Nullable } from '@univer/core';
import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER, DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER, DEFAULT_TOKEN_TYPE_ROOT } from '../Basics/TokenType';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { ErrorNode } from './ErrorNode';
import { NodeType } from './NodeType';
import { nanoid } from 'nanoid';
import { AstNodePromiseType, LambdaPrivacyVarType } from '../Basics/Common';

export const LAMBDA_TOKEN = 'LAMBDA';

export class LambdaNode extends BaseAstNode {
    get nodeType() {
        return NodeType.LAMBDA;
    }
    constructor(private _lambdaId: string) {
        super();
    }

    getLambdaId() {
        return this._lambdaId;
    }

    execute() {
        const children = this.getChildren();
        const childrenCount = children.length;
        this.setValue(children[childrenCount - 1].getValue());
    }
}

export class LambdaNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return 7;
    }

    private _updateLambdaStatement(functionStatementNode: LexerNode, lambdaId: string, currentLambdaPrivacyVar: LambdaPrivacyVarType) {
        this._updateTree(functionStatementNode, lambdaId, currentLambdaPrivacyVar);
    }

    private _updateTree(functionStatementNode: LexerNode, lambdaId: string, currentLambdaPrivacyVar: LambdaPrivacyVarType) {
        const children = functionStatementNode.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const node = children[i];
            if (node instanceof LexerNode) {
                this._updateTree(node, lambdaId, currentLambdaPrivacyVar);
            } else {
                if (currentLambdaPrivacyVar.has(node)) {
                    const newNode = new LexerNode();
                    newNode.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER);
                    newNode.setLambdaId(lambdaId);
                    newNode.setLambdaPrivacyVar(currentLambdaPrivacyVar);
                    newNode.setLambdaParameter(node);
                    children[i] = newNode;
                }
            }
        }
    }

    create(param: LexerNode, parserDataLoader: ParserDataLoader): BaseAstNode {
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

        const lambdaId = nanoid(8);

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

        lambdaRuntime.registerLambdaPrivacyVar(lambdaId, currentLambdaPrivacyVar);

        this._updateLambdaStatement(functionStatementNode, lambdaId, currentLambdaPrivacyVar);

        return new LambdaNode(lambdaId);
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (typeof param === 'string') {
            return false;
        }
        const token = param.getToken();
        if (token === LAMBDA_TOKEN) {
            return this.create(param, parserDataLoader);
        }
        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new LambdaNodeFactory());
