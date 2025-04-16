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

import type { Nullable } from '../shared';
import type { IRange, IUnitRange } from './typedef';
import { DEFAULT_EMPTY_DOCUMENT_VALUE } from '../common/const';
import { BuildTextUtils, DocumentDataModel } from '../docs';
import { TextX } from '../docs/data-model/text-x/text-x';
import { convertTextRotation } from '../docs/data-model/utils';
import { Rectangle } from '../shared';
import { type CellValueType, HorizontalAlign, type TextDirection, VerticalAlign, WrapStrategy } from '../types/enum';
import { CustomRangeType, type IDocumentData, type IPaddingData, type IStyleBase, type IStyleData, type ITextRotation, type ITextStyle } from '../types/interfaces';

export interface IFontLocale {
    fontList: string[];
    defaultFontSize: number;
}

export const isRangesEqual = (oldRanges: IRange[], ranges: IRange[]): boolean => {
    return ranges.length === oldRanges.length && !oldRanges.some((oldRange) => ranges.some((range) => !Rectangle.equals(range, oldRange)));
};

export const isUnitRangesEqual = (oldRanges: IUnitRange[], ranges: IUnitRange[]): boolean => {
    return ranges.length === oldRanges.length && oldRanges.every((oldRange, i) => {
        const current = ranges[i];
        return current.unitId === oldRange.unitId && current.sheetId === oldRange.sheetId && Rectangle.equals(oldRange.range, current.range);
    });
};

export const DEFAULT_PADDING_DATA = {
    t: 0,
    b: 2, // must over 1, see https://github.com/dream-num/univer/issues/2727
    l: 2,
    r: 2,
};

export const getDefaultBaselineOffset = (fontSize: number) => ({
    sbr: 0.6,
    sbo: fontSize,
    spr: 0.6,
    spo: fontSize,
});

export interface ICellStyle {
    textRotation?: ITextRotation;
    textDirection?: Nullable<TextDirection>;
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    wrapStrategy?: WrapStrategy;
    paddingData?: IPaddingData;
    cellValueType?: CellValueType;
}

export const VERTICAL_ROTATE_ANGLE = 90;

export function createDocumentModelWithStyle(content: string, textStyle: ITextStyle, config: ICellStyle = {}) {
    const contentLength = content.length;
    const {
        textRotation,
        paddingData,
        horizontalAlign = HorizontalAlign.UNSPECIFIED,
        verticalAlign = VerticalAlign.UNSPECIFIED,
        wrapStrategy = WrapStrategy.UNSPECIFIED,
        cellValueType,
    } = config;

    const { t: marginTop, r: marginRight, b: marginBottom, l: marginLeft } = paddingData || DEFAULT_PADDING_DATA;
    const { vertexAngle, centerAngle } = convertTextRotation(textRotation);
    const documentData: IDocumentData = {
        id: 'd',
        body: {
            dataStream: `${content}${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [
                {
                    ts: textStyle,
                    st: 0,
                    ed: contentLength,
                },
            ],
            paragraphs: [
                {
                    startIndex: contentLength,
                    paragraphStyle: {
                        horizontalAlign,
                    },
                },
            ],
            sectionBreaks: [{
                startIndex: contentLength + 1,
            }],
        },
        documentStyle: {
            pageSize: {
                width: Number.POSITIVE_INFINITY,
                height: Number.POSITIVE_INFINITY,
            },
            marginTop,
            marginBottom,
            marginRight,
            marginLeft,
            renderConfig: {
                horizontalAlign,
                verticalAlign,
                centerAngle,
                vertexAngle,
                wrapStrategy,
                cellValueType,
                zeroWidthParagraphBreak: 1,
            },
        },
        drawings: {},
        drawingsOrder: [],
    };

    return new DocumentDataModel(documentData);
}

export function extractOtherStyle(style?: Nullable<IStyleData>): ICellStyle {
    if (!style) return {};
    const {
        tr: textRotation,
        td: textDirection,
        ht: horizontalAlign,
        vt: verticalAlign,
        tb: wrapStrategy,
        pd: paddingData,
    } = style;

    return {
        textRotation,
        textDirection,
        horizontalAlign,
        verticalAlign,
        wrapStrategy,
        paddingData,
    } as ICellStyle;
}

/**
 * Pick font style from cell style.
 * @param format
 * @returns {IStyleBase} style
 */
export function getFontFormat(format?: Nullable<IStyleData>): IStyleBase {
    if (!format) {
        return {};
    }
    const { ff, fs, it, bl, ul, st, ol, cl } = format;
    const style: IStyleBase = {};
    ff && (style.ff = ff);
    fs && (style.fs = fs);
    it && (style.it = it);
    bl && (style.bl = bl);
    ul && (style.ul = ul);
    st && (style.st = st);
    ol && (style.ol = ol);
    cl && (style.cl = cl);
    return style;
}

export function addLinkToDocumentModel(documentModel: DocumentDataModel, linkUrl: string, linkId: string): void {
    const body = documentModel.getBody()!;
    if (body.customRanges?.some((range) => range.rangeType === CustomRangeType.HYPERLINK)) {
        return;
    }

    const textX = BuildTextUtils.customRange.add({
        ranges: [
            {
                startOffset: 0,
                endOffset: body.dataStream.length - 1,
                collapsed: false,
            },
        ],
        rangeId: linkId,
        rangeType: CustomRangeType.HYPERLINK,
        body,
        properties: {
            url: linkUrl,
            refId: linkId,
        },
    });
    if (!textX) {
        return;
    }

    TextX.apply(body, textX.serialize());
}

export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}
