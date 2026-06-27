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
import type { IEmbedHostAnchorRecord } from '../../types/host-anchor';
import { CommandType } from '@univerjs/core';
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '../../common/const';
import { EmbedHostAnchorModelService } from '../../services/embed-host-anchor-model.service';

export interface ISetEmbedHostAnchorMutationParams {
    record: IEmbedHostAnchorRecord;
}

export interface IRemoveEmbedHostAnchorMutationParams {
    hostUnitId: string;
    hostAnchorId: string;
}

export const SetEmbedHostAnchorRecordMutation: ICommand<ISetEmbedHostAnchorMutationParams> = {
    id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        accessor.get(EmbedHostAnchorModelService).setAnchor(params.record);
        return true;
    },
};

export const RemoveEmbedHostAnchorRecordMutation: ICommand<IRemoveEmbedHostAnchorMutationParams> = {
    id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        accessor.get(EmbedHostAnchorModelService).removeAnchor(params.hostUnitId, params.hostAnchorId);
        return true;
    },
};
