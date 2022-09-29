import { LexerNode } from '../Analysis/LexerNode';
import { AstNodePromiseType, FunctionVariantType, IInterpreterCalculateProps } from '../Basics/Common';
import { ParserDataLoader } from '../Basics/ParserDataLoader';

import { NodeType } from './NodeType';

interface AstNodeNodeJson {
    token: string;
    children: Array<AstNodeNodeJson>;
    nodeType: string;
}

export class BaseAstNode {
    private _children: BaseAstNode[];

    private _parent: BaseAstNode;

    private _token: string;

    private _valueObject: FunctionVariantType;

    get nodeType() {
        return NodeType.BASE;
    }

    getParent() {
        return this._parent;
    }

    setParent(node: BaseAstNode) {
        this._parent = node;
    }

    getChildren() {
        return this._children;
    }

    addChildren(...astNode: BaseAstNode[]) {
        this._children.push(...astNode);
    }

    getToken() {
        return this._token;
    }

    setValue(value: FunctionVariantType) {
        this._valueObject = value;
    }

    getValue(): FunctionVariantType {
        return this._valueObject;
    }

    execute(interpreterCalculateProps: IInterpreterCalculateProps) {
        /* abstract */
    }

    async executeAsync(interpreterCalculateProps: IInterpreterCalculateProps): Promise<AstNodePromiseType> {
        /* abstract */
        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    serialize() {
        const token = this.getToken();
        const children = this.getChildren();

        const childrenSerialization: Array<AstNodeNodeJson> = [];
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            childrenSerialization.push(item.serialize());
        }
        return {
            token,
            children: childrenSerialization,
            nodeType: this.nodeType,
        };
    }
}

export class BaseAstNodeFactory {
    get zIndex() {
        return 0;
    }

    create(param: LexerNode | string, parserDataLoader?: ParserDataLoader): BaseAstNode {
        return new BaseAstNode();
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader): false | BaseAstNode {
        return false;
    }
}
