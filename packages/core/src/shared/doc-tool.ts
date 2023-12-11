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

import type { IParagraph, IParagraphStyle } from '../types/interfaces/i-document-data';

export function horizontalLineSegmentsSubtraction(A1: number, A2: number, B1: number, B2: number) {
    // 确保A1 < A2, B1 < B2
    if (A1 > A2) {
        [A1, A2] = [A2, A1];
    }
    if (B1 > B2) {
        [B1, B2] = [B2, B1];
    }

    if (A2 < B1 || B2 < A1) {
        return [A1, A2]; // 无重叠，返回原线段A
    }

    if (B1 < A1) {
        B1 = A1;
    }

    if (B2 > A2) {
        B2 = A2;
    }

    const subLength = B2 - B1 + 1;
    let result: number[] = [];

    if (A1 === B1) {
        // Subtract the start segment
        result = [B2 + 1 - subLength, A2 - subLength];
    } else if (A2 === B2) {
        // Subtract the end segment
        result = [A1, B1 - 1];
    } else {
        // Subtract the middle segment
        result = [A1, A2 - subLength];
    }

    return result;
}

export function checkParagraphHasBullet(paragraph: IParagraph) {
    if (paragraph == null) {
        return false;
    }
    const bullet = paragraph.bullet;

    return bullet?.listId != null;
}

export function checkParagraphHasIndent(paragraph: IParagraph) {
    if (paragraph == null) {
        return false;
    }
    const paragraphStyle = paragraph.paragraphStyle;

    return checkParagraphHasIndentByStyle(paragraphStyle);
}

export function checkParagraphHasIndentByStyle(paragraphStyle?: IParagraphStyle) {
    if (paragraphStyle == null) {
        return false;
    }

    if (
        ((paragraphStyle.indentStart == null || paragraphStyle.indentStart === 0) && paragraphStyle.hanging == null) ||
        paragraphStyle.hanging === 0
    ) {
        return false;
    }

    return true;
}

export function insertTextToContent(content: string, start: number, text: string) {
    return content.slice(0, start) + text + content.slice(start);
}

export function deleteContent(content: string, start: number, end: number) {
    if (start > end) {
        return content;
    }

    return content.slice(0, start) + content.slice(end);
}
