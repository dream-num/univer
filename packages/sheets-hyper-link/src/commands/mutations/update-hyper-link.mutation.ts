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

import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { HyperLinkModel } from '../../models/hyper-link.model';
import type { ICellLinkContent } from '../../types/interfaces/i-hyper-link';

export interface IUpdateHyperLinkMutationParams {
    unitId: string;
    subUnitId: string;
    id: string;
    payload: ICellLinkContent;
}

export const UpdateHyperLinkMutation: ICommand<IUpdateHyperLinkMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheets.mutation.update-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const model = accessor.get(HyperLinkModel);
        const { unitId, subUnitId, payload, id } = params;
        return model.updateHyperLink(unitId, subUnitId, id, payload);
    },
};

export interface IUpdateHyperLinkRefMutationParams {
    unitId: string;
    subUnitId: string;
    id: string;
    row: number;
    column: number;
    silent?: boolean;
}

export const UpdateHyperLinkRefMutation: ICommand<IUpdateHyperLinkRefMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheets.mutation.update-hyper-link-ref',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const model = accessor.get(HyperLinkModel);
        const { unitId, subUnitId, id, row, column, silent } = params;
        return model.updateHyperLinkRef(unitId, subUnitId, id, { row, column }, silent);
    },
};
