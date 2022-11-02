import { SheetContext, IBullet, ILists, INestingLevel, ITextStyle } from '@univer/core';
import { FontCache, getFontStyleString, IDocumentSkeletonBullet, IFontLocale } from '../../../..';
import { getBulletOrderedSymbol } from '.';

export function dealWidthBullet(
    bullet?: IBullet,
    lists?: ILists,
    listLevelAncestors?: IDocumentSkeletonBullet[],
    fontLocale?: IFontLocale,
    context?: SheetContext
): IDocumentSkeletonBullet | undefined {
    if (!bullet || !lists) {
        return;
    }

    const { listId, nestingLevel = 0, textStyle } = bullet;

    const list = lists[listId];

    if (!list || !list.nestingLevel) {
        return getDefaultBulletSke(listId, listLevelAncestors?.[nestingLevel]?.startIndexItem, fontLocale);
    }

    const nesting = list.nestingLevel[nestingLevel];

    if (!nesting) {
        return getDefaultBulletSke(listId, listLevelAncestors?.[nestingLevel]?.startIndexItem, fontLocale);
    }

    const bulletSke = _getBulletSke(listId, nestingLevel, list.nestingLevel, listLevelAncestors, textStyle, fontLocale, context);
    return bulletSke;
}

export function getDefaultBulletSke(listId: string, startIndex: number = 1, fontLocale?: IFontLocale): IDocumentSkeletonBullet {
    return {
        listId,
        symbol: '\u25CF', // symbol 列表的内容
        ts: {
            ff: fontLocale?.fontList[0] || 'Arial',
            fs: fontLocale?.defaultFontSize || 9,
        }, // 文字样式
        startIndexItem: startIndex,
        bBox: {
            width: 8.4560546875,
            ba: 7,
            bd: -1,
            aba: 7,
            abd: -1,
            sp: -2,
            sbr: 0.5,
            sbo: 0,
            spr: 0.5,
            spo: 0,
        },
    };
}

function _getBulletSke(
    listId: string,
    nestingLevel: number,
    nestings: INestingLevel[],
    listLevelAncestors?: IDocumentSkeletonBullet[],
    textStyleConfig?: ITextStyle,
    fontLocale?: IFontLocale,
    context?: SheetContext
): IDocumentSkeletonBullet {
    const nesting = nestings[nestingLevel];
    const { bulletAlignment, glyphFormat, textStyle: textStyleFirst, startNumber, glyphType, glyphSymbol } = nesting;

    const textStyle = { ...textStyleConfig, ...textStyleFirst };

    const fontStyle = getFontStyleString(textStyle, fontLocale); // 获得canvas.font格式的字体样式

    let symbolContent: string;
    if (glyphSymbol) {
        // 无序列表直接使用
        symbolContent = glyphSymbol;
    } else {
        // 有序列表
        symbolContent = __generateOrderedListSymbol(glyphFormat, nestings, listLevelAncestors, context); // 有序列表的处理
    }

    const bBox = FontCache.getTextSize(symbolContent, fontStyle);
    const startIndex = listLevelAncestors?.[nestingLevel]?.startIndexItem ?? 0;

    return {
        listId,
        symbol: symbolContent, // symbol 列表的内容
        ts: textStyle, // 文字样式
        fontStyle, //
        startIndexItem: startIndex,
        bBox,
        nestingLevel: nesting,
        bulletAlign: bulletAlignment,
        bulletType: glyphSymbol ? false : !!glyphType, // 默认是无序列表，假如glyphSymbol为空且glyphType不为空才是有序列表
    };
}

function __generateOrderedListSymbol(glyphFormat: string, nestings: INestingLevel[], listLevelAncestors?: IDocumentSkeletonBullet[], context?: SheetContext) {
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
        const levelAndSuffixPre = glyphFormatSplit[1];
        const { level, suffix } = ___getLevelAndSuffix(levelAndSuffixPre);
        const singleSymbol = ___getSymbolByBesting(listLevelAncestors?.[level]?.startIndexItem, nestings[level], context);
        resultSymbol.push(singleSymbol, suffix);
    }
    return resultSymbol.join('');
}

function ___getSymbolByBesting(startIndex: number = 1, nesting: INestingLevel, context?: SheetContext) {
    const { startNumber, glyphType, glyphSymbol } = nesting;

    if (glyphSymbol) {
        // 无序列表直接使用
        return glyphSymbol;
    }

    if (!glyphType) {
        return '\u25CF';
    }

    return getBulletOrderedSymbol(startIndex, startNumber, glyphType, context);
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
        level: parseInt(level) - 1,
        suffix,
    };
}
