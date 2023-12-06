import type { Nullable, Observable } from '@univerjs/core';

import { DEFAULT_TOKEN_TYPE_ROOT } from '../../basics/token-type';
import type { LambdaPrivacyVarType } from '../ast-node/base-ast-node';

interface LexerNodeJson {
    token: string;
    children: Array<LexerNodeJson | string>;
}

export interface FormulaEnginePluginObserver {
    onBeforeFormulaCalculateObservable: Observable<string>;
    onAfterFormulaLexerObservable: Observable<LexerNode>;
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

    dispose() {
        this._children.forEach((node) => {
            if (!(typeof node === 'string')) {
                node.dispose();
            }
        });
        this._functionDefinitionPrivacyVar?.clear();

        this._parent = null;
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
        // const childrenCount = childrenNode.length;
        // for (let i = 0; i < childrenCount; i++) {
        //     const child = childrenNode[i];
        //     if (child === lexerNode) {
        //         childrenNode.splice(i, 1);
        //         return;
        //     }
        // }
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
