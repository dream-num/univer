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

import type { IAccessor, IMutation, IStyleData, Nullable } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';

export interface ISetWorksheetRowColumnStyleMutationParamsUnit {
    index: number;
    style: string | Nullable<IStyleData>;
}

export interface ISetWorksheetRowColumnStyleMutationParams {
    unitId: string;
    subUnitId: string;
    isRow: boolean;
    styles: ISetWorksheetRowColumnStyleMutationParamsUnit[];
}

export const SetWorksheetRowColumnStyleMutationFactory = (accessor: IAccessor, params: ISetWorksheetRowColumnStyleMutationParams) => {
    const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);
    if (universheet == null) {
        throw new Error('[SetWorksheetRowColumnStyleMutationFactory]: universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.subUnitId);
    if (!worksheet) {
        throw new Error('[SetWorksheetRowColumnStyleMutationFactory]: worksheet is null error!');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        styles: params.styles,
        isRow: params.isRow,
    };
};

export const SetWorksheetRowColumnStyleMutation: IMutation<ISetWorksheetRowColumnStyleMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-column-style',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { unitId, styles, subUnitId, isRow } = params;
        const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(unitId);
        if (universheet == null) {
            return false;
        }
        const worksheet = universheet.getSheetBySheetId(subUnitId);

        if (!worksheet) {
            return false;
        }
        if (isRow) {
            for (const { index, style } of styles) {
                worksheet.setRowStyle(index, style);
            }
        } else {
            for (const { index, style } of styles) {
                worksheet.setColumnStyle(index, style);
            }
        }
        return true;
    },
};
