import { BooleanNumber, GridType, HorizontalAlign, ITextRun, NamedStyleType, SpacingRule } from '@univer/core';
import { calculateParagraphLayout, composeCharForLanguage } from '.';
import {
    createSkeletonTabSpan,
    createSkeletonWordSpan,
    getCharSpaceApply,
    getFontStyleString,
    getSpanGroupWidth,
    IFontLocale,
    IParagraphConfig,
    ISectionBreakConfig,
    lineIterator,
} from '../../../..';
// import { getCharSpaceApply, getSpanGroupWidth, lineIterator } from '../../Common/Tools';
// import { createSkeletonTabSpan, createSkeletonWordSpan } from '../../Common/Span';
import { IDocumentSkeletonLine, IDocumentSkeletonPage } from '../../../../Base/IDocumentSkeletonCached';

export function dealWidthTextRun(
    textRun: ITextRun,
    elementIndex: number = 0,
    sectionBreakConfig: ISectionBreakConfig,
    currentPage: IDocumentSkeletonPage,
    paragraphConfig: IParagraphConfig,
    fontLocale?: IFontLocale
): IDocumentSkeletonPage[] {
    const { ct: content = '', ts: textStyle = {}, tab = false } = textRun;
    const fontStyle = getFontStyleString(textStyle, fontLocale);
    const { paragraphStyle = {} } = paragraphConfig;
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        documentTextStyle = {},
        defaultTabStop = 10.5,
        pageSize = {
            width: Infinity,
            height: Infinity,
        },
        marginLeft = 0,
        marginRight = 0,
    } = sectionBreakConfig;
    const { fs: documentFontSize = 0 } = documentTextStyle;
    const {
        namedStyleType = NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED,
        horizontalAlign = HorizontalAlign.UNSPECIFIED,
        lineSpacing = 1,
        spacingRule = SpacingRule.AUTO,
        snapToGrid = BooleanNumber.TRUE,
        direction,
        spaceAbove = 0,
        spaceBelow = 0,
        borderBetween,
        borderTop,
        borderBottom,
        borderLeft,
        borderRight,
        indentFirstLine = 0,
        hanging = 0,
        indentStart = 0,
        indentEnd = 0,
        tabStops = [],
        keepLines = BooleanNumber.FALSE,
        keepNext = BooleanNumber.FALSE,
        wordWrap = BooleanNumber.FALSE,
        widowControl = BooleanNumber.FALSE,
        shading,
    } = paragraphStyle;

    let allPages: IDocumentSkeletonPage[] = [currentPage];
    const pageWidth = pageSize.width || Infinity - marginLeft - marginRight;
    const mixTextStyle = {
        ...documentTextStyle,
        ...textStyle,
    };

    const fontCreateConfig = {
        fontStyle,
        textStyle: mixTextStyle,
        charSpace,
        gridType,
        snapToGrid,
        pageWidth,
    };

    if (tab) {
        const charSpaceApply = getCharSpaceApply(charSpace, documentFontSize, defaultTabStop, gridType, snapToGrid);
        const tabSpan = createSkeletonTabSpan(fontCreateConfig, charSpaceApply); // measureText收敛到create中执行
        allPages = calculateParagraphLayout([tabSpan], allPages, sectionBreakConfig, paragraphConfig, elementIndex, true);
        return allPages;
    }

    const arrayText = content.split('');

    // console.log(arrayText, pageSize);

    for (let charIndex = 0; charIndex < arrayText.length; charIndex++) {
        const char = arrayText[charIndex];
        const languageHandlerResult = composeCharForLanguage(char, charIndex, arrayText, fontCreateConfig); // Handling special languages such as Tibetan, Arabic
        let newSpanGroup = [];
        if (languageHandlerResult) {
            const { charIndex: newCharIndex, spanGroup } = languageHandlerResult;
            charIndex = newCharIndex;
            newSpanGroup = spanGroup;
        } else {
            const span = createSkeletonWordSpan(char, fontCreateConfig); // measureText收敛到create中执行
            newSpanGroup.push(span);
        }

        allPages = calculateParagraphLayout(newSpanGroup, allPages, sectionBreakConfig, paragraphConfig, elementIndex, charIndex === 0);
    }

    lineIterator(allPages, (line: IDocumentSkeletonLine) => {
        horizontalAlignHandler(line, horizontalAlign);
    });

    return allPages;
}

function horizontalAlignHandler(line: IDocumentSkeletonLine, horizontalAlign: HorizontalAlign) {
    if (horizontalAlign === HorizontalAlign.UNSPECIFIED || horizontalAlign === HorizontalAlign.LEFT) {
        return;
    }

    const { divides } = line;
    const divideLength = divides.length;
    for (let i = 0; i < divideLength; i++) {
        const divide = divides[i];
        const { width, spanGroup } = divide;
        const spanGroupWidth = getSpanGroupWidth(divide);
        // console.log(spanGroup, spanGroupWidth, width);
        if (width === Infinity) {
            continue;
        }
        if (horizontalAlign === HorizontalAlign.CENTER) {
            divide.paddingLeft = (width - spanGroupWidth) / 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            divide.paddingLeft = width - spanGroupWidth;
        } else if (horizontalAlign === HorizontalAlign.JUSTIFIED) {
            /**todo */
        }
    }
}

// export class TextRun {
//     private static _context: CanvasRenderingContext2D;

//     private static _verticalText() {}

//     private static _normalText() {}

//     private static _oneTextRun() {}

// 获取单元格文本内容的渲染信息
// let measureTextCache = {}, measureTextCacheTimeOut = null;
// option {cellWidth,cellHeight,space_width,space_height}
// static getCellTextInfo(cell, ctx, option) {
//     let cellWidth = option.cellWidth;
//     let cellHeight = option.cellHeight;
//     let isMode = '',
//         isModeSplit = '';
//     // console.log("initialinfo", cell, option);
//     if (cellWidth == null) {
//         isMode = 'onlyWidth';
//         isModeSplit = '_';
//     }
//     let textInfo = Store.measureTextCellInfoCache[option.r + '_' + option.c + isModeSplit + isMode];
//     if (textInfo != null) {
//         return textInfo;
//     }

//     // let cell = Store.flowdata[r][c];
//     let space_width = option.space_width,
//         space_height = option.space_height; //用户设置或者默认的宽高方向 间隙

//     if (space_width == null) {
//         space_width = 2;
//     }

//     if (space_height == null) {
//         space_height = 2;
//     }

//     //水平对齐
//     let horizonAlign = checkstatusByCell(cell, 'ht');
//     //垂直对齐
//     let verticalAlign = checkstatusByCell(cell, 'vt');

//     let tb = checkstatusByCell(cell, 'tb'); //wrap overflow
//     let tr = checkstatusByCell(cell, 'tr'); //rotate
//     let rt = checkstatusByCell(cell, 'rt'); //rotate angle

//     let isRotateUp = 1,
//         isRotateDown = 0;
//     //根据tr判断旋转角度，这里也支持自动输入旋转角度
//     if (rt == null) {
//         if (tr == '0') {
//             rt = 0;
//         } else if (tr == '1') {
//             rt = 45;
//         } else if (tr == '4') {
//             rt = 90;
//         } else if (tr == '2') {
//             rt = 135;
//         } else if (tr == '5') {
//             rt = 180;
//         }

//         if (rt == null) {
//             rt = 0;
//         }
//     }

//     if (rt > 180 || rt < 0) {
//         rt = 0;
//     }

//     //根据角度判断是文字方向向上还是向下
//     rt = parseInt(rt);
//     if (rt > 90) {
//         rt = 90 - rt;
//         isRotateUp = 0;
//         isRotateDown = 1;
//     }

//     ctx.textAlign = 'start';

//     let textContent = {};
//     textContent.values = [];

//     let fontset,
//         cancelLine = '0',
//         underLine = '0',
//         fontSize = 11,
//         isInline = false,
//         value,
//         inlineStringArr = [];
//     if (isInlineStringCell(cell)) {
//         //判断是否富文本，做一些前置准备工作
//         //主要是把富文本按照换行符和不用样式拆分开，为之后的缓存长宽高做准备
//         let sharedStrings = cell.ct.s,
//             similarIndex = 0;
//         for (let i = 0; i < sharedStrings.length; i++) {
//             let shareCell = sharedStrings[i];
//             let scfontset = universheetfontformat(shareCell);
//             let fc = shareCell.fc,
//                 cl = shareCell.cl,
//                 un = shareCell.un,
//                 v = shareCell.v,
//                 fs = shareCell.fs;
//             v = v
//                 .replace(/\r\n/g, '_x000D_')
//                 .replace(/&#13;&#10;/g, '_x000D_')
//                 .replace(/\r/g, '_x000D_')
//                 .replace(/\n/g, '_x000D_');
//             let splitArr = v.split('_x000D_');
//             for (let x = 0; x < splitArr.length; x++) {
//                 let newValue = splitArr[x];

//                 if (newValue == '' && x != splitArr.length - 1) {
//                     //单独换行符的情况，wrap表示用户换行
//                     inlineStringArr.push({
//                         fontset: scfontset,
//                         fc: fc == null ? '#000' : fc,
//                         cl: cl == null ? 0 : cl,
//                         un: un == null ? 0 : un,
//                         wrap: true,
//                         fs: fs == null ? 11 : fs,
//                     });
//                     similarIndex++;
//                 } else {
//                     let newValueArray = newValue.split('');
//                     for (let n = 0; n < newValueArray.length; n++) {
//                         //一行重的每一个字符入栈
//                         let nv = newValueArray[n];

//                         inlineStringArr.push({
//                             fontset: scfontset,
//                             fc: fc == null ? '#000' : fc,
//                             cl: cl == null ? 0 : cl,
//                             un: un == null ? 0 : un,
//                             v: nv,
//                             si: similarIndex,
//                             fs: fs == null ? 11 : fs,
//                         });
//                     }

//                     if (x != splitArr.length - 1) {
//                         //整行文字的末尾，需要加换行符，wrap表示用户换行
//                         inlineStringArr.push({
//                             fontset: scfontset,
//                             fc: fc == null ? '#000' : fc,
//                             cl: cl == null ? 0 : cl,
//                             un: un == null ? 0 : un,
//                             wrap: true,
//                             fs: fs == null ? 11 : fs,
//                         });
//                         similarIndex++;
//                     }
//                 }
//             }

//             similarIndex++;
//         }
//         isInline = true;
//     } else {
//         //处理非富文本的情况，提前设置ctx为文本样式
//         fontset = universheetfontformat(cell);
//         ctx.font = fontset;

//         cancelLine = checkstatusByCell(cell, 'cl'); //cancelLine
//         underLine = checkstatusByCell(cell, 'un'); //underLine
//         fontSize = checkstatusByCell(cell, 'fs');

//         if (cell instanceof Object) {
//             //读取单元格的值
//             value = cell.m;
//             if (value == null) {
//                 value = cell.v;
//             }
//         } else {
//             value = cell;
//         }

//         if (isRealNull(value)) {
//             return null;
//         }
//     }

//     if (tr == '3') {
//         //vertical text 竖排文字
//         ctx.textBaseline = 'top';

//         let textW_all = 0; //拆分后宽高度合计
//         let textH_all = 0;
//         let colIndex = 0,
//             textH_all_cache = 0,
//             textH_all_Column = {},
//             textH_all_ColumnHeight = [];
//         if (isInline) {
//             //处理列的步骤，因为这里是竖排文字，所以列和正常模式下的行等价，这个按照单字来测量了宽度和高度
//             //富文本时单独处理
//             let preShareCell = null;
//             for (let i = 0; i < inlineStringArr.length; i++) {
//                 let shareCell = inlineStringArr[i];
//                 let value = shareCell.v,
//                     showValue = shareCell.v;
//                 if (shareCell.wrap === true) {
//                     //处理用户手动换行，无论是否触碰边界都要换行
//                     value = 'M';
//                     showValue = '';

//                     if (preShareCell != null && preShareCell.wrap !== true && i < inlineStringArr.length - 1) {
//                         // console.log("wrap",i,colIndex,preShareCell.wrap);
//                         textH_all_ColumnHeight.push(textH_all_cache); //列的高度，由于是竖排文本，所以记录高度而不是宽度
//                         textH_all_cache = 0; //一列的高度缓存清零，开始累加下一列的高度
//                         colIndex += 1;

//                         preShareCell = shareCell;
//                         continue;
//                     }
//                 }

//                 let measureText = getMeasureText(value, ctx, shareCell.fontset);

//                 let textW = measureText.width + space_width; //
//                 let textH = measureText.actualBoundingBoxAscent + measureText.actualBoundingBoxDescent + space_height;

//                 // textW_all += textW;
//                 textH_all_cache += textH;

//                 if (tb == '2' && !shareCell.wrap) {
//                     //tb==2表示自动换行，其他两种方式为溢出和截断，不必须要处理
//                     if (textH_all_cache > cellHeight && textH_all_Column[colIndex] != null) {
//                         // textW_all += textW;
//                         // textH_all = Math.max(textH_all,textH_all_cache);
//                         // console.log(">",i,colIndex);
//                         textH_all_ColumnHeight.push(textH_all_cache - textH);
//                         textH_all_cache = textH;
//                         colIndex += 1;
//                     }
//                 }

//                 if (i == inlineStringArr.length - 1) {
//                     textH_all_ColumnHeight.push(textH_all_cache);
//                 }

//                 if (textH_all_Column[colIndex] == null) {
//                     textH_all_Column[colIndex] = [];
//                 }

//                 let item = {
//                     content: showValue,
//                     style: shareCell,
//                     width: textW,
//                     height: textH,
//                     left: 0,
//                     top: 0,
//                     colIndex: colIndex,
//                     asc: measureText.actualBoundingBoxAscent,
//                     desc: measureText.actualBoundingBoxDescent,
//                     inline: true,
//                 };

//                 if (shareCell.wrap === true) {
//                     item.wrap = true;
//                 }

//                 textH_all_Column[colIndex].push(item);
//                 console.log('normal', i, colIndex, shareCell, preShareCell, textH_all_Column);
//                 preShareCell = shareCell;
//             }
//         } else {
//             let measureText = getMeasureText(value, ctx);
//             let textHeight = measureText.actualBoundingBoxDescent + measureText.actualBoundingBoxAscent;

//             value = value.toString();

//             let vArr = [];
//             if (value.length > 1) {
//                 vArr = value.split('');
//             } else {
//                 vArr.push(value);
//             }
//             let oneWordWidth = getMeasureText(vArr[0], ctx).width;

//             for (let i = 0; i < vArr.length; i++) {
//                 let textW = oneWordWidth + space_width;
//                 let textH = textHeight + space_height;

//                 // textW_all += textW;
//                 textH_all_cache += textH;

//                 if (tb == '2') {
//                     if (textH_all_cache > cellHeight && textH_all_Column[colIndex] != null) {
//                         // textW_all += textW;
//                         // textH_all = Math.max(textH_all,textH_all_cache);
//                         textH_all_ColumnHeight.push(textH_all_cache - textH);
//                         textH_all_cache = textH;
//                         colIndex += 1;
//                     }
//                 }

//                 if (i == vArr.length - 1) {
//                     textH_all_ColumnHeight.push(textH_all_cache);
//                 }

//                 if (textH_all_Column[colIndex] == null) {
//                     textH_all_Column[colIndex] = [];
//                 }

//                 textH_all_Column[colIndex].push({
//                     content: vArr[i],
//                     style: fontset,
//                     width: textW,
//                     height: textH,
//                     left: 0,
//                     top: 0,
//                     colIndex: colIndex,
//                     asc: measureText.actualBoundingBoxAscent,
//                     desc: measureText.actualBoundingBoxDescent,
//                 });
//             }
//         }

//         let textH_all_ColumWidth = [];
//         for (let i = 0; i < textH_all_ColumnHeight.length; i++) {
//             //根据上下文计算单元格文本整个的总行高和列宽
//             let columnHeight = textH_all_ColumnHeight[i];
//             let col = textH_all_Column[i],
//                 colMaxW = 0;
//             for (let c = 0; c < col.length; c++) {
//                 let word = col[c];
//                 colMaxW = Math.max(colMaxW, word.width);
//             }
//             textH_all_ColumWidth.push(colMaxW);
//             textW_all += colMaxW;
//             textH_all = Math.max(textH_all, columnHeight);
//         }

//         textContent.type = 'verticalWrap';
//         textContent.textWidthAll = textW_all;
//         textContent.textHeightAll = textH_all;

//         if (isMode == 'onlyWidth') {
//             //只取总宽高，3.0这里应该拆分出去
//             // console.log("verticalWrap", textContent,cell, option);
//             return textContent;
//         }

//         let cumColumnWidth = 0;
//         for (let i = 0; i < textH_all_ColumnHeight.length; i++) {
//             //处理每一行的位置
//             let columnHeight = textH_all_ColumnHeight[i];
//             let columnWidth = textH_all_ColumWidth[i];

//             let col = textH_all_Column[i];
//             let cumWordHeight = 0;
//             for (let c = 0; c < col.length; c++) {
//                 let word = col[c];
//                 //vt	verticaltype	Vertical alignment	0 middle, 1 up, 2 down	setVerticalAlignment
//                 // ht	horizontaltype	Horizontal alignment	0 center, 1 left, 2 right	setHorizontalAlignment
//                 let left = space_width + cumColumnWidth;
//                 if (horizonAlign == '0') {
//                     left = cellWidth / 2 + cumColumnWidth - textW_all / 2 + space_width * textH_all_ColumnHeight.length;
//                 } else if (horizonAlign == '2') {
//                     left = cellWidth + cumColumnWidth - textW_all + space_width;
//                 }

//                 let top = cellHeight - space_height + cumWordHeight - columnHeight;
//                 if (verticalAlign == '0') {
//                     top = cellHeight / 2 + cumWordHeight - columnHeight / 2;
//                 } else if (verticalAlign == '1') {
//                     top = space_height + cumWordHeight;
//                 }

//                 cumWordHeight += word.height;

//                 word.left = left;
//                 word.top = top;

//                 drawLineInfo(word, cancelLine, underLine, {
//                     width: columnWidth,
//                     height: word.height,
//                     left: left,
//                     top: top + word.height - space_height,
//                     asc: word.height,
//                     desc: 0,
//                     fs: fontSize,
//                 });

//                 textContent.values.push(word);
//             }

//             cumColumnWidth += columnWidth;
//         }
//     } else {
//         let supportBoundBox = isSupportBoundingBox(ctx);
//         if (supportBoundBox) {
//             ctx.textBaseline = 'alphabetic';
//         } else {
//             ctx.textBaseline = 'bottom';
//         }
//         //0 truncation, 1 overflow, 2 word wrap
//         if (tb == '2' || isInline) {
//             //wrap

//             let textW_all = 0; //拆分后宽高度合计
//             let textH_all = 0;
//             let textW_all_inner = 0;

//             // let oneWordWidth =  getMeasureText(vArr[0], ctx).width;
//             let splitIndex = 0,
//                 text_all_cache = 0,
//                 text_all_split = {},
//                 text_all_splitLen = [];

//             textContent.rotate = rt;
//             rt = Math.abs(rt);

//             let anchor = 0,
//                 preHeight = 0,
//                 preWidth = 0,
//                 preStr,
//                 preTextHeight,
//                 preTextWidth,
//                 preMeasureText,
//                 i = 1,
//                 wrapStyle = {},
//                 spaceOrTwoByte = null,
//                 spaceOrTwoByteIndex = null;
//             if (isInline) {
//                 while (i <= inlineStringArr.length) {
//                     let shareCells = inlineStringArr.slice(anchor, i);
//                     if (shareCells[shareCells.length - 1].wrap === true) {
//                         anchor = i;

//                         if (shareCells.length > 1) {
//                             for (let s = 0; s < shareCells.length - 1; s++) {
//                                 let sc = shareCells[s];
//                                 let item = {
//                                     content: sc.v,
//                                     style: sc,
//                                     width: sc.measureText.width,
//                                     height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                     left: 0,
//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     asc: sc.measureText.actualBoundingBoxAscent,
//                                     desc: sc.measureText.actualBoundingBoxDescent,
//                                     inline: true,
//                                     fs: sc.fs,
//                                 };

//                                 // if(rt!=0){//rotate
//                                 //     item.textHeight = sc.textHeight;
//                                 //     item.textWidth = sc.textWidth;
//                                 // }

//                                 text_all_split[splitIndex].push(item);
//                             }
//                         }

//                         if (shareCells.length == 1 || i == inlineStringArr.length) {
//                             let sc = shareCells[0];
//                             let measureText = getMeasureText('M', ctx, sc.fontset);
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             text_all_split[splitIndex].push({
//                                 content: '',
//                                 style: sc,
//                                 width: measureText.width,
//                                 height: measureText.actualBoundingBoxAscent + measureText.actualBoundingBoxDescent,
//                                 left: 0,
//                                 top: 0,
//                                 splitIndex: splitIndex,
//                                 asc: measureText.actualBoundingBoxAscent,
//                                 desc: measureText.actualBoundingBoxDescent,
//                                 inline: true,
//                                 wrap: true,
//                                 fs: sc.fs,
//                             });
//                         }

//                         splitIndex += 1;

//                         i++;

//                         continue;
//                     }

//                     let textWidth = 0,
//                         textHeight = 0;
//                     for (let s = 0; s < shareCells.length; s++) {
//                         let sc = shareCells[s];
//                         if (sc.measureText == null) {
//                             sc.measureText = getMeasureText(sc.v, ctx, sc.fontset);
//                         }
//                         textWidth += sc.measureText.width;
//                         textHeight = Math.max(sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent);
//                         // console.log(sc.v,sc.measureText.width,sc.measureText.actualBoundingBoxAscent,sc.measureText.actualBoundingBoxDescent);
//                     }

//                     let width = textWidth * Math.cos((rt * Math.PI) / 180) + textHeight * Math.sin((rt * Math.PI) / 180); //consider text box wdith and line height

//                     let height = textWidth * Math.sin((rt * Math.PI) / 180) + textHeight * Math.cos((rt * Math.PI) / 180); //consider text box wdith and line height

//                     // textW_all += textW;

//                     let lastWord = shareCells[shareCells.length - 1];
//                     if (lastWord.v == ' ' || checkWordByteLength(lastWord.v) == 2) {
//                         spaceOrTwoByteIndex = i;
//                     }

//                     if (rt != 0) {
//                         //rotate
//                         // console.log("all",anchor, i , str);
//                         console.log(height, space_height, cellHeight, shareCells, height + space_height > cellHeight);
//                         if (height + space_height > cellHeight && text_all_split[splitIndex] != null && tb == '2' && i != inlineStringArr.length) {
//                             // console.log("cut",anchor, i , str);

//                             if (spaceOrTwoByteIndex != null && spaceOrTwoByteIndex < i) {
//                                 for (let s = 0; s < spaceOrTwoByteIndex - anchor; s++) {
//                                     let sc = shareCells[s];
//                                     text_all_split[splitIndex].push({
//                                         content: sc.v,
//                                         style: sc,
//                                         width: sc.measureText.width,
//                                         height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                         left: 0,
//                                         top: 0,
//                                         splitIndex: splitIndex,
//                                         asc: sc.measureText.actualBoundingBoxAscent,
//                                         desc: sc.measureText.actualBoundingBoxDescent,
//                                         inline: true,
//                                         fs: sc.fs,
//                                     });
//                                 }
//                                 anchor = spaceOrTwoByteIndex;

//                                 i = spaceOrTwoByteIndex + 1;

//                                 splitIndex += 1;

//                                 spaceOrTwoByteIndex = null;
//                             } else {
//                                 anchor = i - 1;

//                                 for (let s = 0; s < shareCells.length - 1; s++) {
//                                     let sc = shareCells[s];
//                                     text_all_split[splitIndex].push({
//                                         content: sc.v,
//                                         style: sc,
//                                         width: sc.measureText.width,
//                                         height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                         left: 0,
//                                         top: 0,
//                                         splitIndex: splitIndex,
//                                         asc: sc.measureText.actualBoundingBoxAscent,
//                                         desc: sc.measureText.actualBoundingBoxDescent,
//                                         inline: true,
//                                         fs: sc.fs,
//                                     });
//                                 }

//                                 splitIndex += 1;
//                             }
//                         } else if (i == inlineStringArr.length) {
//                             // console.log("last",anchor, i , str);
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             for (let s = 0; s < shareCells.length; s++) {
//                                 let sc = shareCells[s];
//                                 text_all_split[splitIndex].push({
//                                     content: sc.v,
//                                     style: sc,
//                                     width: sc.measureText.width,
//                                     height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                     left: 0,
//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     asc: sc.measureText.actualBoundingBoxAscent,
//                                     desc: sc.measureText.actualBoundingBoxDescent,
//                                     inline: true,
//                                     fs: sc.fs,
//                                 });
//                             }
//                             break;
//                         } else {
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             i++;
//                         }
//                     } else {
//                         //plain
//                         if (width + space_width > cellWidth && text_all_split[splitIndex] != null && tb == '2' && i != inlineStringArr.length) {
//                             if (spaceOrTwoByteIndex != null && spaceOrTwoByteIndex < i) {
//                                 for (let s = 0; s < spaceOrTwoByteIndex - anchor; s++) {
//                                     let sc = shareCells[s];
//                                     text_all_split[splitIndex].push({
//                                         content: sc.v,
//                                         style: sc,
//                                         width: sc.measureText.width,
//                                         height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                         left: 0,
//                                         top: 0,
//                                         splitIndex: splitIndex,
//                                         asc: sc.measureText.actualBoundingBoxAscent,
//                                         desc: sc.measureText.actualBoundingBoxDescent,
//                                         inline: true,
//                                         fs: sc.fs,
//                                     });
//                                 }
//                                 anchor = spaceOrTwoByteIndex;

//                                 i = spaceOrTwoByteIndex + 1;

//                                 splitIndex += 1;

//                                 spaceOrTwoByteIndex = null;
//                             } else {
//                                 anchor = i - 1;

//                                 for (let s = 0; s < shareCells.length - 1; s++) {
//                                     let sc = shareCells[s];
//                                     text_all_split[splitIndex].push({
//                                         content: sc.v,
//                                         style: sc,
//                                         width: sc.measureText.width,
//                                         height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                         left: 0,
//                                         top: 0,
//                                         splitIndex: splitIndex,
//                                         asc: sc.measureText.actualBoundingBoxAscent,
//                                         desc: sc.measureText.actualBoundingBoxDescent,
//                                         inline: true,
//                                         fs: sc.fs,
//                                     });
//                                 }

//                                 splitIndex += 1;
//                             }
//                         } else if (i == inlineStringArr.length) {
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }

//                             for (let s = 0; s < shareCells.length; s++) {
//                                 let sc = shareCells[s];
//                                 text_all_split[splitIndex].push({
//                                     content: sc.v,
//                                     style: sc,
//                                     width: sc.measureText.width,
//                                     height: sc.measureText.actualBoundingBoxAscent + sc.measureText.actualBoundingBoxDescent,
//                                     left: 0,
//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     asc: sc.measureText.actualBoundingBoxAscent,
//                                     desc: sc.measureText.actualBoundingBoxDescent,
//                                     inline: true,
//                                     fs: sc.fs,
//                                 });
//                             }

//                             break;
//                         } else {
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             i++;
//                         }
//                     }
//                 }
//             } else {
//                 value = value.toString();
//                 while (i <= value.length) {
//                     let str = value.substring(anchor, i);
//                     let measureText = getMeasureText(str, ctx);
//                     let textWidth = measureText.width;
//                     let textHeight = measureText.actualBoundingBoxAscent + measureText.actualBoundingBoxDescent;
//                     //width,height 换算为旋转后的宽高，旋转后再与单元格大小做对比
//                     let width = textWidth * Math.cos((rt * Math.PI) / 180) + textHeight * Math.sin((rt * Math.PI) / 180); //consider text box wdith and line height

//                     let height = textWidth * Math.sin((rt * Math.PI) / 180) + textHeight * Math.cos((rt * Math.PI) / 180); //consider text box wdith and line height
//                     let lastWord = str.substr(str.length - 1, 1);
//                     if (lastWord == ' ' || checkWordByteLength(lastWord) == 2) {
//                         if (preMeasureText != null) {
//                             spaceOrTwoByte = {
//                                 index: i,
//                                 str: preStr + lastWord,
//                                 width: preTextWidth,
//                                 height: preTextHeight,
//                                 asc: preMeasureText.actualBoundingBoxAscent,
//                                 desc: preMeasureText.actualBoundingBoxDescent,
//                             };
//                         }
//                     }
//                     // textW_all += textW;
//                     // console.log(str,anchor,i);
//                     if (rt != 0) {
//                         //rotate
//                         // console.log("all",anchor, i , str);
//                         if (height + space_height > cellHeight && text_all_split[splitIndex] != null && i != value.length) {
//                             // console.log("cut",anchor, i , str);

//                             if (spaceOrTwoByte != null && spaceOrTwoByte.index < i) {
//                                 anchor = spaceOrTwoByte.index;

//                                 i = spaceOrTwoByte.index + 1;

//                                 text_all_split[splitIndex].push({
//                                     content: spaceOrTwoByte.str,
//                                     style: fontset,
//                                     width: spaceOrTwoByte.width,
//                                     height: spaceOrTwoByte.height,
//                                     left: 0,
//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     asc: spaceOrTwoByte.asc,
//                                     desc: spaceOrTwoByte.desc,
//                                     fs: fontSize,
//                                 });

//                                 // console.log(1,anchor,i,splitIndex , spaceOrTwoByte.str);

//                                 splitIndex += 1;

//                                 spaceOrTwoByte = null;
//                             } else {
//                                 anchor = i - 1;

//                                 text_all_split[splitIndex].push({
//                                     content: preStr,
//                                     style: fontset,
//                                     left: 0,
//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     height: preTextHeight,
//                                     width: preTextWidth,
//                                     asc: measureText.actualBoundingBoxAscent,
//                                     desc: measureText.actualBoundingBoxDescent,
//                                     fs: fontSize,
//                                 });

//                                 // console.log(2,anchor,i, splitIndex, preStr);

//                                 splitIndex += 1;
//                             }
//                         } else if (i == value.length) {
//                             // console.log("last",anchor, i , str);
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             text_all_split[splitIndex].push({
//                                 content: str,
//                                 style: fontset,
//                                 left: 0,
//                                 top: 0,
//                                 splitIndex: splitIndex,
//                                 height: textHeight,
//                                 width: textWidth,
//                                 asc: measureText.actualBoundingBoxAscent,
//                                 desc: measureText.actualBoundingBoxDescent,
//                                 fs: fontSize,
//                             });
//                             break;
//                         } else {
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             i++;
//                         }
//                     } else {
//                         //plain
//                         if (width + space_width > cellWidth && text_all_split[splitIndex] != null && i != value.length) {
//                             // console.log(spaceOrTwoByte, i, anchor);
//                             if (spaceOrTwoByte != null && spaceOrTwoByte.index < i) {
//                                 anchor = spaceOrTwoByte.index;

//                                 i = spaceOrTwoByte.index + 1;

//                                 text_all_split[splitIndex].push({
//                                     content: spaceOrTwoByte.str,
//                                     style: fontset,
//                                     width: spaceOrTwoByte.width,
//                                     height: spaceOrTwoByte.height,
//                                     left: 0,

//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     asc: spaceOrTwoByte.asc,
//                                     desc: spaceOrTwoByte.desc,
//                                     fs: fontSize,
//                                 });

//                                 splitIndex += 1;

//                                 spaceOrTwoByte = null;
//                             } else {
//                                 spaceOrTwoByte = null;
//                                 anchor = i - 1;

//                                 text_all_split[splitIndex].push({
//                                     content: preStr,
//                                     style: fontset,
//                                     width: preTextWidth,
//                                     height: preTextHeight,
//                                     left: 0,
//                                     top: 0,
//                                     splitIndex: splitIndex,
//                                     asc: measureText.actualBoundingBoxAscent,
//                                     desc: measureText.actualBoundingBoxDescent,
//                                     fs: fontSize,
//                                 });

//                                 // console.log(2);

//                                 splitIndex += 1;
//                             }
//                         } else if (i == value.length) {
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             text_all_split[splitIndex].push({
//                                 content: str,
//                                 style: fontset,
//                                 width: textWidth,
//                                 height: textHeight,
//                                 left: 0,
//                                 top: 0,
//                                 splitIndex: splitIndex,
//                                 asc: measureText.actualBoundingBoxAscent,
//                                 desc: measureText.actualBoundingBoxDescent,
//                                 fs: fontSize,
//                             });

//                             break;
//                         } else {
//                             if (text_all_split[splitIndex] == null) {
//                                 text_all_split[splitIndex] = [];
//                             }
//                             i++;
//                         }
//                     }

//                     preStr = str;
//                     preTextHeight = textHeight;
//                     preTextWidth = textWidth;
//                     preMeasureText = measureText;
//                 }

//                 // console.log(text_all_split)
//             }

//             let split_all_size = [],
//                 oneLinemaxWordCount = 0;
//             // console.log("split",splitIndex, text_all_split);
//             let splitLen = Object.keys(text_all_split).length;
//             for (let i = 0; i < splitLen; i++) {
//                 let splitLists = text_all_split[i];
//                 if (splitLists == null) {
//                     continue;
//                 }
//                 let sWidth = 0,
//                     sHeight = 0,
//                     maxDesc = 0,
//                     maxAsc = 0,
//                     lineHeight = 0,
//                     maxWordCount = 0;
//                 for (let s = 0; s < splitLists.length; s++) {
//                     let sp = splitLists[s];
//                     if (rt != 0) {
//                         //rotate
//                         sWidth += sp.width;
//                         sHeight = Math.max(sHeight, sp.height - (supportBoundBox ? sp.desc : 0));
//                     } else {
//                         //plain
//                         sWidth += sp.width;
//                         sHeight = Math.max(sHeight, sp.height - (supportBoundBox ? sp.desc : 0));
//                     }
//                     maxDesc = Math.max(maxDesc, supportBoundBox ? sp.desc : 0);
//                     maxAsc = Math.max(maxAsc, sp.asc);
//                     maxWordCount++;
//                 }

//                 lineHeight = sHeight / 2;
//                 oneLinemaxWordCount = Math.max(oneLinemaxWordCount, maxWordCount);
//                 if (rt != 0) {
//                     //rotate
//                     sHeight += lineHeight;
//                     textW_all_inner = Math.max(textW_all_inner, sWidth);
//                     // textW_all =  Math.max(textW_all, sWidth+ (textH_all)/Math.tan(rt*Math.PI/180));
//                     textH_all += sHeight;
//                 } else {
//                     //plain
//                     // console.log("textH_all",textW_all, textH_all);
//                     sHeight += lineHeight;
//                     textW_all = Math.max(textW_all, sWidth);
//                     textH_all += sHeight;
//                 }

//                 split_all_size.push({
//                     width: sWidth,
//                     height: sHeight,
//                     desc: maxDesc,
//                     asc: maxAsc,
//                     lineHeight: lineHeight,
//                     wordCount: maxWordCount,
//                 });
//             }
//             // console.log(textH_all,textW_all,textW_all_inner);
//             // let cumColumnWidth = 0;
//             let cumWordHeight = 0,
//                 cumColumnWidth = 0;
//             let rtPI = (rt * Math.PI) / 180;
//             let lastLine = split_all_size[splitLen - 1];
//             let lastLineSpaceHeight = lastLine.lineHeight;
//             textH_all = textH_all - lastLineSpaceHeight + lastLine.desc; //旋转前的高度， textW_all_inner旋转前的行最长宽度
//             let rw = textH_all / Math.sin(rtPI) + textW_all_inner * Math.cos(rtPI); //进行旋转后文本的总宽度
//             let rh = textW_all_inner * Math.sin(rtPI),
//                 fixOneLineLeft = 0; //进行旋转后文本的总高度，会比原高度小
//             //textW_all为旋转前的总宽度，因为做到旋转后的排列需要把文字进行错落排列，所以这个宽度是错落排列后的叠加总宽度。
//             if (rt != 0) {
//                 if (splitLen == 1) {
//                     textW_all = textW_all_inner + 2 * (textH_all / Math.tan(rtPI));
//                     fixOneLineLeft = textH_all / Math.tan(rtPI);
//                 } else {
//                     textW_all = textW_all_inner + textH_all / Math.tan(rtPI);
//                 }
//                 textContent.textWidthAll = rw;
//                 textContent.textHeightAll = rh;
//             } else {
//                 textContent.textWidthAll = textW_all;
//                 textContent.textHeightAll = textH_all;
//             }

//             if (isMode == 'onlyWidth') {
//                 // console.log("plainWrap", textContent,cell, option);
//                 return textContent;
//             }

//             if (rt != 0 && isRotateUp == '1') {
//                 ctx.textAlign = 'end';
//                 for (let i = 0; i < splitLen; i++) {
//                     let splitLists = text_all_split[i];
//                     if (splitLists == null) {
//                         continue;
//                     }
//                     let size = split_all_size[i];

//                     cumColumnWidth = 0;

//                     for (let c = splitLists.length - 1; c >= 0; c--) {
//                         let spanGroup = splitLists[c];
//                         let left, top;
//                         if (rt != 0) {
//                             //rotate
//                             let x,
//                                 y = cumWordHeight + size.asc;

//                             x = cumWordHeight / Math.tan(rtPI) - cumColumnWidth + textW_all_inner;
//                             if (horizonAlign == '0') {
//                                 //center
//                                 let sh = textH_all / Math.sin(rtPI);
//                                 if (verticalAlign == '0') {
//                                     //mid

//                                     left = x + cellWidth / 2 - textW_all / 2 + (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y + cellHeight / 2 - textH_all / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '1') {
//                                     //top
//                                     left = x + cellWidth / 2 - textW_all / 2;
//                                     top = y - (textH_all / 2 - rh / 2);
//                                 } else if (verticalAlign == '2') {
//                                     //bottom
//                                     left = x + cellWidth / 2 - textW_all / 2 + lastLineSpaceHeight * Math.cos(rtPI);
//                                     top = y + cellHeight - rh / 2 - textH_all / 2 - lastLineSpaceHeight * Math.cos(rtPI);
//                                 }
//                             } else if (horizonAlign == '1') {
//                                 //left
//                                 if (verticalAlign == '0') {
//                                     //mid
//                                     left = x - (rh * Math.sin(rtPI)) / 2 + (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y + cellHeight / 2 + (rh * Math.cos(rtPI)) / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '1') {
//                                     //top
//                                     left = x - rh * Math.sin(rtPI);
//                                     top = y + rh * Math.cos(rtPI);
//                                 } else if (verticalAlign == '2') {
//                                     //bottom
//                                     left = x + lastLineSpaceHeight * Math.cos(rtPI);
//                                     top = y + cellHeight - lastLineSpaceHeight * Math.cos(rtPI);
//                                 }
//                             } else if (horizonAlign == '2') {
//                                 //right
//                                 if (verticalAlign == '0') {
//                                     //mid
//                                     left = x + cellWidth - rw / 2 - (textW_all_inner / 2 + textH_all / 2 / Math.tan(rtPI)) + (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y + cellHeight / 2 - textH_all / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '1') {
//                                     //top fixOneLineLeft
//                                     left = x + cellWidth - textW_all + fixOneLineLeft;
//                                     top = y - textH_all;
//                                 } else if (verticalAlign == '2') {
//                                     //bottom
//                                     left = x + cellWidth - rw * Math.cos(rtPI) + lastLineSpaceHeight * Math.cos(rtPI);
//                                     top = y + cellHeight - rw * Math.sin(rtPI) - lastLineSpaceHeight * Math.cos(rtPI);
//                                 }
//                             }
//                         }

//                         spanGroup.left = left;
//                         spanGroup.top = top;

//                         // console.log(left, top,  cumWordHeight, size.height);

//                         drawLineInfo(spanGroup, cancelLine, underLine, {
//                             width: spanGroup.width,
//                             height: spanGroup.height,
//                             left: left - spanGroup.width,
//                             top: top,
//                             asc: size.asc,
//                             desc: size.desc,
//                             fs: spanGroup.fs,
//                         });

//                         textContent.values.push(spanGroup);

//                         cumColumnWidth += spanGroup.width;
//                     }

//                     cumWordHeight += size.height;
//                 }
//             } else {
//                 for (let i = 0; i < splitLen; i++) {
//                     let splitLists = text_all_split[i];
//                     if (splitLists == null) {
//                         continue;
//                     }
//                     let size = split_all_size[i];

//                     cumColumnWidth = 0;

//                     for (let c = 0; c < splitLists.length; c++) {
//                         let spanGroup = splitLists[c];
//                         let left, top;
//                         if (rt != 0) {
//                             //rotate
//                             let x,
//                                 y = cumWordHeight + size.asc;

//                             x = (textH_all - cumWordHeight) / Math.tan(rtPI) + cumColumnWidth;

//                             if (horizonAlign == '0') {
//                                 //center
//                                 let sh = textH_all / Math.sin(rtPI);
//                                 if (verticalAlign == '0') {
//                                     //mid

//                                     left = x + cellWidth / 2 - textW_all / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y + cellHeight / 2 - textH_all / 2 + (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '1') {
//                                     //top
//                                     left = x + cellWidth / 2 - textW_all / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y - (textH_all / 2 - rh / 2) + (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '2') {
//                                     //bottom
//                                     left = x + cellWidth / 2 - textW_all / 2 - lastLineSpaceHeight * Math.cos(rtPI);
//                                     top = y + cellHeight - rh / 2 - textH_all / 2 - lastLineSpaceHeight * Math.cos(rtPI);
//                                 }
//                             } else if (horizonAlign == '1') {
//                                 //left
//                                 if (verticalAlign == '0') {
//                                     //mid
//                                     left = x - (rh * Math.sin(rtPI)) / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y - textH_all + cellHeight / 2 - (rh * Math.cos(rtPI)) / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '1') {
//                                     //top
//                                     left = x;
//                                     top = y - textH_all;
//                                 } else if (verticalAlign == '2') {
//                                     //bottom
//                                     left = x - rh * Math.sin(rtPI) - lastLineSpaceHeight * Math.cos(rtPI);
//                                     top = y - textH_all + cellHeight - rh * Math.cos(rtPI) - lastLineSpaceHeight * Math.cos(rtPI);
//                                 }
//                             } else if (horizonAlign == '2') {
//                                 //right
//                                 if (verticalAlign == '0') {
//                                     //mid
//                                     left = x + cellWidth - rw / 2 - textW_all / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                     top = y + cellHeight / 2 - textH_all / 2 - (lastLineSpaceHeight * Math.cos(rtPI)) / 2;
//                                 } else if (verticalAlign == '1') {
//                                     //top fixOneLineLeft
//                                     left = x + cellWidth - rw * Math.cos(rtPI);
//                                     top = y + rh * Math.cos(rtPI);
//                                 } else if (verticalAlign == '2') {
//                                     //bottom
//                                     left = x + cellWidth - textW_all - lastLineSpaceHeight * Math.cos(rtPI) + fixOneLineLeft;
//                                     top = y + cellHeight - lastLineSpaceHeight * Math.cos(rtPI);
//                                 }
//                             }

//                             drawLineInfo(spanGroup, cancelLine, underLine, {
//                                 width: spanGroup.width,
//                                 height: spanGroup.height,
//                                 left: left,
//                                 top: top,
//                                 asc: size.asc,
//                                 desc: size.desc,
//                                 fs: spanGroup.fs,
//                             });
//                         } else {
//                             //plain
//                             left = space_width + cumColumnWidth;
//                             if (horizonAlign == '0') {
//                                 //+ space_width*textH_all_ColumnHeight.length
//                                 left = cellWidth / 2 + cumColumnWidth - size.width / 2;
//                             } else if (horizonAlign == '2') {
//                                 left = cellWidth + cumColumnWidth - size.width;
//                             }

//                             top = cellHeight - space_height + cumWordHeight + size.asc - textH_all;
//                             if (verticalAlign == '0') {
//                                 top = cellHeight / 2 + cumWordHeight - textH_all / 2 + size.asc;
//                             } else if (verticalAlign == '1') {
//                                 top = space_height + cumWordHeight + size.asc;
//                             }

//                             drawLineInfo(spanGroup, cancelLine, underLine, {
//                                 width: spanGroup.width,
//                                 height: spanGroup.height,
//                                 left: left,
//                                 top: top,
//                                 asc: size.asc,
//                                 desc: size.desc,
//                                 fs: spanGroup.fs,
//                             });
//                         }

//                         spanGroup.left = left;
//                         spanGroup.top = top;

//                         textContent.values.push(spanGroup);

//                         cumColumnWidth += spanGroup.width;
//                     }

//                     cumWordHeight += size.height;
//                 }
//             }

//             textContent.type = 'plainWrap';

//             if (rt != 0) {
//                 // let leftCenter = (textW_all + textH_all/Math.tan(rt*Math.PI/180))/2;
//                 // let topCenter = textH_all/2;

//                 // if(isRotateUp=="1"){
//                 //     textContent.textLeftAll += leftCenter;
//                 //     textContent.textTopAll += topCenter;
//                 // }
//                 // else {
//                 //     textContent.textLeftAll += leftCenter;
//                 //     textContent.textTopAll -= topCenter;
//                 // }

//                 if (horizonAlign == '0') {
//                     //center
//                     if (verticalAlign == '0') {
//                         //mid
//                         textContent.textLeftAll = cellWidth / 2;
//                         textContent.textTopAll = cellHeight / 2;
//                     } else if (verticalAlign == '1') {
//                         //top
//                         textContent.textLeftAll = cellWidth / 2;
//                         textContent.textTopAll = rh / 2;
//                     } else if (verticalAlign == '2') {
//                         //bottom
//                         textContent.textLeftAll = cellWidth / 2;
//                         textContent.textTopAll = cellHeight - rh / 2;
//                     }
//                 } else if (horizonAlign == '1') {
//                     //left
//                     if (verticalAlign == '0') {
//                         //mid
//                         textContent.textLeftAll = 0;
//                         textContent.textTopAll = cellHeight / 2;
//                     } else if (verticalAlign == '1') {
//                         //top
//                         textContent.textLeftAll = 0;
//                         textContent.textTopAll = 0;
//                     } else if (verticalAlign == '2') {
//                         //bottom
//                         textContent.textLeftAll = 0;
//                         textContent.textTopAll = cellHeight;
//                     }
//                 } else if (horizonAlign == '2') {
//                     //right
//                     if (verticalAlign == '0') {
//                         //mid
//                         textContent.textLeftAll = cellWidth - rw / 2;
//                         textContent.textTopAll = cellHeight / 2;
//                     } else if (verticalAlign == '1') {
//                         //top
//                         textContent.textLeftAll = cellWidth;
//                         textContent.textTopAll = 0;
//                     } else if (verticalAlign == '2') {
//                         //bottom
//                         textContent.textLeftAll = cellWidth;
//                         textContent.textTopAll = cellHeight;
//                     }
//                 }
//             }
//             // else{
//             //     textContent.textWidthAll = textW_all;
//             //     textContent.textHeightAll = textH_all;
//             // }
//         } else {
//             let measureText = getMeasureText(value, ctx);
//             let textWidth = measureText.width;
//             let textHeight = measureText.actualBoundingBoxDescent + measureText.actualBoundingBoxAscent;

//             textContent.rotate = rt;

//             rt = Math.abs(rt);
//             let rtPI = (rt * Math.PI) / 180;

//             let textWidthAll = textWidth * Math.cos(rtPI) + textHeight * Math.sin(rtPI); //consider text box wdith and line height

//             let textHeightAll = textWidth * Math.sin(rtPI) + textHeight * Math.cos(rtPI); //consider text box wdith and line height

//             if (rt != 0) {
//                 textContent.textHeightAll = textHeightAll;
//             } else {
//                 textContent.textHeightAll = textHeightAll + textHeight / 2 - measureText.actualBoundingBoxDescent - space_height;
//             }
//             textContent.textWidthAll = textWidthAll;

//             // console.log(textContent.textWidthAll , textContent.textHeightAll);
//             if (isMode == 'onlyWidth') {
//                 // console.log("plain", textContent,cell, option);
//                 return textContent;
//             }

//             let width = textWidthAll,
//                 height = textHeightAll;

//             let left = space_width + textHeight * Math.sin(rtPI) * isRotateUp; //默认为1，左对齐
//             if (horizonAlign == '0') {
//                 //居中对齐
//                 left = cellWidth / 2 - width / 2 + textHeight * Math.sin(rtPI) * isRotateUp;
//             } else if (horizonAlign == '2') {
//                 //右对齐
//                 left = cellWidth - space_width - width + textHeight * Math.sin(rtPI) * isRotateUp;
//             }

//             let top = cellHeight - space_height - height + measureText.actualBoundingBoxAscent * Math.cos(rtPI) + textWidth * Math.sin(rtPI) * isRotateUp; //默认为2，下对齐
//             if (verticalAlign == '0') {
//                 //居中对齐
//                 top = cellHeight / 2 - height / 2 + measureText.actualBoundingBoxAscent * Math.cos(rtPI) + textWidth * Math.sin(rtPI) * isRotateUp;
//             } else if (verticalAlign == '1') {
//                 //上对齐
//                 top = space_height + measureText.actualBoundingBoxAscent * Math.cos(rtPI) + textWidth * Math.sin(rtPI) * isRotateUp;
//             }

//             textContent.type = 'plain';

//             let spanGroup = {
//                 content: value,
//                 style: fontset,
//                 width: width,
//                 height: height,
//                 left: left,
//                 top: top,
//             };

//             drawLineInfo(spanGroup, cancelLine, underLine, {
//                 width: textWidth,
//                 height: textHeight,
//                 left: left,
//                 top: top,
//                 asc: measureText.actualBoundingBoxAscent,
//                 desc: measureText.actualBoundingBoxDescent,
//                 fs: fontSize,
//             });

//             textContent.values.push(spanGroup);

//             textContent.textLeftAll = left;
//             textContent.textTopAll = top;

//             textContent.asc = measureText.actualBoundingBoxAscent;
//             textContent.desc = measureText.actualBoundingBoxDescent;

//             // console.log("plain",left,top);
//         }
//     }

//     return textContent;
// }

// private static drawLineInfo(spanGroup, cancelLine, underLine, option) {
//     let left = option.left,
//         top = option.top,
//         width = option.width,
//         height = option.height,
//         asc = option.asc,
//         desc = option.desc,
//         fs = option.fs;

//     if (spanGroup.wrap === true) {
//         return;
//     }

//     if (spanGroup.inline == true && spanGroup.style != null) {
//         cancelLine = spanGroup.style.cl;
//         underLine = spanGroup.style.un;
//     }

//     if (cancelLine != '0') {
//         spanGroup.cancelLine = {};
//         spanGroup.cancelLine.startX = left;
//         spanGroup.cancelLine.startY = top - asc / 2 + 1;

//         spanGroup.cancelLine.endX = left + width;
//         spanGroup.cancelLine.endY = top - asc / 2 + 1;

//         spanGroup.cancelLine.fs = fs;
//     }

//     if (underLine != '0') {
//         spanGroup.underLine = [];
//         if (underLine == '1' || underLine == '2') {
//             let item = {};
//             item.startX = left;
//             item.startY = top + 3;

//             item.endX = left + width;
//             item.endY = top + 3;

//             item.fs = fs;

//             spanGroup.underLine.push(item);
//         }

//         if (underLine == '2') {
//             let item = {};
//             item.startX = left;
//             item.startY = top + desc;

//             item.endX = left + width;
//             item.endY = top + desc;

//             item.fs = fs;

//             spanGroup.underLine.push(item);
//         }

//         if (underLine == '3' || underLine == '4') {
//             let item = {};
//             item.startX = left;
//             item.startY = top + desc;

//             item.endX = left + width;
//             item.endY = top + desc;

//             item.fs = fs;

//             spanGroup.underLine.push(item);
//         }

//         if (underLine == '4') {
//             let item = {};
//             item.startX = left;
//             item.startY = top + desc + 2;

//             item.endX = left + width;
//             item.endY = top + desc + 2;

//             item.fs = fs;

//             spanGroup.underLine.push(item);
//         }
//     }
// }
// }
