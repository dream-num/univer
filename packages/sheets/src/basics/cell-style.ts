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

import type { IBorderData, ICellData, IDocumentData, IKeyValue, IParagraph, IStyleData, ITextRun, ITextStyle, Nullable, Styles } from '@univerjs/core';
import { normalizeTextRuns, Tools } from '@univerjs/core';

/**
 *
 * @param styles
 * @param oldVal
 * @param newVal
 */
export function handleStyle(styles: Styles, oldVal: ICellData, newVal: ICellData) {
    // use null to clear style
    const oldStyle = styles.getStyleByCell(oldVal);

    if (oldStyle == null) {
        // clear
        delete oldVal.s;
    }

    if (typeof newVal.s === 'string') {
        newVal.s = styles.get(newVal.s);
    }

    // set style
    const merge = mergeStyle(oldStyle, newVal.s ? (newVal.s as Nullable<IStyleData>) : null);

    // then remove null
    if (merge) {
        Tools.removeNull(merge);

        // remove empty object
        Object.entries(merge).forEach(([key, val]) => {
            if (typeof val === 'object' && val !== null && Object.keys(val).length === 0) {
                delete merge[key as keyof IStyleData];
            }
        });
    }

    if (Tools.isEmptyObject(merge)) {
        delete oldVal.s;
    } else {
        oldVal.s = styles.setValue(merge);
    }

    const newValueStream = newVal.v ? `${newVal.v}\r\n` : '';
    // Only need to copy newValue.s to oldValue.p when you modify the cell style, not when you modify the cell value.
    if (!newVal.p && oldVal.p) {
        if (newValueStream && newValueStream !== oldVal.p.body?.dataStream) {
            delete oldVal.p;
        } else {
            mergeRichTextStyle(oldVal.p, newVal.s ? (newVal.s as Nullable<IStyleData>) : null);
        }
    }
}

/**
 * Convert old style data for storage
 * @param style
 * @param oldStyle
 * @param newStyle
 */
export function transformStyle(oldStyle: Nullable<IStyleData>, newStyle: Nullable<IStyleData>): Nullable<IStyleData> {
    // If there is no newly set style, directly store the historical style
    if (!newStyle || !Object.keys(newStyle).length) {
        return oldStyle;
    }
    const backupStyle: Record<string, any> = Tools.deepClone(oldStyle ?? {});

    for (const k in newStyle) {
        if (k === 'bd') {
            backupStyle[k] = transformBorders(backupStyle[k] || {}, newStyle[k]);
        }
        // 1. To modify the existing style,we need original setting to undo
        // 2. Newly set the style, we need null to undo
        else if (!(k in backupStyle)) {
            backupStyle[k] = null;
        }
    }
    return backupStyle;
}

/**
 * Convert old style border for storage
 * @param style
 * @param oldBorders
 * @param newBorders
 */
function transformBorders(oldBorders: IBorderData, newBorders: Nullable<IBorderData>): IBorderData {
    // If there is no newly set border, directly store the historical border
    if (!newBorders || !Object.keys(newBorders).length) {
        return oldBorders;
    }

    for (const k in newBorders) {
        // 1. To modify the existing border,we need original setting to undo
        // 2. Newly set the border, we need null to undo
        if (!(k in oldBorders)) {
            (oldBorders as IKeyValue)[k] = null;
        }
    }

    return oldBorders;
}

/**
 * merge new style to old style
 * @param oldStyle
 * @param newStyle
 * @param isRichText
 */
function mergeStyle(
    oldStyle: Nullable<IStyleData>,
    newStyle: Nullable<IStyleData>,
    isRichText: boolean = false
): Nullable<IStyleData> {
    // clear style
    if (newStyle === null) return newStyle;
    // don't operate
    if (newStyle === undefined) return oldStyle;

    const backupStyle: Record<string, any> = Tools.deepClone(oldStyle) || {};

    for (const k in newStyle) {
        // Do not copy cell background color to rich text background color.
        if (isRichText && ['bd', 'tr', 'td', 'ht', 'vt', 'tb', 'pd', 'bg'].includes(k)) {
            continue;
        }
        // you can only choose one of the themeColor and rgbColor of the border setting
        if (k in backupStyle && k === 'bd') {
            backupStyle[k] = Object.assign(backupStyle[k], newStyle[k]);
        } else {
            backupStyle[k] = (newStyle as IKeyValue)[k];
        }
    }

    if ('cl' in backupStyle) {
        if ('ul' in backupStyle && backupStyle.ul) {
            backupStyle.ul.cl = backupStyle.cl;
        }

        if ('ol' in backupStyle && backupStyle.ol) {
            backupStyle.ol.cl = backupStyle.cl;
        }

        if ('st' in backupStyle && backupStyle.st) {
            backupStyle.st.cl = backupStyle.cl;
        }
    }

    return backupStyle;
}

/**
 *
 * @param paragraphs
 * @param offset
 */
function skipParagraphs(paragraphs: IParagraph[], offset: number): number {
    if (paragraphs.some((p) => p.startIndex === offset)) {
        return skipParagraphs(paragraphs, offset + 1);
    }

    return offset;
}

/**
 * Find the text style of all paragraphs and modify it to the new style
 * @param p
 * @param newStyle
 */
function mergeRichTextStyle(p: IDocumentData, newStyle: Nullable<IStyleData>) {
    if (p.body == null) {
        return;
    }

    if (!Array.isArray(p.body.textRuns)) {
        p.body.textRuns = [];
    }

    let index = 0;
    const newTextRuns = [];
    const paragraphs = p.body?.paragraphs || [];

    for (const textRun of p.body.textRuns) {
        const { st, ed, ts = {} } = textRun;

        if (index < st) {
            const tr: ITextRun = {
                st: index,
                ed: st,
            };

            const merge = mergeStyle({}, newStyle, true);

            // then remove null
            merge && Tools.removeNull(merge);

            if (!Tools.isEmptyObject(merge)) {
                tr.ts = merge!;
            }

            newTextRuns.push(tr);
        }

        const merge = mergeStyle(ts, newStyle, true);

        // then remove null
        merge && Tools.removeNull(merge);

        if (Tools.isEmptyObject(merge)) {
            delete textRun.ts;
        } else {
            textRun.ts = merge as ITextStyle;
        }

        newTextRuns.push(textRun);

        index = skipParagraphs(paragraphs, ed);
    }

    const endIndex = p.body.dataStream.endsWith('\r\n') ? p.body.dataStream.length - 2 : p.body.dataStream.length;

    if (index < endIndex) {
        const tr: ITextRun = {
            st: index,
            ed: endIndex,
        };

        const merge = mergeStyle({}, newStyle, true);

        // then remove null
        merge && Tools.removeNull(merge);

        if (!Tools.isEmptyObject(merge)) {
            tr.ts = merge!;
        }

        newTextRuns.push(tr);
    }

    p.body.textRuns = normalizeTextRuns(newTextRuns);
}
