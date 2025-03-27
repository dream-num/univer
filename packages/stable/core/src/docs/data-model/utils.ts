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

import type { IStyleBase, ITextRotation } from '../../types/interfaces';
import { getDefaultBaselineOffset, VERTICAL_ROTATE_ANGLE } from '../../sheets/util';
import { DEFAULT_STYLES } from '../../types/const';
import { BaselineOffset, BooleanNumber } from '../../types/enum';
import { FontStyleType } from '../../types/interfaces';

export const DEFAULT_FONTFACE_PLANE =
    '"Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';

export interface IDocumentSkeletonFontStyle {
    fontString: string;
    fontSize: number;
    originFontSize: number;
    fontFamily: string;
    fontCache: string;
}

// eslint-disable-next-line max-lines-per-function
export function getFontStyleString(
    textStyle?: IStyleBase
): IDocumentSkeletonFontStyle {
    const defaultFont = DEFAULT_STYLES.ff;

    const defaultFontSize = DEFAULT_STYLES.fs;

    if (!textStyle) {
        const fontString = `${defaultFontSize}pt  ${defaultFont}`;

        return {
            fontCache: fontString,
            fontString,
            fontSize: defaultFontSize,
            originFontSize: defaultFontSize,
            fontFamily: defaultFont,
        };
    }

  // font-style
    let italic = FontStyleType.ITALIC;
    if (textStyle.it === 0 || textStyle.it === undefined) {
        italic = FontStyleType.NORMAL;
    }

  // font-variant
  // font += `${FontStyleType.NORMAL} `;

  // font-weight
    let bold = FontStyleType.BOLD;
    if (textStyle.bl === 0 || textStyle.bl === undefined) {
        bold = FontStyleType.NORMAL;
    }

  // font-size/line-height
    let originFontSize = defaultFontSize;
    if (textStyle.fs) {
        originFontSize = Math.ceil(textStyle.fs);
    }

    let fontFamilyResult = defaultFont;
    if (textStyle.ff) {
        let fontFamily = textStyle.ff;

        fontFamily = fontFamily.replace(/"/g, '').replace(/'/g, '');

        if (fontFamily.indexOf(' ') > -1) {
            fontFamily = `"${fontFamily}"`;
        }

      // if (fontFamily != null && document.fonts && !document.fonts.check('12px ' + fontFamily)) {
      //     menuButton.addFontToList(fontFamily);
      // }

        if (fontFamily == null) {
            fontFamily = defaultFont;
        }

        fontFamilyResult = fontFamily;
    }

    const { va: baselineOffset } = textStyle;

    let fontSize = originFontSize;
    if (
        baselineOffset === BaselineOffset.SUBSCRIPT ||
      baselineOffset === BaselineOffset.SUPERSCRIPT
    ) {
        const baselineOffsetInfo = getBaselineOffsetInfo(fontFamilyResult, fontSize);
        const { sbr, spr } = baselineOffsetInfo;

        fontSize *= baselineOffset === BaselineOffset.SUBSCRIPT ? sbr : spr;
    }

    const fontStringPure = `${italic} ${bold} ${fontSize}pt ${fontFamilyResult}`;

    const fontString = `${fontStringPure}, ${DEFAULT_FONTFACE_PLANE} `;

    return {
        fontCache: fontStringPure,
        fontString,
        fontSize,
        originFontSize,
        fontFamily: fontFamilyResult,
    };
}

export function getBaselineOffsetInfo(_fontFamily: string, fontSize: number) {
  // The origin FontCache.getBaselineOffsetInfo needs _fontDataMap
  // But now _fontDataMap didn't not set value. So we can use getDefault.
    return getDefaultBaselineOffset(fontSize);
}

export function convertTextRotation(textRotation?: ITextRotation) {
    const { a: angle = 0, v: isVertical = BooleanNumber.FALSE } = textRotation || { a: 0, v: BooleanNumber.FALSE };
    let centerAngle = 0;
    let vertexAngle = angle;
    if (isVertical === BooleanNumber.TRUE) {
        centerAngle = VERTICAL_ROTATE_ANGLE;
        vertexAngle = VERTICAL_ROTATE_ANGLE;
    }

    return { centerAngle, vertexAngle };
}
