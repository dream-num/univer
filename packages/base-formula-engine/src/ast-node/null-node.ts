import { NullValueObject } from '../value-object/primitive-object';
import { BaseAstNode } from './base-ast-node';
import { NodeType } from './node-type';

export class NullNode extends BaseAstNode {
    constructor(private _operatorString: string) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.NULL;
    }

    override execute() {
        this.setValue(new NullValueObject(0));
    }
}
