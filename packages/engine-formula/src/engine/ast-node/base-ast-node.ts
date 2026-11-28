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

import type { DateSystem, IRange, Nullable } from '@univerjs/core';
import type { ErrorType } from '../../basics/error-type';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { ICalculationLocale } from '../value-object/base-value-object';
import { AstNodePromiseType } from '../../basics/common';
import { operatorToken } from '../../basics/token';
import { ErrorValueObject } from '../value-object/base-value-object';
import { NodeType } from './node-type';

export interface IAstNodeNodeJson {
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

    resetCalculationState() {
        this._children.forEach((node) => {
            node.resetCalculationState();
        });
        this._valueObject = null;
        this._calculateState = false;
    }

    isAsync() {
        return this._async;
    }

    isAddress() {
        return this._address;
    }

    /** Resolved dependency targets. Undefined uses the node's reference result. */
    getAddressDependencyReferences(): readonly BaseReferenceObject[] | undefined {
        return undefined;
    }

    resolveAddressDependencyReferences(
        _argument: (node: BaseAstNode) => Promise<BaseReferenceObject | null>
    ): Promise<readonly BaseReferenceObject[]> | undefined {
        return undefined;
    }

    /** A cached formula may not have been executed since opening the workbook. */
    mayReadCalculationRegion(): boolean {
        switch (this.nodeType) {
            case NodeType.LAMBDA:
            case NodeType.LAMBDA_PARAMETER:
            case NodeType.UNION:
            case NodeType.ROOT:
                return Boolean(this._definedNames?.length) || this._children.some((child) => child.mayReadCalculationRegion());
            case NodeType.OPERATOR:
            case NodeType.PREFIX:
            case NodeType.SUFFIX:
            case NodeType.FUNCTION:
                return this._children.some((child) => child.nodeType === NodeType.VALUE
                    ? child.getToken().includes('"')
                    : child.nodeType !== NodeType.NULL && child.nodeType !== NodeType.ERROR);
            default:
                return Boolean(this._definedNames?.length);
        }
    }

    isForcedCalculateFunction() {
        return this._isForcedCalculateFunction;
    }

    needsFilteredOutRows() {
        return false;
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

    getImplicitIntersectionReference(_child: BaseAstNode, _reference: BaseReferenceObject, _range: IRange): FunctionVariantType | undefined {
        return undefined;
    }

    preservesLazyIfReferenceArray(_child: BaseAstNode): boolean {
        return false;
    }

    preservesReferenceInRangeEndpoint(_child: BaseAstNode): boolean {
        return false;
    }

    isUsedAsRangeEndpoint(): boolean {
        let child: BaseAstNode = this;
        let parent = child.getParent();
        while (parent?.preservesReferenceInRangeEndpoint(child)) {
            child = parent;
            parent = child.getParent();
        }
        return parent?.nodeType === NodeType.UNION || parent?.getToken() === operatorToken.INTERSECTION;
    }

    isCalculated() {
        return this._calculateState;
    }

    setCalculated() {
        this._calculateState = true;
    }

    execute(_dateSystem?: DateSystem, _regionalContext?: ICalculationLocale) {
        /* abstract */
    }

    setNotEmpty(state = true) {
        /* abstract */
    }

    async executeAsync(_dateSystem?: DateSystem, _regionalContext?: ICalculationLocale): Promise<AstNodePromiseType> {
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
