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

import type { IStyleData, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonFontStyle } from '@univerjs/engine-render';
import { FontCache, getFontStyleString } from '@univerjs/engine-render';

export const PADDING_H = 4;
export const PADDING_V = 0;
export const MARGIN_H = 4;
export const MARGIN_V = 4;
export const CELL_PADDING_H = 6;
export const CELL_PADDING_V = 6;
export const ICON_PLACE = 14;

export function measureDropdownItemText(text: string, style: Nullable<IStyleData>) {
    const fontStyle = getFontStyleString(style ?? undefined);
    const bBox = FontCache.getTextSize(text, fontStyle);
    return bBox;
}

export function getDropdownItemSize(text: string, fontStyle: IDocumentSkeletonFontStyle) {
    const bBox = FontCache.getTextSize(text, fontStyle);
    const rectWidth = bBox.width + PADDING_H * 2;

    const { ba, bd } = bBox;
    const height = ba + bd;
    return {
        width: rectWidth,
        height: height + (PADDING_V * 2),
        ba,
    };
}

export interface IDropdownLayoutInfo {
    layout: {
        width: number;
        height: number;
        ba: number;
    };
    text: string;
}

export interface IDropdownLine {
    width: number;
    height: number;
    items: (IDropdownLayoutInfo & { left: number })[];
}

export function layoutDropdowns(items: string[], fontStyle: IDocumentSkeletonFontStyle, cellWidth: number, cellHeight: number) {
    const cellPaddingH = ICON_PLACE + CELL_PADDING_H * 2;
    const widthAvailableForContent = cellWidth - cellPaddingH;
    const heightAvailableForContent = cellHeight - CELL_PADDING_V * 2;
    const textLayout = items.map((item) => ({
        layout: getDropdownItemSize(item, fontStyle),
        text: item,
    }));

    let currentLine: IDropdownLine | undefined;
    const lines: IDropdownLine[] = [];

    textLayout.forEach((item) => {
        const { layout } = item;
        const { width, height } = layout;

        if (!currentLine || ((currentLine.width + width + MARGIN_H) > widthAvailableForContent)) {
            currentLine = {
                width,
                height,
                items: [{
                    ...item,
                    left: 0,
                }],
            };
            lines.push(currentLine);
        } else {
            currentLine.items.push({
                ...item,
                left: currentLine.width + MARGIN_H,
            });
            currentLine.width = currentLine.width + width + MARGIN_H;
        }
    });
    let totalHeight = 0;
    let maxLineWidth = 0;
    lines.forEach((line, index) => {
        maxLineWidth = Math.max(maxLineWidth, line.width);
        if (index === lines.length - 1) {
            totalHeight += line.height;
        } else {
            totalHeight += line.height + MARGIN_V;
        }
    });

    return {
        lines,
        totalHeight,
        contentWidth: widthAvailableForContent,
        contentHeight: heightAvailableForContent,
        cellAutoHeight: totalHeight + CELL_PADDING_V * 2,
        calcAutoWidth: maxLineWidth + cellPaddingH,
    };
}
