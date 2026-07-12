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

import type { IDocumentData, IDocumentStyle, ISectionBreak } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '@univerjs/engine-render';
import { resolveSectionHeaderFooterReferences } from '@univerjs/core';
import { getTopLevelSectionBreaks } from '@univerjs/docs';

export interface IDocPageSectionContext {
    sectionId?: string;
    sectionIndex: number;
    sections: ISectionBreak[];
    section?: ISectionBreak;
    /** Effective config after applying the owning section over document defaults. */
    config: IDocumentStyle & Partial<ISectionBreak>;
}

export function getDocPageSectionContext(
    snapshot: IDocumentData,
    page?: Pick<IDocumentSkeletonPage, 'sectionId'>
): IDocPageSectionContext {
    const sections = snapshot.body ? getTopLevelSectionBreaks(snapshot.body) : [];
    const sectionIndex = page?.sectionId == null ? -1 : sections.findIndex((item) => item.sectionId === page.sectionId);
    const section = sectionIndex < 0 ? undefined : sections[sectionIndex];
    const references = section == null
        ? {}
        : resolveSectionHeaderFooterReferences(snapshot.documentStyle, sections, sectionIndex);

    return {
        sectionId: section?.sectionId,
        sectionIndex,
        sections,
        section,
        config: {
            ...snapshot.documentStyle,
            ...section,
            ...references,
        },
    };
}
