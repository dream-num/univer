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

import type { IDocumentBody, IDocumentData } from '../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import {
    cloneBodyWithFreshParagraphIds,
    cloneParagraphWithId,
    ensureUniqueParagraphIds,
    normalizeBodyParagraphIds,
    normalizeDocumentParagraphIds,
    PARAGRAPH_ID_PREFIX,
} from '../paragraph-id';

function createBody(): IDocumentBody {
    return {
        dataStream: 'Alpha\rBeta\r\n',
        paragraphs: [
            { startIndex: 5 },
            { startIndex: 10, paragraphId: 'para_existing' },
        ],
        sectionBreaks: [{ startIndex: 11 }],
    };
}

describe('paragraph id normalization', () => {
    it('adds ids to paragraphs that do not have one and preserves an existing valid id', () => {
        const body = normalizeBodyParagraphIds(createBody(), { unitId: 'doc-1', segmentId: '' });

        expect(body.paragraphs?.[0].paragraphId).toMatch(new RegExp(`^${PARAGRAPH_ID_PREFIX}`));
        expect(body.paragraphs?.[1].paragraphId).toBe('para_existing');
    });

    it('repairs duplicate and invalid ids without changing startIndex', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\rC\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_dup' },
                { startIndex: 3, paragraphId: 'para_dup' },
                { startIndex: 5, paragraphId: 1 as never },
            ],
            sectionBreaks: [{ startIndex: 6 }],
        };

        ensureUniqueParagraphIds(body, { unitId: 'doc-1', segmentId: '' });

        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([1, 3, 5]);
        expect(body.paragraphs?.[0].paragraphId).toBe('para_dup');
        expect(new Set(body.paragraphs?.map((paragraph) => paragraph.paragraphId)).size).toBe(3);
        expect(body.paragraphs?.every((paragraph) => typeof paragraph.paragraphId === 'string')).toBe(true);
        expect(body.paragraphs?.every((paragraph) => paragraph.paragraphId?.startsWith(PARAGRAPH_ID_PREFIX))).toBe(true);
    });

    it('normalizes main body and header/footer bodies', () => {
        const documentData: IDocumentData = {
            id: 'doc-1',
            body: createBody(),
            headers: {
                h1: { headerId: 'h1', body: createBody() },
            },
            footers: {
                f1: { footerId: 'f1', body: createBody() },
            },
            documentStyle: {},
        };

        const normalized = normalizeDocumentParagraphIds(documentData);

        expect(normalized.body?.paragraphs?.every((paragraph) => paragraph.paragraphId?.startsWith(PARAGRAPH_ID_PREFIX))).toBe(true);
        expect(normalized.headers?.h1.body?.paragraphs?.every((paragraph) => paragraph.paragraphId?.startsWith(PARAGRAPH_ID_PREFIX))).toBe(true);
        expect(normalized.footers?.f1.body?.paragraphs?.every((paragraph) => paragraph.paragraphId?.startsWith(PARAGRAPH_ID_PREFIX))).toBe(true);
    });

    it('clones paste/import fragments with fresh unique ids while preserving paragraph count and start indexes', () => {
        const source = normalizeBodyParagraphIds(createBody(), { unitId: 'doc-1', segmentId: '' });
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
