import type { Nullable } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { FUNCTION_NAMES } from '../../basics/function';
import { prefixToken } from '../../basics/token';
import type { BaseFunction } from '../../functions/base-function';
import { IFunctionService } from '../../services/function.service';
import type { LexerNode } from '../analysis/lexer-node';
import type { AsyncObject, FunctionVariantType } from '../reference-object/base-reference-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';
import { PrefixNode } from './prefix-node';

export class FunctionNode extends BaseAstNode {
    constructor(
        token: string,
        private _functionExecutor: BaseFunction
    ) {
        super(token);

        if (this._functionExecutor.isAsync()) {
            this.setAsync();
        }

        if (this._functionExecutor.isAddress()) {
            this.setAddress();
        }
    }

    override get nodeType() {
        return NodeType.FUNCTION;
    }

    override async executeAsync() {
        const variants: FunctionVariantType[] = [];
        const children = this.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const object = children[i].getValue();
            if (object == null) {
                continue;
            }
            variants.push(object);
        }

        const resultVariant = this._functionExecutor.calculate(...variants);
        if (resultVariant.isAsyncObject()) {
            this.setValue(await (resultVariant as AsyncObject).getValue());
        } else {
            this.setValue(resultVariant as FunctionVariantType);
        }
        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    override execute() {
        const variants: FunctionVariantType[] = [];
        const children = this.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const object = children[i].getValue();
            if (object == null) {
                continue;
            }
            variants.push(object);
        }

        const resultVariant = this._functionExecutor.calculate(...variants);

        this.setValue(resultVariant as FunctionVariantType);
    }
}

export class FunctionNodeFactory extends BaseAstNodeFactory {
    constructor(
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.FUNCTION) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(token: string): BaseAstNode {
        const functionExecutor = this._functionService.getExecutor(token);
        if (!functionExecutor) {
            console.error(`No function ${token}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new FunctionNode(token, functionExecutor);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (typeof param === 'string') {
            return;
        }
        const token = param.getToken();
        let tokenTrim = token.trim().toUpperCase();
        let minusPrefixNode: Nullable<PrefixNode>;
        let atPrefixNode: Nullable<PrefixNode>;
        const prefix = tokenTrim.slice(0, 2);
        let sliceLength = 0;
        if (new RegExp(prefixToken.MINUS, 'g').test(prefix)) {
            const functionExecutor = this._functionService.getExecutor(FUNCTION_NAMES.MINUS);
            minusPrefixNode = new PrefixNode(this._injector, prefixToken.MINUS, functionExecutor);
            sliceLength++;
        }

        if (new RegExp(prefixToken.AT, 'g').test(prefix)) {
            atPrefixNode = new PrefixNode(this._injector, prefixToken.AT);
            if (minusPrefixNode) {
                // minusPrefixNode.addChildren(atPrefixNode);
                atPrefixNode.setParent(minusPrefixNode);
            }
            sliceLength++;
        }

        if (sliceLength > 0) {
            tokenTrim = tokenTrim.slice(sliceLength);
        }

        if (this._functionService.hasExecutor(tokenTrim)) {
            const functionNode = this.create(tokenTrim);
            if (atPrefixNode) {
                functionNode.setParent(atPrefixNode);
                // return atPrefixNode;
            } else if (minusPrefixNode) {
                functionNode.setParent(minusPrefixNode);
                // return minusPrefixNode;
            }
            return functionNode;
        }
    }
}

// FORMULA_AST_NODE_REGISTRY.add(new FunctionNodeFactory());
