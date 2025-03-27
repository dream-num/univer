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
import { CommandType, IUniverInstanceService } from '@univerjs/core';

export interface ISetRowVisibleMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetRowVisibleUndoMutationFactory = (accessor: IAccessor, params: ISetRowVisibleMutationParams) => {
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

export const SetRowVisibleMutation: IMutation<ISetRowVisibleMutationParams> = {
    id: 'sheet.mutation.set-row-visible',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getSheetBySheetId(params.subUnitId)!.getRowManager();
        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startRow; j < range.endRow + 1; j++) {
                const row = manager.getRowOrCreate(j);
                if (row != null) {
                    row.hd = 0;
                }
            }
        }

        return true;
    },
};

export interface ISetRowHiddenMutationParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetRowHiddenUndoMutationFactory = (accessor: IAccessor, params: ISetRowHiddenMutationParams) => {
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

export const SetRowHiddenMutation: IMutation<ISetRowHiddenMutationParams> = {
    id: 'sheet.mutation.set-row-hidden',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.unitId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getSheetBySheetId(params.subUnitId)!.getRowManager();

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startRow; j < range.endRow + 1; j++) {
                const row = manager.getRowOrCreate(j);
                if (row != null) {
                    row.hd = 1;
                }
            }
        }

        return true;
    },
};
