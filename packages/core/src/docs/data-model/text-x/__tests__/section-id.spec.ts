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

import type { IDocumentBody } from '../../../../types/interfaces';
import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared';
import { createSectionId, SECTION_ID_PREFIX } from '../../../section-break-id';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { validateDocBodyStructure } from '../structure-validator';
import { TextX } from '../text-x';

describe('section break identity', () => {
    it('creates scoped section ids', () => {
        const ids = new Set<string>();
        const first = createSectionId(ids);
        const second = createSectionId(ids);

        expect(first).toMatch(new RegExp(`^${SECTION_ID_PREFIX}`));
        expect(second).not.toBe(first);
        expect(ids).toEqual(new Set([first, second]));
    });

    it('freshens a colliding inserted section id before applying TextX', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'para_a' }],
            sectionBreaks: [{ startIndex: 2, sectionId: 'section_existing' }],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: T.SECTION_BREAK,
                sectionBreaks: [{ startIndex: 0, sectionId: 'section_existing' }],
            },
        }];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(body.sectionBreaks?.map((section) => section.sectionId)).toHaveLength(2);
        expect(new Set(body.sectionBreaks?.map((section) => section.sectionId)).size).toBe(2);
    });

    it('restores the original section id and config through undo', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.SECTION_BREAK}B${T.SECTION_BREAK}`,
            sectionBreaks: [
                { startIndex: 1, sectionId: 'section_left', sectionType: 1 },
                { startIndex: 3, sectionId: 'section_right' },
            ],
        };
        const actions: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.DELETE, len: 1 },
        ];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);
        TextX.apply(body, TextX.invert(actions));

        expect(body.sectionBreaks?.[0]).toMatchObject({
            startIndex: 1,
            sectionId: 'section_left',
            sectionType: 1,
        });
    });

    it('preserves identity when section configuration is replaced', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: T.SECTION_BREAK,
            sectionBreaks: [{ startIndex: 0, sectionId: 'section_original' }],
        };

        TextX.apply(body, [{
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: {
                dataStream: '',
                sectionBreaks: [{ startIndex: 0, sectionId: 'section_attempted_replacement', sectionType: 1 }],
            },
        }]);

        expect(body.sectionBreaks?.[0]).toMatchObject({
            sectionId: 'section_original',
            sectionType: 1,
        });
    });

    it('reports missing and duplicate section ids', () => {
        const T = DataStreamTreeTokenType;
        const body = {
            dataStream: `${T.SECTION_BREAK}${T.SECTION_BREAK}${T.SECTION_BREAK}`,
            sectionBreaks: [
                { startIndex: 0, sectionId: '' },
                { startIndex: 1, sectionId: 'section_duplicate' },
                { startIndex: 2, sectionId: 'section_duplicate' },
            ],
        } as IDocumentBody;

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toEqual(expect.arrayContaining([
            'missing-section-id',
            'duplicate-section-id',
        ]));
    });
});
