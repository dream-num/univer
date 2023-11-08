import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../Basics/TokenType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseAstNode, ErrorNode, LambdaPrivacyVarType } from './BaseAstNode';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './BaseAstNodeFactory';
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
        return NODE_ORDER_MAP.get(NodeType.LAMBDA_PARAMETER) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: LexerNode): BaseAstNode {
        // const lambdaId = param.getLambdaId();
        const currentLambdaPrivacyVar = param.getLambdaPrivacyVar();
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
