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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISetNumfmtCommandParams } from './set-numfmt.command';
import { CellValueType, CommandType, ICommandService, IUniverInstanceService, Range } from '@univerjs/core';
import { getSheetCommandTarget, INumfmtService, SheetsSelectionsService } from '@univerjs/sheets';
import { getDecimalFromPattern, setPatternDecimal } from '../../utils/decimal';
import { SetNumfmtCommand } from './set-numfmt.command';

export const AddDecimalCommand: ICommand = {
    id: 'sheet.command.numfmt.add.decimal.command',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const numfmtService = accessor.get(INumfmtService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selections = selectionManagerService.getCurrentSelections();
        if (!selections || !selections.length) {
            return false;
        }

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;

        let maxDecimals = 0;
        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                const numfmtValue = numfmtService.getValue(unitId, subUnitId, row, col);
                if (!numfmtValue) {
                    const cell = target.worksheet.getCellRaw(row, col);
                    if (!maxDecimals && cell && cell.t === CellValueType.NUMBER && cell.v) {
                        const regResult = /\.(\d*)$/.exec(String(cell.v));
                        if (regResult) {
                            const length = regResult[1].length;
                            if (!length) {
                                return;
                            }
                            maxDecimals = Math.max(maxDecimals, length);
                        }
                    }
                    return;
                }
                const decimals = getDecimalFromPattern(numfmtValue.pattern);
                maxDecimals = decimals > maxDecimals ? decimals : maxDecimals;
            });
        });
        const decimals = maxDecimals + 1;
        const defaultPattern = setPatternDecimal(`0${decimals > 0 ? '.0' : ''}`, decimals);
        const values: ISetNumfmtCommandParams['values'] = [];

        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                const numfmtValue = numfmtService.getValue(unitId, subUnitId, row, col);
                if (!numfmtValue) {
                    values.push({
                        row,
                        col,
                        pattern: defaultPattern,
                    });
                } else {
                    const decimals = getDecimalFromPattern(numfmtValue.pattern);
                    const pattern = setPatternDecimal(numfmtValue.pattern, decimals + 1);
                    pattern !== numfmtValue.pattern &&
                        values.push({
                            row,
                            col,
                            pattern,
                        });
                }
            });
        });
        if (values.length) {
            const result = await commandService.executeCommand(SetNumfmtCommand.id, { values });
            return result;
        }
        return false;
    },
};
