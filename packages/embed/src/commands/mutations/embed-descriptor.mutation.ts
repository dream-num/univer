import type { EmbedDescriptor } from '../../types/embed';
import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { EmbedModelService } from '../../services/embed-model.service';

export interface ISetEmbedDescriptorMutationParams {
    hostUnitId: string;
    descriptor: EmbedDescriptor;
}

export interface ISoftDeleteEmbedDescriptorMutationParams {
    hostUnitId: string;
    embedId: string;
}

export const SetEmbedDescriptorMutation: ICommand<ISetEmbedDescriptorMutationParams> = {
    id: 'embed.mutation.set-descriptor',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        accessor.get(EmbedModelService).addDescriptor(params.hostUnitId, params.descriptor);
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

        accessor.get(EmbedModelService).softDeleteDescriptor(params.hostUnitId, params.embedId);
        return true;
    },
};
