import { Disposable, Nullable } from '@univerjs/core';

import { LexerNode } from '../Analysis/LexerNode';
import { BaseAstNode } from './BaseAstNode';

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
