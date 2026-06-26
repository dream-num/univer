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
import type { IEmbedDescriptor } from '../../types/embed';
import { CommandType } from '@univerjs/core';
import { EmbedModelService } from '../../services/embed-model.service';

export interface ISetEmbedDescriptorMutationParams {
    unitId: string;
    descriptor: IEmbedDescriptor;
}

export interface ISoftDeleteEmbedDescriptorMutationParams {
    unitId: string;
    embedId: string;
}

export const SetEmbedDescriptorMutation: ICommand<ISetEmbedDescriptorMutationParams> = {
    id: 'embed.mutation.set-descriptor',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        accessor.get(EmbedModelService).addDescriptor(params.unitId, params.descriptor);
        return true;
    },
};

export const SoftDeleteEmbedDescriptorMutation: ICommand<ISoftDeleteEmbedDescriptorMutationParams> = {
    id: 'embed.mutation.soft-delete-descriptor',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        accessor.get(EmbedModelService).softDeleteDescriptor(params.unitId, params.embedId);
        return true;
    },
};
