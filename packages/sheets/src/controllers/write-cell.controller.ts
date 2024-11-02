/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IDocumentBody, IDocumentData, IStyleData, Nullable } from '@univerjs/core';
import type { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';
import { CellValueType, Disposable, numfmt } from '@univerjs/core';
import { AFTER_CELL_EDIT } from '../services/sheet-interceptor/sheet-interceptor.service';

export function isRichText(body: IDocumentBody): boolean {
    const { textRuns = [], paragraphs = [], customRanges, customBlocks = [] } = body;
    const bodyNoLineBreak = body.dataStream.replace('\r\n', '');
    // Some styles are unique to rich text. When this style appears, we consider the value to be rich text.
    const richTextStyle = ['va'];

    return (
        textRuns.some((textRun) => {
            const hasRichTextStyle = Boolean(textRun.ts && Object.keys(textRun.ts).some((property) => {
                return richTextStyle.includes(property);
            }));
            return hasRichTextStyle || (Object.keys(textRun.ts ?? {}).length && (textRun.ed - textRun.st < bodyNoLineBreak.length));
        }) ||
        paragraphs.some((paragraph) => paragraph.bullet) ||
        paragraphs.length >= 2 ||
        Boolean(customRanges?.length) ||
        customBlocks.length > 0
    );
}

export function getCellStyleBySnapshot(snapshot: IDocumentData): Nullable<IStyleData> {
    const { body } = snapshot;
    if (!body) return null;
    const { textRuns = [] } = body;

    let style = {};
    const bodyNoLineBreak = body.dataStream.replace('\r\n', '');
    textRuns.forEach((textRun) => {
        const { st, ed, ts } = textRun;
        if (ed - st >= bodyNoLineBreak.length) {
            style = { ...style, ...ts };
        }
    });
    if (Object.keys(style).length) {
        return style;
    }
    return null;
}

export function normalizeRichText(cellData: ICellData, snapshot: IDocumentData) {
    const body = snapshot.body!;
    const newDataStream = body!.dataStream;
    if (isRichText(body)) {
        if (body.dataStream === '\r\n') {
            cellData.v = '';
            cellData.f = null;
            cellData.si = null;
            cellData.p = null;
        } else {
            cellData.p = snapshot;
            cellData.v = null;
            cellData.f = null;
            cellData.si = null;
        }
    } else if (numfmt.parseDate(newDataStream) || numfmt.parseNumber(newDataStream) || numfmt.parseTime(newDataStream)) {
        // If it can be converted to a number and is not forced to be a string, then the style should keep prev style.
        cellData.v = newDataStream;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
        cellData.t = CellValueType.NUMBER;
    } else {
        // If the data is empty, the data is set to null.
        if (newDataStream === '' && cellData.v == null && cellData.p == null) {
            return null;
        }
        cellData.v = newDataStream;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
        // If the style length in textRun.ts is equal to the content length, it should be set as the cell style
        const style = getCellStyleBySnapshot(snapshot);
        if (style) {
            cellData.s = style;
        }
    }

    return cellData;
}

export class DefaultWriteCellController extends Disposable {
    constructor(private readonly _sheetInterceptorService: SheetInterceptorService) {
        super();

        this._initAfterEditor();
    }

    private _initAfterEditor() {
        this.disposeWithMe(this._sheetInterceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
            priority: -1,
            handler: (cell, context, next) => {
                if (!cell) {
                    return next(cell);
                }

                if (!cell.p) {
                    return next(cell);
                }
                const snapshot = cell.p;
                const newCell = normalizeRichText(cell, snapshot);
                return next(newCell);
            },
        }));
    }
}
