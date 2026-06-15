import type { EmbedHostEntry } from '@univerjs/embed';
import type { ICommand } from '@univerjs/core';
import { CommandType, UniverInstanceType } from '@univerjs/core';
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
