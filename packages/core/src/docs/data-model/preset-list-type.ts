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

import type { IListData, INestingLevel } from '../../types/interfaces/i-document-data';
import { BulletAlignment, GlyphType } from '../../types/interfaces/i-document-data';

export enum PresetListType {
    BULLET_LIST = 'BULLET_LIST',
    ORDER_LIST = 'ORDER_LIST',
}

export const PRESET_LIST_TYPE = {
    [PresetListType.BULLET_LIST]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: [
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %0',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphSymbol: '\u25CF',
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 21 },
                },
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphSymbol: '\u25A0',
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 42 },
                },
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphSymbol: '\u25C6',
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 63 },
                },
            },
        ] as INestingLevel[],
    } as IListData,
    [PresetListType.ORDER_LIST]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel: [
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.DECIMAL,
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 21 },
                },
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.%2)',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.DECIMAL,
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 42 },
                },
            },
            {
                bulletAlignment: BulletAlignment.START,
                glyphFormat: ' %1.%2.%3.',
                textStyle: {
                    fs: 12,
                },
                startNumber: 0,
                glyphType: GlyphType.DECIMAL,
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 63 },
                },
            },
        ] as INestingLevel[],
    } as IListData,
};
