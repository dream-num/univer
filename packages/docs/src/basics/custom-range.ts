/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IDocumentBody, ITextRange } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

export function isCustomRangeSplitSymbol(text: string) {
    return text === DataStreamTreeTokenType.CUSTOM_RANGE_END || text === DataStreamTreeTokenType.CUSTOM_RANGE_START;
}

export function getRangeWithSpecialCharacter(range: ITextRange, body: IDocumentBody) {
    let { startOffset, endOffset } = range;
    while (isCustomRangeSplitSymbol(body.dataStream[startOffset - 1])) {
        startOffset -= 1;
    }

    while (isCustomRangeSplitSymbol(body.dataStream[endOffset + 2])) {
        endOffset += 1;
    }

    return {
        startOffset,
        endOffset,
    };
}
