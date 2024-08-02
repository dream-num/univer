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
    BULLET_LIST_1 = 'BULLET_LIST_1',
    BULLET_LIST_2 = 'BULLET_LIST_2',
    BULLET_LIST_3 = 'BULLET_LIST_3',
    BULLET_LIST_4 = 'BULLET_LIST_4',
    BULLET_LIST_5 = 'BULLET_LIST_5',

    ORDER_LIST = 'ORDER_LIST',
    ORDER_LIST_1 = 'ORDER_LIST_1',
    ORDER_LIST_2 = 'ORDER_LIST_2',
    ORDER_LIST_3 = 'ORDER_LIST_3',
    ORDER_LIST_4 = 'ORDER_LIST_4',
    ORDER_LIST_5 = 'ORDER_LIST_5',
}

type BulletSymbols = [string, string, string];
const bulletListFactory = (symbols: BulletSymbols): INestingLevel[] => {
    return [
        ...symbols,
        ...symbols,
        ...symbols,
    ].map((templateSymbol, i) => ({
        glyphFormat: ` %${i + 1}`,
        glyphSymbol: templateSymbol,
        bulletAlignment: BulletAlignment.START,
        textStyle: {
            fs: 12,
        },
        startNumber: 0,
        paragraphProperties: {
            hanging: { v: 21 },
            indentStart: { v: 21 * (i + 1) },
        },
    }));
};

export const PRESET_LIST_TYPE = {
    [PresetListType.BULLET_LIST]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: bulletListFactory(['\u25CF', '\u25CB', '\u25A0']),
    } as IListData,
    [PresetListType.BULLET_LIST_1]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: bulletListFactory(['\u2756', '\u27A2', '\u25A0']),
    } as IListData,
    [PresetListType.BULLET_LIST_2]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: bulletListFactory(['\u2714', '\u25CF', '\u25C6']),
    } as IListData,
    [PresetListType.BULLET_LIST_3]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: bulletListFactory(['\u25A0', '\u25C6', '\u25CB']),
    } as IListData,
    [PresetListType.BULLET_LIST_4]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: bulletListFactory(['\u2727', '\u25CB', '\u25A0']),
    } as IListData,
    [PresetListType.BULLET_LIST_5]: {
        listType: PresetListType.BULLET_LIST,
        nestingLevel: bulletListFactory(['\u27A2', '\u25CB', '\u25C6']),
    } as IListData,

    [PresetListType.ORDER_LIST]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel:
        [
            { glyphFormat: ' %1.', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %2.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %3.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %4.', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %5.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %6.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %7.', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %8.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %9.', glyphType: GlyphType.LOWER_ROMAN },
        ].map((format, i) => ({
            ...format,
            bulletAlignment: BulletAlignment.START,
            textStyle: {
                fs: 12,
            },
            startNumber: 0,
            paragraphProperties: {
                hanging: { v: 21 },
                indentStart: { v: 21 * (i + 1) },
            },
        })) as INestingLevel[],
    } as IListData,
    [PresetListType.ORDER_LIST_1]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel:
        [
            { glyphFormat: ' %1)', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %2)', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %3)', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %4)', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %5)', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %6)', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %7)', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %8)', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %9)', glyphType: GlyphType.LOWER_ROMAN },
        ].map((format, i) => ({
            ...format,
            bulletAlignment: BulletAlignment.START,
            textStyle: {
                fs: 12,
            },
            startNumber: 0,
            paragraphProperties: {
                hanging: { v: 21 },
                indentStart: { v: 21 * (i + 1) },
            },
        })) as INestingLevel[],
    } as IListData,
    [PresetListType.ORDER_LIST_2]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel:
        [
            ' %1.',
            ' %1.%2.',
            ' %1.%2.%3.',
            ' %1.%2.%3.%4.',
            ' %1.%2.%3.%4.%5.',
            ' %1.%2.%3.%4.%5.%6.',
            ' %1.%2.%3.%4.%5.%6.%7.',
        ].map((format, i) => ({
            bulletAlignment: BulletAlignment.START,
            glyphFormat: format,
            textStyle: {
                fs: 12,
            },
            startNumber: 0,
            glyphType: GlyphType.DECIMAL,
            paragraphProperties: {
                hanging: { v: 21 },
                indentStart: { v: 21 * (i + 1) },
            },
        })) as INestingLevel[],
    } as IListData,
    [PresetListType.ORDER_LIST_3]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel:
        [
            { glyphFormat: ' %1.', glyphType: GlyphType.UPPER_LETTER },
            { glyphFormat: ' %2.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %3.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %4.', glyphType: GlyphType.UPPER_LETTER },
            { glyphFormat: ' %5.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %6.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %7.', glyphType: GlyphType.UPPER_LETTER },
            { glyphFormat: ' %8.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %9.', glyphType: GlyphType.LOWER_ROMAN },
        ].map((format, i) => ({
            ...format,
            bulletAlignment: BulletAlignment.START,
            textStyle: {
                fs: 12,
            },
            startNumber: 0,
            paragraphProperties: {
                hanging: { v: 21 },
                indentStart: { v: 21 * (i + 1) },
            },
        })) as INestingLevel[],
    } as IListData,
    [PresetListType.ORDER_LIST_4]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel:
        [
            { glyphFormat: ' %1.', glyphType: GlyphType.UPPER_LETTER },
            { glyphFormat: ' %2.', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %3.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %4.', glyphType: GlyphType.UPPER_LETTER },
            { glyphFormat: ' %5.', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %6.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %7.', glyphType: GlyphType.UPPER_LETTER },
            { glyphFormat: ' %8.', glyphType: GlyphType.DECIMAL },
            { glyphFormat: ' %9.', glyphType: GlyphType.LOWER_ROMAN },
        ].map((format, i) => ({
            ...format,
            bulletAlignment: BulletAlignment.START,
            textStyle: {
                fs: 12,
            },
            startNumber: 0,
            paragraphProperties: {
                hanging: { v: 21 },
                indentStart: { v: 21 * (i + 1) },
            },
        })) as INestingLevel[],
    } as IListData,
    [PresetListType.ORDER_LIST_5]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel:
        [
            { glyphFormat: ' %1.', glyphType: GlyphType.DECIMAL_ZERO },
            { glyphFormat: ' %2.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %3.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %4.', glyphType: GlyphType.DECIMAL_ZERO },
            { glyphFormat: ' %5.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %6.', glyphType: GlyphType.LOWER_ROMAN },
            { glyphFormat: ' %7.', glyphType: GlyphType.DECIMAL_ZERO },
            { glyphFormat: ' %8.', glyphType: GlyphType.LOWER_LETTER },
            { glyphFormat: ' %9.', glyphType: GlyphType.LOWER_ROMAN },
        ].map((format, i) => ({
            ...format,
            bulletAlignment: BulletAlignment.START,
            textStyle: {
                fs: 12,
            },
            startNumber: 0,
            paragraphProperties: {
                hanging: { v: 21 },
                indentStart: { v: 21 * (i + 1) },
            },
        })) as INestingLevel[],
    } as IListData,
};
