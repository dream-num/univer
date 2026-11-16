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

import type { IDocumentBody, IHyperlink } from '@univerjs/core';
import { CustomRangeType } from '@univerjs/core';

export function getDocHyperLinkTarget(properties?: IHyperlink): string {
    return properties?.url ?? (properties?.bookmarkId ? `#${properties.bookmarkId}` : properties?.headingId ? `#${properties.headingId}` : '');
}

export function getDocHyperLinkTargetLabel(properties: IHyperlink | undefined, body: IDocumentBody | undefined): string {
    const target = getDocHyperLinkTarget(properties);
    if (!target.startsWith('#') || !body) return target;
    const id = target.slice(1);
    const bookmark = body.customRanges?.find((range) => range.rangeType === CustomRangeType.BOOKMARK && (range.rangeId === id || range.properties?.bookmarkId === id));
    const paragraphIndex = body.paragraphs?.findIndex((paragraph) => paragraph.paragraphId === id || paragraph.paragraphStyle?.headingId === id) ?? -1;
    const start = bookmark?.startIndex ?? (paragraphIndex < 0 ? undefined : paragraphIndex === 0 ? 0 : body.paragraphs![paragraphIndex - 1].startIndex + 1);
    if (start == null) return target;
    const end = bookmark && !bookmark.properties?.collapsed ? bookmark.endIndex + 1 : body.paragraphs?.find((paragraph) => paragraph.startIndex >= start)?.startIndex ?? start;
    return body.dataStream.slice(start, Math.min(end, start + 512)).replace(/[\u0000-\u001F\uFFFC]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || target;
}

export function getDocHyperLinkTargetProperties(target: string, body?: IDocumentBody, previous?: IHyperlink): IHyperlink {
    if (!target.startsWith('#')) {
        return { url: target };
    }
    const id = target.slice(1);
    if (previous?.headingId === id || (!body?.customRanges?.some((range) => range.rangeType === CustomRangeType.BOOKMARK &&
        (range.rangeId === id || range.properties?.bookmarkId === id)) && body?.paragraphs?.some((paragraph) => paragraph.paragraphId === id || paragraph.paragraphStyle?.headingId === id))) {
        return { headingId: id };
    }
    return { bookmarkId: id };
}
