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

import { ListGlyphType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { dealWithBullet, getDefaultBulletSke } from '../bullet';

describe('paragraph bullet', () => {
    it('returns default bullet skeleton for missing list definitions', () => {
        expect(dealWithBullet()).toBeUndefined();

        const fallbackNoList = dealWithBullet(
            { listId: 'l1', listType: 'decimal', nestingLevel: 0 } as any,
            {} as any,
            []
        );
        expect(fallbackNoList).toEqual(expect.objectContaining({
            listId: 'l1',
            symbol: '\u25CF',
        }));

        const fallbackNoNesting = dealWithBullet(
            { listId: 'l2', listType: 'decimal', nestingLevel: 2 } as any,
            {
                decimal: {
                    nestingLevel: [{}],
                },
            } as any,
            [{ startIndexItem: 2 } as any, null, { startIndexItem: 8 } as any]
        );
        expect(fallbackNoNesting?.startIndexItem).toBe(8);

        expect(getDefaultBulletSke('lx', 3).startIndexItem).toBe(3);
    });

    it('builds ordered and unordered list symbols from nesting rules', () => {
        const listLevelAncestors = [
            { startIndexItem: 4 } as any,
            { startIndexItem: 3 } as any,
        ];
        const lists = {
            custom: {
                nestingLevel: [
                    {
                        startNumber: 1,
                        glyphType: ListGlyphType.DECIMAL,
                        glyphFormat: '%1.',
                        paragraphProperties: {},
                        textStyle: {
                            ff: 'Times New Roman',
                        },
                    },
                    {
                        startNumber: 1,
                        glyphType: ListGlyphType.UPPER_LETTER,
                        glyphFormat: '%1.%2)',
                        paragraphProperties: {},
                        textStyle: {
                            ff: 'Arial',
                            fs: 11,
                        },
                    },
                ],
            },
            unordered: {
                nestingLevel: [
                    {
                        glyphSymbol: '•',
                        glyphFormat: '',
                        paragraphProperties: {},
                        textStyle: {},
                    },
                ],
            },
        } as any;

        const ordered = dealWithBullet(
            {
                listId: 'l-order',
                listType: 'custom',
                nestingLevel: 1,
                textStyle: {
                    bl: 1,
                },
            } as any,
            lists,
            listLevelAncestors
        );
        expect(ordered?.symbol).toBe('4.D)');
        expect(ordered?.startIndexItem).toBe(4);
        expect(ordered?.bulletType).toBe(true);

        const unordered = dealWithBullet(
            {
                listId: 'l-unorder',
                listType: 'unordered',
                nestingLevel: 0,
            } as any,
            lists,
            listLevelAncestors
        );
        expect(unordered?.symbol).toBe('•');
        expect(unordered?.bulletType).toBe(false);
    });
});
