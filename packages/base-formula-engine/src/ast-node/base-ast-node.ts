import { Disposable, Nullable } from '@univerjs/core';

import { AstNodePromiseType } from '../basics/common';
import { ErrorType } from '../basics/error-type';
import { ErrorValueObject } from '../other-object/error-value-object';
import { FunctionVariantType } from '../reference-object/base-reference-object';
import { NodeType } from './node-type';

interface AstNodeNodeJson {
    token: string;
    children?: AstNodeNodeJson[];
    nodeType: string;
}

export type LambdaPrivacyVarType = Map<string, Nullable<BaseAstNode>>;

export class BaseAstNode extends Disposable {
    private _children: BaseAstNode[] = [];

    private _parent: Nullable<BaseAstNode>;

    private _valueObject: Nullable<FunctionVariantType>;

    private _calculateState = false;

    private _async = false;

    private _address = false;

    constructor(private _token: string) {
        super();
    }

    override dispose(): void {
        this._children.forEach((node) => {
            node.dispose();
        });
        this._valueObject?.dispose();

        this._parent = null;
    }

    get nodeType() {
        return NodeType.BASE;
    }

    isAsync() {
        return this._async;
    }

    isAddress() {
        return this._address;
    }

    setAsync() {
        this._async = true;
    }

    setAddress() {
        this._address = true;
    }

    getParent() {
        return this._parent;
    }

    setParent(node: BaseAstNode) {
        this._parent = node;
        node.addChildren(this);
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

    setValue(value: Nullable<FunctionVariantType>) {
        this._valueObject = value;
    }

    getValue(): Nullable<FunctionVariantType> {
        return this._valueObject;
    }

    isCalculated() {
        return this._calculateState;
    }

    setCalculated() {
        this._calculateState = true;
    }

    execute() {
        /* abstract */
    }

    async executeAsync(): Promise<AstNodePromiseType> {
        /* abstract */
        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    serialize() {
        const token = this.getToken();
        const children = this.getChildren();

        const childrenSerialization: AstNodeNodeJson[] = [];
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            childrenSerialization.push(item.serialize());
        }

        const result: AstNodeNodeJson = {
            token,
            nodeType: this.nodeType,
        };

        if (childrenCount > 0) {
            result.children = childrenSerialization;
        }

        return result;
    }
}

export class ErrorNode extends BaseAstNode {
    private _errorValueObject: ErrorValueObject;

    constructor(errorType: ErrorType) {
        super(errorType);
        this._errorValueObject = ErrorValueObject.create(errorType);
    }

    override get nodeType() {
        return NodeType.ERROR;
    }

    static create(errorType: ErrorType) {
        return new ErrorNode(errorType);
    }

    override getValue() {
        return this._errorValueObject;
    }
}
