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

import type { IParagraph, IParagraphBorder } from '@univerjs/core';
import { createParagraphId, DataStreamTreeTokenType, generateRandomId, Tools } from '@univerjs/core';

/** Builds paragraph metadata for inserted paragraph tokens, including horizontal-rule borders. */
export function generateParagraphs(
    dataStream: string,
    prevParagraph?: IParagraph,
    borderBottom?: IParagraphBorder,
    existingParagraphIds: Iterable<string> = []
): IParagraph[] {
    const paragraphs: IParagraph[] = [];
    const existingIds = new Set(existingParagraphIds);

    for (let i = 0, len = dataStream.length; i < len; i++) {
        if (dataStream[i] !== DataStreamTreeTokenType.PARAGRAPH) {
            continue;
        }

        paragraphs.push({
            startIndex: i,
            paragraphId: createParagraphId(existingIds),
        });
    }

    for (const paragraph of paragraphs) {
        if (prevParagraph?.bullet) {
            paragraph.bullet = Tools.deepClone(prevParagraph.bullet);
        }

        if (prevParagraph?.paragraphStyle) {
            paragraph.paragraphStyle = Tools.deepClone(prevParagraph.paragraphStyle);
            delete paragraph.paragraphStyle.borderBottom;
            if (prevParagraph.paragraphStyle.headingId) {
                paragraph.paragraphStyle.headingId = generateRandomId(6);
            }
        }

        if (borderBottom) {
            paragraph.paragraphStyle ??= {};
            paragraph.paragraphStyle.borderBottom = Tools.deepClone(borderBottom);
        }
    }

    return paragraphs;
}
