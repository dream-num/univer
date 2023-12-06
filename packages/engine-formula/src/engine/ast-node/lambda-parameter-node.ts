import type { Nullable } from '@univerjs/core';

import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../other-object/error-value-object';
import type { LambdaPrivacyVarType } from './base-ast-node';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class LambdaParameterNode extends BaseAstNode {
    constructor(
        token: string,
        private _lambdaParameter: string,
        private _currentLambdaPrivacyVar: LambdaPrivacyVarType
    ) {
        super(token);
    }

    getLambdaParameter() {
        return this._lambdaParameter;
    }

    getCurrentLambdaPrivacyVar() {
        return this._currentLambdaPrivacyVar;
    }

    override get nodeType() {
        return NodeType.LAMBDA_PARAMETER;
    }

    override execute() {
        const node = this._getRootLexerNode(this._currentLambdaPrivacyVar.get(this._lambdaParameter));
        if (!node) {
            this.setValue(ErrorValueObject.create(ErrorType.SPILL));
        } else {
            this.setValue(node.getValue());
        }
    }

    private _getRootLexerNode(node: Nullable<BaseAstNode>): Nullable<BaseAstNode> {
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

        return this._getRootLexerNode(currentLambdaPrivacyVar.get(lambdaParameter));
    }
}

export class LambdaParameterNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.LAMBDA_PARAMETER) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: LexerNode): BaseAstNode {
        // const lambdaId = param.getLambdaId();
        const currentLambdaPrivacyVar = param.getFunctionDefinitionPrivacyVar();
        const lambdaParameter = param.getLambdaParameter();

        if (!currentLambdaPrivacyVar) {
            return new ErrorNode(ErrorType.SPILL);
        }

        return new LambdaParameterNode(param.getToken(), lambdaParameter, currentLambdaPrivacyVar);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken().trim();
        if (token !== DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
            return;
        }

        return this.create(param);
    }
}
