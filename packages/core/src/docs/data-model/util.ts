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

import type { IDocumentBody } from '../../types/interfaces';

export function isRichText(body: IDocumentBody): boolean {
    const { textRuns = [], paragraphs = [], customRanges, customBlocks = [] } = body;

    const bodyNoLineBreak = body.dataStream.replace('\r\n', '');

    // Some styles are unique to rich text. When this style appears, we consider the value to be rich text.
    const richTextStyle = ['va'];

    return (
        textRuns.some((textRun) => {
            const hasRichTextStyle = Boolean(textRun.ts && Object.keys(textRun.ts).some((property) => {
                return richTextStyle.includes(property);
            }));
            return hasRichTextStyle || (Object.keys(textRun.ts ?? {}).length && (textRun.ed - textRun.st < bodyNoLineBreak.length));
        }) ||
        paragraphs.some((paragraph) => paragraph.bullet) ||
        paragraphs.length >= 2 ||
        Boolean(customRanges?.length) ||
        customBlocks.length > 0
    );
}

