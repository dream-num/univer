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

import type { Nullable } from '@univerjs/core';
import type { BaseAstNode } from '../ast-node/base-ast-node';

export interface IExecuteAstNodeData {
    node: Nullable<BaseAstNode>;
    refOffsetX: number;
    refOffsetY: number;
}

export function getAstNodeTopParent(node: BaseAstNode) {
    let parent: Nullable<BaseAstNode> = node;
    while (parent?.getParent()) {
        parent = parent.getParent();
        // console.log(parent);
    }
    return parent;
}

export function generateExecuteAstNodeData(node: BaseAstNode, refOffsetX: number = 0, refOffsetY: number = 0) {
    return {
        node,
        refOffsetX,
        refOffsetY,
    };
}
