import { OPERATOR_TOKEN_SET } from '../Basics/Token';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';
import { ValueObjectFactory } from '../ValueObject/ValueObjectFactory';
import { LexerNode } from '../Analysis/LexerNode';
import { BooleanValue } from '../Basics/Common';

export class ValueNode extends BaseAstNode {
    get nodeType() {
        return NodeType.VALUE;
    }
    constructor(private _operatorString: string) {
        super(_operatorString);
        this.setValue(ValueObjectFactory.create(this._operatorString));
    }
}

export class ValueNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.VALUE) || 100;
    }

    _checkValueNode(token: string) {
        if (isNaN(Number(token))) {
            const tokenTrim = token.trim();
            const startToken = tokenTrim.charAt(0);
            const endToken = tokenTrim.charAt(tokenTrim.length - 1);
            if (startToken === '"' && endToken === '"') {
                return this.create(tokenTrim);
            } else if (startToken === '{' && endToken === '}') {
                return this.create(tokenTrim);
            } else if (tokenTrim === BooleanValue.TRUE || tokenTrim === BooleanValue.FALSE) {
                return this.create(tokenTrim);
            }
        } else {
            return this.create(token);
        }
        return false;
    }

    create(param: string): BaseAstNode {
        return new ValueNode(param);
    }

    checkAndCreateNodeType(param: LexerNode | string) {
        if (param instanceof LexerNode) {
            return false;
        }
        return this._checkValueNode(param);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new ValueNodeFactory());
