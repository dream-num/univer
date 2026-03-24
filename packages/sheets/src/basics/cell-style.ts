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
    BorderKey,
    BorderStyleKey,
    ColorStyleKey,
    IBorderData,
    IBorderStyleData,
    ICellData,
    IColorStyle,
    IDocumentData,
    IPaddingData,
    IParagraph,
    IStyleData,
    ITextDecoration,
    ITextRotation,
    ITextRun,
    ITextStyle,
    Nullable,
    PaddingKey,
    StyleKey,
    Styles,
    TextDecorationKey,
    TextRotationKey,
} from '@univerjs/core';
import {
    BORDER_KEYS,
    BORDER_STYLE_KEYS,
    COLOR_STYLE_KEYS,
    normalizeTextRuns,
    PADDING_KEYS,
    STYLE_KEYS,
    TEXT_DECORATION_KEYS,
    TEXT_ROTATION_KEYS,
    Tools,
} from '@univerjs/core';

type UnknownRecord = Record<string, unknown>;
type BorderRecord = Partial<Record<BorderKey, Nullable<IBorderStyleData>>>;

function isPlainRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function forEachPresentKey<K extends string>(
    value: UnknownRecord,
    keys: readonly K[],
    iteratee: (key: K, fieldValue: unknown) => void
) {
    for (const key of keys) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
            continue;
        }

        iteratee(key, value[key]);
    }
}

function sanitizeFixedShapeObject<T extends object, K extends string>(
    value: unknown,
    directKeys: readonly K[],
    nestedSanitizers?: Record<string, (value: unknown) => unknown>
): Nullable<T> | undefined {
    if (value == null) {
        return value as null | undefined;
    }

    if (!isPlainRecord(value)) {
        return undefined;
    }

    const sanitized: UnknownRecord = {};
    let hasFields = false;

    forEachPresentKey(value, directKeys, (key, fieldValue) => {
        sanitized[key] = fieldValue;
        hasFields = true;
    });

    if (nestedSanitizers) {
        for (const key in nestedSanitizers) {
            const sanitize = nestedSanitizers[key];

            if (!sanitize || !Object.prototype.hasOwnProperty.call(value, key)) {
                continue;
            }

            const sanitizedValue = sanitize(value[key]);

            if (sanitizedValue !== undefined) {
                sanitized[key] = sanitizedValue;
                hasFields = true;
            }
        }
    }

    return hasFields ? (sanitized as T) : undefined;
}

function sanitizeMappedObject<T extends object, K extends string>(
    value: unknown,
    keys: readonly K[],
    sanitize: (value: unknown) => unknown
): Nullable<T> | undefined {
    if (value == null) {
        return value as null | undefined;
    }

    if (!isPlainRecord(value)) {
        return undefined;
    }

    const sanitized: UnknownRecord = {};
    let hasFields = false;

    forEachPresentKey(value, keys, (key, fieldValue) => {
        const sanitizedValue = sanitize(fieldValue);

        if (sanitizedValue !== undefined) {
            sanitized[key] = sanitizedValue;
            hasFields = true;
        }
    });

    return hasFields ? (sanitized as T) : undefined;
}

function shouldSkipRichTextStyleKey(key: StyleKey): boolean {
    switch (key) {
        case 'bd':
        case 'tr':
        case 'td':
        case 'ht':
        case 'vt':
        case 'tb':
        case 'pd':
        case 'bg':
            return true;
        default:
            return false;
    }
}

function isSerializablePrimitive(value: unknown): value is string | number | boolean | null | undefined {
    return value == null || ['string', 'number', 'boolean'].includes(typeof value);
}

function sanitizeColorStyle(value: unknown): Nullable<IColorStyle> | undefined {
    return sanitizeFixedShapeObject<IColorStyle, ColorStyleKey>(value, COLOR_STYLE_KEYS);
}

function sanitizeTextDecoration(value: unknown): Nullable<ITextDecoration> | undefined {
    return sanitizeFixedShapeObject<ITextDecoration, TextDecorationKey>(value, TEXT_DECORATION_KEYS, {
        cl: sanitizeColorStyle,
    });
}

function sanitizeBorderStyleData(value: unknown): Nullable<IBorderStyleData> | undefined {
    return sanitizeFixedShapeObject<IBorderStyleData, BorderStyleKey>(value, BORDER_STYLE_KEYS, {
        cl: sanitizeColorStyle,
    });
}

function sanitizeBorderData(value: unknown): Nullable<IBorderData> | undefined {
    return sanitizeMappedObject<IBorderData, BorderKey>(value, BORDER_KEYS, sanitizeBorderStyleData);
}

function sanitizeTextRotation(value: unknown): Nullable<ITextRotation> | undefined {
    return sanitizeFixedShapeObject<ITextRotation, TextRotationKey>(value, TEXT_ROTATION_KEYS);
}

function sanitizePaddingData(value: unknown): Nullable<IPaddingData> | undefined {
    return sanitizeFixedShapeObject<IPaddingData, PaddingKey>(value, PADDING_KEYS);
}

function sanitizeNumberFormat(value: unknown): Nullable<{ pattern: string }> | undefined {
    if (value == null) {
        return value as null | undefined;
    }

    if (!isPlainRecord(value) || !Object.prototype.hasOwnProperty.call(value, 'pattern') || typeof value.pattern !== 'string') {
        return undefined;
    }

    return { pattern: value.pattern };
}

function sanitizeStyleValue(key: StyleKey, value: unknown): unknown {
    switch (key) {
        case 'ul':
        case 'bbl':
        case 'st':
        case 'ol':
            return sanitizeTextDecoration(value);
        case 'bg':
        case 'cl':
            return sanitizeColorStyle(value);
        case 'bd':
            return sanitizeBorderData(value);
        case 'tr':
            return sanitizeTextRotation(value);
        case 'pd':
            return sanitizePaddingData(value);
        case 'n':
            return sanitizeNumberFormat(value);
        default:
            return isSerializablePrimitive(value) ? value : undefined;
    }
}

function mergeBorderData(
    currentBorders: Nullable<IBorderData>,
    incomingBorders: Nullable<IBorderData>
): Nullable<IBorderData> {
    if (incomingBorders === null) {
        return null;
    }

    if (incomingBorders === undefined) {
        return currentBorders;
    }

    const borderRecord = incomingBorders as BorderRecord;
    const mergedBorders: BorderRecord = Tools.isObject(currentBorders) ? { ...(currentBorders as BorderRecord) } : {};

    forEachPresentKey(borderRecord as UnknownRecord, BORDER_KEYS, (key, fieldValue) => {
        const borderStyle = sanitizeBorderStyleData(fieldValue);

        if (borderStyle !== undefined) {
            mergedBorders[key] = borderStyle;
        }
    });

    return mergedBorders as IBorderData;
}

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
    const backupStyle = (Tools.deepClone(oldStyle ?? {}) || {}) as UnknownRecord;
    const styleRecord = newStyle as UnknownRecord;

    for (const key of STYLE_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(styleRecord, key)) {
            continue;
        }

        const sanitizedValue = sanitizeStyleValue(key, styleRecord[key]);

        if (sanitizedValue === undefined) {
            continue;
        }

        if (key === 'bd') {
            backupStyle[key] = transformBorders((backupStyle[key] as IBorderData) || {}, sanitizedValue as Nullable<IBorderData>);
        }
        // 1. To modify the existing style,we need original setting to undo
        // 2. Newly set the style, we need null to undo
        else if (!(key in backupStyle)) {
            backupStyle[key] = null;
        }
    }
    return backupStyle as Nullable<IStyleData>;
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

    const oldBorderRecord = oldBorders as BorderRecord;

    for (const key of BORDER_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(newBorders as UnknownRecord, key)) {
            continue;
        }

        // 1. To modify the existing border,we need original setting to undo
        // 2. Newly set the border, we need null to undo
        if (!(key in oldBorders)) {
            oldBorderRecord[key] = null;
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

    const backupStyle = (Tools.deepClone(oldStyle) || {}) as UnknownRecord;
    const styleRecord = newStyle as UnknownRecord;

    for (const key of STYLE_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(styleRecord, key)) {
            continue;
        }

        // Do not copy cell background color to rich text background color.
        if (isRichText && shouldSkipRichTextStyleKey(key)) {
            continue;
        }

        const sanitizedValue = sanitizeStyleValue(key, styleRecord[key]);

        if (sanitizedValue === undefined) {
            continue;
        }

        // you can only choose one of the themeColor and rgbColor of the border setting
        if (key === 'bd') {
            backupStyle[key] = mergeBorderData(backupStyle[key] as Nullable<IBorderData>, sanitizedValue as Nullable<IBorderData>);
        } else {
            backupStyle[key] = sanitizedValue;
        }
    }

    if ('cl' in backupStyle) {
        const backupStyleData = backupStyle as IStyleData;
        const color = backupStyleData.cl;

        if ('ul' in backupStyleData && backupStyleData.ul) {
            backupStyleData.ul.cl = color as IColorStyle;
        }

        if ('ol' in backupStyleData && backupStyleData.ol) {
            backupStyleData.ol.cl = color as IColorStyle;
        }

        if ('st' in backupStyleData && backupStyleData.st) {
            backupStyleData.st.cl = color as IColorStyle;
        }
    }

    return backupStyle as Nullable<IStyleData>;
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
