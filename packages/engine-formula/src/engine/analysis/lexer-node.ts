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

import type { LambdaPrivacyVarType } from '../ast-node/base-ast-node';
import { DEFAULT_TOKEN_TYPE_ROOT } from '../../basics/token-type';

interface LexerNodeJson {
    token: string;
    children: Array<LexerNodeJson | string>;
}

export class LexerNode {
    private _parent: Nullable<LexerNode>;

    private _token: string = DEFAULT_TOKEN_TYPE_ROOT;

    private _children: Array<LexerNode | string> = [];

    private _lambdaId: Nullable<string>;

    private _functionDefinitionPrivacyVar: Nullable<LambdaPrivacyVarType>;

    private _lambdaParameter: string = '';

    private _startIndex: number = -1;

    private _endIndex: number = -1;

    private _definedNames: Array<string> = [];

    dispose() {
        this._children.forEach((node) => {
            if (!(typeof node === 'string')) {
                node.dispose();
            }
        });
        this._functionDefinitionPrivacyVar?.clear();

        this._functionDefinitionPrivacyVar = null;

        this._children = [];

        this._parent = null;

        this._definedNames = [];
    }

    getDefinedNames() {
        return this._definedNames;
    }

    getStartIndex() {
        return this._startIndex;
    }

    getLambdaId() {
        return this._lambdaId;
    }

    setLambdaId(lambdaId: string) {
        this._lambdaId = lambdaId;
    }

    getFunctionDefinitionPrivacyVar() {
        return this._functionDefinitionPrivacyVar;
    }

    setLambdaPrivacyVar(lambdaPrivacyVar: LambdaPrivacyVarType) {
        this._functionDefinitionPrivacyVar = lambdaPrivacyVar;
    }

    getLambdaParameter() {
        return this._lambdaParameter;
    }

    setLambdaParameter(lambdaParameter: string) {
        this._lambdaParameter = lambdaParameter;
    }

    getParent() {
        return this._parent;
    }

    setParent(lexerNode: LexerNode) {
        this._parent = lexerNode;
    }

    getChildren() {
        return this._children;
    }

    setChildren(children: Array<LexerNode | string>) {
        this._children = children;
    }

    addChildren(children: LexerNode | string) {
        this._children.push(children);
    }

    addChildrenFirst(children: LexerNode | string) {
        this._children.unshift(children);
    }

    getToken() {
        return this._token;
    }

    setToken(token: string) {
        this._token = token;
    }

    setIndex(st: number, ed: number) {
        this._startIndex = st;
        this._endIndex = ed;
    }

    setDefinedNames(definedNames: Array<string>) {
        this._definedNames = definedNames;
    }

    hasDefinedNames() {
        return this._definedNames.length > 0;
    }

    replaceChild(lexerNode: LexerNode, newLexerNode: LexerNode) {
        const i = this._getIndexInParent(lexerNode);

        if (i == null) {
            return;
        }

        this.getChildren().splice(i, 1, newLexerNode);

        newLexerNode.setParent(this);
    }

    changeToParent(newParentLexerNode: LexerNode) {
        const parentNode = this.getParent();
        if (parentNode) {
            parentNode.removeChild(this);
        }
        this.setParent(newParentLexerNode);
        const childrenNode = newParentLexerNode.getChildren();
        childrenNode.push(this);
    }

    removeChild(lexerNode: LexerNode) {
        const i = this._getIndexInParent(lexerNode);

        if (i == null) {
            return;
        }

        this.getChildren().splice(i, 1);
    }

    serialize() {
        const token = this.getToken();
        const children = this.getChildren();

        const childrenSerialization: Array<LexerNodeJson | string> = [];
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            if (item instanceof LexerNode) {
                childrenSerialization.push(item.serialize());
            } else {
                childrenSerialization.push(item);
            }
        }
        return {
            token,
            st: this._startIndex,
            ed: this._endIndex,
            children: childrenSerialization,
        };
    }

    private _getIndexInParent(lexerNode: LexerNode) {
        const childrenNode = this.getChildren();
        const childrenCount = childrenNode.length;
        for (let i = 0; i < childrenCount; i++) {
            const child = childrenNode[i];
            if (child === lexerNode) {
                return i;
            }
        }
    }
}
