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

import type { IParagraph, IParagraphStyle } from '../types/interfaces/i-document-data';

export function horizontalLineSegmentsSubtraction(aStart: number, aEnd: number, bStart: number, bEnd: number) {
    // Ensure A1 < A2, B1 < B2
    if (aStart > aEnd) {
        throw new Error('a1 should be less than a2');
    }
    if (bStart > bEnd) {
        throw new Error('b1 should be less than b2');
    }

    if (aEnd < bStart || bEnd < aStart) {
        return [aStart, aEnd]; // No overlap, return original segment A
    }

    // If b contains a, the result is an empty interval
    if (bStart <= aStart && bEnd >= aEnd) {
        return [];
    }

    const subLength = bEnd - bStart + 1;

    // If a contains b, return the two remaining intervals
    if (aStart < bStart && aEnd > bEnd) {
        return [aStart, aEnd - subLength];
    }

    // If b covers the start part of a
    if (bStart <= aStart && bEnd < aEnd) {
        return [bEnd + 1 - subLength, aEnd - subLength];
    }

    // If b covers the end part of a
    if (bStart > aStart && bEnd >= aEnd) {
        return [aStart, bStart - 1];
    }

    return [aStart, aEnd];
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
        ((paragraphStyle.indentStart == null || paragraphStyle.indentStart.v === 0) && paragraphStyle.hanging == null) ||
        paragraphStyle.hanging?.v === 0
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
