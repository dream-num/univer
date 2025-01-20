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
    IAccessor,
    ICellData,
    ICopyToOptionsData,
    IMutation,
    IMutationCommonParams,
    IObjectMatrixPrimitiveType,
    IRange,
    Nullable,
    Workbook,
} from '@univerjs/core';
import { CommandType, IUniverInstanceService, ObjectMatrix, Tools } from '@univerjs/core';
import { handleStyle, transformStyle } from '../../basics/cell-style';
import { getCellType } from '../../basics/cell-type';
import { getCellValue, setNull } from '../../basics/cell-value';

/** Params of `SetRangeValuesMutation` */
export interface ISetRangeValuesMutationParams extends IMutationCommonParams {
    subUnitId: string;
    unitId: string;

    /**
     * null for clear all
     */
    cellValue?: IObjectMatrixPrimitiveType<Nullable<ICellData>>;

    /**
     * @deprecated not a good design
     */
    options?: ICopyToOptionsData;
}

export interface ISetRangeValuesRangeMutationParams extends ISetRangeValuesMutationParams {
    range: IRange[];
}

/**
 * Generate undo mutation of a `SetRangeValuesMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {ISetRangeValuesMutationParams} params - do mutation params
 * @returns {ISetRangeValuesMutationParams} undo mutation params
 */
export const SetRangeValuesUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetRangeValuesMutationParams
): ISetRangeValuesMutationParams => {
    const { unitId, subUnitId, cellValue } = params;
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getUniverSheetInstance(unitId);

    if (workbook == null) {
        throw new Error('workbook is null error!');
    }

    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

    const cellMatrix = worksheet.getCellMatrix();
    const styles = workbook.getStyles();
    const undoData = new ObjectMatrix<Nullable<ICellData>>();

    const newValues = new ObjectMatrix(cellValue);

    newValues.forValue((row, col, newVal) => {
        const cell = Tools.deepClone(cellMatrix?.getValue(row, col)) || {}; // clone cell data，prevent modify the original data
        const oldStyle = styles.getStyleByCell(cell);
        // transformStyle does not accept style id
        const newStyle = styles.getStyleByCell(newVal);

        cell.s = transformStyle(oldStyle, newStyle);

        undoData.setValue(row, col, setNull(cell));
    });

    return {
        ...params,
        options: {},
        cellValue: undoData.getMatrix(),
    } as ISetRangeValuesMutationParams;
};

export const SetRangeValuesMutation: IMutation<ISetRangeValuesMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-values',

    type: CommandType.MUTATION,

    handler: (accessor, params) => {
        const { cellValue, subUnitId, unitId } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUnit<Workbook>(unitId);
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return false;
        }

        const cellMatrix = worksheet.getCellMatrix();
        const styles = workbook.getStyles();
        const newValues = new ObjectMatrix(cellValue);

        newValues.forValue((row, col, newVal) => {
            // clear all
            if (!newVal) {
                cellMatrix?.setValue(row, col, {});
            } else {
                const oldVal = cellMatrix.getValue(row, col) || {};

                // NOTE: we may need to take `p` into account
                const type = getCellType(styles, newVal, oldVal);

                if (newVal.f !== undefined) {
                    oldVal.f = newVal.f;
                }

                if (newVal.si !== undefined) {
                    oldVal.si = newVal.si;
                }

                if (newVal.p !== undefined) {
                    oldVal.p = newVal.p;
                }

                // Set to null, clear content
                if (newVal.v !== undefined) {
                    oldVal.v = getCellValue(type, newVal);
                }

                if (oldVal.v !== undefined) {
                    oldVal.t = type;
                    // The text format may be set for the numeric cell, and cell.v needs to be converted to text
                    oldVal.v = getCellValue(type, oldVal);
                }

                // handle style
                if (newVal.s !== undefined) {
                    handleStyle(styles, oldVal, newVal);
                }

                if (newVal.custom !== undefined) {
                    // Custom will overwrite the original value
                    oldVal.custom = newVal.custom;
                }

                cellMatrix.setValue(row, col, Tools.removeNull(oldVal));
            }
        });

        return true;
    },
};
