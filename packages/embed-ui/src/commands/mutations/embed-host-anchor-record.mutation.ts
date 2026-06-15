import type { ICommand } from '@univerjs/core';
import type { EmbedHostAnchorRecord } from '../../types/host-anchor';
import { CommandType } from '@univerjs/core';
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '../../common/const';
import { EmbedHostAnchorModelService } from '../../services/embed-host-anchor-model.service';

export interface ISetEmbedHostAnchorMutationParams {
    record: EmbedHostAnchorRecord;
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
