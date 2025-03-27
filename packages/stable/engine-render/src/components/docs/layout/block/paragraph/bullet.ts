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

import type { IBullet, ILists, INestingLevel, ITextStyle, LocaleService, Nullable } from '@univerjs/core';

import type { IDocumentSkeletonBullet } from '../../../../../basics/i-document-skeleton-cached';
import { getFontStyleString } from '../../../../../basics/tools';
import { getBulletOrderedSymbol } from './bullet-ruler';

export function dealWithBullet(
    bullet?: IBullet,
    lists?: ILists,
    listLevelAncestors?: Array<Nullable<IDocumentSkeletonBullet>>,
    localeService?: LocaleService
): IDocumentSkeletonBullet | undefined {
    if (!bullet || !lists) {
        return;
    }

    const { listId, listType, nestingLevel = 0, textStyle } = bullet;

    const list = lists[listType];

    if (!list || !list.nestingLevel) {
        return getDefaultBulletSke(listId, listLevelAncestors?.[nestingLevel]?.startIndexItem);
    }

    const nesting = list.nestingLevel[nestingLevel];

    if (!nesting) {
        return getDefaultBulletSke(listId, listLevelAncestors?.[nestingLevel]?.startIndexItem);
    }

    const bulletSke = _getBulletSke(
        listId,
        nestingLevel,
        list.nestingLevel,
        listLevelAncestors,
        textStyle,
        localeService
    );
    return bulletSke;
}

export function getDefaultBulletSke(listId: string, startIndex: number = 1): IDocumentSkeletonBullet {
    return {
        listId,
        symbol: '\u25CF', // symbol 列表的内容
        ts: {
            // TODO: @jikkai @DR-Univer should read default font from configuration, not from locale service
            ff: 'Arial',
            fs: 9,
        }, // 文字样式
        startIndexItem: startIndex,
        // bBox: {
        //     width: 8.4560546875,
        //     ba: 7,
        //     bd: -1,
        //     aba: 7,
        //     abd: -1,
        //     sp: -2,
        //     sbr: 0.5,
        //     sbo: 0,
        //     spr: 0.5,
        //     spo: 0,
        // },
        paragraphProperties: {
            indentFirstLine: { v: 0 },
            hanging: { v: 21 },
            indentStart: { v: 0 },
        },
    };
}

function _getBulletSke(
    listId: string,
    nestingLevel: number,
    nestings: INestingLevel[],
    listLevelAncestors?: Array<Nullable<IDocumentSkeletonBullet>>,
    textStyleConfig?: ITextStyle,
    _localeService?: LocaleService
): IDocumentSkeletonBullet {
    const nesting = nestings[nestingLevel];
    const {
        bulletAlignment,
        glyphFormat,
        textStyle: textStyleFirst = {},
        // startNumber,
        glyphType,
        glyphSymbol,
    } = nesting;

    const textStyle = { ...textStyleConfig, ...textStyleFirst };

    const fontStyle = getFontStyleString(textStyle); // 获得canvas.font格式的字体样式

    let symbolContent: string;
    if (glyphSymbol) {
        // 无序列表直接使用
        symbolContent = glyphSymbol;
    } else {
        // 有序列表
        symbolContent = __generateOrderedListSymbol(glyphFormat, nestingLevel, nestings, listLevelAncestors); // 有序列表的处理
    }

    // const bBox = FontCache.getTextSize(symbolContent, fontStyle);
    const startIndex = listLevelAncestors?.[nestingLevel]?.startIndexItem ?? 1;

    return {
        listId,
        symbol: symbolContent, // symbol 列表的内容
        ts: textStyle, // 文字样式
        fontStyle, //
        startIndexItem: startIndex + 1,
        // bBox,
        nestingLevel: nesting,
        bulletAlign: bulletAlignment,
        bulletType: glyphSymbol ? false : !!glyphType, // 默认是无序列表，假如glyphSymbol为空且glyphType不为空才是有序列表
        paragraphProperties: nesting.paragraphProperties,
    };
}

function __generateOrderedListSymbol(
    glyphFormat: string,
    nestingLevel: number,
    nestings: INestingLevel[],
    listLevelAncestors?: Array<Nullable<IDocumentSkeletonBullet>>
) {
    // const indexNumber = startNumber + startIndex;
    // parse  <prefix>%[nestingLevelMinusOne]<suffix>, return symbolContent
    // <w:lvl w:ilvl="0">
    //     <w:start w:val="1"/>
    //     <w:numFmt w:val="decimal"/>
    //     <w:lvlText w:val="%1."/>
    //     <w:lvlJc w:val="left"/>
    // </w:lvl>

    const glyphFormatSplit = glyphFormat.split('%');
    const prefix = glyphFormatSplit[0];
    const resultSymbol = [prefix];

    for (let i = 1; i < glyphFormatSplit.length; i++) {
        const levelAndSuffixPre = glyphFormatSplit[i];
        const { level, suffix } = ___getLevelAndSuffix(levelAndSuffixPre);

        let startIndexItem = listLevelAncestors?.[level]?.startIndexItem || 1;

        if (level !== nestingLevel && listLevelAncestors?.[level] !== null) {
            startIndexItem -= 1;
        }

        const singleSymbol = ___getSymbolByBesting(startIndexItem, nestings[level]);
        // console.log(
        //     '___getSymbolByBesting',
        //     singleSymbol,
        //     level,
        //     suffix,
        //     listLevelAncestors?.length,
        //     listLevelAncestors?.[level]?.startIndexItem,
        //     listLevelAncestors?.[level]?.symbol,
        //     nestings
        // );
        resultSymbol.push(singleSymbol, suffix);
    }

    return resultSymbol.join('');
}

function ___getSymbolByBesting(startIndex: number = 1, nesting: INestingLevel) {
    const { startNumber, glyphType, glyphSymbol } = nesting;

    if (glyphSymbol) {
        // 无序列表直接使用
        return glyphSymbol;
    }

    if (!glyphType) {
        return '\u25CF';
    }

    return getBulletOrderedSymbol(startIndex, startNumber, glyphType);
}

function ___getLevelAndSuffix(levelAndSuffixPre: string) {
    if (levelAndSuffixPre === '') {
        return {
            level: 0,
            suffix: '',
        };
    }

    const levelAndSuffixPreSpit = levelAndSuffixPre.split('');
    let level = '';
    let suffix = '';
    let isSuffixState = false;
    const digitReg = /[0-9]/g;
    levelAndSuffixPreSpit.forEach((w: string) => {
        if (!isSuffixState && digitReg.test(`${level}${w}`)) {
            level += w;
        } else {
            isSuffixState = true;
            suffix += w;
        }
    });

    return {
        level: Number.parseInt(level) - 1,
        suffix,
    };
}
