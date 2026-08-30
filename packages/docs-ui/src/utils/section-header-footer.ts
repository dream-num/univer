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

import type { IDocumentData, IDocumentStyle, ISectionBreak, Nullable } from '@univerjs/core';
import type { DocumentViewModel, IDocumentSkeletonPage } from '@univerjs/engine-render';
import { BooleanNumber, resolveSectionHeaderFooterReferences } from '@univerjs/core';
import { getTopLevelSectionBreaks, HeaderFooterType } from '@univerjs/docs';
import { DocumentEditArea } from '@univerjs/engine-render';

export interface IDocPageSectionContext {
    sectionId?: string;
    sectionIndex: number;
    sections: ISectionBreak[];
    section?: ISectionBreak;
    /** Effective config after applying the owning section over document defaults. */
    config: IDocumentStyle & Partial<ISectionBreak>;
}

export interface IHeaderFooterTarget {
    createType: Nullable<HeaderFooterType>;
    headerFooterId: Nullable<string>;
    sectionId?: string;
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

export function getHeaderFooterTarget(
    viewModel: DocumentViewModel,
    editArea: DocumentEditArea,
    segmentPage: number,
    page?: IDocumentSkeletonPage
): IHeaderFooterTarget {
    const snapshot = viewModel.getDataModel().getSnapshot();
    const { sectionId, config } = getDocPageSectionContext(snapshot, page);
    const {
        defaultHeaderId,
        defaultFooterId,
        evenPageHeaderId,
        evenPageFooterId,
        firstPageHeaderId,
        firstPageFooterId,
        evenAndOddHeaders,
        useFirstPageHeaderFooter,
    } = config;
    const isFirstPage = page ? page.pageNumber === page.pageNumberStart : segmentPage === 0;
    const isEvenPage = page ? page.pageNumber % 2 === 0 : segmentPage % 2 === 1;

    if (editArea === DocumentEditArea.BODY) {
        return { createType: null, headerFooterId: null, sectionId };
    }

    const isHeader = editArea === DocumentEditArea.HEADER;
    if (!isHeader && editArea !== DocumentEditArea.FOOTER) {
        throw new Error(`Invalid editArea: ${editArea}`);
    }
    const variants = isHeader
        ? {
            first: [firstPageHeaderId, HeaderFooterType.FIRST_PAGE_HEADER] as const,
            even: [evenPageHeaderId, HeaderFooterType.EVEN_PAGE_HEADER] as const,
            default: [defaultHeaderId, HeaderFooterType.DEFAULT_HEADER] as const,
        }
        : {
            first: [firstPageFooterId, HeaderFooterType.FIRST_PAGE_FOOTER] as const,
            even: [evenPageFooterId, HeaderFooterType.EVEN_PAGE_FOOTER] as const,
            default: [defaultFooterId, HeaderFooterType.DEFAULT_FOOTER] as const,
        };
    const [headerFooterId, createType] = useFirstPageHeaderFooter === BooleanNumber.TRUE && isFirstPage
        ? variants.first
        : evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage
            ? variants.even
            : variants.default;

    return {
        createType: headerFooterId ? null : createType,
        headerFooterId: headerFooterId ?? null,
        sectionId,
    };
}
