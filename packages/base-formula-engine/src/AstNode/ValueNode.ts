import { LexerNode } from '../Analysis/LexerNode';
import { BooleanValue } from '../Basics/Common';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { ValueObjectFactory } from '../ValueObject/ArrayValueObject';
import { BaseAstNode } from './BaseAstNode';
import { BaseAstNodeFactory } from './BaseAstNodeFactory';
import { NODE_ORDER_MAP, NodeType } from './NodeType';

export class ValueNode extends BaseAstNode {
    constructor(private _operatorString: string) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.VALUE;
    }

    override execute() {
        this.setValue(ValueObjectFactory.create(this._operatorString));
    }
}

export class ValueNodeFactory extends BaseAstNodeFactory {
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.VALUE) || 100;
    }

    _checkValueNode(token: string) {
        if (isNaN(Number(token))) {
            const tokenTrim = token.trim();
            const startToken = tokenTrim.charAt(0);
            const endToken = tokenTrim.charAt(tokenTrim.length - 1);
            if (startToken === '"' && endToken === '"') {
                return this.create(tokenTrim);
            }
            if (startToken === '{' && endToken === '}') {
                return this.create(tokenTrim);
            }
            if (tokenTrim === BooleanValue.TRUE || tokenTrim === BooleanValue.FALSE) {
                return this.create(tokenTrim);
            }
        } else {
            return this.create(token);
        }
        return false;
    }

    override create(param: string): BaseAstNode {
        return new ValueNode(param);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (param instanceof LexerNode) {
            return false;
        }
        return this._checkValueNode(param);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new ValueNodeFactory());
