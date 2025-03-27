/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Nullable } from '@univerjs/core';
import type { ErrorType } from '../../basics/error-type';

import type { FunctionVariantType } from '../reference-object/base-reference-object';

import { AstNodePromiseType } from '../../basics/common';
import { ErrorValueObject } from '../value-object/base-value-object';
import { NodeType } from './node-type';

interface IAstNodeNodeJson {
    token: string;
    children?: IAstNodeNodeJson[];
    nodeType: number;
}

export type LambdaPrivacyVarType = Map<string, Nullable<BaseAstNode>>;

export class BaseAstNode {
    private _children: BaseAstNode[] = [];

    private _definedNames: Nullable<Array<string>>;

    private _parent: Nullable<BaseAstNode>;

    private _valueObject: Nullable<FunctionVariantType>;

    private _calculateState = false;

    private _async = false;

    private _address = false;

    private _isForcedCalculateFunction = false;

    constructor(private _token: string) {

    }

    dispose(): void {
        this._children.forEach((node) => {
            node.dispose();
        });
        this._valueObject?.dispose();

        this._valueObject = null;

        this._children = [];

        this._definedNames = null;

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

    isForcedCalculateFunction() {
        return this._isForcedCalculateFunction;
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

    setForcedCalculateFunction() {
        this._isForcedCalculateFunction = true;
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

    setNotEmpty(state = true) {
        /* abstract */
    }

    async executeAsync(): Promise<AstNodePromiseType> {
        /* abstract */
        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    serialize() {
        const token = this.getToken();
        const children = this.getChildren();

        const childrenSerialization: IAstNodeNodeJson[] = [];
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            childrenSerialization.push(item.serialize());
        }

        const result: IAstNodeNodeJson = {
            token,
            nodeType: this.nodeType,
        };

        if (childrenCount > 0) {
            result.children = childrenSerialization;
        }

        return result;
    }

    hasDefinedName(definedName: string) {
        return this._definedNames?.includes(definedName) || false;
    }

    setDefinedNames(definedNames: Array<string>) {
        this._definedNames = definedNames;
    }

    getDefinedNames() {
        return this._definedNames;
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
