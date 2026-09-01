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

import type { IParagraph, Nullable } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

export function isHorizontalLineParagraph(dataStream: string, paragraph: Nullable<IParagraph>) {
    const paragraphStyle = paragraph?.paragraphStyle;

    const isEmpty = Array.from(dataStream).every((token) =>
        token === DataStreamTreeTokenType.PARAGRAPH || token === DataStreamTreeTokenType.SECTION_BREAK
    );

    return isEmpty &&
        paragraphStyle?.borderBottom != null &&
        paragraphStyle.borderTop == null &&
        paragraphStyle.borderLeft == null &&
        paragraphStyle.borderRight == null &&
        paragraphStyle.borderBetween == null;
}
