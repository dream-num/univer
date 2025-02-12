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

import type {
    IDocumentSkeletonColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
} from '../../basics/i-document-skeleton-cached';
import { PageLayoutType } from '../../basics/i-document-skeleton-cached';

export class Liquid {
    private _translateX: number = 0;

    private _translateY: number = 0;

    private _translateSaveList: Array<{ x: number; y: number }> = [];

    get x() {
        return this._translateX;
    }

    get y() {
        return this._translateY;
    }

    reset() {
        this.translateBy(0, 0);
        this._translateSaveList = [];
    }

    translateBy(x: number = 0, y: number = 0) {
        this._translateX = x;
        this._translateY = y;
    }

    translate(x: number = 0, y: number = 0) {
        this._translateX += x;
        this._translateY += y;
    }

    translateSave() {
        this._translateSaveList.push({
            x: this._translateX,
            y: this._translateY,
        });
    }

    translateRestore() {
        const save = this._translateSaveList.pop();
        if (save) {
            this._translateX = save.x;
            this._translateY = save.y;
        }
    }

    translatePagePadding(page: IDocumentSkeletonPage) {
        const {
            marginTop: pagePaddingTop = 0,
            marginBottom: _pagePaddingBottom = 0,
            marginLeft: pagePaddingLeft = 0,
            marginRight: _pagePaddingRight = 0,
        } = page;

        this.translate(pagePaddingLeft, pagePaddingTop);
    }

    restorePagePadding(page: IDocumentSkeletonPage) {
        const {
            marginTop: pagePaddingTop = 0,
            marginBottom: _pagePaddingBottom = 0,
            marginLeft: pagePaddingLeft = 0,
            marginRight: _pagePaddingRight = 0,
        } = page;

        this.translate(-pagePaddingLeft, -pagePaddingTop);
    }

    translatePage(
        page: IDocumentSkeletonPage,
        type = PageLayoutType.VERTICAL,
        left = 0,
        top = 0,
        _right = 0,
        _bottom = 0
    ) {
        const {
            // sections,
            // marginTop: pagePaddingTop = 0,
            // marginBottom: pagePaddingBottom = 0,
            // marginLeft: pagePaddingLeft = 0,
            // marginRight: pagePaddingRight = 0,
            pageWidth,
            pageHeight,
            // width,
            // height,
            // pageNumber = 1,
            // renderConfig = {},
        } = page;

        let pageTop = 0;

        let pageLeft = 0;

        if (type === PageLayoutType.VERTICAL) {
            pageTop += pageHeight + top;
        } else if (type === PageLayoutType.HORIZONTAL) {
            pageLeft += pageWidth + left;
        }

        this.translate(pageLeft, pageTop);

        return {
            x: pageLeft,
            y: pageTop,
        };
    }

    translateSection(section: IDocumentSkeletonSection) {
        const { top: sectionTop = 0 } = section;
        this.translate(0, sectionTop);
        return {
            x: 0,
            y: sectionTop,
        };
    }

    translateColumn(column: IDocumentSkeletonColumn) {
        const { left: columnLeft } = column;

        this.translate(columnLeft, 0);

        return {
            x: columnLeft,
            y: 0,
        };
    }

    translateLine(line: IDocumentSkeletonLine, includeMarginTop = false, includePaddingTop = false) {
        const {
            top: lineTop,
            marginBottom: _lineMarginBottom = 0,
            marginTop: lineMarginTop = 0,
            paddingTop: linePaddingTop = 0,
            paddingBottom: _linePaddingBottom = 0,
        } = line;

        const lineOffset = lineTop +
            (includeMarginTop ? lineMarginTop : 0) +
            (includePaddingTop ? linePaddingTop : 0);

        this.translate(0, lineOffset);
        return {
            x: 0,
            y: lineOffset,
        };
    }

    translateDivide(divide: IDocumentSkeletonDivide) {
        const { left: divideLeft, paddingLeft: dividePaddingLeft } = divide;
        const left = divideLeft + dividePaddingLeft;
        this.translate(left, 0);

        return {
            x: left,
            y: 0,
        };
    }

    translateGlyph(glyph: IDocumentSkeletonGlyph) {
        const { left: spanLeft } = glyph;
        this.translate(spanLeft, 0);

        return {
            x: spanLeft,
            y: 0,
        };
    }
}
