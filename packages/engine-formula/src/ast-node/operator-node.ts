import { LexerNode } from '../analysis/lexer-node';
import { ErrorType } from '../basics/error-type';
import { FUNCTION_NAMES } from '../basics/function';
import type { compareToken } from '../basics/token';
import { OPERATOR_TOKEN_COMPARE_SET, OPERATOR_TOKEN_SET, operatorToken } from '../basics/token';
import type { BaseFunction } from '../functions/base-function';
import type { Compare } from '../functions/meta/compare';
import type { FunctionVariantType } from '../reference-object/base-reference-object';
import { IFunctionService } from '../services/function.service';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class OperatorNode extends BaseAstNode {
    constructor(
        private _operatorString: string,
        private _functionExecutor: BaseFunction
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.OPERATOR;
    }

    override execute() {
        const children = this.getChildren();
        if (this._functionExecutor.name === FUNCTION_NAMES.COMPARE) {
            (this._functionExecutor as Compare).setCompareType(this.getToken() as compareToken);
        }
        const object1 = children[0].getValue();
        const object2 = children[1].getValue();
        if (object1 == null || object2 == null) {
            throw new Error('object1 or object2 is null');
        }
        this.setValue(this._functionExecutor.calculate(object1, object2) as FunctionVariantType);
    }
}

export class OperatorNodeFactory extends BaseAstNodeFactory {
    constructor(@IFunctionService private readonly _functionService: IFunctionService) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.OPERATOR) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: string): BaseAstNode {
        let functionName = '';
        const tokenTrim = param;
        if (tokenTrim === operatorToken.PLUS) {
            functionName = FUNCTION_NAMES.PLUS;
        } else if (tokenTrim === operatorToken.MINUS) {
            functionName = FUNCTION_NAMES.MINUS;
        } else if (tokenTrim === operatorToken.MULTIPLY) {
            functionName = FUNCTION_NAMES.MULTIPLY;
        } else if (tokenTrim === operatorToken.DIVIDED) {
            functionName = FUNCTION_NAMES.DIVIDED;
        } else if (tokenTrim === operatorToken.CONCATENATE) {
            functionName = FUNCTION_NAMES.CONCATENATE;
        } else if (tokenTrim === operatorToken.POWER) {
            functionName = FUNCTION_NAMES.POWER;
        } else if (OPERATOR_TOKEN_COMPARE_SET.has(tokenTrim)) {
            functionName = FUNCTION_NAMES.COMPARE;
        }

        const functionExecutor = this._functionService.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new OperatorNode(tokenTrim, functionExecutor);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (param instanceof LexerNode) {
            return;
        }
        const tokenTrim = param.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        if (OPERATOR_TOKEN_SET.has(tokenTrim)) {
            return this.create(tokenTrim);
        }
    }
}
