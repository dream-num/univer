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

import type { IDocumentStyle, ISectionBreak } from '../types/interfaces/i-document-data';

export type SectionHeaderFooterKind = 'header' | 'footer';
export type SectionHeaderFooterVariant = 'default' | 'first' | 'even';
export type SectionHeaderFooterReferenceKey =
    | 'defaultHeaderId'
    | 'defaultFooterId'
    | 'firstPageHeaderId'
    | 'firstPageFooterId'
    | 'evenPageHeaderId'
    | 'evenPageFooterId';

export interface IResolvedSectionHeaderFooterReference {
    segmentId?: string;
    linkedToPrevious: boolean;
    sourceSectionId?: string;
}

export function getSectionHeaderFooterReferenceKey(
    kind: SectionHeaderFooterKind,
    variant: SectionHeaderFooterVariant
): SectionHeaderFooterReferenceKey {
    const prefix = variant === 'default' ? 'default' : variant === 'first' ? 'firstPage' : 'evenPage';
    return `${prefix}${kind === 'header' ? 'Header' : 'Footer'}Id` as SectionHeaderFooterReferenceKey;
}

/**
 * Resolves one OOXML header/footer reference for a document section.
 * A missing reference after the first section inherits the previous section.
 * Document-level references are defaults for the first section only.
 */
export function resolveSectionHeaderFooterReference(
    documentStyle: IDocumentStyle,
    sections: Readonly<ISectionBreak[]>,
    sectionIndex: number,
    key: SectionHeaderFooterReferenceKey
): IResolvedSectionHeaderFooterReference {
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
        return { linkedToPrevious: false };
    }

    const current = sections[sectionIndex];
    const explicit = current[key];
    if (typeof explicit === 'string' && explicit) {
        return {
            segmentId: explicit,
            linkedToPrevious: false,
            sourceSectionId: current.sectionId,
        };
    }

    if (sectionIndex === 0) {
        const documentDefault = documentStyle[key];
        return {
            ...(typeof documentDefault === 'string' && documentDefault ? { segmentId: documentDefault } : {}),
            linkedToPrevious: false,
        };
    }

    const inherited = resolveSectionHeaderFooterReference(documentStyle, sections, sectionIndex - 1, key);
    return {
        ...(inherited.segmentId ? { segmentId: inherited.segmentId } : {}),
        linkedToPrevious: true,
        sourceSectionId: inherited.sourceSectionId,
    };
}

export function resolveSectionHeaderFooterReferences(
    documentStyle: IDocumentStyle,
    sections: Readonly<ISectionBreak[]>,
    sectionIndex: number
): Pick<ISectionBreak, SectionHeaderFooterReferenceKey> {
    const result: Pick<ISectionBreak, SectionHeaderFooterReferenceKey> = {};
    const keys: SectionHeaderFooterReferenceKey[] = [
        'defaultHeaderId',
        'defaultFooterId',
        'firstPageHeaderId',
        'firstPageFooterId',
        'evenPageHeaderId',
        'evenPageFooterId',
    ];

    for (const key of keys) {
        const { segmentId } = resolveSectionHeaderFooterReference(documentStyle, sections, sectionIndex, key);
        if (segmentId) {
            result[key] = segmentId;
        }
    }
    return result;
}
