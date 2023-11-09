import { LexerNode } from '../Analysis/LexerNode';
import { ErrorType } from '../Basics/ErrorType';
import { compareToken, OPERATOR_TOKEN_COMPARE_SET, OPERATOR_TOKEN_SET, operatorToken } from '../Basics/Token';
import { BaseFunction } from '../Functions/BaseFunction';
import { Compare } from '../Functions/meta/Compare';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { IFunctionService } from '../Service/function.service';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

const PLUS_EXECUTOR_NAME = 'PLUS';

const MINUS_EXECUTOR_NAME = 'MINUS';

const MULTIPLY_EXECUTOR_NAME = 'MULTIPLY';

const DIVIDED_EXECUTOR_NAME = 'DIVIDED';

const CONCATENATE_EXECUTOR_NAME = 'CONCATENATE';

const POWER_EXECUTOR_NAME = 'POWER';

const COMPARE_EXECUTOR_NAME = 'COMPARE';

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
        if (this._functionExecutor.name === COMPARE_EXECUTOR_NAME) {
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
            functionName = PLUS_EXECUTOR_NAME;
        } else if (tokenTrim === operatorToken.MINUS) {
            functionName = MINUS_EXECUTOR_NAME;
        } else if (tokenTrim === operatorToken.MULTIPLY) {
            functionName = MULTIPLY_EXECUTOR_NAME;
        } else if (tokenTrim === operatorToken.DIVIDED) {
            functionName = DIVIDED_EXECUTOR_NAME;
        } else if (tokenTrim === operatorToken.CONCATENATE) {
            functionName = CONCATENATE_EXECUTOR_NAME;
        } else if (tokenTrim === operatorToken.POWER) {
            functionName = POWER_EXECUTOR_NAME;
        } else if (OPERATOR_TOKEN_COMPARE_SET.has(tokenTrim)) {
            functionName = COMPARE_EXECUTOR_NAME;
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
