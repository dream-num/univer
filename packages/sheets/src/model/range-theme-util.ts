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

import type { IStyleData, Nullable } from '@univerjs/core';

export type IRangeThemeStyleItem = Pick<IStyleData, 'bg' | 'ol' | 'bd' | 'cl'>;

/**
 * Range theme style
 * @description The range theme style is used to set the style of the range.
 */
export class RangeThemeStyle {
    private readonly _name: string;
    wholeStyle: Nullable<IRangeThemeStyleItem> = null;

    headerRowStyle: Nullable<IRangeThemeStyleItem> = null;
    headerColumnStyle: Nullable<IRangeThemeStyleItem> = null;

    firstRowStyle: Nullable<IRangeThemeStyleItem> = null;
    secondRowStyle: Nullable<IRangeThemeStyleItem> = null;
    lastRowStyle: Nullable<IRangeThemeStyleItem> = null;

    firstColumnStyle: Nullable<IRangeThemeStyleItem> = null;
    secondColumnStyle: Nullable<IRangeThemeStyleItem> = null;
    lastColumnStyle: Nullable<IRangeThemeStyleItem> = null;
    /**
     * @constructor
     * @param {string} name The name of the range theme style, it used to identify the range theme style.
     */
    constructor(name: string) {
        this._name = name;
    }

    getName(): string {
        return this._name;
    }

    getWholeStyle(): Nullable<IRangeThemeStyleItem> {
        return this.wholeStyle;
    }

    setWholeStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.wholeStyle = style;
    }

    getFirstRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.firstRowStyle;
    }

    setFirstRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.firstRowStyle = style;
    }

    getSecondRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.secondRowStyle;
    }

    setSecondRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.secondRowStyle = style;
    }

    getLastRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.lastRowStyle;
    }

    setLastRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.lastRowStyle = style;
    }

    getFirstColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.firstColumnStyle;
    }

    setFirstColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.firstColumnStyle = style;
    }

    getSecondColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.secondColumnStyle;
    }

    setSecondColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.secondColumnStyle = style;
    }

    getLastColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.lastColumnStyle;
    }

    setLastColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.lastColumnStyle = style;
    }

    getHeaderRowStyle(): Nullable<IRangeThemeStyleItem> {
        return this.headerRowStyle;
    }

    setHeaderRowStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.headerRowStyle = style;
    }

    getHeaderColumnStyle(): Nullable<IRangeThemeStyleItem> {
        return this.headerColumnStyle;
    }

    setHeaderColumnStyle(style: Nullable<IRangeThemeStyleItem>): void {
        this.headerColumnStyle = style;
    }

    public getStyle(offsetRow: number, offsetCol: number) {
        if (offsetCol === 0) {
            return this.headerColumnStyle;
        }
        if (offsetRow === 0) {
            return this.headerRowStyle;
        }
        if (offsetRow % 2 === 0) {
            return this.firstRowStyle;
        }
        if (offsetRow % 2 === 1) {
            return this.secondRowStyle;
        }
        if (this.wholeStyle && offsetRow >= 0 && offsetCol >= 0) {
            return this.wholeStyle;
        }
    }

    toJSON(): Record<string, string> {
        return {
            name: this._name,
            wholeStyle: JSON.stringify(this.wholeStyle),
            headerRowStyle: JSON.stringify(this.headerRowStyle),
            headerColumnStyle: JSON.stringify(this.headerColumnStyle),
            firstRowStyle: JSON.stringify(this.firstRowStyle),
            secondRowStyle: JSON.stringify(this.secondRowStyle),
            lastRowStyle: JSON.stringify(this.lastRowStyle),
            firstColumnStyle: JSON.stringify(this.firstColumnStyle),
            secondColumnStyle: JSON.stringify(this.secondColumnStyle),
            lastColumnStyle: JSON.stringify(this.lastColumnStyle),
        };
    }

    fromJSON(json: Record<string, string>): void {
        this.wholeStyle = JSON.parse(json.wholeStyle);
        this.headerRowStyle = JSON.parse(json.headerRowStyle);
        this.headerColumnStyle = JSON.parse(json.headerColumnStyle);
        this.firstRowStyle = JSON.parse(json.firstRowStyle);
        this.secondRowStyle = JSON.parse(json.secondRowStyle);
        this.lastRowStyle = JSON.parse(json.lastRowStyle);
        this.firstColumnStyle = JSON.parse(json.firstColumnStyle);
        this.secondColumnStyle = JSON.parse(json.secondColumnStyle);
        this.lastColumnStyle = JSON.parse(json.lastColumnStyle);
    }
}

