import type { Nullable } from '@univerjs/core';
import { Tools } from '@univerjs/core';

import { LexerNode } from '../analysis/lexer-node';
import { ErrorType } from '../basics/error-type';
import { isFirstChildParameter } from '../basics/function-definition';
import {
    DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER,
    DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER,
    DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER,
} from '../basics/token-type';
import { IFormulaRuntimeService } from '../services/runtime.service';
import type { LambdaPrivacyVarType } from './base-ast-node';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

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

    isFunctionParameter() {
        return this._lambdaId === null;
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
    constructor(@IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.LAMBDA) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: LexerNode): BaseAstNode {
        const children = param.getChildren();
        const lambdaVar = children[0];
        let parameterArray = children.slice(1, -1);
        const functionStatementNode = children[children.length - 1];
        if (!(lambdaVar instanceof LexerNode && functionStatementNode instanceof LexerNode)) {
            return ErrorNode.create(ErrorType.NAME);
        }

        if (lambdaVar.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
            const lambdaVarChildren = lambdaVar.getChildren();

            if (parameterArray.length !== lambdaVarChildren.length) {
                return ErrorNode.create(ErrorType.VALUE);
            }
        } else {
            parameterArray = children.slice(0, -1);
        }

        // const lambdaId = nanoid(8);
        const lambdaId = Tools.generateRandomId(8);

        // const lambdaRuntime = parserDataLoader.getLambdaRuntime();
        const currentLambdaPrivacyVar = new Map<string, Nullable<BaseAstNode>>();

        for (let i = 0; i < parameterArray.length; i++) {
            const parameter = parameterArray[i];
            if (parameter instanceof LexerNode) {
                const variant = parameter.getChildren()[0] as string;
                parameter.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER);
                currentLambdaPrivacyVar.set(variant.trim(), undefined);
            } else {
                return ErrorNode.create(ErrorType.VALUE);
            }
        }

        this._runtimeService.registerFunctionDefinitionPrivacyVar(lambdaId, currentLambdaPrivacyVar);

        this._updateLambdaStatement(functionStatementNode, lambdaId, currentLambdaPrivacyVar);

        return new LambdaNode(param.getToken(), lambdaId);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken().trim().toUpperCase();
        if (token !== LAMBDA_TOKEN) {
            return;
        }

        return this.create(param);
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
        const firstChild = children[0];
        for (let i = 0; i < childrenCount; i++) {
            const node = children[i];
            if (isFirstChildParameter(firstChild) && i !== 0) {
                continue;
            }
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
