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

import type {
    CellValue,
    ICellData,
    IColorStyle,
    IObjectMatrixPrimitiveType,
    IRange, ISelectionCellWithCoord,
    IStyleData,
    ITextDecoration,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import { BooleanNumber, ICommandService, WrapStrategy } from '@univerjs/core';
import type {
    ISetHorizontalTextAlignCommandParams,
    ISetStyleCommandParams,
    ISetTextWrapCommandParams,
    ISetVerticalTextAlignCommandParams,
    IStyleTypeValue,
} from '@univerjs/sheets';
import {
    SetHorizontalTextAlignCommand,
    SetRangeValuesCommand,
    SetStyleCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '@univerjs/sheets';
import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import { SetNumfmtCommand } from '@univerjs/sheets-numfmt';

import { FormulaDataModel } from '@univerjs/engine-formula';
import { Inject, Injector } from '@wendellhu/redi';
import { ISheetClipboardService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { FHorizontalAlignment, FVerticalAlignment } from './utils';
import { covertCellValue,
    covertCellValues,
    isCellMerged,
    transformCoreHorizontalAlignment,
    transformCoreVerticalAlignment,
    transformFacadeHorizontalAlignment,
    transformFacadeVerticalAlignment,
} from './utils';

export type FontLine = 'none' | 'underline' | 'line-through';
export type FontStyle = 'normal' | 'italic';
export type FontWeight = 'normal' | 'bold';

export class FRange {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _range: IRange,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        // empty
    }

    getRow(): number {
        return this._range.startRow;
    }

    getColumn(): number {
        return this._range.startColumn;
    }

    getWidth(): number {
        return this._range.endColumn - this._range.startColumn + 1;
    }

    getHeight(): number {
        return this._range.endRow - this._range.startRow + 1;
    }

    /**
     * Return first cell model data in this range
     * @returns The cell model data
     */
    getCellData(): ICellData | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn) ?? null;
    }

    /**
     * Return this cell information, including whether it is merged and cell coordinates
     * @returns The cell information
     */
    getCell(): ISelectionCellWithCoord {
        const unitId = this._workbook.getUnitId();
        const subUnitId = this._worksheet.getSheetId();
        const skeleton = this._renderManagerService.getRenderById(unitId)!
            .with(SheetSkeletonManagerService).getUnitSkeleton(unitId, subUnitId)!.skeleton;
        return skeleton.getCellByIndex(this._range.startRow, this._range.startColumn);
    }

    /**
     * Return range whether this range is merged
     * @returns if true is merged
     */
    isMerged() {
        return isCellMerged(this.getCell().mergeInfo, this._range);
    }

    /**
     * Returns the coordinates of this cell,does not include units
     * @returns coordinates of the cell， top, right, bottom, left
     */
    getCellRect(): DOMRect {
        const { startX: x, startY: y, endX: x2, endY: y2 } = this.getCell();
        const data = { x, y, width: x2 - x, height: y2 - y, top: y, left: x, bottom: y2, right: x2 };
        return { ...data, toJSON: () => JSON.stringify(data) };
    }

    /**
     * Return first cell style data in this range
     * @returns The cell style data
     */
    getCellStyleData(): IStyleData | null {
        const cell = this.getCellData();
        const styles = this._workbook.getStyles();
        if (cell && styles) {
            return styles.getStyleByCell(cell) ?? null;
        }

        return null;
    }

    getValue(): CellValue | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
    }

    /**
     * Returns the formulas (A1 notation) for the cells in the range. Entries in the 2D array are empty strings for cells with no formula.
     * @returns A two-dimensional array of formulas in string format.
     */
    getFormulas(): string[][] {
        const formulas: string[][] = [];

        const { startRow, endRow, startColumn, endColumn } = this._range;
        const sheetId = this._worksheet.getSheetId();
        const unitId = this._workbook.getUnitId();

        for (let row = startRow; row <= endRow; row++) {
            const rowFormulas: string[] = [];

            for (let col = startColumn; col <= endColumn; col++) {
                const formulaString = this._formulaDataModel.getFormulaStringByCell(row, col, sheetId, unitId);
                rowFormulas.push(formulaString || '');
            }

            formulas.push(rowFormulas);
        }

        return formulas;
    }

    getWrap(): boolean {
        return this._worksheet.getRange(this._range).getWrap() === BooleanNumber.TRUE;
    }

    getWrapStrategy(): WrapStrategy {
        return this._worksheet.getRange(this._range).getWrapStrategy();
    }

    getHorizontalAlignment(): string {
        return transformCoreHorizontalAlignment(this._worksheet.getRange(this._range).getHorizontalAlignment());
    }

    getVerticalAlignment(): string {
        return transformCoreVerticalAlignment(this._worksheet.getRange(this._range).getVerticalAlignment());
    }

    // #region editing

    setBackgroundColor(color: string): Promise<boolean> {
        return this._commandService.executeCommand(SetStyleCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style: {
                type: 'bg',
                value: {
                    rgb: color,
                },
            },
        } as ISetStyleCommandParams<IColorStyle>);
    }

    /**
     * The value can be a number, string, boolean, or standard cell format. If it begins with `=`, it is interpreted as a formula. The value is tiled to all cells in the range.
     * @param value
     */
    setValue(value: CellValue | ICellData): Promise<boolean> {
        const realValue = covertCellValue(value);

        if (!realValue) {
            throw new Error('Invalid value');
        }

        return this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Set the cell wrap of the given range.
     * Cells with wrap enabled (the default) resize to display their full content. Cells with wrap disabled display as much as possible in the cell without resizing or running to multiple lines.
     */
    setWrap(isWrapEnabled: boolean): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: isWrapEnabled ? WrapStrategy.WRAP : WrapStrategy.UNSPECIFIED,
        } as ISetTextWrapCommandParams);
    }

    /**
     * Sets the text wrapping strategy for the cells in the range.
     */
    setWrapStrategy(strategy: WrapStrategy): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: strategy,
        } as ISetTextWrapCommandParams);
    }

    /**
     * Set the vertical (top to bottom) alignment for the given range (top/middle/bottom).
     */
    setVerticalAlignment(alignment: FVerticalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetVerticalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeVerticalAlignment(alignment),
        } as ISetVerticalTextAlignCommandParams);
    }

    /**
     * Set the horizontal (left to right) alignment for the given range (left/center/right).
     */
    setHorizontalAlignment(alignment: FHorizontalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetHorizontalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeHorizontalAlignment(alignment),
        } as ISetHorizontalTextAlignCommandParams);
    }

    /**
     * Set the number format of the range.
     * @param pattern number format pattern.
     * @returns Execution result.
     */
    setNumberFormat(pattern: string): Promise<boolean> {
        // TODO@Gggpound: the API should support other types of parameters
        const values: ISetNumfmtCommandParams['values'] = [];

        // Add number format info to the `values` array.
        this.forEach((row, col) => values.push({ row, col, pattern }));
        return this._commandService.executeCommand(SetNumfmtCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        } as ISetNumfmtCommandParams);
    }

    /**
     * Sets a different value for each cell in the range. The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats. If a value begins with `=`, it is interpreted as a formula.
     * @param value
     */
    setValues(
        value:
            | CellValue[][]
            | IObjectMatrixPrimitiveType<CellValue>
            | ICellData[][]
            | IObjectMatrixPrimitiveType<ICellData>
    ): Promise<boolean> {
        const realValue = covertCellValues(value, this._range);

        return this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Sets the font weight for the given range (normal/bold),
     * @param fontWeight The font weight, either 'normal' or 'bold'; a null value resets the font weight.
     */
    setFontWeight(fontWeight: FontWeight | null): this {
        let value: BooleanNumber | null;
        if (fontWeight === 'bold') {
            value = BooleanNumber.TRUE;
        } else if (fontWeight === 'normal') {
            value = BooleanNumber.FALSE;
        } else if (fontWeight === null) {
            value = null;
        } else {
            throw new Error('Invalid fontWeight');
        }

        const style: IStyleTypeValue<BooleanNumber | null> = {
            type: 'bl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font style for the given range ('italic' or 'normal').
     * @param fontStyle The font style, either 'italic' or 'normal'; a null value resets the font style.
     */
    setFontStyle(fontStyle: FontStyle | null): this {
        let value: BooleanNumber | null;
        if (fontStyle === 'italic') {
            value = BooleanNumber.TRUE;
        } else if (fontStyle === 'normal') {
            value = BooleanNumber.FALSE;
        } else if (fontStyle === null) {
            value = null;
        } else {
            throw new Error('Invalid fontStyle');
        }

        const style: IStyleTypeValue<BooleanNumber | null> = {
            type: 'it',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font line style of the given range ('underline', 'line-through', or 'none').
     * @param fontLine The font line style, either 'underline', 'line-through', or 'none'; a null value resets the font line style.
     */
    setFontLine(fontLine: FontLine | null): this {
        if (fontLine === 'underline') {
            this._setFontUnderline({
                s: BooleanNumber.TRUE,
            });
        } else if (fontLine === 'line-through') {
            this._setFontStrikethrough({
                s: BooleanNumber.TRUE,
            });
        } else if (fontLine === 'none') {
            this._setFontUnderline({
                s: BooleanNumber.FALSE,
            });
            this._setFontStrikethrough({
                s: BooleanNumber.FALSE,
            });
        } else if (fontLine === null) {
            this._setFontUnderline(null);
            this._setFontStrikethrough(null);
        } else {
            throw new Error('Invalid fontLine');
        }
        return this;
    }

    /**
     * Sets the font underline style of the given ITextDecoration
     */
    private _setFontUnderline(value: ITextDecoration | null) {
        const style: IStyleTypeValue<ITextDecoration | null> = {
            type: 'ul',
            value,
        };
        const setStyleParams: ISetStyleCommandParams<ITextDecoration | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font strikethrough style of the given ITextDecoration
     */
    private _setFontStrikethrough(value: ITextDecoration | null) {
        const style: IStyleTypeValue<ITextDecoration | null> = {
            type: 'st',
            value,
        };
        const setStyleParams: ISetStyleCommandParams<ITextDecoration | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
    }

    /**
     * Sets the font family, such as "Arial" or "Helvetica".
     * @param fontFamily The font family to set; a null value resets the font family.
     */
    setFontFamily(fontFamily: string | null): this {
        const style: IStyleTypeValue<string | null> = {
            type: 'ff',
            value: fontFamily,
        };
        const setStyleParams: ISetStyleCommandParams<string | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font size, with the size being the point size to use.
     * @param size A font size in point size. A null value resets the font size.
     */
    setFontSize(size: number | null): this {
        const style: IStyleTypeValue<number | null> = {
            type: 'fs',
            value: size,
        };
        const setStyleParams: ISetStyleCommandParams<number | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    /**
     * Sets the font color in CSS notation (such as '#ffffff' or 'white').
     * @param color The font color in CSS notation (such as '#ffffff' or 'white'); a null value resets the color.
     */
    setFontColor(color: string | null): this {
        const value: IColorStyle | null = color === null ? null : { rgb: color };
        const style: IStyleTypeValue<IColorStyle | null> = {
            type: 'cl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<IColorStyle | null> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);

        return this;
    }

    // #endregion editing

    /**
     * Iterate cells in this range. Merged cells will be respected.
     * @param callback
     */
    forEach(callback: (row: number, col: number, cell: ICellData) => void): void {
        // Iterate each cell in this range.
        const { startColumn, startRow, endColumn, endRow } = this._range;
        this._worksheet
            .getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn)
            .forValue((row, col, value) => {
                callback(row, col, value);
            });
    }

    /**
     * Generate HTML content for the range.
     */
    generateHTML(): string {
        const copyContent = this._injector.get(ISheetClipboardService).generateCopyContent(
            this._workbook.getUnitId(),
            this._worksheet.getSheetId(),
            this._range
        );

        return copyContent?.html ?? '';
    }
}
