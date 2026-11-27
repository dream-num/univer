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

import { cjk } from '@univerjs/engine-render';

/**
 * Whether the text covered by a document range is East Asian. A collapsed range (caret) looks at
 * the character before it, which is the text the inline format commands and menus act on.
 *
 * @param dataStream the data stream of the body that owns the range
 * @param startOffset range start offset
 * @param endOffset range end offset
 * @returns true when the range holds CJK letters
 */
export function isEastAsianTextAtRange(
    dataStream: string,
    startOffset?: number | null,
    endOffset?: number | null
): boolean {
    if (startOffset == null || endOffset == null) {
        return false;
    }

    const text = endOffset > startOffset
        ? dataStream.slice(startOffset, endOffset)
        : dataStream.slice(Math.max(0, startOffset - 1), startOffset);

    return cjk.hasCJKText(text);
}
