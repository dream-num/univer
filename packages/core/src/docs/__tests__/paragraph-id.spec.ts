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

import type { IDocumentBody } from '../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import {
    cloneBodyWithFreshParagraphIds,
    cloneParagraphWithId,
    PARAGRAPH_ID_PREFIX,
} from '../paragraph-id';

function createBody(): IDocumentBody {
    return {
        dataStream: 'Alpha\rBeta\r\n',
        paragraphs: [
            { startIndex: 5, paragraphId: 'para_alpha' },
            { startIndex: 10, paragraphId: 'para_existing' },
        ],
        sectionBreaks: [{ sectionId: 'section_fixture_1', startIndex: 11 }],
    };
}

describe('paragraph id helpers', () => {
    it('clones paste/import fragments with fresh unique ids while preserving paragraph count and start indexes', () => {
        const source = createBody();
        const cloned = cloneBodyWithFreshParagraphIds(source, { unitId: 'doc-2', segmentId: '' });

        expect(cloned.paragraphs).toHaveLength(source.paragraphs!.length);
        expect(cloned.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual(source.paragraphs?.map((paragraph) => paragraph.startIndex));
        expect(cloned.paragraphs?.map((paragraph) => paragraph.paragraphId)).not.toEqual(source.paragraphs?.map((paragraph) => paragraph.paragraphId));
        expect(new Set(cloned.paragraphs?.map((paragraph) => paragraph.paragraphId)).size).toBe(cloned.paragraphs?.length);
        expect(cloned.paragraphs?.every((paragraph) => paragraph.paragraphId?.startsWith(PARAGRAPH_ID_PREFIX))).toBe(true);
    });

    it('preserves a valid unique id when cloning a paragraph by default or when preserveId is true', () => {
        const existingIds = new Set<string>();
        const paragraph = { startIndex: 5, paragraphId: 'para_keep' };

        const defaultClone = cloneParagraphWithId(paragraph, existingIds);
        const explicitClone = cloneParagraphWithId({ ...paragraph, paragraphId: 'para_keep_explicit' }, existingIds, true);

        expect(defaultClone).not.toBe(paragraph);
        expect(defaultClone.paragraphId).toBe('para_keep');
        expect(explicitClone.paragraphId).toBe('para_keep_explicit');
        expect(existingIds.has('para_keep')).toBe(true);
        expect(existingIds.has('para_keep_explicit')).toBe(true);
    });

    it('regenerates a paragraph id when preserving would duplicate an existing id', () => {
        const existingIds = new Set<string>(['para_duplicate']);
        const cloned = cloneParagraphWithId({ startIndex: 5, paragraphId: 'para_duplicate' }, existingIds);

        expect(cloned.paragraphId).not.toBe('para_duplicate');
        expect(cloned.paragraphId).toMatch(new RegExp(`^${PARAGRAPH_ID_PREFIX}`));
        expect(existingIds.has(cloned.paragraphId!)).toBe(true);
    });

    it('regenerates invalid paragraph ids when cloning a paragraph', () => {
        const existingIds = new Set<string>();
        const cloned = cloneParagraphWithId({ startIndex: 5, paragraphId: 'invalid' }, existingIds);

        expect(cloned.paragraphId).not.toBe('invalid');
        expect(cloned.paragraphId).toMatch(new RegExp(`^${PARAGRAPH_ID_PREFIX}`));
        expect(existingIds.has(cloned.paragraphId!)).toBe(true);
    });

    it('regenerates a paragraph id when preserveId is false', () => {
        const existingIds = new Set<string>();
        const cloned = cloneParagraphWithId({ startIndex: 5, paragraphId: 'para_replace' }, existingIds, false);

        expect(cloned.paragraphId).not.toBe('para_replace');
        expect(cloned.paragraphId).toMatch(new RegExp(`^${PARAGRAPH_ID_PREFIX}`));
        expect(existingIds.has(cloned.paragraphId!)).toBe(true);
    });
});
