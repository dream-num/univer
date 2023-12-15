/**
 * Copyright 2023-present DreamNum Inc.
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

import { BulletAlignment, GlyphType } from '@univerjs/core';

export const DEFAULT_LIST_TEST = {
    bulletList: {
        listId: 'bulletList',
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
    orderList: {
        listId: 'orderList',
        nestingLevel: [
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.DECIMAL,
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
                glyphType: GlyphType.DECIMAL,
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
                glyphType: GlyphType.DECIMAL,
                hanging: 21,
                indentStart: 63,
            },
        ],
    },
};
