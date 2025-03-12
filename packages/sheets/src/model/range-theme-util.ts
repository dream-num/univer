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

export type IRangeThemeStyleItem = Pick<IStyleData, 'bg' | 'ol' | 'bd' | 'cl' | 'ht' | 'vt' | 'bl'>;
export interface IRangeThemeStyleJSON {
    name: string;
    wholeStyle?: IRangeThemeStyleItem;
    headerRowStyle?: IRangeThemeStyleItem;
    headerColumnStyle?: IRangeThemeStyleItem;
    firstRowStyle?: IRangeThemeStyleItem;
    secondRowStyle?: IRangeThemeStyleItem;
    lastRowStyle?: IRangeThemeStyleItem;
    firstColumnStyle?: IRangeThemeStyleItem;
    secondColumnStyle?: IRangeThemeStyleItem;
    lastColumnStyle?: IRangeThemeStyleItem;
}

const serializeRangeStyle = (style: IRangeThemeStyleItem) => {
    const result = {} as IRangeThemeStyleItem;
    if (style.bg) {
        result.bg = { ...style.bg };
    }
    if (style.ol) {
        result.ol = { ...style.ol };
    }
    if (style.bd) {
        result.bd = { ...style.bd };
    }
    if (style.cl) {
        result.cl = { ...style.cl };
    }
    if (style.ht) {
        result.ht = style.ht;
    }
    if (style.vt) {
        result.vt = style.vt;
    }
    // the bl type is BooleanNumber, may be 0
    if (style.bl !== undefined) {
        result.bl = style.bl;
    }
    return result;
};

export function composeStyles(styles: IStyleData[]): IRangeThemeStyleItem {
    const composedStyle: IRangeThemeStyleItem = {};
    if (styles.length === 1) {
        return styles[0];
    }

    for (const style of styles) {
        if (style.bg) {
            composedStyle.bg = style.bg;
        }
        if (style.ol) {
            composedStyle.ol = style.ol;
        }
        if (style.bd) {
            composedStyle.bd = { ...composedStyle.bd, ...style.bd };
        }
        if (style.cl) {
            composedStyle.cl = style.cl;
        }
        if (style.ht) {
            composedStyle.ht = style.ht;
        }
        if (style.vt) {
            composedStyle.vt = style.vt;
        }
        if (style.bl !== undefined) {
            composedStyle.bl = style.bl;
        }
    }

    return composedStyle;
}

const STYLE_MAP = {
    wholeStyle: 1,
    headerRowStyle: 2,
    headerColumnStyle: 4,
    firstRowStyle: 8,
    secondRowStyle: 16,
    lastRowStyle: 32,
    firstColumnStyle: 128,
    secondColumnStyle: 256,
    lastColumnStyle: 512,
};

/**
 * Range theme style
 * @description The range theme style is used to set the style of the range.This class is used to create a build-in theme style or a custom theme style.
 */
export class RangeThemeStyle {
    private _name: string;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} wholeStyle effect for the whole range.
     */
    wholeStyle: Nullable<IRangeThemeStyleItem> = null;

    /**
     * @property {Nullable<IRangeThemeStyleItem>} headerRowStyle effect for the header row.
     */
    headerRowStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} headerColumnStyle effect for the header column.
     */
    headerColumnStyle: Nullable<IRangeThemeStyleItem> = null;

    /**
     * @property {Nullable<IRangeThemeStyleItem>} firstRowStyle effect for the first row.
     */
    firstRowStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} secondRowStyle effect for the second row.
     */
    secondRowStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} lastRowStyle effect for the last row.
     */
    lastRowStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} firstColumnStyle effect for the first column.
     */
    firstColumnStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} secondColumnStyle effect for the second column.
     */
    secondColumnStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @property {Nullable<IRangeThemeStyleItem>} lastColumnStyle effect for the last column.
     */
    lastColumnStyle: Nullable<IRangeThemeStyleItem> = null;

    /**
     * @property {Nullable<IRangeThemeStyleItem>} quickly get merge style
     */
    private _mergeCacheMap: Map<number, IRangeThemeStyleItem> = new Map();
    /**
     * @constructor
     * @param {string} name The name of the range theme style, it used to identify the range theme style.
     * @param {IRangeThemeStyleJSON} [options] The options to initialize the range theme style.
     */
    constructor(name: string, options?: Omit<IRangeThemeStyleJSON, 'name'>) {
        if (options) {
            this.fromJson({ ...options, name });
        }

        this._name = name;
    }

    /**
     * Gets the name of the range theme style.The name is read only, and use to identifier the range theme style.
     * @returns {string} The name of the range theme style.
     */
    getName(): string {
        return this._name;
    }

    getWholeStyle(): Nullable<IRangeThemeStyleItem> {
        return this.wholeStyle;
    }

    setWholeStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.wholeStyle = style;
        this._resetStyleCache();
    }

    getFirstRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.firstRowStyle;
    }

    setFirstRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.firstRowStyle = style;
        this._resetStyleCache();
    }

    getSecondRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.secondRowStyle;
    }

    setSecondRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.secondRowStyle = style;
        this._resetStyleCache();
    }

    getLastRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.lastRowStyle;
    }

    setLastRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.lastRowStyle = style;
        this._resetStyleCache();
    }

    getFirstColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.firstColumnStyle;
    }

    setFirstColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.firstColumnStyle = style;
        this._resetStyleCache();
    }

    getSecondColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.secondColumnStyle;
    }

    setSecondColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.secondColumnStyle = style;
        this._resetStyleCache();
    }

    getLastColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.lastColumnStyle;
    }

    setLastColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.lastColumnStyle = style;
        this._resetStyleCache();
    }

    getHeaderRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.headerRowStyle;
    }

    setHeaderRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.headerRowStyle = style;
        this._resetStyleCache();
    }

    getHeaderColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.headerColumnStyle;
    }

    setHeaderColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.headerColumnStyle = style;
        this._resetStyleCache();
    }

    public getStyle(offsetRow: number, offsetCol: number, isLastRow: boolean, isLastCol: boolean) {
        let mergeNumber = 0;

        if (isLastRow) {
            mergeNumber = mergeNumber | STYLE_MAP.lastRowStyle;
        }

        if (isLastCol) {
            mergeNumber = mergeNumber | STYLE_MAP.lastColumnStyle;
        }

        if (offsetRow >= 0 && offsetCol >= 0) {
            mergeNumber = mergeNumber | STYLE_MAP.wholeStyle;
        }

        if (offsetRow % 2 === 1) {
            mergeNumber = mergeNumber | STYLE_MAP.firstRowStyle;
        }

        if (offsetRow % 2 === 0) {
            mergeNumber = mergeNumber | STYLE_MAP.secondRowStyle;
        }

        if (offsetRow === 0) {
            mergeNumber = mergeNumber | STYLE_MAP.headerRowStyle;
        }

        if (offsetCol === 0) {
            mergeNumber = mergeNumber | STYLE_MAP.headerColumnStyle;
        }

        if (offsetCol % 2 === 1) {
            mergeNumber = mergeNumber | STYLE_MAP.firstColumnStyle;
        }

        if (offsetCol % 2 === 0) {
            mergeNumber = mergeNumber | STYLE_MAP.secondColumnStyle;
        }

        // it means no style should be merged
        if (mergeNumber === 0) {
            return null;
        }
        return this._getMergeStyle(mergeNumber);
    }

    private _getMergeStyle(mergeNumber: number) {
        let style = this._mergeCacheMap.get(mergeNumber);
        if (!style) {
            style = this._mergeStyle(mergeNumber);
            this._mergeCacheMap.set(mergeNumber, style);
        }
        return style;
    }

    private _mergeStyle(mergeNumber: number): IRangeThemeStyleItem {
        const rs: IRangeThemeStyleItem[] = [];
        // the push order means the priority of the style
        if (this.wholeStyle && (mergeNumber & STYLE_MAP.wholeStyle)) {
            rs.push(this.wholeStyle);
        }

        // zebra crossing
        if (this.firstColumnStyle && (mergeNumber & STYLE_MAP.firstColumnStyle)) {
            rs.push(this.firstColumnStyle);
        }
        if (this.secondColumnStyle && (mergeNumber & STYLE_MAP.secondColumnStyle)) {
            rs.push(this.secondColumnStyle);
        }

        if (this.firstRowStyle && (mergeNumber & STYLE_MAP.firstRowStyle)) {
            rs.push(this.firstRowStyle);
        }
        if (this.secondRowStyle && (mergeNumber & STYLE_MAP.secondRowStyle)) {
            rs.push(this.secondRowStyle);
        }

        // column header
        if (this.headerColumnStyle && (mergeNumber & STYLE_MAP.headerColumnStyle)) {
            rs.push(this.headerColumnStyle);
        }
        // last column
        if (this.lastColumnStyle && (mergeNumber & STYLE_MAP.lastColumnStyle)) {
            rs.push(this.lastColumnStyle);
        }

        // row header
        if (this.headerRowStyle && (mergeNumber & STYLE_MAP.headerRowStyle)) {
            rs.push(this.headerRowStyle);
        }
        // last row
        if (this.lastRowStyle && (mergeNumber & STYLE_MAP.lastRowStyle)) {
            rs.push(this.lastRowStyle);
        }

        return composeStyles(rs as IStyleData[]);
    }

    private _resetStyleCache() {
        this._mergeCacheMap.clear();
    }

    toJson(): IRangeThemeStyleJSON {
        const jsonData: IRangeThemeStyleJSON = {
            name: this._name,
        };

        if (this.wholeStyle) {
            jsonData.wholeStyle = serializeRangeStyle(this.wholeStyle)!;
        }

        if (this.headerRowStyle) {
            jsonData.headerRowStyle = serializeRangeStyle(this.headerRowStyle)!;
        }

        if (this.headerColumnStyle) {
            jsonData.headerColumnStyle = serializeRangeStyle(this.headerColumnStyle)!;
        }

        if (this.firstRowStyle) {
            jsonData.firstRowStyle = serializeRangeStyle(this.firstRowStyle)!;
        }

        if (this.secondRowStyle) {
            jsonData.secondRowStyle = serializeRangeStyle(this.secondRowStyle)!;
        }

        if (this.lastRowStyle) {
            jsonData.lastRowStyle = serializeRangeStyle(this.lastRowStyle)!;
        }

        if (this.firstColumnStyle) {
            jsonData.firstColumnStyle = serializeRangeStyle(this.firstColumnStyle)!;
        }

        if (this.secondColumnStyle) {
            jsonData.secondColumnStyle = serializeRangeStyle(this.secondColumnStyle)!;
        }

        if (this.lastColumnStyle) {
            jsonData.lastColumnStyle = serializeRangeStyle(this.lastColumnStyle)!;
        }
        return jsonData;
    }

    fromJson(json: IRangeThemeStyleJSON): void {
        this._name = json.name;
        if (json.wholeStyle) {
            this.wholeStyle = serializeRangeStyle(json.wholeStyle);
        }

        if (json.headerRowStyle) {
            this.headerRowStyle = serializeRangeStyle(json.headerRowStyle);
        }

        if (json.headerColumnStyle) {
            this.headerColumnStyle = serializeRangeStyle(json.headerColumnStyle);
        }

        if (json.firstRowStyle) {
            this.firstRowStyle = serializeRangeStyle(json.firstRowStyle);
        }

        if (json.secondRowStyle) {
            this.secondRowStyle = serializeRangeStyle(json.secondRowStyle);
        }

        if (json.lastRowStyle) {
            this.lastRowStyle = serializeRangeStyle(json.lastRowStyle);
        }

        if (json.firstColumnStyle) {
            this.firstColumnStyle = serializeRangeStyle(json.firstColumnStyle);
        }

        if (json.secondColumnStyle) {
            this.secondColumnStyle = serializeRangeStyle(json.secondColumnStyle);
        }

        if (json.lastColumnStyle) {
            this.lastColumnStyle = serializeRangeStyle(json.lastColumnStyle);
        }
    }

    dispose(): void {
        this._mergeCacheMap.clear();
    }
}
