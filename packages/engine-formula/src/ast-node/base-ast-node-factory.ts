import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';

import { LexerNode } from '../analysis/lexer-node';
import { BaseAstNode } from './base-ast-node';

export const DEFAULT_AST_NODE_FACTORY_Z_INDEX = 100;

export class BaseAstNodeFactory extends Disposable {
    get zIndex() {
        return 0;
    }

    create(param: LexerNode | string): BaseAstNode {
        let token;
        if (param instanceof LexerNode) {
            token = param.getToken();
        } else {
            token = param;
        }
        return new BaseAstNode(token);
    }

    checkAndCreateNodeType(param: LexerNode | string): Nullable<BaseAstNode> {}
}
