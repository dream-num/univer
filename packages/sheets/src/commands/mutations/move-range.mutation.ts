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

import type { ICellData, IExecutionOptions, IMutation, IObjectMatrixPrimitiveType, IRange, IStyleData, Nullable, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { handleStyle } from '../../basics/cell-style';

export interface IMoveRangeMutationParams {
    unitId: string;
    fromRange: IRange;
    toRange: IRange;
    from: {
        subUnitId: string;
        value: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
    };
    to: {
        subUnitId: string;
        value: IObjectMatrixPrimitiveType<Nullable<ICellData>>;
    };
}

interface ICellStyleData {
    s: Nullable<string | IStyleData>;
}

export const MoveRangeMutation: IMutation<IMoveRangeMutationParams, boolean> = {
    id: 'sheet.mutation.move-range',
    type: CommandType.MUTATION,
    handler: (accessor, params, options?: IExecutionOptions) => {
        const { from, to } = params;

        if (!from || !to) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }

        const fromWorksheet = workbook.getSheetBySheetId(params.from.subUnitId);
        const toWorksheet = workbook.getSheetBySheetId(params.to.subUnitId);

        if (!fromWorksheet || !toWorksheet) {
            return false;
        }

        const fromCellMatrix = fromWorksheet.getCellMatrix();
        const toCellMatrix = toWorksheet.getCellMatrix();

        let originStyleWhenCollab: ICellStyleData = { s: null };
        new ObjectMatrix<Nullable<ICellData>>(from.value).forValue((row, col, newVal) => {
            if (options?.fromCollab) {
                const fromCellValue = fromCellMatrix.getValue(row, col);
                originStyleWhenCollab = { s: fromCellValue?.s || null };
            }
            fromCellMatrix.setValue(row, col, newVal);
        });

        const workbookStyles = workbook.getStyles();

        new ObjectMatrix<Nullable<ICellData>>(to.value).forValue((row, col, newVal) => {
            if (newVal && newVal.s && options?.fromCollab) {
                let styleHash = workbookStyles.search(newVal.s as IStyleData, JSON.stringify(newVal.s));
                if (!styleHash) {
                    handleStyle(workbookStyles, originStyleWhenCollab, { s: newVal.s });
                    styleHash = workbookStyles.search(newVal.s as IStyleData, JSON.stringify(newVal.s));
                }
                if (styleHash) {
                    newVal.s = styleHash;
                }
            }
            toCellMatrix.setValue(row, col, newVal);
        });

        return true;
    },
};
