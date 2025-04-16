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

import type { IAccessor, IMutation, IRange } from '@univerjs/core';
import { BooleanNumber, CommandType, IUniverInstanceService } from '@univerjs/core';

export interface ISetColHiddenMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetColHiddenUndoMutationFactory = (accessor: IAccessor, params: ISetColHiddenMutationParams) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        ranges: params.ranges,
    };
};

export const SetColHiddenMutation: IMutation<ISetColHiddenMutationParams> = {
    id: 'sheet.mutation.set-col-hidden',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (!universheet) {
            return false;
        }

        const manager = universheet.getSheetBySheetId(params.subUnitId)!.getColumnManager();
        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startColumn; j < range.endColumn + 1; j++) {
                const column = manager.getColumnOrCreate(j);
                if (column != null) {
                    column.hd = BooleanNumber.TRUE;
                }
            }
        }

        return true;
    },
};

export interface ISetColVisibleMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetColVisibleUndoMutationFactory = (accessor: IAccessor, params: ISetColVisibleMutationParams) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        unitId: params.unitId,
        subUnitId: params.subUnitId,
        ranges: params.ranges,
    };
};

export const SetColVisibleMutation: IMutation<ISetColVisibleMutationParams> = {
    id: 'sheet.mutation.set-col-visible',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (!universheet) {
            return false;
        }

        const manager = universheet.getSheetBySheetId(params.subUnitId)!.getColumnManager();
        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startColumn; j < range.endColumn + 1; j++) {
                const column = manager.getColumnOrCreate(j);
                if (column != null) {
                    column.hd = BooleanNumber.FALSE;
                }
            }
        }

        return true;
    },
};
