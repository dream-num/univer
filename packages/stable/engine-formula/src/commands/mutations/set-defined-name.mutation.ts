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

import type { IAccessor, IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { IDefinedNamesService } from '../../services/defined-names.service';

export interface ISetDefinedNameMutationSearchParam {
    unitId: string;
    id: string;
}

export interface ISetDefinedNameMutationParam extends ISetDefinedNameMutationSearchParam {
    name: string;
    formulaOrRefString: string;
    comment?: string;
    localSheetId?: string;
    hidden?: boolean;
}

/**
 * Generate undo mutation of a `SetDefinedNameMutation`
 * @param accessor
 * @param params
 * @returns
 */
export const SetDefinedNameMutationFactory = (
    accessor: IAccessor,
    params: ISetDefinedNameMutationParam
): ISetDefinedNameMutationParam => {
    const { unitId, id } = params;
    const definedNamesService = accessor.get(IDefinedNamesService);

    const definedName = definedNamesService.getValueById(unitId, id);

    return {
        ...definedName,
        unitId,
    };
};

/**
 * In the formula engine, the mutation is solely responsible for communication between the worker and the main thread.
 * It requires setting local to true during execution.
 */
export const SetDefinedNameMutation: IMutation<ISetDefinedNameMutationParam> = {
    id: 'formula.mutation.set-defined-name',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (params == null) {
            return false;
        }

        const definedNamesService = accessor.get(IDefinedNamesService);
        const { id, unitId, name, formulaOrRefString, comment, hidden, localSheetId } = params as ISetDefinedNameMutationParam;
        definedNamesService.registerDefinedName(unitId, {
            id,
            name: name.trim(),
            formulaOrRefString: formulaOrRefString.trim(),
            comment: comment?.trim(),
            hidden,
            localSheetId,
        });

        return true;
    },
};

export const RemoveDefinedNameMutation: IMutation<ISetDefinedNameMutationParam> = {
    id: 'formula.mutation.remove-defined-name',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (params == null) {
            return false;
        }
        const definedNamesService = accessor.get(IDefinedNamesService);
        const { unitId, id } = params as ISetDefinedNameMutationSearchParam;
        definedNamesService.removeDefinedName(unitId, id);

        return true;
    },
};
