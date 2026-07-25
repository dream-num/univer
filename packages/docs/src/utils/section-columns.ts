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

import type { IDocumentStyle, ISectionBreak, ISectionColumnProperties, PageOrientType } from '@univerjs/core';
import { PAGE_SIZE, PageOrientType as PageOrient, PaperType, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN } from '@univerjs/core';

export interface IEffectiveSectionPageSetup {
    pageSize: {
        width: number;
        height: number;
    };
    pageOrient: PageOrientType;
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    contentSize: {
        width: number;
        height: number;
    };
    pageNumberStart?: number;
}

function resolveSectionValue<T>(
    sectionValue: T | undefined,
    documentValue: T | undefined,
    fallback: T
): T {
    return sectionValue ?? documentValue ?? fallback;
}

function getEffectivePageSize(
    documentStyle: IDocumentStyle | undefined,
    section: ISectionBreak | undefined
): IEffectiveSectionPageSetup['pageSize'] {
    const fallback = PAGE_SIZE[PaperType.A4];
    return {
        width: resolveSectionValue(section?.pageSize?.width, documentStyle?.pageSize?.width, fallback.width),
        height: resolveSectionValue(section?.pageSize?.height, documentStyle?.pageSize?.height, fallback.height),
    };
}

function getEffectiveMargins(
    documentStyle: IDocumentStyle | undefined,
    section: ISectionBreak | undefined
): IEffectiveSectionPageSetup['margins'] {
    return {
        top: resolveSectionValue(section?.marginTop, documentStyle?.marginTop, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN),
        bottom: resolveSectionValue(section?.marginBottom, documentStyle?.marginBottom, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN),
        left: resolveSectionValue(section?.marginLeft, documentStyle?.marginLeft, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN),
        right: resolveSectionValue(section?.marginRight, documentStyle?.marginRight, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN),
    };
}

function assertPositivePageSetup(
    pageSize: IEffectiveSectionPageSetup['pageSize'],
    contentSize: IEffectiveSectionPageSetup['contentSize']
): void {
    if (![pageSize.width, pageSize.height, contentSize.width, contentSize.height]
        .every((value) => Number.isFinite(value) && value > 0)) {
        throw new RangeError('Effective section page setup must leave a positive content area and use finite positive page dimensions.');
    }
}

/** Resolves nominal traditional page geometry without requiring a renderer. */
export function getEffectiveSectionPageSetup(
    documentStyle: IDocumentStyle | undefined,
    section: ISectionBreak | undefined
): IEffectiveSectionPageSetup {
    const pageSize = getEffectivePageSize(documentStyle, section);
    const margins = getEffectiveMargins(documentStyle, section);
    const contentSize = {
        width: getSectionContentWidth(documentStyle, section),
        height: pageSize.height - margins.top - margins.bottom,
    };
    assertPositivePageSetup(pageSize, contentSize);

    const pageNumberStart = section?.pageNumberStart ?? documentStyle?.pageNumberStart;
    return {
        pageSize,
        pageOrient: resolveSectionValue(section?.pageOrient, documentStyle?.pageOrient, PageOrient.PORTRAIT),
        margins,
        contentSize,
        ...(pageNumberStart == null ? {} : { pageNumberStart }),
    };
}

/** Returns the usable horizontal layout width for a traditional section. */
export function getSectionContentWidth(
    documentStyle: IDocumentStyle | undefined,
    section: ISectionBreak | undefined
): number {
    const pageWidth = resolveSectionValue(
        section?.pageSize?.width,
        documentStyle?.pageSize?.width,
        PAGE_SIZE[PaperType.A4].width
    );
    return Math.max(
        0,
        pageWidth -
        resolveSectionValue(section?.marginLeft, documentStyle?.marginLeft, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN) -
        resolveSectionValue(section?.marginRight, documentStyle?.marginRight, TRADITIONAL_DOCUMENT_DEFAULT_MARGIN)
    );
}

/** Creates explicit OOXML section columns from a count, gap, and optional widths. */
export function createSectionColumnProperties(
    documentStyle: IDocumentStyle | undefined,
    section: ISectionBreak | undefined,
    columnCount: number,
    gap: number,
    widths?: number[]
): ISectionColumnProperties[] {
    if (columnCount <= 1) {
        return [];
    }

    const safeGap = Math.max(0, gap);
    const contentWidth = getSectionContentWidth(documentStyle, section);
    const availableWidth = Math.max(0, contentWidth - safeGap * (columnCount - 1));
    if (widths) {
        if (widths.some((width) => !Number.isFinite(width) || width < 0)) {
            throw new RangeError('Section column widths must be finite and non-negative.');
        }
        if (widths.reduce((sum, width) => sum + width, 0) > availableWidth) {
            throw new RangeError('Section columns exceed the available page content width.');
        }
    }
    const resolvedWidths = widths ?? Array.from({ length: columnCount }, () => availableWidth / columnCount);

    return resolvedWidths.map((width, index) => ({
        width: Math.max(0, width),
        paddingEnd: index === columnCount - 1 ? 0 : safeGap,
    }));
}
