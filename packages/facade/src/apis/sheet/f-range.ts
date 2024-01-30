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
    IRange,
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
import { Inject, Injector } from '@wendellhu/redi';

import type { FHorizontalAlignment, FVerticalAlignment } from './utils';
import {
    covertCellValue,
    covertCellValues,
    transformCoreHorizontalAlignment,
    transformCoreVerticalAlignment,
    transformFacadeHorizontalAlignment,
    transformFacadeVerticalAlignment,
} from './utils';

type FontWeight = 'bold' | 'normal';

export class FRange {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _range: IRange,
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

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

    getValue(): CellValue | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
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

    setWrap(isWrapEnabled: boolean): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: isWrapEnabled ? WrapStrategy.WRAP : WrapStrategy.UNSPECIFIED,
        } as ISetTextWrapCommandParams);
    }

    setWrapStrategy(strategy: WrapStrategy): Promise<boolean> {
        return this._commandService.executeCommand(SetTextWrapCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: strategy,
        } as ISetTextWrapCommandParams);
    }

    setVerticalAlignment(alignment: FVerticalAlignment): Promise<boolean> {
        return this._commandService.executeCommand(SetVerticalTextAlignCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: transformFacadeVerticalAlignment(alignment),
        } as ISetVerticalTextAlignCommandParams);
    }

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
     * Set the font weight for the given range (normal/bold).
     * @param fontWeight
     */
    setFontWeight(fontWeight: FontWeight | null): void {
        const value: BooleanNumber | undefined = fontWeight === null ? undefined : fontWeight === 'bold' ? 1 : 0;

        const style: IStyleTypeValue<BooleanNumber | undefined> = {
            type: 'bl',
            value,
        };

        const setStyleParams: ISetStyleCommandParams<BooleanNumber | undefined> = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            style,
        };

        this._commandService.executeCommand(SetStyleCommand.id, setStyleParams);
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
}
