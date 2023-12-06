import { BooleanValue } from '../../basics/common';
import { LexerNode } from '../analysis/lexer-node';
import { ValueObjectFactory } from '../value-object/array-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

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
        return NODE_ORDER_MAP.get(NodeType.VALUE) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
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
    }

    override create(param: string): BaseAstNode {
        return new ValueNode(param);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (param instanceof LexerNode) {
            return;
        }
        return this._checkValueNode(param);
    }
}
