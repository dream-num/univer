import { Nullable } from '@univerjs/core';
import { LexerNode } from '../Analysis/LexerNode';
import { AstNodePromiseType, FunctionVariantType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { prefixToken } from '../Basics/Token';
import { BaseFunction } from '../Functions/BaseFunction';
import { AsyncObject } from '../OtherObject/AsyncObject';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { ErrorNode } from './ErrorNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';
import { PrefixNode } from './PrefixNode';

export class FunctionNode extends BaseAstNode {
    get nodeType() {
        return NodeType.FUNCTION;
    }

    constructor(token: string, private _functionExecutor: BaseFunction) {
        super(token);

        if (this._functionExecutor.isAsync()) {
            this.setAsync();
        }

        if (this._functionExecutor.isAddress()) {
            this.setAddress();
        }
    }

    async executeAsync() {
        const variants: FunctionVariantType[] = [];
        const children = this.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            variants.push(children[i].getValue());
        }

        const resultVariant = this._functionExecutor.calculate(...variants);
        if (resultVariant.isAsyncObject()) {
            this.setValue(await (resultVariant as AsyncObject).getValue());
        } else {
            this.setValue(resultVariant as FunctionVariantType);
        }
        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    execute() {
        const variants: FunctionVariantType[] = [];
        const children = this.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            variants.push(children[i].getValue());
        }

        const resultVariant = this._functionExecutor.calculate(...variants);

        this.setValue(resultVariant as FunctionVariantType);
    }
}

export class FunctionNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.FUNCTION) || 100;
    }

    create(token: string, parserDataLoader: ParserDataLoader): BaseAstNode {
        const functionExecutor = parserDataLoader.getExecutor(token);
        if (!functionExecutor) {
            console.error(`No function ${token}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new FunctionNode(token, functionExecutor);
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (typeof param === 'string') {
            return false;
        }
        const token = param.getToken();
        let tokenTrim = token.trim().toUpperCase();
        let minusPrefixNode: Nullable<PrefixNode>;
        let atPrefixNode: Nullable<PrefixNode>;
        const prefix = tokenTrim.slice(0, 2);
        let sliceLength = 0;
        if (new RegExp(prefixToken.MINUS, 'g').test(prefix)) {
            const functionExecutor = parserDataLoader.getExecutor('MINUS');
            minusPrefixNode = new PrefixNode(prefixToken.MINUS, functionExecutor);
            sliceLength++;
        }

        if (new RegExp(prefixToken.AT, 'g').test(prefix)) {
            atPrefixNode = new PrefixNode(prefixToken.AT);
            if (minusPrefixNode) {
                // minusPrefixNode.addChildren(atPrefixNode);
                atPrefixNode.setParent(minusPrefixNode);
            }
            sliceLength++;
        }

        if (sliceLength > 0) {
            tokenTrim = tokenTrim.slice(sliceLength);
        }

        if (parserDataLoader?.hasExecutor(tokenTrim)) {
            const functionNode = this.create(tokenTrim, parserDataLoader);
            if (atPrefixNode) {
                functionNode.setParent(atPrefixNode);
                // return atPrefixNode;
            } else if (minusPrefixNode) {
                functionNode.setParent(minusPrefixNode);
                // return minusPrefixNode;
            }
            return functionNode;
        }
        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new FunctionNodeFactory());
