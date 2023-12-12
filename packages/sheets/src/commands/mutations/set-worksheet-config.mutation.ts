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

import type { IMutation, IWorksheetData } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

/** @deprecated */
export interface ISetWorksheetConfigMutationParams {
    unitId: string;
    subUnitId: string;
    config: IWorksheetData;
}

/** @deprecated */
export const SetWorksheetConfigUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetConfigMutationParams
): ISetWorksheetConfigMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);
    const worksheet = workbook!.getSheetBySheetId(params.subUnitId)!;
    const config = Tools.deepClone(worksheet.getConfig());

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        config,
    };
};

/** @deprecated */
export const SetWorksheetConfigMutation: IMutation<ISetWorksheetConfigMutationParams> = {
    id: 'sheet.mutation.set-worksheet-config',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.unitId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.subUnitId);
        if (!worksheet) return false;

        // TODO: setConfig is going to be deprecated
        // worksheet.setConfig(params.config);

        return true;
    },
};
