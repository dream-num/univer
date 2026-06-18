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

import type { ICommand, UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry } from '@univerjs/embed';
import { CommandType } from '@univerjs/core';
import { CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID } from '../../common/const';
import { EmbedHostAdapterRegistryService } from '../../services/embed-host-adapter-registry.service';

export interface IEmbedHostAnchorMutationParams {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    hostAnchorId: string;
}

export const CreateEmbedHostAnchorMutation: ICommand<IEmbedHostAnchorMutationParams> = {
    id: CREATE_EMBED_HOST_ANCHOR_MUTATION_ID,
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const hostAnchorId = accessor.get(EmbedHostAdapterRegistryService).createAnchor({
            embedId: params.embedId,
            hostUnitId: params.hostUnitId,
            hostType: params.hostType,
            entry: params.entry,
            requestedAnchorId: params.hostAnchorId,
        });
        if (hostAnchorId !== params.hostAnchorId) {
            throw new Error('EMBED_HOST_ANCHOR_RESTORE_MISMATCH');
        }

        return true;
    },
};

export const RemoveEmbedHostAnchorMutation: ICommand<IEmbedHostAnchorMutationParams> = {
    id: REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID,
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        accessor.get(EmbedHostAdapterRegistryService).removeAnchor(params);
        return true;
    },
};
