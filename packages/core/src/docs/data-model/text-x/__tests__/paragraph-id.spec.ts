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
import type { TextXAction } from '../../index';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared';
import { DataStreamTreeTokenType } from '../../types';
import { PRESERVE_INSERTED_PARAGRAPH_IDS, TextXActionType } from '../action-types';
import { TextX } from '../text-x';

const PARAGRAPH_ID_PATTERN = /^para_.+/;

describe('TextX paragraph ids', () => {
    it('does not treat a structural gap as part of the following paragraph', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.BLOCK_START}B${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'para_left' },
                { startIndex: 6, paragraphId: 'para_right', paragraphStyle: { indentStart: { v: 60 } } },
                { startIndex: 8, paragraphId: 'para_trailing' },
            ],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 4,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: T.PARAGRAPH,
                paragraphs: [{ startIndex: 0, paragraphId: 'para_inserted' }],
            },
        }];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(body.paragraphs?.find((paragraph) => paragraph.paragraphId === 'para_right')).toEqual({
            startIndex: 7,
            paragraphId: 'para_right',
            paragraphStyle: { indentStart: { v: 60 } },
        });
        expect(body.paragraphs?.find((paragraph) => paragraph.startIndex === 4)?.paragraphId).not.toBe('para_right');
    });

    it('preserves paragraph ids when inserting text before paragraphs', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
        };

        TextX.apply(body, [{
            t: TextXActionType.INSERT,
            len: 1,
            body: { dataStream: 'X' },
        }]);

        expect(body.paragraphs).toEqual([
            { startIndex: 2, paragraphId: 'para_first' },
            { startIndex: 4, paragraphId: 'para_second' },
        ]);
    });

    it('preserves inserted paragraph ids through invert', () => {
        const textX = new TextX();

        textX.insert(2, {
            dataStream: 'A\r',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_inserted' }],
        });

        const invertedActions = TextX.invert(textX.serialize());

        expect(invertedActions).toEqual([{
            t: TextXActionType.DELETE,
            len: 2,
            body: {
                dataStream: 'A\r',
                paragraphs: [{ startIndex: 1, paragraphId: 'para_inserted' }],
            },
        }]);
    });

    it('generates paragraph ids for inserted builder bodies when making them invertible', () => {
        const textX = new TextX();

        textX.insert(2, {
            dataStream: 'A\r',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_fixture_11' }],
        });

        const actions = textX.serialize();
        TextX.makeInvertible(actions, {
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'para_existing' }],
        });

        const insertParagraphId = actions[0].body?.paragraphs?.[0].paragraphId;
        const invertedParagraphId = TextX.invert(actions)[0].body?.paragraphs?.[0].paragraphId;

        expect(insertParagraphId).toMatch(PARAGRAPH_ID_PATTERN);
        expect(invertedParagraphId).toBe(insertParagraphId);
    });

    it('generates paragraph ids for inserted bodies that omit them', () => {
        const body: IDocumentBody = {
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'para_existing' }],
        };

        TextX.apply(body, [{
            t: TextXActionType.INSERT,
            len: 2,
            body: {
                dataStream: 'A\r',
                paragraphs: [{ startIndex: 1, paragraphId: 'para_fixture_12' }],
            },
        }]);

        expect(body.paragraphs?.[0]).toMatchObject({ startIndex: 1 });
        expect(body.paragraphs?.[0].paragraphId).toMatch(PARAGRAPH_ID_PATTERN);
        expect(body.paragraphs?.[0].paragraphId).not.toBe('para_existing');
        expect(body.paragraphs?.[1]).toEqual({ startIndex: 2, paragraphId: 'para_existing' });
    });

    it('keeps original paragraph id and gives split paragraph a new id', () => {
        const body: IDocumentBody = {
            dataStream: 'AB\r\n',
            paragraphs: [{ startIndex: 2, paragraphId: 'para_original' }],
        };

        TextX.apply(body, [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: '\r',
                paragraphs: [{ startIndex: 0, paragraphId: 'para_fixture_13' }],
            },
        }]);

        expect(body.paragraphs?.[0]).toEqual({ startIndex: 1, paragraphId: 'para_original' });
        expect(body.paragraphs?.[1].startIndex).toBe(3);
        expect(body.paragraphs?.[1].paragraphId).toMatch(PARAGRAPH_ID_PATTERN);
        expect(body.paragraphs?.[1].paragraphId).not.toBe('para_original');
    });

    it('keeps original paragraph id and gives explicit inserted id to split paragraph', () => {
        const body: IDocumentBody = {
            dataStream: 'AB\r\n',
            paragraphs: [{ startIndex: 2, paragraphId: 'para_original' }],
        };

        TextX.apply(body, [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: '\r',
                paragraphs: [{ startIndex: 0, paragraphId: 'para_explicit' }],
            },
        }]);

        expect(body.paragraphs).toEqual([
            { startIndex: 1, paragraphId: 'para_original' },
            { startIndex: 3, paragraphId: 'para_explicit' },
        ]);
    });

    it('keeps original paragraph id when applying an invertible split action', () => {
        const body: IDocumentBody = {
            dataStream: 'AB\r\n',
            paragraphs: [{ startIndex: 2, paragraphId: 'para_original' }],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: '\r',
                paragraphs: [{ startIndex: 0 } as never],
            },
        }];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(actions[1].body?.paragraphs?.[0].paragraphId).toBe('para_original');
        expect(body.paragraphs?.[0]).toEqual({ startIndex: 1, paragraphId: 'para_original' });
        expect(body.paragraphs?.[1].startIndex).toBe(3);
        expect(body.paragraphs?.[1].paragraphId).toMatch(PARAGRAPH_ID_PATTERN);
        expect(body.paragraphs?.[1].paragraphId).not.toBe('para_original');
    });

    it('keeps explicit split paragraph id through makeInvertible and apply', () => {
        const body: IDocumentBody = {
            dataStream: 'AB\r\n',
            paragraphs: [{ startIndex: 2, paragraphId: 'para_original' }],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: '\r',
                paragraphs: [{ startIndex: 0, paragraphId: 'para_explicit' }],
            },
        }];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(actions[1].body?.paragraphs?.[0].paragraphId).toBe('para_explicit');
        expect(body.paragraphs).toEqual([
            { startIndex: 1, paragraphId: 'para_original' },
            { startIndex: 3, paragraphId: 'para_explicit' },
        ]);
    });

    it('repairs inserted paragraph ids that collide with the target document before invert', () => {
        const body: IDocumentBody = {
            dataStream: 'A\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_existing' }],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 2,
            body: {
                dataStream: 'B\r',
                paragraphs: [{ startIndex: 1, paragraphId: 'para_existing' }],
            },
        }];

        TextX.makeInvertible(actions, body);
        const insertedParagraphId = actions[0].body?.paragraphs?.[0].paragraphId;
        const invertedParagraphId = TextX.invert(actions)[0].body?.paragraphs?.[0].paragraphId;

        TextX.apply(body, actions);

        expect(insertedParagraphId).toMatch(PARAGRAPH_ID_PATTERN);
        expect(insertedParagraphId).not.toBe('para_existing');
        expect(invertedParagraphId).toBe(insertedParagraphId);
        expect(body.paragraphs?.[0]).toEqual({ startIndex: 1, paragraphId: insertedParagraphId });
        expect(body.paragraphs?.[1]).toEqual({ startIndex: 3, paragraphId: 'para_existing' });
    });

    it('repairs duplicate paragraph ids across multiple inserts before invert', () => {
        const body: IDocumentBody = {
            dataStream: 'A\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_existing' }],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 2,
            body: {
                dataStream: 'B\r',
                paragraphs: [{ startIndex: 1, paragraphId: 'para_dup' }],
            },
        }, {
            t: TextXActionType.INSERT,
            len: 2,
            body: {
                dataStream: 'C\r',
                paragraphs: [{ startIndex: 1, paragraphId: 'para_dup' }],
            },
        }];

        TextX.makeInvertible(actions, body);
        const firstInsertParagraphId = actions[0].body?.paragraphs?.[0].paragraphId;
        const secondInsertParagraphId = actions[1].body?.paragraphs?.[0].paragraphId;
        const invertedActions = TextX.invert(actions);

        TextX.apply(body, actions);

        expect(firstInsertParagraphId).toBe('para_dup');
        expect(secondInsertParagraphId).toMatch(PARAGRAPH_ID_PATTERN);
        expect(secondInsertParagraphId).not.toBe(firstInsertParagraphId);
        expect(invertedActions[0].body?.paragraphs?.[0].paragraphId).toBe(firstInsertParagraphId);
        expect(invertedActions[1].body?.paragraphs?.[0].paragraphId).toBe(secondInsertParagraphId);
        expect(body.paragraphs?.[0]).toEqual({ startIndex: 1, paragraphId: firstInsertParagraphId });
        expect(body.paragraphs?.[1]).toEqual({ startIndex: 3, paragraphId: secondInsertParagraphId });
    });

    it('keeps the following paragraph id when deleting a paragraph marker under the current merge model', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
        };

        TextX.apply(body, [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.DELETE,
            len: 1,
        }]);

        expect(body.dataStream).toBe('AB\r\n');
        expect(body.paragraphs).toEqual([{ startIndex: 2, paragraphId: 'para_second' }]);
    });

    it('preserves target paragraph id when retain metadata omits one', () => {
        const body: IDocumentBody = {
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'para_original' }],
        };

        TextX.apply(body, [{
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: {
                dataStream: '',
                paragraphs: [{
                    startIndex: 0,
                    paragraphStyle: { lineSpacing: 2 },
                } as never],
            },
        }]);

        expect(body.paragraphs).toEqual([{
            startIndex: 0,
            paragraphId: 'para_original',
            paragraphStyle: { lineSpacing: 2 },
        }]);
    });

    it('uses explicit paragraph id when retain metadata provides one', () => {
        const body: IDocumentBody = {
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'para_original' }],
        };

        TextX.apply(body, [{
            t: TextXActionType.RETAIN,
            len: 1,
            coverType: UpdateDocsAttributeType.REPLACE,
            body: {
                dataStream: '',
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: 'para_replacement',
                    paragraphStyle: { lineSpacing: 2 },
                }],
            },
        }]);

        expect(body.paragraphs).toEqual([{
            startIndex: 0,
            paragraphId: 'para_replacement',
            paragraphStyle: { lineSpacing: 2 },
        }]);
    });

    it('makeInvertible delete body captures original paragraph ids', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
        };
        const actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.DELETE,
            len: 1,
        }];

        TextX.makeInvertible(actions, body);

        expect(actions[1]).toEqual({
            t: TextXActionType.DELETE,
            len: 1,
            body: {
                dataStream: '\r',
                textRuns: undefined,
                paragraphs: [{ startIndex: 0, paragraphId: 'para_first' }],
                customBlocks: undefined,
            },
        });
    });

    it('preserves explicit paragraph ids during an atomic structural replacement', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
        };
        const replacementBody = {
            dataStream: 'A\rB\r',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
            [PRESERVE_INSERTED_PARAGRAPH_IDS]: true,
        } as IDocumentBody;
        const textX = new TextX();

        textX.insert(4, replacementBody);
        textX.delete(4);
        const actions = textX.serialize();
        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(body.dataStream).toBe('A\rB\r\n');
        expect(body.paragraphs).toEqual([
            { startIndex: 1, paragraphId: 'para_first' },
            { startIndex: 3, paragraphId: 'para_second' },
        ]);
        expect((actions[0].body as IDocumentBody & Record<string, unknown>)[PRESERVE_INSERTED_PARAGRAPH_IDS]).toBe(true);
        expect((body as IDocumentBody & Record<string, unknown>)[PRESERVE_INSERTED_PARAGRAPH_IDS]).toBeUndefined();
    });

    it('preserves the structural replacement marker when insert actions are split and composed', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
        };
        const replacement = new TextX();
        replacement.insert(4, {
            dataStream: 'A\rB\r',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_first' },
                { startIndex: 3, paragraphId: 'para_second' },
            ],
            [PRESERVE_INSERTED_PARAGRAPH_IDS]: true,
        } as IDocumentBody);
        replacement.delete(4);

        const formatting = new TextX();
        formatting.retain(2, {
            dataStream: '',
            paragraphs: [{ startIndex: 1, paragraphId: 'para_first', paragraphStyle: { spaceAbove: { v: 8 } } }],
        });
        formatting.retain(2);

        const composed = TextX.compose(replacement.serialize(), formatting.serialize());
        const insertedBodies = composed
            .filter((action) => action.t === TextXActionType.INSERT)
            .map((action) => action.body as IDocumentBody & Record<string, unknown>);

        expect(insertedBodies.length).toBeGreaterThan(0);
        expect(insertedBodies.every((insertedBody) => insertedBody[PRESERVE_INSERTED_PARAGRAPH_IDS] === true)).toBe(true);

        TextX.makeInvertible(composed, body);
        TextX.apply(body, composed);

        expect(body.paragraphs?.map((paragraph) => paragraph.paragraphId)).toEqual(['para_first', 'para_second']);
    });
});
