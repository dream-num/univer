import { LexerNode } from '../Analysis/LexerNode';
import { BaseAstNode } from './BaseAstNode';

export class BaseAstNodeFactory {
    get zIndex() {
        return 0;
    }

    create(param: LexerNode | string, parserDataLoader?: any): BaseAstNode {
        let token;
        if (param instanceof LexerNode) {
            token = param.getToken();
        } else {
            token = param;
        }
        return new BaseAstNode(token);
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: any): false | BaseAstNode {
        return false;
    }
}
