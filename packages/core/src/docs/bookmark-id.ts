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

import type { ICustomRange } from '../types/interfaces/i-document-data';
import { CustomRangeType } from '../types/interfaces/i-document-data';

const BOOKMARK_ID_PREFIX = 'univer-bookmark-';

export function createBookmarkRangeId(id: string): string {
    return `${BOOKMARK_ID_PREFIX}${id}`;
}

function isManagedBookmark(range: ICustomRange): boolean {
    return range.rangeType === CustomRangeType.BOOKMARK && range.rangeId.startsWith(BOOKMARK_ID_PREFIX);
}

export function orderManagedBookmarks(ranges: ICustomRange[]): ICustomRange[] {
    // Managed bookmark identities define a stable group after the ranges from legacy documents.
    // An insertion or deletion in either group must not change the order of the other group.
    const first = ranges.findIndex(isManagedBookmark);
    if (first === -1) {
        return ranges;
    }
    let index = first + 1;
    while (index < ranges.length && isManagedBookmark(ranges[index]) && ranges[index - 1].rangeId <= ranges[index].rangeId) {
        index++;
    }
    if (index === ranges.length) {
        return ranges;
    }

    const structuralRanges = ranges.filter((range) => !isManagedBookmark(range));
    const bookmarks = ranges.filter(isManagedBookmark);
    bookmarks.sort((left, right) => {
        if (left.rangeId < right.rangeId) {
            return -1;
        }
        return Number(left.rangeId > right.rangeId);
    });
    return structuralRanges.concat(bookmarks);
}
