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

import type { IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

describe('test TextX methods and branches', () => {
    describe('test TextX methods', () => {
        it('test TextX insert method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.insert(5, body);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.INSERT,
                    body,
                    len: 5,
                },
            ]);
        });

        it('test TextX delete method', () => {
            const textX = new TextX();

            textX.delete(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.DELETE,
                    len: 5,
                },
            ]);
        });

        it('test TextX retain method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.retain(5, body, UpdateDocsAttributeType.COVER);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    body,
                    len: 5,
                    coverType: UpdateDocsAttributeType.COVER,
                },
            ]);
        });

        it('test TextX push method and merge two delete actions', () => {
            const textX = new TextX();

            textX.delete(5);
            textX.delete(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.DELETE,
                    len: 10, // 5 + 5
                },
            ]);
        });

        it('test TextX push method and put insert action before delete action', () => {
            const textX = new TextX();

            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.delete(5);
            textX.insert(5, body);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.INSERT,
                    body,
                    len: 5,
                },
                {
                    t: TextXActionType.DELETE,
                    len: 5,
                },
            ]);
        });

        it('test TextX push method and merge two simple retain action', () => {
            const textX = new TextX();

            textX.retain(4);
            textX.retain(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    len: 9,
                },
            ]);
        });

        it('test TextX push method and with more than one params', () => {
            const textX = new TextX();

            textX.push({
                t: TextXActionType.RETAIN,
                len: 4,
            }, {
                t: TextXActionType.RETAIN,
                len: 5,
            });

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    len: 9,
                },
            ]);
        });

        it('test TextX push method and with more than one params and merge the last two actions', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.push({
                t: TextXActionType.RETAIN,
                len: 4,
            }, {
                t: TextXActionType.DELETE,
                len: 5,
            });

            textX.push({
                t: TextXActionType.INSERT,
                len: 5,
                body,
            });

            const actions = textX.serialize();

            expect(actions.length).toBe(3);
            expect(actions[0].t).toBe(TextXActionType.RETAIN);
            expect(actions[1].t).toBe(TextXActionType.INSERT);
            expect(actions[2].t).toBe(TextXActionType.DELETE);
        });
    });

    describe('test TextX static methods', () => {
        it('test TextX isNoop method', () => {
            const textX = new TextX();

            expect(TextX.isNoop(textX.serialize())).toBe(true);

            textX.retain(4);
            textX.delete(5);

            expect(TextX.isNoop(textX.serialize())).toBe(false);
        });

        it('textX name should to be text-x', () => {
            expect(TextX.name).toBe('text-x');
        });
    });
});
