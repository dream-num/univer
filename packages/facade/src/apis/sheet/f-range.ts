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
    BooleanNumber,
    ICellData,
    ICellV,
    IColorStyle,
    IObjectMatrixPrimitiveType,
    IRange,
    Workbook,
    Worksheet,
} from '@univerjs/core';
import { ICommandService } from '@univerjs/core';
import type { ISetStyleCommandParams, IStyleTypeValue } from '@univerjs/sheets';
import { SetRangeValuesCommand, SetStyleCommand } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { covertCellValue, covertCellValues } from './utils';

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

    getValue(): ICellV | null {
        return this._worksheet.getCell(this._range.startRow, this._range.startColumn)?.v ?? null;
    }

    setBackgroundColor(color: string): void {
        this._commandService.executeCommand(SetStyleCommand.id, {
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
    setValue(value: ICellV | ICellData): void {
        const realValue = covertCellValue(value);

        if (!realValue) {
            throw new Error('Invalid value');
        }

        this._commandService.executeCommand(SetRangeValuesCommand.id, {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            range: this._range,
            value: realValue,
        });
    }

    /**
     * Sets a different value for each cell in the range. The value can be a two-dimensional array or a standard range matrix (must match the dimensions of this range), consisting of numbers, strings, Boolean values or Composed of standard cell formats. If a value begins with `=`, it is interpreted as a formula.
     * @param value
     */
    setValues(
        value: ICellV[][] | IObjectMatrixPrimitiveType<ICellV> | ICellData[][] | IObjectMatrixPrimitiveType<ICellData>
    ): void {
        const realValue = covertCellValues(value, this._range);

        this._commandService.executeCommand(SetRangeValuesCommand.id, {
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
}
