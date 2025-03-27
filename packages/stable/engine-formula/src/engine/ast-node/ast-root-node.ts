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

import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_TYPE_ROOT } from '../../basics/token-type';
import { LexerNode } from '../analysis/lexer-node';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

export class AstRootNode extends BaseAstNode {
    override get nodeType() {
        return NodeType.ROOT;
    }

    override execute() {
        const children = this.getChildren();

        if (children.length > 1) {
            this.setValue(ErrorValueObject.create(ErrorType.VALUE));

            return;
        }

        const node = children[0];
        // if (node.nodeType === NodeType.FUNCTION) {
        //     await node.executeAsync(interpreterCalculateProps);
        // } else {
        //     node.execute(interpreterCalculateProps);
        // }
        if (node == null) {
            /**
             * fix: https://github.com/dream-num/univer/issues/1415
             */
            this.setValue(ErrorValueObject.create(ErrorType.VALUE));
        } else {
            this.setValue(node.getValue());
        }

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
    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.ROOT) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }
        const token = param.getToken();
        if (token === DEFAULT_TOKEN_TYPE_ROOT) {
            return new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
        }
    }
}

// FORMULA_AST_NODE_REGISTRY.add(new AstRootNodeFactory());
