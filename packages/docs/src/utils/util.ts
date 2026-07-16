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

import type { DocumentDataModel, IAccessor, ITextRangeParam } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocContentInsertRange } from '../services/doc-content-insert.service';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocContentInsertService } from '../services/doc-content-insert.service';

export function consumeContentInsertRange(accessor: IAccessor, unitId: string): IDocContentInsertRange | null {
    try {
        return accessor.get(DocContentInsertService).consumeInsertRange(unitId);
    } catch {
        return null;
    }
}

export function getContentInsertRange(accessor: IAccessor, unitId?: string): (IDocContentInsertRange & {
    collapsed: boolean;
}) | null {
    const _unitId = unitId ?? accessor.get(IUniverInstanceService).getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getUnitId();
    if (!_unitId) {
        return null;
    }

    const insertRange = consumeContentInsertRange(accessor, _unitId);
    if (!insertRange) {
        return null;
    }

    return {
        ...insertRange,
        collapsed: insertRange?.startOffset === insertRange?.endOffset,
    };
}

export function isHeaderFooterSelection(range?: ITextRangeWithStyle): boolean {
    return Boolean(range?.segmentId);
}

export function normalizeTextRange(textRange: ITextRangeParam): ITextRangeParam {
    const endOffset = textRange.endOffset ?? textRange.startOffset;

    return {
        ...textRange,
        endOffset,
        collapsed: textRange.collapsed ?? textRange.startOffset === endOffset,
        segmentId: textRange.segmentId ?? '',
    };
}
