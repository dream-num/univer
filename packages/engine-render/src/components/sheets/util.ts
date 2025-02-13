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

import type { CellValueType, IDocumentData, IPaddingData, IStyleBase, IStyleData, ITextRotation, ITextStyle, Nullable, TextDirection } from '@univerjs/core';
import { DEFAULT_EMPTY_DOCUMENT_VALUE, DocumentDataModel, HorizontalAlign, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { convertTextRotation } from '../../basics/text-rotation';
import { DEFAULT_PADDING_DATA } from './sheet.render-skeleton';

export interface ICellStyle {
    textRotation?: ITextRotation;
    textDirection?: Nullable<TextDirection>;
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    wrapStrategy?: WrapStrategy;
    paddingData?: IPaddingData;
    cellValueType?: CellValueType;
}

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
