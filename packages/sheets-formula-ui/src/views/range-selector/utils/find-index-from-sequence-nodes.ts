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

import type { ISequenceNode } from '@univerjs/engine-formula';
import { sequenceNodeType } from '@univerjs/engine-formula';

export const findIndexFromSequenceNodes = (sequenceNode: (string | ISequenceNode)[], targetIndex: number, isEqual = true) => {
    let result = -1;
    sequenceNode.reduce((pre, cur, index) => {
        if (pre.isFinish) {
            return pre;
        }
        const oldIndex = pre.currentIndex;
        if (typeof cur !== 'string') {
            pre.currentIndex += cur.token.length;
        } else {
            const length = cur.length;
            pre.currentIndex += length;
        }

        if (isEqual ? (pre.currentIndex === targetIndex) : (targetIndex > oldIndex && targetIndex <= pre.currentIndex)) {
            result = index;
            pre.isFinish = true;
        }
        return pre;
    }, { currentIndex: 0, isFinish: false });
    return result;
};

export const findRefSequenceIndex = (sequenceNode: (string | ISequenceNode)[], targetIndex: number) => {
    const last = sequenceNode[targetIndex];
    let result = -1;
    if (!last || typeof last === 'string' || last.nodeType !== sequenceNodeType.REFERENCE) return -1;
    for (let i = 0; i <= targetIndex; i++) {
        const currentNode = sequenceNode[i];
        if (typeof currentNode !== 'string' && currentNode.nodeType === sequenceNodeType.REFERENCE) {
            result++;
        }
    }
    return result;
};
