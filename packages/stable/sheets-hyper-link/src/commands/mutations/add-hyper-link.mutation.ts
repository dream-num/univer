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

import type { ICommand } from '@univerjs/core';
import type { ISheetHyperLink } from '../../types/interfaces/i-hyper-link';
import { CommandType } from '@univerjs/core';
import { HyperLinkModel } from '../../models/hyper-link.model';

export interface IAddHyperLinkMutationParams {
    unitId: string;
    subUnitId: string;
    link: ISheetHyperLink;
}

export const AddHyperLinkMutation: ICommand<IAddHyperLinkMutationParams> = {
    type: CommandType.MUTATION,
    id: 'sheets.mutation.add-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const model = accessor.get(HyperLinkModel);
        const { unitId, subUnitId, link } = params;
        return model.addHyperLink(unitId, subUnitId, link);
    },
};
