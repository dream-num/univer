import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../Basics/TokenType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseAstNode, ErrorNode, LambdaPrivacyVarType } from './BaseAstNode';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

export class LambdaParameterNode extends BaseAstNode {
    constructor(
        token: string,
        private _lambdaParameter: string,
        private _currentLambdaPrivacyVar: LambdaPrivacyVarType
    ) {
        super(token);
    }

    override get nodeType() {
        return NodeType.LAMBDA_PARAMETER;
    }

    override execute() {
        const node = this._currentLambdaPrivacyVar.get(this._lambdaParameter);
        if (!node) {
            this.setValue(ErrorValueObject.create(ErrorType.SPILL));
        } else {
            this.setValue(node.getValue());
        }
    }
}

export class LambdaParameterNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.LAMBDA_PARAMETER) || 100;
    }

    override create(param: LexerNode): BaseAstNode {
        const lambdaId = param.getLambdaId();
        const currentLambdaPrivacyVar = param.getLambdaPrivacyVar();
        const lambdaParameter = param.getLambdaParameter();

        if (!currentLambdaPrivacyVar) {
            return new ErrorNode(ErrorType.SPILL);
        }

        return new LambdaParameterNode(param.getToken(), lambdaParameter, currentLambdaPrivacyVar);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return false;
        }

        const token = param.getToken().trim();
        if (token !== DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
            return false;
        }

        return this.create(param);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new LambdaParameterNodeFactory());
