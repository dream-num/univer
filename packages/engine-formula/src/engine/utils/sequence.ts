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

import type { LexerNode } from '../analysis/lexer-node';

export enum sequenceNodeType {
    NORMAL,
    NUMBER,
    STRING,
    FUNCTION,
    REFERENCE,
    ARRAY,
    DEFINED_NAME,
}

export interface ISequenceNode {
    nodeType: sequenceNodeType;
    token: string;
    startIndex: number;
    endIndex: number;
}

export interface ISequenceArray {
    segment: string;
    currentString: string;
    cur: number;
    currentLexerNode: LexerNode;
}

/**
 * Deserialize Sequence to text.
 * @param newSequenceNodes
 * @returns
 */
export function generateStringWithSequence(newSequenceNodes: Array<string | ISequenceNode>) {
    let sequenceString = '';
    for (const node of newSequenceNodes) {
        if (typeof node === 'string') {
            sequenceString += node;
        } else {
            sequenceString += node.token;
        }
    }
    return sequenceString;
}
