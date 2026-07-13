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

import { describe, expect, it } from 'vitest';
import { resolveSectionHeaderFooterReference, resolveSectionHeaderFooterReferences } from '../section-header-footer';

describe('section header/footer references', () => {
    const documentStyle = { defaultHeaderId: 'header-global', defaultFooterId: 'footer-global' };
    const sections = [
        { sectionId: 'section_1', startIndex: 3 },
        { sectionId: 'section_2', startIndex: 7 },
        { sectionId: 'section_3', startIndex: 11, defaultHeaderId: 'header-3' },
        { sectionId: 'section_4', startIndex: 15 },
    ];

    it('uses document defaults only for the first section and inherits through later sections', () => {
        expect(resolveSectionHeaderFooterReference(documentStyle, sections, 0, 'defaultHeaderId')).toEqual({
            segmentId: 'header-global',
            linkedToPrevious: false,
        });
        expect(resolveSectionHeaderFooterReference(documentStyle, sections, 1, 'defaultHeaderId')).toEqual({
            segmentId: 'header-global',
            linkedToPrevious: true,
            sourceSectionId: undefined,
        });
        expect(resolveSectionHeaderFooterReference(documentStyle, sections, 2, 'defaultHeaderId')).toEqual({
            segmentId: 'header-3',
            linkedToPrevious: false,
            sourceSectionId: 'section_3',
        });
        expect(resolveSectionHeaderFooterReference(documentStyle, sections, 3, 'defaultHeaderId')).toEqual({
            segmentId: 'header-3',
            linkedToPrevious: true,
            sourceSectionId: 'section_3',
        });
    });

    it('resolves all six reference variants independently', () => {
        expect(resolveSectionHeaderFooterReferences(documentStyle, sections, 1)).toEqual({
            defaultHeaderId: 'header-global',
            defaultFooterId: 'footer-global',
        });
    });
});
