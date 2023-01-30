import { BulletAlignment, GlyphType } from '@univerjs/core';

export const DEFAULT_LIST_TEST = {
    unorderedTest: {
        listId: 'unorderedTest',
        nestingLevel: [
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %0',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphSymbol: '\u25CF',
                hanging: 21,
                indentStart: 21,
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphSymbol: '\u25A0',
                hanging: 21,
                indentStart: 42,
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphSymbol: '\u25C6',
                hanging: 21,
                indentStart: 63,
            },
        ],
    },
    testBullet: {
        listId: 'testBullet',
        nestingLevel: [
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.ROMAN,
                hanging: 21,
                indentStart: 21,
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.%2)',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.ROMAN,
                hanging: 21,
                indentStart: 42,
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.%2.%3.',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.ROMAN,
                hanging: 21,
                indentStart: 63,
            },
        ],
    },
};
