import type { EmbedDescriptor } from '@univerjs/embed';
import type { ICommand } from '@univerjs/core';
import type { EmbedHostCopyContext, EmbedHostCreateContext, EmbedHostRemoveContext } from '../../services/embed-host-lifecycle.service';
import { CommandType } from '@univerjs/core';
import { EmbedHostLifecycleService } from '../../services/embed-host-lifecycle.service';

export type ICreateHostEmbedCommandParams = EmbedHostCreateContext;
export type ICopyHostEmbedCommandParams = EmbedHostCopyContext;
export type IRemoveHostEmbedCommandParams = EmbedHostRemoveContext;

export const CreateHostEmbedCommand: ICommand<ICreateHostEmbedCommandParams, EmbedDescriptor | false> = {
    id: 'embed-ui.command.create-host-embed',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).createEmbed(params);
    },
};

export const CopyHostEmbedCommand: ICommand<ICopyHostEmbedCommandParams, EmbedDescriptor | false> = {
    id: 'embed-ui.command.copy-host-embed',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).copyEmbed(params);
    },
};

export const RemoveHostEmbedCommand: ICommand<IRemoveHostEmbedCommandParams, boolean> = {
    id: 'embed-ui.command.remove-host-embed',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return accessor.get(EmbedHostLifecycleService).removeEmbed(params);
    },
};
