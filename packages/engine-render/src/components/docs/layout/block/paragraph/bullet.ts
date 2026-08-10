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
    localeService?: LocaleService,
    compactSpacing = false,
    paragraphTextStyle?: ITextStyle
): IDocumentSkeletonBullet | undefined {
    if (!bullet || !lists) {
        return;
    }

    const { listId, listType, nestingLevel = 0, startNumber, image, textStyle } = bullet;
    const preserveTextLineHeight = compactSpacing;

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
        startNumber,
        { ...paragraphTextStyle, ...textStyle },
        localeService,
        compactSpacing,
        preserveTextLineHeight,
        image?.source
    );
    return bulletSke;
}

export function getDefaultBulletSke(listId: string, startIndex: number = 1): IDocumentSkeletonBullet {
    return {
        listId,
        symbol: '\u25CF', // symbol list content
        ts: {},
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
            indentStart: { v: 21 },
        },
    };
}

function _getBulletSke(
    listId: string,
    nestingLevel: number,
    nestings: INestingLevel[],
    listLevelAncestors?: Array<Nullable<IDocumentSkeletonBullet>>,
    paragraphStartNumber?: number,
    textStyleConfig?: ITextStyle,
    _localeService?: LocaleService,
    compactSpacing = false,
    preserveTextLineHeight = false,
    imageSource?: string
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
    const fontStyle = getFontStyleString(textStyle); // Get font style in canvas.font format

    const previousAtLevel = listLevelAncestors?.[nestingLevel];
    const startIndex = paragraphStartNumber === undefined
        ? previousAtLevel?.startIndexItem ?? 1
        : 1;
    const effectiveStartNumber = paragraphStartNumber ?? previousAtLevel?.startNumber ?? nesting.startNumber;

    let symbolContent: string;
    if (glyphSymbol) {
        // Unordered list uses directly
        symbolContent = normalizeLegacySymbolFontGlyph(glyphSymbol, textStyle.ff);
    } else {
        // Ordered list
        symbolContent = __generateOrderedListSymbol(
            glyphFormat,
            nestingLevel,
            nestings,
            listLevelAncestors,
            startIndex,
            effectiveStartNumber
        ); // Ordered list processing
    }

    // const bBox = FontCache.getTextSize(symbolContent, fontStyle);

    return {
        listId,
        symbol: symbolContent, // symbol list content
        ts: textStyle, // text style
        fontStyle, //
        startIndexItem: startIndex + 1,
        startNumber: effectiveStartNumber,
        // bBox,
        nestingLevel: nesting,
        bulletAlign: bulletAlignment,
        bulletType: glyphSymbol ? false : !!glyphType, // Default is unordered list, only ordered if glyphSymbol is empty and glyphType is not empty
        compactSpacing,
        preserveTextLineHeight,
        imageSource,
        paragraphProperties: nesting.paragraphProperties,
    };
}

const LEGACY_SYMBOL_GLYPH_EQUIVALENTS: Record<string, Record<number, string>> = {
    wingdings: {
        0xA7: '\u25AA',
        0xD8: '\u27A2',
    },
};

function normalizeLegacySymbolFontGlyph(symbol: string, fontFamily?: Nullable<string>): string {
    const primaryFontFamily = fontFamily
        ?.split(',')[0]
        ?.trim()
        .replace(/^['"]|['"]$/g, '')
        .toLowerCase();
    const equivalents = primaryFontFamily
        ? LEGACY_SYMBOL_GLYPH_EQUIVALENTS[primaryFontFamily]
        : undefined;
    if (!equivalents) {
        return symbol;
    }

    return Array.from(symbol, (character) => {
        const codePoint = character.codePointAt(0);
        return codePoint === undefined ? character : equivalents[codePoint] ?? character;
    }).join('');
}

function __generateOrderedListSymbol(
    glyphFormat: string,
    nestingLevel: number,
    nestings: INestingLevel[],
    listLevelAncestors: Array<Nullable<IDocumentSkeletonBullet>> | undefined,
    currentStartIndex: number,
    currentStartNumber: number
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

        const ancestor = listLevelAncestors?.[level];
        let startIndexItem = level === nestingLevel ? currentStartIndex : ancestor?.startIndexItem || 1;

        if (level !== nestingLevel && ancestor !== null) {
            startIndexItem -= 1;
        }

        const startNumber = level === nestingLevel
            ? currentStartNumber
            : ancestor?.startNumber ?? nestings[level].startNumber;
        const singleSymbol = ___getSymbolByBesting(startIndexItem, nestings[level], startNumber);
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

function ___getSymbolByBesting(startIndex: number = 1, nesting: INestingLevel, startNumber = nesting.startNumber) {
    const { glyphType, glyphSymbol } = nesting;

    if (glyphSymbol) {
        // Unordered list uses directly
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
