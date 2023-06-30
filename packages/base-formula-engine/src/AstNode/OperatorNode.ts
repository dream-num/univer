import { OPERATOR_TOKEN_SET, OPERATOR_TOKEN_COMPARE_SET, operatorToken, compareToken } from '../Basics/Token';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { ErrorNode } from './ErrorNode';
import { ErrorType } from '../Basics/ErrorType';
import { BaseFunction } from '../Functions/BaseFunction';
import { LexerNode } from '../Analysis/LexerNode';
import { FunctionVariantType } from '../Basics/Common';
import { Compare } from '../Functions/meta/Compare';

const PLUS_EXECUTOR_NAME = 'PLUS';

const MINUS_EXECUTOR_NAME = 'MINUS';

const MULTIPLY_EXECUTOR_NAME = 'MULTIPLY';

const DIVIDED_EXECUTOR_NAME = 'DIVIDED';

const CONCATENATE_EXECUTOR_NAME = 'CONCATENATE';

const POWER_EXECUTOR_NAME = 'POWER';

const COMPARE_EXECUTOR_NAME = 'COMPARE';

export class OperatorNode extends BaseAstNode {
    constructor(private _operatorString: string, private _functionExecutor: BaseFunction) {
        super(_operatorString);
    }

    get nodeType() {
        return NodeType.OPERATOR;
    }

    execute() {
        const children = this.getChildren();
        if (this._functionExecutor.name === COMPARE_EXECUTOR_NAME) {
            (this._functionExecutor as Compare).setCompareType(this.getToken() as compareToken);
        }
        this.setValue(this._functionExecutor.calculate(children[0].getValue(), children[1].getValue()) as FunctionVariantType);
    }
}

export class OperatorNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.OPERATOR) || 100;
    }

    create(param: string, parserDataLoader: ParserDataLoader): BaseAstNode {
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

        const functionExecutor = parserDataLoader.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new OperatorNode(tokenTrim, functionExecutor);
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (param instanceof LexerNode) {
            return false;
        }
        const tokenTrim = param.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return false;
        }

        if (OPERATOR_TOKEN_SET.has(tokenTrim)) {
            return this.create(tokenTrim, parserDataLoader);
        }
        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new OperatorNodeFactory());
