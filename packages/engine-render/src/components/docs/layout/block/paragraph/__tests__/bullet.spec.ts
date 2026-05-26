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

import type { IBullet, ILists, INestingLevel } from '@univerjs/core';
import { BulletAlignment, ListGlyphType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { dealWithBullet, getDefaultBulletSke } from '../bullet';

function createNestingLevel(overrides: Partial<INestingLevel> = {}): INestingLevel {
    return {
        bulletAlignment: BulletAlignment.START,
        glyphFormat: '%1.',
        startNumber: 1,
        ...overrides,
    };
}

function createLists(nestingLevels: INestingLevel[]): ILists {
    return {
        'test-list': {
            listType: 'test-list',
            nestingLevel: nestingLevels,
        },
    };
}

function createBullet(overrides: Partial<IBullet> = {}): IBullet {
    return {
        listId: 'list-1',
        listType: 'test-list',
        nestingLevel: 0,
        ...overrides,
    };
}

describe('bullet', () => {
    describe('dealWithBullet', () => {
        it('returns undefined when bullet is missing', () => {
            expect(dealWithBullet(undefined, {} as unknown as ILists)).toBeUndefined();
        });

        it('returns undefined when lists is missing', () => {
            expect(dealWithBullet(createBullet(), undefined as unknown as ILists)).toBeUndefined();
        });

        it('falls back to default bullet when list is missing', () => {
            const bullet = createBullet();
            const result = dealWithBullet(bullet, {} as unknown as ILists);
            expect(result).toBeDefined();
            expect(result!.symbol).toBe('\u25CF');
            expect(result!.listId).toBe('list-1');
        });

        it('falls back to default bullet when nestingLevel is missing', () => {
            const bullet = createBullet();
            const lists = {
                'test-list': {
                    listType: 'test-list',
                },
            };
            const result = dealWithBullet(bullet, lists as unknown as ILists);
            expect(result).toBeDefined();
            expect(result?.symbol).toBe('\u25CF');
        });

        it('falls back to default bullet when nesting level index is out of bounds', () => {
            const bullet = createBullet({ nestingLevel: 5 });
            const lists = createLists([createNestingLevel()]);
            const result = dealWithBullet(bullet, lists as unknown as ILists);
            expect(result).toBeDefined();
            expect(result?.symbol).toBe('\u25CF');
        });

        it('generates ordered list symbol with glyphFormat', () => {
            const bullet = createBullet();
            const lists = createLists([
                createNestingLevel({ glyphFormat: '%1.', glyphType: ListGlyphType.DECIMAL }),
            ]);
            const result = dealWithBullet(bullet, lists as unknown as ILists);
            expect(result).toBeDefined();
            expect(result!.symbol).toBe('2.');
            expect(result!.bulletType).toBe(true);
        });

        it('uses glyphSymbol directly for unordered list', () => {
            const bullet = createBullet();
            const lists = createLists([
                createNestingLevel({ glyphSymbol: '\u2022' }),
            ]);
            const result = dealWithBullet(bullet, lists as unknown as ILists);
            expect(result).toBeDefined();
            expect(result!.symbol).toBe('\u2022');
            expect(result!.bulletType).toBe(false);
        });

        it('handles multi-level glyphFormat', () => {
            const bullet = createBullet({ nestingLevel: 1 });
            const lists = createLists([
                createNestingLevel({ glyphFormat: '%1.', glyphType: ListGlyphType.DECIMAL }),
                createNestingLevel({ glyphFormat: '%1.%2.', glyphType: ListGlyphType.DECIMAL }),
            ]);
            const listLevelAncestors: Array<Record<string, unknown> | null> = [
                { startIndexItem: 2, symbol: '2.' },
                null,
            ];
            const result = dealWithBullet(bullet, lists as unknown as ILists, listLevelAncestors as unknown as Parameters<typeof dealWithBullet>[2]);
            expect(result).toBeDefined();
            expect(result?.symbol).toBe('2.2.');
        });

        it('merges textStyle from bullet and nestingLevel', () => {
            const bullet = createBullet({ textStyle: { fs: 14 } });
            const lists = createLists([
                createNestingLevel({ textStyle: { ff: 'Arial' }, glyphType: ListGlyphType.DECIMAL }),
            ]);
            const result = dealWithBullet(bullet, lists as unknown as ILists);
            expect(result).toBeDefined();
            expect(result!.ts.fs).toBe(14);
            expect(result!.ts.ff).toBe('Arial');
        });

        it('includes paragraphProperties from nestingLevel', () => {
            const bullet = createBullet();
            const lists = createLists([
                createNestingLevel({
                    glyphType: ListGlyphType.DECIMAL,
                    paragraphProperties: {
                        indentFirstLine: { v: 10 },
                    },
                }),
            ]);
            const result = dealWithBullet(bullet, lists as unknown as ILists);
            expect(result).toBeDefined();
            expect(result!.paragraphProperties).toBeDefined();
        });

        it('inherits startIndexItem from listLevelAncestors', () => {
            const bullet = createBullet();
            const lists = createLists([
                createNestingLevel({ glyphFormat: '%1.', glyphType: ListGlyphType.DECIMAL }),
            ]);
            const listLevelAncestors: Array<Record<string, unknown> | null> = [
                { startIndexItem: 5, symbol: '5.' },
            ];
            const result = dealWithBullet(bullet, lists as unknown as ILists, listLevelAncestors as unknown as Parameters<typeof dealWithBullet>[2]);
            expect(result).toBeDefined();
            expect(result?.startIndexItem).toBe(6);
        });
    });

    describe('getDefaultBulletSke', () => {
        it('returns default bullet skeleton', () => {
            const result = getDefaultBulletSke('list-default');
            expect(result.listId).toBe('list-default');
            expect(result.symbol).toBe('\u25CF');
            expect(result.ts.ff).toBe('Arial');
            expect(result.ts.fs).toBe(9);
            expect(result.startIndexItem).toBe(1);
            expect(result.paragraphProperties).toBeDefined();
        });

        it('uses custom startIndex', () => {
            const result = getDefaultBulletSke('list-default', 10);
            expect(result.startIndexItem).toBe(10);
        });
    });
});
