import { LexerNode } from '../Analysis/LexerNode';
import { AstNodePromiseType, IInterpreterCalculateProps } from '../Basics/Common';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { DEFAULT_TOKEN_TYPE_PARAMETER, DEFAULT_TOKEN_TYPE_ROOT } from '../Basics/TokenType';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';

export class AstRootNode extends BaseAstNode {
    get nodeType() {
        return NodeType.ROOT;
    }

    execute() {
        const children = this.getChildren();
        const node = children[0];
        // if (node.nodeType === NodeType.FUNCTION) {
        //     await node.executeAsync(interpreterCalculateProps);
        // } else {
        //     node.execute(interpreterCalculateProps);
        // }
        this.setValue(node.getValue());
        // return Promise.resolve(AstNodePromiseType.SUCCESS);
    }
}
// export class AstVariantNode extends BaseAstNode {
//     get nodeType() {
//         return NodeType.Variant;
//     }

//     async executeAsync(interpreterCalculateProps: IInterpreterCalculateProps) {
//         const children = this.getChildren();
//         const childrenCount = children.length;
//         for (let i = 0; i < childrenCount; i++) {
//             const node = children[i];
//             if (node.nodeType === NodeType.FUNCTION) {
//                 await node.executeAsync(interpreterCalculateProps);
//             } else {
//                 node.execute(interpreterCalculateProps);
//             }
//         }

//         return Promise.resolve(AstNodePromiseType.SUCCESS);
//     }
// }

export class AstRootNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.ROOT) || 100;
    }

    checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return false;
        }
        const token = param.getToken();
        if (token === DEFAULT_TOKEN_TYPE_ROOT) {
            return new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
        }
        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new AstRootNodeFactory());
