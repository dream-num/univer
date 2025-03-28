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

import type { IListData, INestingLevel, ITextStyle } from '../../types/interfaces/i-document-data';
import { Tools } from '../../shared';
import { BooleanNumber } from '../../types/enum';
import { BulletAlignment, ListGlyphType } from '../../types/interfaces/i-document-data';

export enum QuickListType {
    ORDER_LIST_QUICK_1 = '1.',
    ORDER_LIST_QUICK_2 = 'a)',
    ORDER_LIST_QUICK_3 = 'a.',
    ORDER_LIST_QUICK_4 = 'i.',
    ORDER_LIST_QUICK_5 = 'A.',
    ORDER_LIST_QUICK_6 = 'I.',
    ORDER_LIST_QUICK_7 = '01.',
    BULLET_LIST = '*',
}

export enum PresetListType {
    BULLET_LIST = 'BULLET_LIST',
    BULLET_LIST_1 = 'BULLET_LIST_1',
    BULLET_LIST_2 = 'BULLET_LIST_2',
    BULLET_LIST_3 = 'BULLET_LIST_3',
    BULLET_LIST_4 = 'BULLET_LIST_4',
    BULLET_LIST_5 = 'BULLET_LIST_5',

    /**
     * 1 a i
     */
    ORDER_LIST = 'ORDER_LIST',
    /**
     * 1) a) i)
     */
    ORDER_LIST_1 = 'ORDER_LIST_1',
    /**
     * 1. 1.1. 1.1.1.
     */
    ORDER_LIST_2 = 'ORDER_LIST_2',
    /**
     * A a i
     */
    ORDER_LIST_3 = 'ORDER_LIST_3',
    /**
     * A 1 i
     */
    ORDER_LIST_4 = 'ORDER_LIST_4',
    /**
     * 01 a i
     */
    ORDER_LIST_5 = 'ORDER_LIST_5',

    ORDER_LIST_QUICK_2 = 'ORDER_LIST_QUICK_2',
    ORDER_LIST_QUICK_3 = 'ORDER_LIST_QUICK_3',
    ORDER_LIST_QUICK_4 = 'ORDER_LIST_QUICK_4',
    ORDER_LIST_QUICK_5 = 'ORDER_LIST_QUICK_5',
    ORDER_LIST_QUICK_6 = 'ORDER_LIST_QUICK_6',

    CHECK_LIST = 'CHECK_LIST',
    CHECK_LIST_CHECKED = 'CHECK_LIST_CHECKED',
}

const orderListSymbolMap = {
    'a)': { glyphFormat: '%1)', glyphType: ListGlyphType.DECIMAL },
    '1.': { glyphFormat: '%1.', glyphType: ListGlyphType.DECIMAL },
    'a.': { glyphFormat: '%1.', glyphType: ListGlyphType.LOWER_LETTER },
    'A.': { glyphFormat: '%1.', glyphType: ListGlyphType.UPPER_LETTER },
    'i.': { glyphFormat: '%1.', glyphType: ListGlyphType.LOWER_ROMAN },
    'I.': { glyphFormat: '%1.', glyphType: ListGlyphType.UPPER_LETTER },
};

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
            indentStart: { v: 21 * (i) },
        },
    }));
};

const orderListFactory = (options: { glyphFormat: string; glyphType: ListGlyphType }[]): INestingLevel[] => {
    return options.map((format, i) => ({
        ...format,
        bulletAlignment: BulletAlignment.START,
        textStyle: {
            fs: 12,
        },
        startNumber: 0,
        paragraphProperties: {
            hanging: { v: 21 },
            indentStart: { v: 21 * (i) },
        },
    }));
};

const checkListFactory = (symbol: string, textStyle?: ITextStyle): INestingLevel[] => {
    return new Array(9).fill(0).map((_, i) => ({
        glyphFormat: ` %${i + 1}`,
        glyphSymbol: symbol,
        bulletAlignment: BulletAlignment.START,
        textStyle: {
            fs: 16,
        },
        startNumber: 0,
        paragraphProperties: {
            hanging: { v: 21 },
            indentStart: { v: 21 * (i) },
            textStyle,
        },
    } as INestingLevel));
};

export const PRESET_LIST_TYPE: Record<string, IListData> = {
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
        nestingLevel: orderListFactory([
            { glyphFormat: '%1.', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%2.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%3.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%4.', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%5.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%6.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%7.', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%8.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%9.', glyphType: ListGlyphType.LOWER_ROMAN },
        ]),
    } as IListData,
    [PresetListType.ORDER_LIST_1]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel: orderListFactory([
            { glyphFormat: '%1)', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%2)', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%3)', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%4)', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%5)', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%6)', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%7)', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%8)', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%9)', glyphType: ListGlyphType.LOWER_ROMAN },
        ]),
    } as IListData,
    [PresetListType.ORDER_LIST_2]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel: orderListFactory([
            '%1.',
            '%1.%2.',
            '%1.%2.%3.',
            '%1.%2.%3.%4.',
            '%1.%2.%3.%4.%5.',
            '%1.%2.%3.%4.%5.%6.',
            '%1.%2.%3.%4.%5.%6.%7.',
        ].map((format) => ({ glyphFormat: format, glyphType: ListGlyphType.DECIMAL }))),
    } as IListData,
    [PresetListType.ORDER_LIST_3]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel: orderListFactory([
            { glyphFormat: '%1.', glyphType: ListGlyphType.UPPER_LETTER },
            { glyphFormat: '%2.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%3.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%4.', glyphType: ListGlyphType.UPPER_LETTER },
            { glyphFormat: '%5.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%6.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%7.', glyphType: ListGlyphType.UPPER_LETTER },
            { glyphFormat: '%8.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%9.', glyphType: ListGlyphType.LOWER_ROMAN },
        ]),
    } as IListData,
    [PresetListType.ORDER_LIST_4]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel: orderListFactory([
            { glyphFormat: '%1.', glyphType: ListGlyphType.UPPER_LETTER },
            { glyphFormat: '%2.', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%3.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%4.', glyphType: ListGlyphType.UPPER_LETTER },
            { glyphFormat: '%5.', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%6.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%7.', glyphType: ListGlyphType.UPPER_LETTER },
            { glyphFormat: '%8.', glyphType: ListGlyphType.DECIMAL },
            { glyphFormat: '%9.', glyphType: ListGlyphType.LOWER_ROMAN },
        ]),
    } as IListData,
    [PresetListType.ORDER_LIST_5]: {
        listType: PresetListType.ORDER_LIST,
        nestingLevel: orderListFactory([
            { glyphFormat: '%1.', glyphType: ListGlyphType.DECIMAL_ZERO },
            { glyphFormat: '%2.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%3.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%4.', glyphType: ListGlyphType.DECIMAL_ZERO },
            { glyphFormat: '%5.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%6.', glyphType: ListGlyphType.LOWER_ROMAN },
            { glyphFormat: '%7.', glyphType: ListGlyphType.DECIMAL_ZERO },
            { glyphFormat: '%8.', glyphType: ListGlyphType.LOWER_LETTER },
            { glyphFormat: '%9.', glyphType: ListGlyphType.LOWER_ROMAN },
        ]),
    } as IListData,

    [PresetListType.CHECK_LIST]: {
        listType: PresetListType.CHECK_LIST,
        nestingLevel: checkListFactory('\u2610'),
    } as IListData,
    [PresetListType.CHECK_LIST_CHECKED]: {
        listType: PresetListType.CHECK_LIST_CHECKED,
        nestingLevel: checkListFactory(
            '\u2611',
            {
                st: {
                    s: BooleanNumber.TRUE,
                },
            }
        ),
    } as IListData,
};

const generateOrderList = (opt: { glyphFormat: string; glyphType: ListGlyphType }) => {
    const { glyphFormat, glyphType } = opt;

    const data = Tools.deepClone(PRESET_LIST_TYPE[PresetListType.ORDER_LIST]);
    data.nestingLevel[0].glyphFormat = glyphFormat;
    data.nestingLevel[0].glyphType = glyphType;

    return data;
};

const QUICK_LIST_TYPE = {
    [PresetListType.ORDER_LIST_QUICK_2]: generateOrderList(orderListSymbolMap[QuickListType.ORDER_LIST_QUICK_2]),
    [PresetListType.ORDER_LIST_QUICK_3]: generateOrderList(orderListSymbolMap[QuickListType.ORDER_LIST_QUICK_3]),
    [PresetListType.ORDER_LIST_QUICK_4]: generateOrderList(orderListSymbolMap[QuickListType.ORDER_LIST_QUICK_4]),
    [PresetListType.ORDER_LIST_QUICK_6]: generateOrderList(orderListSymbolMap[QuickListType.ORDER_LIST_QUICK_6]),
};

Object.assign(PRESET_LIST_TYPE, QUICK_LIST_TYPE);

export const QuickListTypeMap = {
    [QuickListType.ORDER_LIST_QUICK_1]: PresetListType.ORDER_LIST,
    [QuickListType.ORDER_LIST_QUICK_2]: PresetListType.ORDER_LIST_QUICK_2,
    [QuickListType.ORDER_LIST_QUICK_3]: PresetListType.ORDER_LIST_QUICK_3,
    [QuickListType.ORDER_LIST_QUICK_4]: PresetListType.ORDER_LIST_QUICK_4,
    [QuickListType.ORDER_LIST_QUICK_5]: PresetListType.ORDER_LIST_3,
    [QuickListType.ORDER_LIST_QUICK_6]: PresetListType.ORDER_LIST_QUICK_6,
    [QuickListType.ORDER_LIST_QUICK_7]: PresetListType.ORDER_LIST_5,
    [QuickListType.BULLET_LIST]: PresetListType.BULLET_LIST,
};
