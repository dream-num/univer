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

import type { BorderStyleTypes, BorderType, CellValue, ICellData, TextDirection, Workbook, Worksheet, WrapStrategy } from '@univerjs/core';
import type { FontLine, FontStyle, FontWeight, FRange } from './f-range';
import type { IFacadeClearOptions } from './f-worksheet';
import type { FHorizontalAlignment, FVerticalAlignment } from './utils';
import { ICommandService, Inject, Injector } from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, getPrimaryForRange, RemoveWorksheetMergeCommand, SetBorderBasicCommand, SetSelectionsOperation } from '@univerjs/sheets';

/**
 * Represents a list of ranges on the same worksheet. It mirrors the Google Sheets RangeList
 * shape for applying the same operation to non-contiguous ranges.
 *
 * @example
 * ```ts
 * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
 * sheet.getRangeList(['A1:B2', 'D1:E2'])
 *   .setBackgroundColor('#fce4d6')
 *   .setFontWeight('bold');
 * ```
 * @hideconstructor
 */
export class FRangeList extends FBaseInitialable {
    static { this._enableManualInit(); }

    constructor(
        protected readonly _workbook: Workbook,
        protected readonly _ranges: FRange[],
        @Inject(Injector) protected override readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService
    ) {
        super(_injector);
        this._runInitializers(this._injector, this._workbook, this._ranges);
    }

    /**
     * Returns the ranges represented by this list.
     * @returns {FRange[]} The ranges in this list.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * const rangeList = sheet.getRangeList(['A1:B2', 'D1:E2']);
     * console.log(rangeList.getRanges().map((range) => range.getA1Notation()));
     * ```
     */
    getRanges(): FRange[] {
        return [...this._ranges];
    }

    /**
     * Selects this list of ranges. The last range becomes the active range.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['D4', 'B2:C4']).activate();
     * ```
     */
    activate(): FRangeList {
        const worksheet = this._getSingleWorksheet('activate');
        const lastIndex = this._ranges.length - 1;
        this._ranges[0].activate();
        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            selections: this._ranges.map((range, index) => ({
                range: range.getRange(),
                primary: index === lastIndex ? getPrimaryForRange(range.getRange(), worksheet) : null,
                style: null,
            })),
        });
        return this;
    }

    /**
     * Breaks apart merged cells in each range in this list.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).breakApart();
     * ```
     */
    breakApart(): FRangeList {
        return this._forEachRangeGroup((unitId, subUnitId, ranges) => {
            this._commandService.syncExecuteCommand(RemoveWorksheetMergeCommand.id, {
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
            });
        });
    }

    /**
     * Clears contents and formats in each range in this list.
     * @param {IFacadeClearOptions} [options] Univer clear options. Currently supports the same options as FRange.clear.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A:A', 'C:C']).clear({ contentsOnly: true });
     * ```
     */
    clear(options?: IFacadeClearOptions): FRangeList {
        if (options && options.contentsOnly && !options.formatOnly) {
            return this.clearContent();
        }

        if (options && options.formatOnly && !options.contentsOnly) {
            return this.clearFormat();
        }

        return this._forEachRangeGroup((unitId, subUnitId, ranges) => {
            this._commandService.syncExecuteCommand(ClearSelectionAllCommand.id, {
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
                options,
            });
        });
    }

    /**
     * Clears contents in each range in this list while preserving formatting.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A:A', 'C:C']).clearContent();
     * ```
     */
    clearContent(): FRangeList {
        return this._forEachRangeGroup((unitId, subUnitId, ranges) => {
            this._commandService.syncExecuteCommand(ClearSelectionContentCommand.id, {
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
            });
        });
    }

    /**
     * Clears formats in each range in this list while preserving contents.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A:A', 'C:C']).clearFormat();
     * ```
     */
    clearFormat(): FRangeList {
        return this._forEachRangeGroup((unitId, subUnitId, ranges) => {
            this._commandService.syncExecuteCommand(ClearSelectionFormatCommand.id, {
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
            });
        });
    }

    /**
     * Sets basic border properties for each range in this list.
     * This follows Univer's BorderType and BorderStyleTypes API rather than boolean-edge overloads.
     * @param {BorderType} type The type of border to apply.
     * @param {BorderStyleTypes} style The border style.
     * @param {string} [color] Optional border color in CSS notation.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2'])
     *   .setBorder(univerAPI.Enum.BorderType.ALL, univerAPI.Enum.BorderStyleTypes.THIN, '#ff0000');
     * ```
     */
    setBorder(type: BorderType, style: BorderStyleTypes, color?: string): FRangeList {
        return this._forEachRangeGroup((unitId, subUnitId, ranges) => {
            this._commandService.syncExecuteCommand(SetBorderBasicCommand.id, {
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
                value: {
                    type,
                    style,
                    color,
                },
            });
        });
    }

    /**
     * Sets the background color for each range in this list.
     * @param {string} color The background color.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setBackgroundColor('#fce4d6');
     * ```
     */
    setBackgroundColor(color: string): FRangeList {
        return this._forEachRange((range) => range.setBackgroundColor(color));
    }

    /**
     * Sets the background color for each range in this list.
     * @param {string} color The background color.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setBackground('#fce4d6');
     * ```
     */
    setBackground(color: string): FRangeList {
        return this.setBackgroundColor(color);
    }

    /**
     * Sets the background color for each range in this list from RGB channel values.
     * @param {number} red The red channel, from 0 to 255.
     * @param {number} green The green channel, from 0 to 255.
     * @param {number} blue The blue channel, from 0 to 255.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setBackgroundRGB(255, 0, 0);
     * ```
     */
    setBackgroundRGB(red: number, green: number, blue: number): FRangeList {
        return this.setBackgroundColor(this._rgbToHex(red, green, blue));
    }

    /**
     * Sets text rotation for each range in this list.
     * @param {number} rotation The rotation angle in degrees.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setTextRotation(45);
     * ```
     */
    setTextRotation(rotation: number): FRangeList {
        return this._forEachRange((range) => range.setTextRotation(rotation));
    }

    /**
     * Sets text direction for each range in this list.
     * @param {TextDirection} direction The text direction.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2'])
     *   .setTextDirection(univerAPI.Enum.TextDirection.RIGHT_TO_LEFT);
     * ```
     */
    setTextDirection(direction: TextDirection): FRangeList {
        return this._forEachRange((range) => range.setTextDirection(direction));
    }

    /**
     * Sets one value for every cell in each range in this list.
     * @param {CellValue | ICellData} value The value or standard cell data to set.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:A10', 'C1:C10']).setValue('Ready');
     * ```
     */
    setValue(value: CellValue | ICellData): FRangeList {
        return this._forEachRange((range) => range.setValue(value));
    }

    /**
     * Sets the same A1-notation formula for each range in this list.
     * @param {string} formula The formula to set.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A11', 'C11']).setFormula('=SUM(A1:A10)');
     * ```
     */
    setFormula(formula: string): FRangeList {
        return this._forEachRange((range) => range.setFormula(formula));
    }

    /**
     * Sets text wrapping for each range in this list.
     * @param {boolean} isWrapEnabled Whether to enable wrapping.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setWrap(true);
     * ```
     */
    setWrap(isWrapEnabled: boolean): FRangeList {
        return this._forEachRange((range) => range.setWrap(isWrapEnabled));
    }

    /**
     * Sets text wrapping strategy for each range in this list.
     * @param {WrapStrategy} strategy The text wrapping strategy.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setWrapStrategy(univerAPI.Enum.WrapStrategy.WRAP);
     * ```
     */
    setWrapStrategy(strategy: WrapStrategy): FRangeList {
        return this._forEachRange((range) => range.setWrapStrategy(strategy));
    }

    /**
     * Sets vertical alignment for each range in this list.
     * @param {FVerticalAlignment} alignment The vertical alignment.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setVerticalAlignment('middle');
     * ```
     */
    setVerticalAlignment(alignment: FVerticalAlignment): FRangeList {
        return this._forEachRange((range) => range.setVerticalAlignment(alignment));
    }

    /**
     * Sets horizontal alignment for each range in this list.
     * @param {FHorizontalAlignment} alignment The horizontal alignment.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setHorizontalAlignment('center');
     * ```
     */
    setHorizontalAlignment(alignment: FHorizontalAlignment): FRangeList {
        return this._forEachRange((range) => range.setHorizontalAlignment(alignment));
    }

    /**
     * Sets font weight for each range in this list.
     * @param {FontWeight | null} fontWeight The font weight, or null to reset.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setFontWeight('bold');
     * ```
     */
    setFontWeight(fontWeight: FontWeight | null): FRangeList {
        return this._forEachRange((range) => range.setFontWeight(fontWeight));
    }

    /**
     * Sets font style for each range in this list.
     * @param {FontStyle | null} fontStyle The font style, or null to reset.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setFontStyle('italic');
     * ```
     */
    setFontStyle(fontStyle: FontStyle | null): FRangeList {
        return this._forEachRange((range) => range.setFontStyle(fontStyle));
    }

    /**
     * Sets font line for each range in this list.
     * @param {FontLine | null} fontLine The font line style, or null to reset.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setFontLine('underline');
     * ```
     */
    setFontLine(fontLine: FontLine | null): FRangeList {
        return this._forEachRange((range) => range.setFontLine(fontLine));
    }

    /**
     * Sets font family for each range in this list.
     * @param {string | null} fontFamily The font family, or null to reset.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setFontFamily('Arial');
     * ```
     */
    setFontFamily(fontFamily: string | null): FRangeList {
        return this._forEachRange((range) => range.setFontFamily(fontFamily));
    }

    /**
     * Sets font size for each range in this list.
     * @param {number | null} size The font size, or null to reset.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setFontSize(12);
     * ```
     */
    setFontSize(size: number | null): FRangeList {
        return this._forEachRange((range) => range.setFontSize(size));
    }

    /**
     * Sets font color for each range in this list.
     * @param {string | null} color The font color, or null to reset.
     * @returns {FRangeList} This range list, for chaining.
     * @example
     * ```ts
     * const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
     * sheet.getRangeList(['A1:B2', 'D1:E2']).setFontColor('#ff0000');
     * ```
     */
    setFontColor(color: string | null): FRangeList {
        return this._forEachRange((range) => range.setFontColor(color));
    }

    private _rgbToHex(red: number, green: number, blue: number): string {
        return [red, green, blue].map((channel) => {
            if (!Number.isInteger(channel) || channel < 0 || channel > 255) {
                throw new Error('RGB channel values must be integers from 0 to 255');
            }

            return channel.toString(16).padStart(2, '0');
        }).join('').replace(/^/, '#');
    }

    private _getSingleWorksheet(action: string): Worksheet {
        const firstRange = this._ranges[0];
        const sheetId = firstRange.getSheetId();
        const worksheet = this._workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            throw new Error('Range sheet not found');
        }

        const hasMultipleSheets = this._ranges.some((range) => range.getUnitId() !== firstRange.getUnitId() || range.getSheetId() !== sheetId);
        if (hasMultipleSheets) {
            throw new Error(`Cannot ${action} a range list across multiple worksheets`);
        }

        return worksheet;
    }

    private _forEachRange(callback: (range: FRange) => void): FRangeList {
        this._ranges.forEach(callback);
        return this;
    }

    protected _forEachRangeGroup(callback: (unitId: string, subUnitId: string, ranges: FRange[]) => void): FRangeList {
        for (const [key, ranges] of this._getRangeGroups()) {
            const [unitId, subUnitId] = key.split(':');
            callback(unitId, subUnitId, ranges);
        }

        return this;
    }

    protected _getRangeGroups(): Map<string, FRange[]> {
        const groups = new Map<string, FRange[]>();
        for (const range of this._ranges) {
            const key = `${range.getUnitId()}:${range.getSheetId()}`;
            const ranges = groups.get(key) ?? [];
            ranges.push(range);
            groups.set(key, ranges);
        }

        return groups;
    }
}
