import { matchToken } from '../Basics/Token';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNode, ErrorNode } from './BaseAstNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { ErrorType } from '../Basics/ErrorType';
import { BaseFunction } from '../Functions/BaseFunction';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { LexerNode } from '../Analysis/LexerNode';
import { FunctionVariantType } from '../ReferenceObject/BaseReferenceObject';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';

const UNION_EXECUTOR_NAME = 'UNION';

export class UnionNode extends BaseAstNode {
    constructor(private _operatorString: string, private _functionExecutor: BaseFunction) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.UNION;
    }

    override execute() {
        const children = this.getChildren();
        const leftNode = children[0].getValue();
        const rightNode = children[1].getValue();
        let result: FunctionVariantType;
        if (this._operatorString === matchToken.COLON) {
            result = this._functionExecutor.calculate(leftNode, rightNode) as FunctionVariantType;
        } else {
            result = ErrorValueObject.create(ErrorType.NAME);
        }
        this.setValue(result);
    }
}

export class UnionNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.UNION) || 100;
    }

    override create(param: string, parserDataLoader: ParserDataLoader): BaseAstNode {
        const functionExecutor = parserDataLoader.getExecutor(UNION_EXECUTOR_NAME);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new UnionNode(param, functionExecutor);
    }

    override checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (!(param instanceof LexerNode)) {
            return false;
        }

        const token = param.getToken();

        const tokenTrim = token.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return false;
        }

        if (tokenTrim !== matchToken.COLON) {
            return false;
        }

        return this.create(tokenTrim, parserDataLoader);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new UnionNodeFactory());
