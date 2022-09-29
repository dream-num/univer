import { LexerNode } from '../Analysis/LexerNode';
import { AstNodePromiseType, IInterpreterCalculateProps } from '../Basics/Common';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { DEFAULT_TOKEN_TYPE_ROOT } from '../Basics/TokenType';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType } from './NodeType';

export class AstRootNode extends BaseAstNode {
    get nodeType() {
        return NodeType.ROOT;
    }

    async executeAsync(interpreterCalculateProps: IInterpreterCalculateProps) {
        const children = this.getChildren();
        const node = children[0];
        if (node.nodeType === NodeType.FUNCTION) {
            await node.executeAsync(interpreterCalculateProps);
        } else {
            node.execute(interpreterCalculateProps);
        }
        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }
}

export class AstRootNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return 50;
    }

    create(param: LexerNode | string): BaseAstNode {
        return new AstRootNode();
    }

    checkAndCreateNodeType(param: LexerNode) {
        const token = param.getToken();
        if (token === DEFAULT_TOKEN_TYPE_ROOT) {
            return this.create(token);
        }
        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new AstRootNodeFactory());
