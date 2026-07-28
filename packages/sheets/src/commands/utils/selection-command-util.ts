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

import type { IAccessor, IRange } from '@univerjs/core';
import { IContextService, Rectangle } from '@univerjs/core';
import { IRefSelectionsService } from '../../services/selections/ref-selections.service';
import { REF_SELECTIONS_ENABLED, SheetsSelectionsService } from '../../services/selections/selection.service';

export function hasOverlappingRanges(ranges: readonly IRange[]): boolean {
    return ranges.some((range, index) =>
        ranges.slice(index + 1).some((other) => Rectangle.simpleRangesIntersect(range, other))
    );
}

export function getSelectionsService(
    accessor: IAccessor,
    fromCurrentSelection?: boolean
): SheetsSelectionsService {
    const contextService = accessor.get(IContextService);
    const isInRefSelectionMode = contextService.getContextValue(REF_SELECTIONS_ENABLED);

    return accessor.get(isInRefSelectionMode && !fromCurrentSelection ? IRefSelectionsService : SheetsSelectionsService);
}
